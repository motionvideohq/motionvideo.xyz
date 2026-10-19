import {
  oauthProviderAuthServerMetadata,
  oauthProviderOpenIdConfigMetadata,
} from "@better-auth/oauth-provider";
import { createFileRoute } from "@tanstack/react-router";

import {
  OAUTH_OPENID_CONFIG_SUFFIX,
  OAUTH_WELL_KNOWN_SUFFIX,
} from "@/constants/oauth";
import { auth } from "@/server/auth";

// Path-appended OAuth discovery (RFC 8414 §3.1, OIDC Discovery §4):
// `/api/auth/.well-known/<name>`. The path-inserted spellings live in
// src/routes/[.]well-known.$.ts.

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

const handle = (request: Request): Promise<Response> => {
  const { pathname } = new URL(request.url);
  if (pathname.endsWith(OAUTH_WELL_KNOWN_SUFFIX)) {
    return authServerMetadata(request);
  }
  if (pathname.endsWith(OAUTH_OPENID_CONFIG_SUFFIX)) {
    return openIdConfigMetadata(request);
  }
  return auth.handler(request);
};

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handle(request),
      POST: ({ request }) => auth.handler(request),
    },
  },
});
