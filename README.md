<div align="center">

<a href="https://motionvideo.xyz">
  <img src="public/og.png" alt="MotionVideo: Motion design, written in code." width="800" />
</a>

# MotionVideo

**Motion design, written in code.**

A searchable collection of AI-made motion videos and their public prompts and skills.<br /> The MotionVideo skill pack teaches your coding agent timing, easing, and choreography.

[Discover](https://motionvideo.xyz) · [Tools](https://motionvideo.xyz/tools) · [Creatives](https://motionvideo.xyz/creatives) · [Skills](https://motionvideo.xyz/skills) · [Extras](https://motionvideo.xyz/extras) · [MotionVideo skill](https://motionvideo.xyz/motionvideo-skill) · [About](https://motionvideo.xyz/about) · [Contact](https://motionvideo.xyz/contact)

[![GitHub stars](https://img.shields.io/github/stars/motionvideohq/motionvideo.xyz?style=flat-square)](https://github.com/motionvideohq/motionvideo.xyz/stargazers) [![License: MIT](https://img.shields.io/github/license/motionvideohq/motionvideo.xyz?style=flat-square)](LICENSE) [![Follow on X](https://img.shields.io/badge/Follow-%40alaymanguy-000000?style=flat-square&logo=x&logoColor=white)](https://x.com/alaymanguy)

</div>

---

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | [TanStack Start](https://tanstack.com/start) (React 19, file-based routing, server functions) |
| UI | [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com), [Tailwind CSS v4](https://tailwindcss.com), [Reicon](https://reicon.dev/docs/react) icons, [player.style](https://player.style) (Sutro) video player |
| Hosting | [Cloudflare Workers](https://workers.cloudflare.com), deployed with [Wrangler](https://developers.cloudflare.com/workers/wrangler/) and Workers Builds |
| Data | [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite) with [Drizzle ORM](https://orm.drizzle.team), [R2](https://developers.cloudflare.com/r2/) for video assets |
| Auth | [Better Auth](https://www.better-auth.com) (email magic links) |
| Email | [Resend](https://resend.com) (sign-in and contact messages), Cloudflare Email Routing (inbound) |
| Payments | [Dodo Payments](https://dodopayments.com) as merchant of record (brand "MotionVideo"), with GitHub repository access delivery |
| Tooling | [pnpm](https://pnpm.io), [Vite](https://vite.dev), [Oxlint](https://oxc.rs) + [Oxfmt](https://oxc.rs) via [Ultracite](https://www.ultracite.ai), [Lefthook](https://lefthook.dev) |

## Getting started

```bash
pnpm install
cp .env.example .env
TIMELESS_DIR="$HOME/Downloads/Timeless-Type-Family-1.094"
mkdir -p src/assets/fonts/timeless
cp "$TIMELESS_DIR/Sans-Grotesk/TimelessSansVF.woff2" src/assets/fonts/timeless/
cp "$TIMELESS_DIR/LICENSE.pdf" src/assets/fonts/timeless/
pnpm db:migrate:local
pnpm dev
```

Download the Timeless family from [Timeless](https://timeless.co) and adjust `TIMELESS_DIR` if it is stored elsewhere. Its license permits website embedding but prohibits publishing the fonts in a public repository, so `src/assets/fonts/timeless/` is Git-ignored. CI and deployment build environments must provision these licensed assets before building.

Email templates are React Email components in `src/emails`. Preview them with `pnpm email:dev` (port 3001).

## Discover, directories, and skill access

- The header lists Discover and Tools, then a More menu with Creatives, Skills, and Extras (the trigger reads as current on any of them); the mobile menu lists all five sections. Search (⌘K) lists the same pages.
- `/` is the public video gallery: compact sponsor/maker strip, type and category filters, search, sorting, and responsive masonry. The first card contains the introduction, Surprise me (within the current filters), and a Submit a video CTA.
- Each category is its own page, `/category/<category>` (e.g. `/category/product-ui`), with its own title, description, canonical, and heading; `type` and `sort` stay search params. Unknown categories 404.
- Videos open as overlay routes over the gallery: `/videos/<slug>` from Discover, `/category/<category>/videos/<slug>` from a category page (canonical: `/videos/<slug>`); closing returns to the page underneath. Masonry remeasures when cards, viewport width, or content heights change.
- `/tools` lists public tools, with a page per category: `/tools/ai`, `/tools/editors`, `/tools/mockups`, `/tools/motion`. `/skills` lists open-source agent skills and `/extras` the resources that fit no other section; both are split out of the tools import in code (`src/lib/directories.ts`), so re-importing keeps the split. `/tools/skills` and `/tools/resources` redirect (301) to them. `/creatives` lists studios and independent designers, with `/creatives/studios` and `/creatives/designers`. `/studios` redirects (301) to `/creatives`. Category slugs are defined in `src/lib/directories.ts`.
- `/submit` accepts video, tool, creative, agent skill, and other submissions from signed-in accounts (signed-out visitors are sent to `/sign-in?redirect=/submit…`, keeping `?kind=` and `?category=`). Every Submit CTA, including the header's, passes the current section and category (e.g. `/tools/ai` → `/submit?kind=tool&category=ai`, `/category/product-ui` → `/submit?kind=video&category=product-ui`). The form's optional Category select offers the kind's categories (gallery categories for videos, directory categories for tools and creatives; none for skills and extras); invalid `?category=` values are ignored and the server rejects a category that doesn't belong to the kind. It is stored in `community_submission.category`.
- `/bookmarks` lists the signed-in user's saved videos (newest first) in the gallery masonry; cards open the video overlay on Discover.
- `/motionvideo-skill` retains the original skill landing, demos, FAQ, pricing, and checkout links.
- `/sponsor` lists the Diamond ($500/mo), Gold ($250/mo), and Silver ($150/mo) sponsorship plans with catalogue counts and current sponsors per tier; each plan links to `/checkout?product=<tier>`, and `?thanks=<tier>` shows a thank-you note.
- Accounts: anyone can sign in with an email magic link; the account is created the first time a link is opened. Signed out, the header avatar and bookmark buttons open a sign-in dialog (the same form as `/sign-in`, which remains for direct visits and redirects). Signed in, the avatar opens a menu with Bookmarks, Dashboard, and Sign out. Purchases are matched by email and shown on `/dashboard`; they do not gate sign-in.
- Public interfaces retain the existing light/dark theme and English, Spanish, and French dictionaries.

Product UI glyphs use direct `reicon-react/icons/<Name>` imports and the shared `ReiconDuotone` renderer, which draws Reicon's official Duotone glyph (the reicon.dev "Duotone" set: one solid layer and one 50% layer). reicon-react 1.2.6 only ships Outline and Filled, so `pnpm icons:duotone` vendors the duotone markup for every icon the site imports from Reicon's repository (`data/icon-duotone.json`, MIT) into `src/components/ui/reicon-duotone-glyphs.ts`; rerun it after importing a new icon. Icons without a same-named duotone glyph map to their nearest duotone form via `ALIASES` in the script (chevrons → `arrow-*2` carets, check/plus/x → `check-circle`/`add-circle`/`close-circle`, search → `magnifier`, send → `plane`, sparkles → `stars`, loader → `refresh`, grid → `widget`); any icon still unmapped falls back to its reicon-react Outline glyph, and the script lists those. `filled` makes the light layer solid and `secondaryColor` recolours it, for toggled states such as a saved bookmark. GitHub and X retain their original Simple Icons brand marks; MotionVideo's logomark, other brand artwork, and motion-design illustrations remain unchanged.

With a mouse or trackpad (`pointer: fine`), the site uses a custom arrow cursor (the [Kibo UI cursor](https://www.kibo-ui.com/components/cursor) pointer shape, black with a white keyline) for both the default and the pointer cursor, defined as SVG data URIs with a 2x `image-set()` in `src/styles.css`; Tailwind's `cursor-default`/`cursor-pointer` map to it too. Text fields and contenteditable keep the native I-beam, semantic cursors such as `not-allowed` and resize handles stay native, and touch devices are unaffected.

The account control uses [Reicon Avatars](https://github.com/dqev/reicon-avatars). A random anonymous seed is persisted in `sessionStorage`, keeping the avatar stable across routes and reloads within that browser session. Seeds do not contain account IDs or email addresses; requests omit the referrer. A Reicon user glyph covers initial hydration and avatar-loading failures without disabling account navigation. Creator photos remain their original attributed images.

Website typography uses the supplied Timeless Sans variable WOFF2, with the Grotesk style selected, weights 300–900, and normal/italic faces. CSS and the root preload reference the same self-hosted font file. Email templates retain email-safe system fonts.

The catalog holds 297 public entries, with 230 published prompts, 4 skill links, and 297 original creator posts. Three skill-only entries have no published prompt; the gallery links to their public skill instead. 64 entries come from the What Ships motion category and publish no prompt or skill.

Refresh `src/data/motion-catalog.json` with:

```bash
pnpm catalog:import
```

The importer reads public serialized page data without executing remote scripts, fetches details with three paced workers, validates the catalog, and leaves the previous file unchanged if any entry fails. Pass an output path to import without replacing the shipped catalog: `pnpm catalog:import /tmp/motion-catalog.json`.

Then append motion videos from the public [What Ships motion category](https://whatships.com/videos/category/motion/) with `pnpm catalog:import:whatships`. It cross-checks the category's markdown, HTML cards, and `search-index.json`, reads each video page's serialized player props and JSON-LD without executing remote scripts, skips entries already in the catalog (matching tweet status IDs, media/source URLs, or same handle with a similar title), and appends only new entries, newest first, after the existing ones. New entries carry no prompt or skill tags because What Ships publishes neither; dimensions come from the source MP4 path (ffprobe as fallback), and playback uses the What Ships proxy because `video.twimg.com` rejects cross-site referrers. Rerun it after every `pnpm catalog:import`, which rewrites the file from prompt-motion.com alone. Pass an output path to merge into a separate file: `pnpm catalog:import:whatships /tmp/motion-catalog.json`.

Videos, previews, posters, avatars, and directory covers are served from our R2 bucket `motionvideo-assets` at `https://assets.motionvideo.xyz`. After any import, run:

```bash
pnpm assets:mirror            # add --dry-run to list pending files
```

It downloads every remote media URL in `src/data/motion-catalog.json` and `src/data/resource-directories.json`, uploads it with `wrangler r2 object put --remote` (immutable cache headers; keys embed a hash of the source URL, e.g. `motion/<slug>/video-<hash>.mp4`, `avatars/<handle>-<hash>.jpg`, `directories/tools/<id>-<hash>.webp`), skips objects already on the domain, and rewrites only successfully mirrored URLs. It needs `wrangler login`. The importers write source URLs again, so rerun the mirror after them; already-uploaded files are skipped. Each entry credits its creator and links to the creator's original post. Inclusion does not imply use of the MotionVideo skill.

`wrangler` uploads at most 300 MiB per file; the mirror reports larger files as failures and leaves their source URLs. Re-encode such a file under 300 MiB (e.g. `ffmpeg -i in.mp4 -c:v libx264 -b:v 6500k -maxrate 7500k -bufsize 13000k -c:a aac -b:a 128k -movflags +faststart out.mp4`), upload it to the key `pnpm assets:mirror --dry-run` prints for it, then rerun the mirror to rewrite the URL. An empty `avatar` renders the user glyph (used for creators whose X account no longer exists); a failing avatar falls back to it too. The What Ships importer skips `@ycombinator`'s long-form talks, which are not motion design and run to gigabytes.

Discover, Tools, and Studios share `VirtualMasonry` (`src/components/virtual-masonry.tsx`): window-scrolled, shortest-lane packing, with only cards near the viewport mounted. Hovering a card for 2 s zooms it into a preview positioned by Floating UI (via Base UI's PreviewCard) against a virtual anchor whose centre is clamped to the viewport, and the preview's width is capped by the viewport height, so it always opens fully on screen. Search lives in the ⌘K / `/` command menu, which lazy-loads the catalog and directories on first open.

Each video has its own URL, `/videos/$slug`. Both it and `/` are children of the pathless `src/routes/_gallery.tsx` layout, so the video opens as an overlay route on top of the still-mounted grid (scroll and filters preserved). Links use TanStack Router's `viewTransition`; the card media and the overlay player share a `view-transition-name`, so the card morphs into the player and back.

Refresh `src/data/resource-directories.json` from the public [What Ships](https://whatships.com/) tools and studios pages with:

```bash
pnpm catalog:import:resources
```

This importer cross-checks markdown listings against HTML cards without executing remote scripts, validates each entry, and preserves the previous catalog on failure. Pass an output path to inspect a fresh import separately: `pnpm catalog:import:resources /tmp/resource-directories.json`. Run `pnpm assets:mirror` afterwards to move covers onto our domain. MotionVideo is an independent directory and does not claim partnerships with listed resources.

## Payments

[Dodo Payments](https://dodopayments.com) is the merchant of record, under the Dodo brand "MotionVideo". `src/server/dodo.ts` holds every API call; there is no local copy of orders.

- `GET /checkout?product=skill|diamond|gold|silver` (default `skill`) creates a hosted Checkout Session and 303-redirects to it. The product comes from a fixed allowlist of env product IDs and signed-in emails are prefilled. The skill bundle ($49) gets the launch code `MOTIONVIDEOLAUNCH` ($20 off, 100 uses) while it has uses left; Dodo only accepts a preset code when the checkout's code field is enabled, so that field appears only on launch-priced sessions, already filled in. Existing buyers go to `/dashboard`. Sponsor tiers are monthly subscriptions (Diamond $500, Gold $250, Silver $150) and return to `/sponsor?thanks=<tier>`.
- The skill bundle returns to `/welcome?payment_id=…`. The page looks the payment up (it must be a skill bundle payment), then emails a sign-in link to its address once Dodo marks it succeeded; the thank-you email template is used only when the address has a paid order.
- `/dashboard` shows whether the signed-in email has a succeeded, not fully refunded skill bundle payment, with the customer portal for owners and a buy button otherwise. The launch offer's sold count is the discount's `times_used`.
- Delivery is Dodo's GitHub entitlement ("MotionVideo Skill repository", `pull` on `motionvideohq/motionvideo-skill`) attached to the skill bundle: the buyer connects GitHub in the Dodo customer portal (opened from `/dashboard`), Dodo sends the repository invite, and a refund removes it. The Dodo Payments GitHub App must be installed on the `motionvideohq` organization (Dodo dashboard → Entitlements → GitHub Access → Connect GitHub).
- `POST /api/webhook/dodo` verifies the Standard Webhooks signature with `DODO_PAYMENTS_WEBHOOK_KEY` on the raw body and acknowledges; nothing needs fulfillment there. Endpoints are business-wide, so it also receives other brands' events.

`pnpm dodo:setup` (test mode) and `pnpm dodo:setup --live` create or find the brand, the four products, the launch discount, the GitHub entitlement, and (live only) the webhook endpoint for `https://motionvideo.xyz/api/webhook/dodo`. It is idempotent and never touches the business's other brands. Test mode writes the IDs and a local webhook key to `.env` (pass `--test-webhook-url=<tunnel>/api/webhook/dodo` to register a test endpoint instead); live mode writes the IDs to `wrangler.jsonc` vars. Set the production secrets without displaying them:

```bash
pnpm -s dodo:setup --live --print-secret=api-key | pnpm wrangler secret put DODO_PAYMENTS_API_KEY
pnpm -s dodo:setup --live --print-secret=webhook-key | pnpm wrangler secret put DODO_PAYMENTS_WEBHOOK_KEY
```

Environment: `DODO_PAYMENTS_ENVIRONMENT` (`test_mode` | `live_mode`; anything else means test), `DODO_PAYMENTS_API_KEY`, `DODO_PAYMENTS_WEBHOOK_KEY`, `DODO_PRODUCT_SKILL`, `DODO_PRODUCT_SPONSOR_DIAMOND`, `DODO_PRODUCT_SPONSOR_GOLD`, `DODO_PRODUCT_SPONSOR_SILVER`, `DODO_LAUNCH_DISCOUNT_ID`, plus `DODO_PAYMENTS_LIVE_API_KEY` in `.env` for the live setup run only. Keep the discount ID stable: recreating the discount resets the sold count.

To test a webhook locally, sign a payload with the `.env` key per [Standard Webhooks](https://www.standardwebhooks.com/) (HMAC-SHA256 of `<webhook-id>.<webhook-timestamp>.<body>`), or forward real test events with the Dodo CLI (`dodo wh listen http://localhost:3000/api/webhook/dodo`) after pointing `DODO_PAYMENTS_WEBHOOK_KEY` at that endpoint's secret.

## Newsletter, submission, and bookmark storage

Apply D1 migrations with `pnpm db:migrate:local` for development. `pnpm deploy` applies remote migrations before deployment; deployments outside that command must run `pnpm db:migrate:remote` before enabling these forms.

- Newsletter signup requires explicit consent and stores the normalized email, consent timestamp, and creation timestamp in `newsletter_subscriber`. Duplicate signups succeed without replacing the original consent record. Signup collects an audience; it does not send a welcome email or configure a campaign service.
- Submissions require a signed-in account and attribution permission, and store the account email, name, title, public HTTPS URL, description, and an optional video prompt in `community_submission`, with `status = 'pending'`. They are not automatically published and submitted URLs are never fetched.
- Bookmarks live in `bookmarks (user_id, video_slug, created_at)` with a `(user_id, video_slug)` primary key; rows are deleted with their user. `src/server/bookmark-functions.ts` lists and sets them for the session's user only, accepting slugs from `src/data/motion-catalog.json`. The client keeps one optimistic store (`src/lib/bookmarks.ts`) shared by every bookmark button.
- Both forms validate on the client and server, include a honeypot, and reuse the existing contact rate limiter. Success is shown only after the D1 write succeeds; validation, rate-limit, and storage failures are reported in the form.
- Review submissions or retrieve the opted-in audience with privileged D1 access, not a public endpoint:

```bash
pnpm exec wrangler d1 execute DB --remote --command "SELECT email, newsletter_consent_at, created_at FROM newsletter_subscriber ORDER BY created_at DESC"
pnpm exec wrangler d1 execute DB --remote --command "SELECT id, kind, title, url, name, email, description, prompt, created_at FROM community_submission WHERE status = 'pending' ORDER BY created_at DESC"
```

The privacy policy covers this collection, retention, and consent withdrawal through the contact page.

## License

The website source code is released under the [MIT License](LICENSE). The MotionVideo skill pack, brand name, and logomark are not covered by this license; the skill pack is sold separately under its own [terms](https://motionvideo.xyz/terms).

Imported creator videos, prompts, and media retain their owners’ rights and are not covered by the website’s MIT license.

Timeless font assets are governed by the accompanying Timeless Free Font License 1.2, not the website's MIT license. Reicon's base artwork includes Solar Icons by [480 Design](https://solar-icons.vercel.app/) (CC BY 4.0) and [Zappicon](https://zappicon.com/).

The 404 figure is a [Hairline](https://github.com/lucasmarkes/hairline) figure by Lucas Marques (MIT; see `src/components/hairline/LICENSE`). `kernel.js` is vendored verbatim and `missing-frame.js` was made with its `hairline-create` skill; both are excluded from lint and format, and edits go to the figure only, rechecked with the skill's `look.mjs`.

## Made by

[Aniket Pawar](https://www.aniketpawar.com) ([@alaymanguy](https://x.com/alaymanguy)), who also runs [Shadcn Labs](https://www.shadcn-labs.com).
