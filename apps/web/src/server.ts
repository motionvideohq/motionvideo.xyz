import handler from "@tanstack/react-start/server-entry";
import { WorkerEntrypoint, env } from "cloudflare:workers";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALES,
  isLocale,
  localizedPath,
} from "@/constants/locales";
import { STATIC_PAGES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { hasSessionCookie } from "@/lib/session-cookie";
import { UPLOAD_PATH_PREFIX } from "@/lib/uploads";

// Durable Object classes must be exported from the Worker entry.
export { Presence } from "@/server/presence";

const PRESENCE_PATH = "/api/presence";

/** Prerendered pages, once per locale (`/en/about`, `/fr/about`, …). */
const STATIC_PATHS = new Set(
  LOCALES.flatMap((locale) =>
    STATIC_PAGES.map((page) => localizedPath(page, locale))
  )
);

const HAS_FILE_EXTENSION = /\.[a-z0-9]+$/iu;
const SKIP_PREFIXES = ["/api/", "/_", "/uploads/"];
// Files the router itself generates; any other path with an extension that
// reaches the Worker is not ours (an old build's asset, `/wp-login.php`, a
// guessed icon) and gets a plain 404 instead of a full React render.
const GENERATED_FILES = new Set(["/sitemap.xml", "/llms.txt"]);

const notFound = () =>
  new Response("Not found", {
    status: 404,
    headers: { "Cache-Control": "public, max-age=300" },
  });

// Account and checkout pages must never enter the anonymous shared cache.
const UNSHARED_PAGES = [
  "/admin",
  "/dashboard",
  "/sign-in",
  "/checkout",
  "/welcome",
];
// Campaign parameters change nothing on the page; dropping them before the
// cache keeps one entry per page instead of one per link someone shared.
const TRACKING_PARAM = /^(?:utm_.+|fbclid|gclid|msclkid|mc_cid|mc_eid)$/u;
// Pages: fresh for 10 minutes at the edge, then served stale while one
// request re-renders. Browsers always revalidate, so signing in shows the
// signed-in header at once. Generated files change only with deploys.
const PAGE_CACHE =
  "public, max-age=0, s-maxage=600, stale-while-revalidate=86400";
const FILE_CACHE = "public, max-age=3600, s-maxage=86400";

/**
 * Whether this request can be answered from (and fill) the shared cache:
 * a page or generated file, read by someone with no session cookie.
 */
const isShareable = (request: Request, url: URL) => {
  if (
    (request.method !== "GET" && request.method !== "HEAD") ||
    hasSessionCookie(request.headers)
  ) {
    return false;
  }
  if (GENERATED_FILES.has(url.pathname)) {
    return true;
  }
  const [, segment, ...rest] = url.pathname.split("/");
  const page = `/${rest.join("/")}`;
  return (
    isLocale(segment) &&
    !UNSHARED_PAGES.some(
      (prefix) => page === prefix || page.startsWith(`${prefix}/`)
    )
  );
};

/**
 * The renderer behind the shared cache. Cloudflare checks the cache before
 * calling it, so a hit costs no Worker CPU at all; on a miss it renders and
 * marks a successful page cacheable. Only ever called by the default
 * entrypoint, with anonymous, cookie-free requests.
 */
export class Pages extends WorkerEntrypoint {
  // An entrypoint's handler must be an instance method, even without `this`.
  // oxlint-disable-next-line class-methods-use-this
  override async fetch(request: Request) {
    const response = await handler.fetch(request);
    if (
      response.status !== 200 ||
      response.headers.has("Set-Cookie") ||
      /\b(?:private|no-store)\b/iu.test(
        response.headers.get("Cache-Control") ?? ""
      )
    ) {
      return response;
    }
    const cached = new Response(response.body, response);
    const { pathname } = new URL(request.url);
    cached.headers.set(
      "Cache-Control",
      GENERATED_FILES.has(pathname) ? FILE_CACHE : PAGE_CACHE
    );
    return cached;
  }
}

/**
 * Locale for an unprefixed visit: an explicit choice in the cookie first, then
 * the browser's language list, then the default.
 */
const negotiateLocale = (request: Request) => {
  const cookie = request.headers
    .get("Cookie")
    ?.match(
      new RegExp(String.raw`(?:^|;\s*)${LOCALE_COOKIE}=([^;]+)`, "u")
    )?.[1];
  if (isLocale(cookie)) {
    return cookie;
  }
  const accepted = request.headers.get("Accept-Language") ?? "";
  for (const entry of accepted.split(",")) {
    const tag = entry.split(";")[0]?.trim().toLowerCase();
    const language = tag?.split("-")[0];
    if (isLocale(language)) {
      return language;
    }
  }
  return DEFAULT_LOCALE;
};

/**
 * Old unprefixed pages (`/about`) become the negotiated locale's URL. API,
 * asset, and framework paths are left alone, as are unknown two-letter
 * prefixes: those render a translation-aware 404 instead of being rewritten.
 */
const localeRedirect = (request: Request): Response | null => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return null;
  }
  const url = new URL(request.url);
  const { pathname } = url;
  if (
    pathname === "/" ||
    (!SKIP_PREFIXES.some((prefix) => pathname.startsWith(prefix)) &&
      !HAS_FILE_EXTENSION.test(pathname))
  ) {
    const [, segment] = pathname.split("/");
    if (isLocale(segment)) {
      return null;
    }
    // A lowercase two-letter first segment is most likely an attempted locale
    // (`/xx/about`); let the router show its locale-aware 404.
    if (segment !== undefined && /^[a-z]{2}$/iu.test(segment)) {
      return null;
    }
    url.pathname = localizedPath(pathname, negotiateLocale(request));
    // `Response.redirect` has immutable headers in Workers, so build the response
    // directly to add cache negotiation hints.
    return new Response(null, {
      headers: {
        "Cache-Control": "private, no-store",
        Location: url.toString(),
        Vary: "Accept-Language, Cookie",
      },
      status: 307,
    });
  }
  return null;
};

// Sent with every page and API response (not the presence WebSocket). Framing
// is denied (clickjacking), MIME sniffing is off, and HTTPS is pinned.
const SECURITY_HEADERS = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
} as const;

const withSecurityHeaders = (response: Response) => {
  const secured = new Response(response.body, response);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    secured.headers.set(name, value);
  }
  return secured;
};

/**
 * Answers that need no rendering: the apex and slashless redirects, 404s for
 * probes and stale files, the anonymous session check, and sending unprefixed
 * pages to a locale. `null` when the request needs the app.
 */
const answerWithoutRendering = (request: Request, url: URL) => {
  // `www.` is attached as a custom domain too; send it to the apex so auth
  // cookies and BETTER_AUTH_URL only ever see one origin.
  if (url.hostname === `www.${SITE.DOMAIN}`) {
    const apex = new URL(url);
    apex.hostname = SITE.DOMAIN;
    return Response.redirect(apex.toString(), 301);
  }
  // One URL per page: `/en/tools/` (and `/en/`) move permanently to the
  // slashless form the router renders, rather than through the router's own
  // temporary redirect. API and framework paths keep their exact form.
  const isAppPath = !SKIP_PREFIXES.some((prefix) =>
    url.pathname.startsWith(prefix)
  );
  if (url.pathname.length > 1 && url.pathname.endsWith("/") && isAppPath) {
    const slashless = new URL(url);
    slashless.pathname = url.pathname.replace(/\/+$/u, "") || "/";
    return Response.redirect(slashless.toString(), 308);
  }
  // Probes and stale links (`/assets/old.js`, `/wp-admin/…`, `/.env`): real
  // assets never reach the Worker, so these can only be 404s.
  if (
    url.pathname.startsWith("/.") ||
    url.pathname.startsWith("/wp-") ||
    (HAS_FILE_EXTENSION.test(url.pathname) &&
      !GENERATED_FILES.has(url.pathname) &&
      isAppPath)
  ) {
    return notFound();
  }
  // The client asks for the session on every page load; without a session
  // cookie the answer is always "none", so skip loading Better Auth.
  if (
    (request.method === "GET" || request.method === "HEAD") &&
    url.pathname === "/api/auth/get-session" &&
    !hasSessionCookie(request.headers)
  ) {
    return Response.json(null, {
      headers: { "Cache-Control": "private, no-store" },
    });
  }
  return localeRedirect(request);
};

const route = async (
  request: Request,
  ctx: ExecutionContext
): Promise<Response> => {
  const url = new URL(request.url);
  const answered = answerWithoutRendering(request, url);
  if (answered) {
    return answered;
  }
  // Uploaded logos and covers (POST /api/upload), straight from R2.
  if (request.method === "GET" && url.pathname.startsWith(UPLOAD_PATH_PREFIX)) {
    const object = await env.UPLOADS.get(url.pathname.slice(1));
    if (!object) {
      return new Response("Not found", { status: 404 });
    }
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("ETag", object.httpEtag);
    // Uploads are images only; never let a browser treat one as a page.
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Content-Security-Policy", "default-src 'none'; sandbox");
    return new Response(object.body, { headers });
  }
  // Prerendered at build time: serve the HTML file. It doesn't exist yet
  // while the build itself prerenders these pages, so render instead.
  if (STATIC_PATHS.has(url.pathname)) {
    const page = await env.ASSETS.fetch(request);
    if (page.status !== 404) {
      return page;
    }
  }
  // Anonymous page views go through the shared cache, cookies stripped so
  // nothing personal can be rendered into the shared copy.
  if (isShareable(request, url)) {
    const shared = new URL(url);
    const tracking = [...shared.searchParams.keys()].filter((name) =>
      TRACKING_PARAM.test(name)
    );
    for (const name of tracking) {
      shared.searchParams.delete(name);
    }
    const anonymous = new Request(shared, request);
    anonymous.headers.delete("Cookie");
    return ctx.exports.Pages.fetch(anonymous);
  }
  const response = await handler.fetch(request);
  // Signed-in and account pages bypass Pages; never let a downstream cache
  // retain their HTML, even if the renderer provides no cache directive.
  if (isLocale(url.pathname.split("/")[1])) {
    const privateResponse = new Response(response.body, response);
    privateResponse.headers.set("Cache-Control", "private, no-store");
    return privateResponse;
  }
  return response;
};

export default {
  async fetch(request: Request, _env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    // Live presence WebSockets go straight to the one site-wide instance,
    // only from our own pages (other sites can't open sockets that count
    // against the Durable Object's free quota).
    if (url.pathname === PRESENCE_PATH) {
      const origin = request.headers.get("Origin");
      if (origin !== url.origin) {
        return new Response("Forbidden", { status: 403 });
      }
      const presence = env.PRESENCE.get(env.PRESENCE.idFromName("site"));
      return presence.fetch(request);
    }
    return withSecurityHeaders(await route(request, ctx));
  },
};
