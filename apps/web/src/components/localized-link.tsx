import { Link } from "@tanstack/react-router";
import type { LinkComponentProps } from "@tanstack/react-router";
import { getPrefix } from "intlayer";
import type { FC } from "react";
import { useLocale } from "react-intlayer";

import { I18N_ROUTING } from "@/constants/locales";

/**
 * The optional locale segment every page route sits under
 * (`src/routes/{-$locale}`). Keeping it in one place makes the link wrapper
 * and generated route ids line up with the docs' TanStack Start setup.
 */
export const LOCALE_ROUTE = "{-$locale}" as const;

/**
 * `Link` props with the app-facing `to` (no locale prefix). The router's route
 * ids include `{-$locale}`, so the wrapper adds it for the caller:
 * `to={ROUTES.TOOLS}` renders `/fr/tools`, or `/tools` in English (its
 * prefix is `undefined`, which drops the optional segment).
 */
type LocalizedLinkProps = Omit<LinkComponentProps, "params" | "to"> & {
  to: string;
  params?: Record<string, string | undefined>;
};

export const LocalizedLink: FC<LocalizedLinkProps> = ({
  params,
  to,
  ...props
}) => {
  const { locale } = useLocale();
  const { localePrefix } = getPrefix(locale, I18N_ROUTING);

  return (
    // SAFETY: TanStack's Link is generic over each route's params/search, so the
    // app-facing `to` (without a locale) and merged params are asserted at this
    // boundary; prepending `{-$locale}` produces the matching generated route id.
    <Link
      {...(props as object)}
      params={{ locale: localePrefix, ...params } as never}
      to={`/${LOCALE_ROUTE}${to}` as never}
    />
  );
};
