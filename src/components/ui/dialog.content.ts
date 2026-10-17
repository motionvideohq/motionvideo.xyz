import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "dialog",
  content: {
    close: t({
      en: "Close",
      es: "Cerrar",
      fr: "Fermer",
      zh: "关闭",
      ko: "닫기",
      ja: "閉じる",
      de: "Schließen",
      pt: "Fechar",
      ru: "Закрыть",
    }),
  },
} satisfies Dictionary;
