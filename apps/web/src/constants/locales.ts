import { defaultLocale, locales } from "intlayer";
import type { LocalesValues } from "intlayer";

/** Every locale the site renders, in switcher order. */
// SAFETY: intlayer's generated config types `locales` with the project's locale
// union, which `LocalesValues` also models.
export const LOCALES = locales as readonly LocalesValues[];

// SAFETY: the generated config's default locale is one of the configured locales.
export const DEFAULT_LOCALE = defaultLocale as LocalesValues;

/** Each language in its own name. */
export const LOCALE_NAMES: Record<LocalesValues, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  zh: "简体中文",
  ko: "한국어",
  ja: "日本語",
  de: "Deutsch",
  pt: "Português",
  ru: "Русский",
};

/**
 * English, the default locale, lives at the bare path (`/tools`); every other
 * locale sits ahead of the page (`/fr/tools`), matched by the optional
 * `{-$locale}` route segment. Passing the mode explicitly keeps helpers
 * correct even before the generated Intlayer config has been rebuilt.
 */
export const I18N_ROUTING = {
  defaultLocale: DEFAULT_LOCALE,
  mode: "prefix-no-default" as const,
};

const DEFAULT_PREFIX = `/${DEFAULT_LOCALE}`;

/** Paths served outside the locale routes: APIs, framework, uploads, OAuth discovery. */
export const NON_PAGE_PREFIXES = ["/api/", "/_", "/uploads/", "/.well-known/"];

// Site files at fixed URLs (`/llms.txt`, `/docs/mcp.md`) and static assets.
const FILE_PATH = /\.[a-z0-9]+$/iu;

/** Whether a pathname is a page (localized) rather than an API path or a file. */
export const isPagePath = (pathname: string): boolean =>
  !NON_PAGE_PREFIXES.some((prefix) => pathname.startsWith(prefix)) &&
  !FILE_PATH.test(pathname);

export const isLocale = (value: unknown): value is LocalesValues =>
  // SAFETY: `includes` is true only for the locale strings in LOCALES, which
  // the generated config guarantees are LocalesValues.
  typeof value === "string" && LOCALES.includes(value as LocalesValues);

/**
 * What a route `head` under `/{-$locale}` reads (no locale for English).
 * Annotating a head's argument with this (instead of letting TanStack infer
 * the full context) keeps the head from feeding back into the route's own
 * loader/search inference, which otherwise collapses those types to `{}` on
 * routes that declare a loader.
 */
export interface LocaleHeadContext {
  params: { locale?: string };
}

/**
 * Drop the default locale's prefix from a path (`/en/tools?x=1` →
 * `/tools?x=1`, `/en` → `/`). Other paths pass through.
 */
export const withoutDefaultLocale = (path: string): string => {
  if (!path.startsWith(DEFAULT_PREFIX)) {
    return path;
  }
  const rest = path.slice(DEFAULT_PREFIX.length);
  if (rest === "" || rest.startsWith("/")) {
    return rest || "/";
  }
  return /^[?#]/u.test(rest) ? `/${rest}` : path;
};

/**
 * The public URL of an unprefixed app path (`/tools`) in a locale: `/fr/tools`,
 * or `/tools` for English. A non-default home is `/fr` rather than `/fr/`.
 */
export const localizedPath = (path: string, locale: LocalesValues): string => {
  let suffix = path;
  if (suffix === "/") {
    suffix = "";
  } else if (!suffix.startsWith("/")) {
    suffix = `/${suffix}`;
  }
  if (locale === DEFAULT_LOCALE) {
    return suffix || "/";
  }
  return `/${locale}${suffix}`;
};

/**
 * Localize a path only when it has no locale yet. Redirect targets can arrive
 * as an app path (`/dashboard`) or an already-localized URL (`/fr/dashboard`);
 * a legacy `/en/…` URL loses its prefix.
 */
export const ensureLocalizedPath = (
  path: string,
  locale: LocalesValues
): string => {
  const [pathname] = path.split(/[?#]/u);
  const [, segment] = pathname.split("/");
  return isLocale(segment)
    ? withoutDefaultLocale(path)
    : localizedPath(path, locale);
};

/** Locale of a pathname, or the default locale when it has no locale prefix. */
export const localeFromPath = (pathname: string): LocalesValues => {
  const [, segment] = pathname.split("/");
  return isLocale(segment) ? segment : DEFAULT_LOCALE;
};

/** The locale of an optional `{-$locale}` route param: none means English. */
export const localeParam = (locale?: string): LocalesValues =>
  LOCALES.find((supported) => supported === locale) ?? DEFAULT_LOCALE;

/** Locale used for the `og:locale` meta tag (`en` → `en_US`). */
const OG_LOCALES: Record<LocalesValues, string> = {
  de: "de_DE",
  en: "en_US",
  es: "es_ES",
  fr: "fr_FR",
  ja: "ja_JP",
  ko: "ko_KR",
  pt: "pt_PT",
  ru: "ru_RU",
  zh: "zh_CN",
};

export const ogLocale = (locale: LocalesValues): string => OG_LOCALES[locale];

/** Cookie Intlayer and the Worker use to remember a negotiated locale. */
export const LOCALE_COOKIE = "INTLAYER_LOCALE";
