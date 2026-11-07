import { useLocation } from "@tanstack/react-router";
import { getHTMLTextDir, getPathWithoutLocale } from "intlayer";
import type { LocalesValues } from "intlayer";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { IntlayerProvider } from "react-intlayer";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  localizedPath,
} from "@/constants/locales";

const rememberLocale = (locale: LocalesValues) => {
  if (typeof document === "undefined") {
    return;
  }
  // The Worker reads this cookie to negotiate a locale for unprefixed requests.
  // oxlint-disable-next-line unicorn/no-document-cookie
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
};

/**
 * Locale comes from the URL (`/fr/...`, or no prefix for English), so
 * switching languages is a navigation to the same page with a different
 * prefix rather than local state.
 */
const LocaleEffect = ({ locale }: { locale: LocalesValues }) => {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = getHTMLTextDir(locale);
    rememberLocale(locale);
  }, [locale]);
  return null;
};

export const LocaleProvider = ({
  children,
  locale,
}: {
  children: ReactNode;
  locale: LocalesValues;
}) => {
  const location = useLocation();

  const setLocale = (nextLocale: LocalesValues) => {
    if (typeof window === "undefined" || nextLocale === locale) {
      return;
    }
    // Remembered first: the Worker sends unprefixed (English) visits to the
    // cookie's locale, which would otherwise bounce a switch to English back.
    rememberLocale(nextLocale);
    const path = localizedPath(
      getPathWithoutLocale(location.pathname),
      nextLocale
    );
    // A full load keeps the server-rendered document, loaders, and `<html
    // lang>` in sync with the new prefix.
    window.location.assign(
      `${path}${window.location.search}${window.location.hash}`
    );
  };

  return (
    <IntlayerProvider
      defaultLocale={DEFAULT_LOCALE}
      isCookieEnabled={false}
      locale={locale}
      setLocale={setLocale}
    >
      <LocaleEffect locale={locale} />
      {children}
    </IntlayerProvider>
  );
};
