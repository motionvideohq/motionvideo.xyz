import type { IntlayerConfig } from "intlayer";

const config = {
  internationalization: {
    locales: ["en", "es", "fr", "zh", "ko", "ja", "de", "pt", "ru"],
    defaultLocale: "en",
  },
  routing: {
    // English (the default) has no prefix, every other locale does:
    // `/about`, `/fr/about`, and so on.
    mode: "prefix-no-default",
    // The URL is the source of truth; the Worker sends unprefixed visits to a
    // non-English locale negotiated from the cookie or Accept-Language.
    storage: false,
    enableProxy: false,
  },
  content: {
    contentDir: ["src"],
  },
} satisfies IntlayerConfig;

export default config;
