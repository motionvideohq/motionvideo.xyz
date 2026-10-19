import handler from "@tanstack/react-start/server-entry";
import { env } from "cloudflare:workers";

import { STATIC_PAGES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { UPLOAD_PATH_PREFIX } from "@/lib/uploads";
import { oauthPreflight, withOAuthCors } from "@/server/oauth-cors";

// Durable Object classes must be exported from the Worker entry.
export { Presence } from "@/server/presence";

const PRESENCE_PATH = "/api/presence";

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

// Worker entry. `www.` is attached as a custom domain too; send it to the
// apex so auth cookies and BETTER_AUTH_URL only ever see one origin.
const route = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  if (url.hostname === `www.${SITE.DOMAIN}`) {
    url.hostname = SITE.DOMAIN;
    return Response.redirect(url.toString(), 301);
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
  if (STATIC_PAGES.includes(url.pathname)) {
    const page = await env.ASSETS.fetch(request);
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
    return withSecurityHeaders(withOAuthCors(request, await route(request)));
  },
};
