// Better Auth's session cookie (`__Secure-` prefixed over HTTPS). Its mere
// presence says "maybe signed in"; without it the visitor is certainly
// anonymous, so the Worker can skip loading Better Auth, querying D1, and can
// serve them the shared cached page. Presence is not proof: whoever needs the
// session still verifies it with Better Auth.
const SESSION_COOKIE = /(?:^|;\s*)(?:__Secure-)?better-auth\.session_token=/u;

/** Whether the request carries a Better Auth session cookie at all. */
export const hasSessionCookie = (headers: Headers) =>
  SESSION_COOKIE.test(headers.get("Cookie") ?? "");
