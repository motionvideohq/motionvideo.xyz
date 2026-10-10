import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "bookmark-button",
  content: {
    add: t({ en: "Bookmark", es: "Guardar", fr: "Enregistrer" }),
    remove: t({
      en: "Remove bookmark",
      es: "Quitar de guardados",
      fr: "Retirer des favoris",
    }),
    signInReason: t({
      en: "Sign in or create a free account to bookmark videos.",
      es: "Inicia sesión o crea una cuenta gratuita para guardar vídeos.",
      fr: "Connectez-vous ou créez un compte gratuit pour enregistrer des vidéos.",
    }),
  },
} satisfies Dictionary;
