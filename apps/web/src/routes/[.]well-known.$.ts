import {
  oauthProviderAuthServerMetadata,
  oauthProviderOpenIdConfigMetadata,
} from "@better-auth/oauth-provider";
import { createFileRoute } from "@tanstack/react-router";

import {
  OAUTH_BASE_PATH,
  OAUTH_OPENID_CONFIG_SUFFIX,
  OAUTH_WELL_KNOWN_SUFFIX,
} from "@/constants/oauth";
import { auth } from "@/server/auth";

// OAuth discovery for clients that insert the issuer path after the
// `.well-known` segment (RFC 8414 §3.1, OIDC Discovery §4): the MCP server's
// authorization server is this site, at `https://motionvideo.xyz/api/auth`.
// The path-appended spellings under /api/auth/.well-known are handled by the
// /api/auth catch-all, and mcp.motionvideo.xyz serves its own discovery too.

const metadataHeaders = {
  "access-control-allow-origin": "*",
  "cache-control": "public, max-age=300",
};

const authServerMetadata = oauthProviderAuthServerMetadata(auth, {
  headers: metadataHeaders,
});
const openIdConfigMetadata = oauthProviderOpenIdConfigMetadata(auth, {
  headers: metadataHeaders,
});

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
        return new Response("Not found", { status: 404 });
      },
    },
  },
});
