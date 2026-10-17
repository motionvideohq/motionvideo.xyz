import { t } from "intlayer";
import type { Dictionary } from "intlayer";

const localeSwitcher = {
  key: "locale-switcher",
  content: {
    language: t({
      en: "Language",
      es: "Idioma",
      fr: "Langue",
      zh: "语言",
      ko: "언어",
      ja: "言語",
      de: "Sprache",
      pt: "Idioma",
      ru: "Язык",
    }),
  },
} satisfies Dictionary;

export default localeSwitcher;
