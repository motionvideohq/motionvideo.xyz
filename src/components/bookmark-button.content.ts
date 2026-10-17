import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "bookmark-button",
  content: {
    add: t({
      en: "Bookmark",
      es: "Guardar",
      fr: "Enregistrer",
      zh: "收藏",
      ko: "북마크",
      ja: "ブックマーク",
      de: "Merken",
      pt: "Guardar",
      ru: "В закладки",
    }),
    remove: t({
      en: "Remove bookmark",
      es: "Quitar de guardados",
      fr: "Retirer des favoris",
      zh: "取消收藏",
      ko: "북마크 해제",
      ja: "ブックマークを解除",
      de: "Merkzeichen entfernen",
      pt: "Remover dos guardados",
      ru: "Убрать из закладок",
    }),
    signInReason: t({
      en: "Sign in or create a free account to save bookmarks.",
      es: "Inicia sesión o crea una cuenta gratuita para guardar favoritos.",
      fr: "Connectez-vous ou créez un compte gratuit pour enregistrer des favoris.",
      zh: "登录或创建免费账号即可保存收藏。",
      ko: "북마크를 저장하려면 로그인하거나 무료 계정을 만드세요.",
      ja: "ブックマークを保存するには、ログインするか無料アカウントを作成してください。",
      de: "Melde dich an oder erstelle ein kostenloses Konto, um Videos zu merken.",
      pt: "Inicia sessão ou cria uma conta gratuita para guardar favoritos.",
      ru: "Войдите или создайте бесплатный аккаунт, чтобы сохранять закладки.",
    }),
  },
} satisfies Dictionary;
