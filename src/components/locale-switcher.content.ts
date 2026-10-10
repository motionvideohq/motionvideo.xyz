import { t } from "intlayer";
import type { Dictionary } from "intlayer";

const localeSwitcher = {
  key: "locale-switcher",
  content: {
    language: t({ en: "Language", es: "Idioma", fr: "Langue" }),
  },
} satisfies Dictionary;

export default localeSwitcher;
