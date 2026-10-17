import type { IntlayerConfig } from "intlayer";

const config = {
  internationalization: {
    locales: ["en", "es", "fr", "zh", "ko", "ja", "de", "pt", "ru"],
    defaultLocale: "en",
  },
  routing: {
    enableProxy: false,
    storage: false,
  },
  content: {
    contentDir: ["src"],
  },
} satisfies IntlayerConfig;

export default config;
