import { t } from "intlayer";
import type { Dictionary } from "intlayer";

const feedButtons = {
  key: "feed-buttons",
  content: {
    // The chevron that opens the Atom and JSON Feed links.
    moreFormats: t({
      en: "More feed formats",
      es: "Más formatos de feed",
      fr: "Autres formats de flux",
      zh: "更多订阅格式",
      ko: "다른 피드 형식",
      ja: "その他のフィード形式",
      de: "Weitere Feed-Formate",
      pt: "Mais formatos de feed",
      ru: "Другие форматы ленты",
    }),
  },
} satisfies Dictionary;

export default feedButtons;
