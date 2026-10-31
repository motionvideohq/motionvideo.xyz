# Workers CPU time: what's happening and what to do

Data from the last 24 h of the `motionvideo` Worker (2026-10-24 17:52 → 2026-10-25 17:54 UTC), read with the Cloudflare GraphQL analytics API and `cf sql query` over Workers Logs, plus a local production build (`pnpm build`, `vite preview`, `wrangler check startup`).

## Implemented (staying on the Free plan)

| # | Change | Where |
| --- | --- | --- |
| 1 | **Workers Cache** for anonymous pages. A cookie-free copy of each anonymous `GET` or `HEAD` to a locale page, `/sitemap.xml` or `/llms.txt` goes to a cached `Pages` entrypoint. 200 responses without `Set-Cookie`, `private` or `no-store` get `s-maxage=600, stale-while-revalidate=86400` (pages, browser `max-age=0`) or `s-maxage=86400` (files, browser `max-age=3600`). Requests with a session cookie and account/admin/sign-in/checkout/welcome pages skip the shared cache and return `private, no-store`. Campaign params (`utm_*`, `fbclid`, `gclid`…) are dropped from the cache key. Only the cached renderer is skipped on hits; the uncached gateway still runs. | `wrangler.jsonc` (`cache`, `exports`), `src/server.ts` |
| 2 | **Cheap 404s** for paths with a file extension that aren't ours, `/.…` and `/wp-…`, before any rendering. This also fixes `/apple-touch-icon-precomposed.png` returning the home page. | `src/server.ts` |
| 3 | **No Better Auth for anonymous visitors.** `/api/auth/get-session` answers `null` straight away without a session cookie, and `getCurrentSession()` (SSR) skips the lookup the same way. | `src/lib/session-cookie.ts`, `src/server.ts`, `src/server/auth.tsx` |
| 4 | **Session cookie cache** (5 min) and no rate-limit bookkeeping on `/get-session`, so signed-in checks mostly skip D1. | `src/server/auth-config.ts` |
| 5 | **Precomputed colour pages and similar videos** (`colorPages`, each video's `similar`). These were 16 ms per cold isolate and 6.5 ms per video page; they now run in `pnpm catalog:derive`, which the colour, import and removal scripts call. | `scripts/derive-catalog.mjs`, `src/lib/motion-video-route.ts`, `src/components/similar-videos.tsx` |
| 6 | **Lighter gallery HTML:** the server renders the first screen plus 200 px (instead of plus 900 px), and card hover actions mount after hydration. Home HTML went from 480 KB to 154 KB. | `src/components/virtual-masonry.tsx`, `src/components/motion-video.tsx`, `src/hooks/use-hydrated.ts` |

Not done (needs a decision or a bigger change): Workers Paid (declined, $0 budget), presence WebSocket changes (§6), `ssr: false` for account routes and trimming the server bundle (§7).

After deploying, check `Cf-Cache-Status` on `/en` (expect `HIT` from the second request on) and re-run the queries at the end of this file. Note that every deploy starts with a cold cache.

## Local verification (2026-10-26)

The worker-only branch was built independently of the changelog and email settings changes. Production preview checks covered anonymous session reads, unsupported session methods, cheap 404s, locale/slash redirects, private account routes, both session-cookie names bypassing shared caching, tracking parameter removal, `HEAD`, colour/video pages, and generated-file cache headers. The home response was 153,961 bytes. Browser checks confirmed hydrated bookmark controls and virtual scrolling; opening a bookmark showed the sign-in dialog.

All 500 precomputed recommendation lists and 12 colour pages matched a fresh derivation. Removing a video and deriving again left six distinct, existing, non-self recommendations per remaining video.

These are local behavior checks, not evidence of deployed cache hits or CPU quantiles. `wrangler check startup` timed out during profiling; the historical startup measurement below was not refreshed. Verify `Cf-Cache-Status` and the production analytics after deployment.

## TL;DR

- **Yes, we're over the limit by design, not by accident.** The Free plan allows **10 ms CPU per request**. Our _successful_ page requests use **~21 ms median, 186 ms p90, 422 ms p99**. Server-rendering React for a 500-video gallery cannot fit in 10 ms; Cloudflare's own docs say SSR typically needs 10–20 ms and the average Worker uses 2.2 ms.
- **4,513 requests (~10% of page traffic) were killed with `exceededResources`** (visitors got Error 1102). The "built-in flexibility" Cloudflare gives each isolate is what keeps the other 90% alive.
- **The biggest lever is caching, not micro-optimisation.** Almost every page is identical for every anonymous visitor, yet every view re-renders it. Cloudflare's new **Workers Cache** serves cached responses _without running the Worker at all_ (zero CPU).
- **Fastest unblock:** Workers Paid ($5/month). At today's volume (~1.6 M CPU-ms
  per day, ~49 M per month) that's $5 + ~$0.40 overage. It stops the 1102 errors immediately while the fixes below land.

## Evidence

### Invocation outcomes (GraphQL `workersInvocationsAdaptive`, 24 h)

| Status                     |  Requests | CPU p50 |  CPU p90 |  CPU p99 |
| -------------------------- | --------: | ------: | -------: | -------: |
| success                    |    26,983 | 20.9 ms | 185.9 ms | 421.5 ms |
| clientDisconnected         |    11,371 |  0.9 ms |   1.6 ms |  15.4 ms |
| **exceededResources**      | **4,513** |   10 ms |    10 ms |  31.4 ms |
| responseStreamDisconnected |     1,344 |  0.9 ms |   1.4 ms |   2.4 ms |

### Where the CPU goes (Workers Logs, 56,387 fetch events)

Paths are normalised (`/{loc}` = any locale prefix, `:slug` = any video). Most traffic was still on the pre-locale build, hence both `/` and `/{loc}`.

| Route | Requests | Avg CPU | Requests ≥ 10 ms | Not ok | Share of all CPU |
| --- | --: | --: | --: | --: | --: |
| `/` (home, pre-locale) | 5,360 | **173.6 ms** | 5,204 | 74 | **56.6%** |
| `/videos/:slug` | 7,156 | 37.4 ms | 6,546 | 3,691 | 16.3% |
| `/api/auth/get-session` | 8,019 | 15.3 ms | 4,619 | 186 | 7.5% |
| `/category/:x` | 553 | 119.5 ms | 550 | 79 | 4.0% |
| `/category/:x/videos/:slug` | 1,101 | 47.1 ms | 1,012 | 453 | 3.2% |
| `/api/presence` | 29,386 | 1.6 ms | 186 | 22,807¹ | 2.9% |
| `/{loc}/videos/:slug` | 639 | 51.6 ms | 624 | 116 | 2.0% |
| `/{loc}` (home) | 146 | **207.8 ms** | 146 | 1 | 1.8% |
| `/assets/*` (missing files) | 470 | 49.9 ms | 430 | 58 | 1.4% |
| `/_serverFn/*` | 2,603 | 5.6 ms | 401 | 8 | 0.9% |
| junk (`/apple-touch-icon-precomposed.png`, `/wp-admin/…`, `/.well-known/…`, `/og.png`) | ~140 | 60–120 ms | all | 0 | ~0.6% |

¹ WebSocket sessions end as `canceled`; that's normal, not an error.

Other facts:

- **Visitors are mostly human** (52,517 of 56,387 requests; ClaudeBot, facebookexternalhit and curl are the main bots). Blocking bots won't fix this.
- **`/api/presence` is 52% of all requests** (29k/day), plus **263k Durable Object WebSocket events/day**. Cheap on CPU, but it eats the Free plan's **100,000 requests/day** quota and Durable Object usage.
- **The home page HTML is 480 KB.** 34 server-rendered cards; ~196 KB of it is `class` attributes and ~181 KB inline SVG icons (each card's hover actions repeat four ~1–2.7 KB icons). Serialising that much HTML is CPU.
- **Server bundle:** 10.2 MB raw / 2.65 MB gzip (Free limit is 3 MB gzip, so we're close). Biggest chunks: better-auth 1.6 MB, Recharts (sponsor chart) 1.1 MB, motion catalog 1.0 MB.
- **Startup** (`wrangler check startup`): 35 ms active locally. Fine against the 1 s startup limit, but the heavy chunks load lazily on the _first request_ of each isolate, and low-traffic isolates are evicted often.

### Hot spots measured locally (Apple silicon; Cloudflare's CPUs are slower)

| Work | Time | When it runs |
| --- | --: | --- |
| `JSON.parse` of `motion-catalog.json` (1 MB) | 5.5 ms | every cold isolate |
| `COLOR_PAGES` (12 colours × 512 videos × OKLab distances) | **16.0 ms** | every cold isolate, at module load |
| `similarMotionVideos` for one video | **6.5 ms** | every video page render |
| `filterMotionVideos` (one category) | 0.2 ms | every gallery render |
| `/sitemap.xml` | 48 ms, **6 MB** body | every request (cached only 1 h, by browsers) |
| `/en` home render (warm) | 24 ms wall | every view |
| `/en` home render (cold isolate) | 319 ms wall | first view per isolate |

## Root causes, ranked

1. **No server-side caching of HTML.** Every anonymous view re-renders a page that's the same for everyone. This alone explains most of the CPU.
2. **Expensive work recomputed per isolate or per request:** colour pages, similar videos, a 1 MB JSON parse and the 6 MB sitemap.
3. **Auth on the hot path.** `getLandingData` calls `getCurrentSession()` during SSR for every visitor, and the client calls `/api/auth/get-session` on every page load (15 ms average, often on a cold isolate that has to load the 1.6 MB better-auth chunk).
4. **Heavy HTML:** 480 KB per gallery page.
5. **Junk and missing-asset requests get a full React 404 render** (and `/apple-touch-icon-precomposed.png` even returns the 480 KB home page with 200).
6. **Presence WebSockets** burn half the daily request quota.

## Recommendations

Ordered by impact ÷ effort. ✅ = low risk, ⚠️ = needs care.

### 0. Unblock now: Workers Paid ($5/month) ✅

- **Why:** 10 ms → 30 s CPU per request, unlimited requests, 30 M CPU-ms/month included. At today's ~49 M CPU-ms/month the bill is about $5.38. It stops the 1102 errors today, before any code changes.
- **How:** Dashboard → Workers & Pages → Plans. Optionally set `limits.cpu_ms` in `wrangler.jsonc` (e.g. 1000) as a runaway guard.
- **Docs:** [Limits](https://developers.cloudflare.com/workers/platform/limits/#cpu-time), [Pricing](https://developers.cloudflare.com/workers/platform/pricing/).

### 1. Turn on Workers Cache for anonymous HTML ⚠️ (biggest win)

- **What it is:** with `"cache": { "enabled": true }` in Wrangler, Cloudflare checks a tiered edge cache _before invoking the Worker_. A hit costs **zero CPU**. It also collapses concurrent misses into one render.
- **The catch:** the cache key is path + query + Worker version only. **Cookies and `Accept-Language` are not in the key.** Turning it on naively would serve one signed-in user's HTML (avatar, `signedIn: true`) to anonymous visitors, and the unprefixed `/` → `/fr` redirect would be cached for everyone.
- **Safe shape** (from the docs' "gateway + cached entrypoint" pattern):
  - Keep the **default entrypoint uncached** (`exports.default.cache.enabled: false`). It stays tiny: www and trailing-slash redirects, locale negotiation, presence, `/api/*`, and "is there a better-auth session cookie?".
  - For **anonymous `GET` page requests**, forward to a named `Pages` entrypoint via `ctx.exports.Pages.fetch(request)`, with caching enabled and the `Cookie` header stripped.
  - Pages return `Cache-Control: public, max-age=60, s-maxage=600, stale-while-revalidate=86400` (tune per route), plus `Cache-Tag` for purging. Account, admin, sign-in and checkout return `private, no-store`.
  - **Signed-in requests** go straight to the renderer, uncached. They're a small share of traffic.
- **Prerequisites:** the anonymous HTML must not depend on the visitor. Today `getLandingData` puts `signedIn` (from the session) into SSR. Move "who am I" to the client (it already calls `useSession`), or render the anonymous state on the server and let the client upgrade. Job listings and sponsors are global, so they're fine to cache with a short TTL.
- **Deploys:** each deploy starts with a cold cache (version is in the key). That's fine, or set `cross_version_cache: true` and purge by tag after content changes.
- **Docs:** [Workers Cache](https://developers.cloudflare.com/workers/cache/), [Configuration](https://developers.cloudflare.com/workers/cache/configuration/), [Cache keys](https://developers.cloudflare.com/workers/cache/cache-keys/), [Examples (gateway pattern)](https://developers.cloudflare.com/workers/cache/examples/), [Limitations](https://developers.cloudflare.com/workers/cache/limitations/). Needs Wrangler ≥ 4.69 (≥ 4.107 for per-entrypoint `exports`).
- **TanStack side:** per-route `headers: () => ({ 'Cache-Control': … })` ([TanStack Start ISR guide](https://tanstack.com/start/latest/docs/framework/react/guide/isr)).

### 2. Move per-isolate/per-request computation to build time ✅

- **`COLOR_PAGES`** (16 ms+ per cold isolate): compute in `catalog:refresh:colors` and store the list (or a `colorPages` array) in the catalog JSON. At runtime it becomes a lookup.
- **`similarMotionVideos`** (6.5 ms+ per video page): precompute the 6 similar slugs per video into the catalog (`similar: string[]`) in the same script.
- **Sitemap** (6 MB, ~50 ms+): prerender it at build as a static asset (served by Static Assets, no Worker), or split it into a sitemap index with one file per locale. With caching on, at least give it a long `s-maxage`.
- **Catalog JSON size** (1 MB parsed per isolate): the server only needs a slim index for routing and SEO. The `blur` data URIs and full prompts can stay client-side or be split per video.

### 3. Take auth off the hot path ✅

- **SSR:** only call `getCurrentSession()` when a better-auth session cookie is present. Anonymous visitors (the majority) then skip it. A cookie check costs microseconds; loading and running better-auth does not.
- **Enable `session.cookieCache`** (`{ enabled: true, maxAge: 300 }`) so `getSession` verifies a signed cookie instead of querying D1 on every call ([Better Auth: session management](https://www.better-auth.com/docs/concepts/session-management#cookie-cache)).
- **Client:** don't fetch the session when there's no session cookie, and consider turning off refetch-on-focus for `useSession`. 8k calls/day at 15 ms each is 7.5% of all CPU.

### 4. Cheap 404s in `server.ts` ✅

- For paths with a file extension that aren't real assets (`/assets/*` from old deploys, `*.png`, `/wp-admin/*`, `/.well-known/*` except anything we serve), return a plain `404` from the Worker **before** the TanStack handler. Today each costs 50–120 ms of React rendering.
- **Bug to fix along the way:** `/apple-touch-icon-precomposed.png` currently returns the 480 KB home page with status 200.
- **Optional:** add `/apple-touch-icon-precomposed.png` as a copy of the existing icon, since iOS asks for it.

### 5. Lighter gallery HTML ✅

- Render fewer cards on the server: the masonry SSR window is 1,900 px tall, which comes to 34 cards. A smaller server window (e.g. the first screen, ~12 cards) cuts the HTML and render time roughly in half; the client mounts the rest on hydration anyway.
- Render the hover-only actions (copy, bookmark and their icons) only after hydration, not on the server. That's ~4.8 KB of SVG per card.
- Long repeated Tailwind class strings make up 40% of the HTML.

### 6. Presence: cut the request count ⚠️ (product decision)

- **Problem:** 29k WebSocket connects/day (52% of requests) and 263k Durable Object events/day for the "N online" badge. On the Free plan this eats the 100k/day request quota.
- **Options:**
  - only connect while the tab is visible, and reconnect less eagerly;
  - send a slower heartbeat;
  - show the count with a periodic cached fetch instead of a socket;
  - drop the badge on mobile.

### 7. Smaller wins / housekeeping

- **`ssr: false` for account and admin routes** (dashboard, settings, admin). They're `noindex`, behind auth, and don't benefit from SSR ([TanStack Selective SSR](https://tanstack.com/start/latest/docs/framework/react/guide/selective-ssr)).
- **Keep Recharts and other heavy libraries out of the server bundle** where they're only used in the client (sponsor chart). That keeps us well under the 3 MB gzip Free-plan size limit and shortens cold starts.
- **Profile, don't guess:** `wrangler dev` → DevTools → Performance gives a CPU profile per request ([Profiling CPU usage](https://developers.cloudflare.com/workers/observability/dev-tools/cpu-usage/)). `npx wrangler check startup` shows startup cost.

## Suggested order

1. Upgrade to Workers Paid (today, no code).
2. Cheap 404s + auth only when a cookie is present + `cookieCache` (small, safe diffs).
3. Precompute colour pages, similar videos and the sitemap (script + catalog changes).
4. Workers Cache with the gateway/cached-entrypoint split, after making anonymous HTML visitor-independent. Measure the cache hit rate via `Cf-Cache-Status`.
5. Lighter gallery HTML and presence changes as follow-ups.

## How to re-measure

```sh
# CPU quantiles by outcome, last 24 h (needs `wrangler login`)
TOKEN=$(npx wrangler auth token | tail -1)
ACC=<account id from `npx wrangler whoami`>
curl -s https://api.cloudflare.com/client/v4/graphql \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"query":"query($a:String!,$s:Time!,$u:Time!){viewer{accounts(filter:{accountTag:$a}){workersInvocationsAdaptive(limit:20,filter:{datetime_geq:$s,datetime_leq:$u}){sum{requests} quantiles{cpuTimeP50 cpuTimeP90 cpuTimeP99} dimensions{scriptName status}}}}}","variables":{"a":"'$ACC'","s":"<ISO start>","u":"<ISO end>"}}'

# Per-request CPU and path from Workers Logs (observability is already enabled)
npx cf sql query "SELECT timestamp, cpuTimeMs, attributes FROM logs.workersLogs WHERE invocationType = 'fetch' AND logType = 'cf-worker-event' ORDER BY timestamp LIMIT 1500 FORMAT JSONEachRow" \
  --scope-account $ACC --time-since <ISO start>
```

The CPU fields are microseconds in GraphQL and milliseconds in Workers Logs (`cpuTimeMs`).
