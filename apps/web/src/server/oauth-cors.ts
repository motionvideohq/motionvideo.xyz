// OAuth 2.1 protocol endpoints are called cross-origin by browser-based MCP
// clients (web connectors, MCP Inspector). The endpoints below never rely on
// cookies, so a wildcard origin is safe: without
// `Access-Control-Allow-Credentials` the browser neither sends nor exposes
// credentialed data, and the site's own pages are same-origin anyway.
//
// /oauth2/authorize and /oauth2/consent are plain navigations from our pages
// and never need CORS.

const CORS_HEADERS = {
  "access-control-allow-headers": "content-type, authorization",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-origin": "*",
  "access-control-max-age": "86400",
} as const;

// Token exchange, dynamic client registration, revocation, introspection,
// and the JWKS.
const CORS_PATHS: ReadonlySet<string> = new Set([
  "/api/auth/jwks",
  "/api/auth/oauth2/introspect",
  "/api/auth/oauth2/register",
  "/api/auth/oauth2/revoke",
  "/api/auth/oauth2/token",
]);

/** An OPTIONS preflight for a public OAuth endpoint; `undefined` for others. */
export const oauthPreflight = (request: Request): Response | undefined => {
  if (
    request.method !== "OPTIONS" ||
    !CORS_PATHS.has(new URL(request.url).pathname)
  ) {
    return undefined;
  }
  return new Response(null, { headers: CORS_HEADERS, status: 204 });
};

/** Adds CORS headers to responses of the public OAuth endpoints. */
export const withOAuthCors = (
  request: Request,
  response: Response
): Response => {
  if (!CORS_PATHS.has(new URL(request.url).pathname)) {
    return response;
  }
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(CORS_HEADERS)) {
    headers.set(name, value);
  }
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
};
