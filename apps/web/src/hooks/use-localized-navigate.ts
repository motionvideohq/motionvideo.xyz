import { useNavigate } from "@tanstack/react-router";
import { getPrefix } from "intlayer";
import { useLocale } from "react-intlayer";

import { LOCALE_ROUTE } from "@/components/localized-link";
import { I18N_ROUTING } from "@/constants/locales";

/** Values accepted in a route's params or search object. */
export type LocalizedRouteValue = string | number | boolean | undefined;

/**
 * Navigation options for app paths: `to` is written without the locale segment
 * (`to: ROUTES.DASHBOARD`), and the wrapper inserts `/$locale`.
 *
 * These are intentionally loose. The generated router types only know the
 * `/$locale/...` routes, so typing callers against them would force every page
 * to spell the locale segment itself.
 */
export interface LocalizedNavigateOptions {
  to?: string;
  params?: Record<string, LocalizedRouteValue>;
  search?:
    | object
    | true
    | ((previous: Record<string, LocalizedRouteValue>) => object);
  replace?: boolean;
  resetScroll?: boolean;
  hash?: string | true;
  state?: unknown;
  viewTransition?: boolean;
  ignoreBlocker?: boolean;
  reloadDocument?: boolean;
  mask?: unknown;
  from?: string;
}

export type LocalizedNavigate = (
  options: LocalizedNavigateOptions
) => Promise<void>;

/**
 * `useNavigate` for locale-prefixed routes: callers keep passing the app path
 * (`to: ROUTES.DASHBOARD`) and the wrapper inserts the current locale.
 */
export const useLocalizedNavigate = (): LocalizedNavigate => {
  const navigate = useNavigate();
  const { locale } = useLocale();
  const { localePrefix } = getPrefix(locale, I18N_ROUTING);

  const localizedNavigate: LocalizedNavigate = ({
    params,
    search,
    to = "/",
    ...rest
  }) => {
    // Relative navigation (`.`/`..`) stays on the current route, which already
    // carries the locale.
    if (to.startsWith(".")) {
      // SAFETY: the router accepts app paths, but its generated types only
      // expose the `/$locale/...` ids.
      return navigate({ ...rest, params, search, to } as never);
    }

    // SAFETY: `to` is an app path; prepending the locale segment produces the
    // matching generated `/$locale/...` route id.
    return navigate({
      ...rest,
      params: { locale: localePrefix, ...params },
      search,
      to: `/${LOCALE_ROUTE}${to}`,
    } as never);
  };

  return localizedNavigate;
};
