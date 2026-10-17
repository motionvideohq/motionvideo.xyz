import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "bookmark-button",
  content: {
    add: t({ en: "Bookmark", es: "Guardar", fr: "Enregistrer", zh: "收藏" }),
    remove: t({
      en: "Remove bookmark",
      es: "Quitar de guardados",
      fr: "Retirer des favoris",
      zh: "取消收藏",
    }),
    signInReason: t({
      en: "Sign in or create a free account to save bookmarks.",
      es: "Inicia sesión o crea una cuenta gratuita para guardar favoritos.",
      fr: "Connectez-vous ou créez un compte gratuit pour enregistrer des favoris.",
      zh: "登录或创建免费账号即可保存收藏。",
    }),
  },
} satisfies Dictionary;
