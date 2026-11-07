import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { z } from "zod";

import { LoginForm } from "@/components/login-form";
import { SignInFeed } from "@/components/sign-in-feed";
import { BrandHeader } from "@/components/site-header";
import {
  DEFAULT_LOCALE,
  ensureLocalizedPath,
  isLocale,
  localizedPath,
} from "@/constants/locales";
import type { LocaleHeadContext } from "@/constants/locales";
import { OAUTH_AUTHORIZE_PATH } from "@/constants/oauth";
import { ROUTES } from "@/constants/routes";
import { useHydrated } from "@/lib/use-hydrated";
import { createMetadata } from "@/seo/metadata";
import { getSignInFeed } from "@/server/sign-in-functions";

interface SignInSearch {
  redirect?: string;
}

const routeApi = getRouteApi("/$locale/sign-in");

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
// and bookmark buttons open the same form in a dialog. On lg+ the gallery
// scrolls by in the right half.
const SignIn = () => {
  const search = routeApi.useSearch();
  const { locale } = routeApi.useParams();
  const feed = routeApi.useLoaderData();
  const hydrated = useHydrated();

  // OAuth flows (MCP clients signing in) bounce through here with the signed
  // authorize query, and resuming hands it back untouched. The server-rendered
  // value is a never-read fallback: `callbackURL` is used in click handlers
  // only.
  const params = hydrated ? new URLSearchParams(window.location.search) : null;
  const resumingOAuth =
    params !== null && authorizeParams.every((key) => params.has(key));
  let redirectTo = localizedPath(ROUTES.DASHBOARD, locale);
  if (resumingOAuth) {
    redirectTo = `${OAUTH_AUTHORIZE_PATH}${window.location.search}`;
  } else if (search.redirect) {
    // Links from before the locale prefix still come back to the right page.
    redirectTo = ensureLocalizedPath(search.redirect, locale);
  }
  return (
    <div className="relative grid min-h-svh lg:grid-cols-2">
      {/* Spans the whole page, not just the form's half, so the logo sits
          where the site header puts it on wide screens too. */}
      <BrandHeader className="absolute inset-x-0 top-0" />
      {/* Centred in its half, vertically too; the padding keeps it clear of
          the brand row on short screens. */}
      <main
        id="main-content"
        className="flex min-h-svh items-center justify-center px-6 py-24"
      >
        <div className="w-full max-w-sm">
          <LoginForm layout="page" callbackURL={redirectTo} />
        </div>
      </main>
      <div className="sticky top-0 hidden h-svh p-2 lg:block">
        <div className="bg-muted size-full overflow-hidden rounded-2xl">
          <SignInFeed videos={feed} />
        </div>
      </div>
    </div>
  );
};

export const Route = createFileRoute("/$locale/sign-in")({
  component: SignIn,
  loader: () => getSignInFeed(),
  staticData: { noIndex: true },
  head: ({ params }: LocaleHeadContext) =>
    createMetadata({
      title: getIntlayer(
        "account-meta",
        isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
      ).signInTitle,
    }),
  validateSearch: (search): SignInSearch => ({
    redirect: safeRedirect.safeParse(search.redirect).data,
  }),
});
