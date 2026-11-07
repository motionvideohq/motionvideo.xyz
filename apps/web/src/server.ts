import handler from "@tanstack/react-start/server-entry";
import { env } from "cloudflare:workers";

import { CACHE_CONTROL } from "@/constants/cache-control";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALES,
  isLocale,
  localizedPath,
} from "@/constants/locales";
import { STATIC_PAGES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { currentOffer } from "@/lib/offers";
import { UPLOAD_PATH_PREFIX } from "@/lib/uploads";
import { deleteExpiredAuthRows } from "@/server/cleanup";
import { oauthPreflight, withOAuthCors } from "@/server/oauth-cors";
import { visitorOffer } from "@/server/visitor-pricing";

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
// OAuth discovery (`/.well-known/…`) is machine-read at fixed URLs.
const SKIP_PREFIXES = ["/api/", "/_", "/uploads/", "/.well-known/"];

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
        "Cache-Control": CACHE_CONTROL.PRIVATE,
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
 * While an offer runs for this visitor (src/lib/offers.ts), teaser included,
 * marks the page (`<html data-offer="black-friday-2026" data-offer-phase=
 * "sale">`) so its banner shows (OfferBanner). Done here, not in the render,
 * so prerendered pages get it too. The marked copy goes out without
 * validators: a browser can't then revalidate it against a cached unmarked
 * one, or keep the mark once the offer is over.
 */
const withOffer = async (request: Request, response: Response) => {
  if (!response.headers.get("Content-Type")?.startsWith("text/html")) {
    return response;
  }
  const current = await visitorOffer(request);
  if (!current) {
    return response;
  }
  const marked = new HTMLRewriter()
    .on("html", {
      element: (element) => {
        // An HTMLRewriter element, not a DOM node: it has no `dataset`.
        // oxlint-disable-next-line unicorn/prefer-dom-node-dataset
        element.setAttribute("data-offer", current.offer.id);
        // oxlint-disable-next-line unicorn/prefer-dom-node-dataset
        element.setAttribute("data-offer-phase", current.phase);
      },
    })
    .transform(response);
  const headers = new Headers(marked.headers);
  headers.delete("ETag");
  headers.delete("Last-Modified");
  headers.set("Cache-Control", "private, no-cache");
  return new Response(marked.body, { headers, status: marked.status });
};

// Worker entry. `www.` is attached as a custom domain too; send it to the
// apex so auth cookies and BETTER_AUTH_URL only ever see one origin.
const route = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  if (url.hostname === `www.${SITE.DOMAIN}`) {
    url.hostname = SITE.DOMAIN;
    return Response.redirect(url.toString(), 301);
  }
  // One URL per page: `/en/tools/` (and `/en/`) move permanently to the
  // slashless form the router renders, rather than through the router's own
  // temporary redirect. API and framework paths keep their exact form.
  if (
    url.pathname.length > 1 &&
    url.pathname.endsWith("/") &&
    !SKIP_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))
  ) {
    url.pathname = url.pathname.replace(/\/+$/u, "") || "/";
    return Response.redirect(url.toString(), 308);
  }
  const localized = localeRedirect(request);
  if (localized) {
    return localized;
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
  // while the build itself prerenders these pages, so render instead. While
  // an offer runs the file is fetched whole (no validators), so it can be
  // marked (withOffer) rather than answered with a 304 for the unmarked copy.
  if (STATIC_PATHS.has(url.pathname)) {
    let assetRequest = request;
    if (currentOffer(Date.now())) {
      const headers = new Headers(request.headers);
      headers.delete("If-None-Match");
      headers.delete("If-Modified-Since");
      assetRequest = new Request(request, { headers });
    }
    const page = await env.ASSETS.fetch(assetRequest);
    if (page.status !== 404) {
      return page;
    }
  }
  return handler.fetch(request);
};

export default {
  async fetch(request: Request) {
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
    const preflight = oauthPreflight(request);
    if (preflight) {
      return preflight;
    }
    return withSecurityHeaders(
      withOAuthCors(request, await withOffer(request, await route(request)))
    );
  },
  // Daily Cron Trigger (wrangler.jsonc `triggers`).
  async scheduled() {
    await deleteExpiredAuthRows();
  },
};
