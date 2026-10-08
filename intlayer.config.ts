import type { IntlayerConfig } from "intlayer";

const config = {
  internationalization: {
    locales: ["en", "es", "fr"],
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
