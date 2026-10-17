import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "copy-prompt-button",
  content: {
    copy: t({
      en: "Copy prompt",
      es: "Copiar instrucción",
      fr: "Copier l’instruction",
    }),
    copied: t({ en: "Copied", es: "Copiada", fr: "Copiée" }),
    copyError: t({
      en: "Couldn’t copy. Select the text and copy it manually.",
      es: "No se pudo copiar. Selecciona el texto y cópialo manualmente.",
      fr: "Copie impossible. Sélectionnez le texte et copiez-le manuellement.",
    }),
  },
} satisfies Dictionary;
