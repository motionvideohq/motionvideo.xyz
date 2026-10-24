// This site is the OAuth 2.1 authorization server for the MotionVideo MCP
// server (mcp.motionvideo.xyz). Access tokens are audience-bound to the MCP
// resource and carry the account scope; every value here is public, so the
// MCP server keeps its own copy.

/** The MCP protected resource (RFC 8707) this site issues access tokens for. */
export const MCP_RESOURCE = "https://mcp.motionvideo.xyz/mcp";

/**
 * The scope every signed-in tool on the MCP server needs: bookmarks,
 * featured submissions and, with a Pro or Business plan, the Pro Moves tools.
 */
export const MCP_SCOPE = "account";

/** Scopes this authorization server accepts requests for, in consent order. */
export const OAUTH_SCOPES = [
  "openid",
  "profile",
  "email",
  "offline_access",
  MCP_SCOPE,
] as const;

/** Better Auth's base path; the OAuth endpoints all live under it. */
export const OAUTH_BASE_PATH = "/api/auth";

/** Better Auth endpoints the OAuth flows navigate through. */
export const OAUTH_AUTHORIZE_PATH = `${OAUTH_BASE_PATH}/oauth2/authorize`;
export const OAUTH_CONSENT_PATH = `${OAUTH_BASE_PATH}/oauth2/consent`;
export const OAUTH_PUBLIC_CLIENT_PATH = `${OAUTH_BASE_PATH}/oauth2/public-client`;

// Discovery documents come in two shapes (RFC 8414 §3.1 and OIDC Discovery
// §4): the path is either inserted after `/.well-known/…` or appended to the
// issuer's own path, so both spellings of each document exist.
/** Path-insertion suffix: `/.well-known/<name>/api/auth`. */
export const OAUTH_WELL_KNOWN_SUFFIX =
  "/.well-known/oauth-authorization-server";
export const OAUTH_OPENID_CONFIG_SUFFIX = "/.well-known/openid-configuration";
