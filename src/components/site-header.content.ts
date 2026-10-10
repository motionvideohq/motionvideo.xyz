import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "site-header",
  content: {
    navigation: t({
      en: "Main navigation",
      es: "Navegación principal",
      fr: "Navigation principale",
    }),
    discover: t({ en: "Discover", es: "Descubrir", fr: "Découvrir" }),
    tools: t({ en: "Tools", es: "Herramientas", fr: "Outils" }),
    creatives: t({ en: "Creatives", es: "Creativos", fr: "Créatifs" }),
    skills: t({ en: "Skills", es: "Habilidades", fr: "Compétences" }),
    extras: t({ en: "Extras", es: "Extras", fr: "Extras" }),
    more: t({ en: "More", es: "Más", fr: "Plus" }),
    sponsorSlot: t({
      en: "Your logo here: sponsor MotionVideo",
      es: "Tu logo aquí: patrocina MotionVideo",
      fr: "Votre logo ici : sponsorisez MotionVideo",
    }),
    sponsored: t({ en: "Sponsored", es: "Patrocinado", fr: "Sponsorisé" }),
    openMenu: t({ en: "Open menu", es: "Abrir menú", fr: "Ouvrir le menu" }),
    closeMenu: t({ en: "Close menu", es: "Cerrar menú", fr: "Fermer le menu" }),
    skill: t({ en: "SKILL.md", es: "SKILL.md", fr: "SKILL.md" }),
    skillLabel: t({
      en: "Get the MotionVideo agent skill (SKILL.md)",
      es: "Obtén la habilidad de agente MotionVideo (SKILL.md)",
      fr: "Obtenir la compétence d’agent MotionVideo (SKILL.md)",
    }),
    accountMenu: t({
      en: "Account menu",
      es: "Menú de la cuenta",
      fr: "Menu du compte",
    }),
    bookmarks: t({ en: "Bookmarks", es: "Guardados", fr: "Favoris" }),
    dashboard: t({ en: "Dashboard", es: "Panel", fr: "Tableau de bord" }),
    signOut: t({ en: "Sign out", es: "Cerrar sesión", fr: "Se déconnecter" }),
    signIn: t({
      en: "Sign in or create an account",
      es: "Inicia sesión o crea una cuenta",
      fr: "Connectez-vous ou créez un compte",
    }),
  },
} satisfies Dictionary;
