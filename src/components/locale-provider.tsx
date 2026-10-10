import type { LocalesValues } from "intlayer";
import { useEffect, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import { IntlayerProvider, useLocale } from "react-intlayer";

export const LOCALE_STORAGE_KEY = "motionvideo-locale";
export const SUPPORTED_LOCALES = ["en", "es", "fr"] as const;

const isSupportedLocale = (
  value: string | null
): value is (typeof SUPPORTED_LOCALES)[number] =>
  SUPPORTED_LOCALES.some((locale) => locale === value);

let sessionLocale: LocalesValues = "en";
const localeListeners = new Set<() => void>();

const getServerLocale = (): LocalesValues => "en";

const getBrowserLocale = (): LocalesValues => {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isSupportedLocale(saved) ? saved : "en";
  } catch {
    return sessionLocale;
  }
};

const subscribeLocale = (onChange: () => void) => {
  localeListeners.add(onChange);
  const onStorage = (event: StorageEvent) => {
    if (event.key === LOCALE_STORAGE_KEY || event.key === null) {
      onChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    localeListeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
};

const setLocale = (nextLocale: LocalesValues) => {
  if (!isSupportedLocale(nextLocale)) {
    return;
  }
  sessionLocale = nextLocale;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
  } catch {
    // Private browsing may disable persistence without disabling translation.
  }
  for (const onChange of localeListeners) {
    onChange();
  }
};

const DocumentLanguage = () => {
  const { locale } = useLocale();
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
};

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  // Server rendering and initial hydration use the same English snapshot.
  // React adopts the browser snapshot only after hydration.
  const locale = useSyncExternalStore(
    subscribeLocale,
    getBrowserLocale,
    getServerLocale
  );

  return (
    <IntlayerProvider
      locale={locale}
      setLocale={setLocale}
      isCookieEnabled={false}
    >
      <DocumentLanguage />
      {children}
    </IntlayerProvider>
  );
};
