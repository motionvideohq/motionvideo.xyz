import {
  oauthProviderAuthServerMetadata,
  oauthProviderOpenIdConfigMetadata,
} from "@better-auth/oauth-provider";
import { createFileRoute } from "@tanstack/react-router";

import { LINK } from "@/constants/links";
import {
  OAUTH_BASE_PATH,
  OAUTH_OPENID_CONFIG_SUFFIX,
  OAUTH_WELL_KNOWN_SUFFIX,
} from "@/constants/oauth";
import { ROUTES } from "@/constants/routes";
import { absoluteUrl } from "@/constants/url";
import { getAuth } from "@/server/auth";

// OAuth discovery for clients that insert the issuer path after the
// `.well-known` segment (RFC 8414 §3.1, OIDC Discovery §4): the MCP server's
// authorization server is this site, at `https://motionvideo.xyz/api/auth`.
// The path-appended spellings under /api/auth/.well-known are handled by the
// /api/auth catch-all, and mcp.motionvideo.xyz serves its own discovery too.

const metadataHeaders = {
  "access-control-allow-origin": "*",
  "cache-control": "public, max-age=300",
};

// Built per request: `getAuth()` must not run at module scope.
const authServerMetadata = (request: Request) =>
  oauthProviderAuthServerMetadata(getAuth(), { headers: metadataHeaders })(
    request
  );
const openIdConfigMetadata = (request: Request) =>
  oauthProviderOpenIdConfigMetadata(getAuth(), { headers: metadataHeaders })(
    request
  );

const YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// RFC 9116 security.txt. `Expires` must stay under a year ahead, so it is
// computed per request (six months out) and never goes stale.
const securityTxt = () =>
  new Response(
    [
      `Contact: mailto:${LINK.EMAIL}`,
      `Contact: ${LINK.GITHUB_REPO}/security/advisories/new`,
      `Expires: ${new Date(Date.now() + YEAR_MS / 2).toISOString()}`,
      "Preferred-Languages: en",
      `Policy: ${absoluteUrl(ROUTES.SECURITY)}`,
      `Canonical: ${absoluteUrl("/.well-known/security.txt")}`,
      "",
    ].join("\n"),
    {
      headers: {
        "cache-control": "public, max-age=86400",
        "content-type": "text/plain; charset=utf-8",
      },
    }
  );

export const Route = createFileRoute("/.well-known/$")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const { pathname } = new URL(request.url);
        if (
          pathname === OAUTH_WELL_KNOWN_SUFFIX ||
          pathname === `${OAUTH_WELL_KNOWN_SUFFIX}${OAUTH_BASE_PATH}`
        ) {
          return authServerMetadata(request);
        }
        if (
          pathname === OAUTH_OPENID_CONFIG_SUFFIX ||
          pathname === `${OAUTH_OPENID_CONFIG_SUFFIX}${OAUTH_BASE_PATH}`
        ) {
          return openIdConfigMetadata(request);
        }
        if (pathname === "/.well-known/security.txt") {
          return securityTxt();
        }
        return new Response("Not found", { status: 404 });
      },
    },
  },
});
