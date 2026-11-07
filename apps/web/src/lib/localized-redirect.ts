import { redirect } from "@tanstack/react-router";
import { getPrefix } from "intlayer";
import type { LocalesValues } from "intlayer";

import { LOCALE_ROUTE } from "@/components/localized-link";
import { I18N_ROUTING } from "@/constants/locales";
import type { LocalizedNavigateOptions } from "@/hooks/use-localized-navigate";

/**
 * Loose redirect options, for the same reason as `LocalizedNavigateOptions`:
 * callers write app paths, not the generated `/{-$locale}/...` route ids.
 */
type LocalizedRedirectOptions = Omit<
  LocalizedNavigateOptions,
  "to" | "params"
> & {
  params?: Record<string, string | undefined>;
  href?: string;
  code?: number;
  statusCode?: number;
  headers?: HeadersInit;
  throw?: unknown;
};

/**
 * `redirect` for routes under `/{-$locale}`: callers pass the app path
 * (`/sign-in`) and the route's `locale` param (absent in English), and the
 * locale's prefix is inserted as a route param.
 */
export const localizedRedirect = (
  to: string,
  locale: LocalesValues | undefined,
  options: LocalizedRedirectOptions = {}
) =>
  // SAFETY: `to` is an app path; prepending the locale segment produces the
  // matching generated `/{-$locale}/...` route id.
  redirect({
    ...options,
    params: {
      locale: getPrefix(locale, I18N_ROUTING).localePrefix,
      ...options.params,
    },
    to: `/${LOCALE_ROUTE}${to}`,
  } as never);
