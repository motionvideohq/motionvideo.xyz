import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { z } from "zod";

import { LoginForm } from "@/components/login-form";
import { OAUTH_AUTHORIZE_PATH } from "@/constants/oauth";
import { ROUTES } from "@/constants/routes";
import { useHydrated } from "@/lib/use-hydrated";
import { createMetadata } from "@/seo/metadata";

interface SignInSearch {
  redirect?: string;
}

const routeApi = getRouteApi("/sign-in");

// Same-origin paths only, never "//evil.com".
const safeRedirect = z
  .string()
  .startsWith("/")
  .refine((path) => !path.startsWith("//"));

// An OAuth authorize request always carries these. It is detected in the
// browser, never in `validateSearch`: the signed query must reach the
// authorization server byte for byte, and any search value this route adds on
// top of the URL makes the router rewrite (and re-encode) the whole query,
// which breaks the signature.
const authorizeParams = ["client_id", "redirect_uri", "response_type", "sig"];

// Direct visits and redirects from account-only pages; elsewhere the header
// and bookmark buttons open the same form in a dialog.
const SignIn = () => {
  const search = routeApi.useSearch();
  const hydrated = useHydrated();

  // OAuth flows (MCP clients signing in) bounce through here with the signed
  // authorize query, and resuming hands it back untouched. The server-rendered
  // value is a never-read fallback: `callbackURL` is used in click handlers
  // only.
  const params = hydrated ? new URLSearchParams(window.location.search) : null;
  const resumingOAuth =
    params !== null && authorizeParams.every((key) => params.has(key));
  const callbackURL =
    resumingOAuth && params !== null
      ? `${OAUTH_AUTHORIZE_PATH}${window.location.search}`
      : (search.redirect ?? ROUTES.DASHBOARD);

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <LoginForm callbackURL={callbackURL} />
      </div>
    </main>
  );
};

export const Route = createFileRoute("/sign-in")({
  component: SignIn,
  head: () =>
    createMetadata({
      canonical: ROUTES.SIGN_IN,
      noIndex: true,
      title: "Sign in",
    }),
  validateSearch: (search): SignInSearch => ({
    redirect: safeRedirect.safeParse(search.redirect).data,
  }),
});
