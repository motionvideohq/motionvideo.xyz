import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "command-menu",
  content: {
    open: t({
      en: "Search MotionVideo",
      es: "Buscar en MotionVideo",
      fr: "Rechercher sur MotionVideo",
    }),
    placeholder: t({
      en: "Search videos, creators, tools, creatives…",
      es: "Buscar vídeos, creadores, herramientas, creativos…",
      fr: "Rechercher vidéos, créateurs, outils, créatifs…",
    }),
    close: t({
      en: "Close search",
      es: "Cerrar búsqueda",
      fr: "Fermer la recherche",
    }),
    empty: t({
      en: "Nothing matches that search.",
      es: "Nada coincide con esa búsqueda.",
      fr: "Aucun résultat pour cette recherche.",
    }),
    pages: t({ en: "Pages", es: "Páginas", fr: "Pages" }),
    popular: t({
      en: "Popular videos",
      es: "Vídeos populares",
      fr: "Vidéos populaires",
    }),
    videos: t({ en: "Videos", es: "Vídeos", fr: "Vidéos" }),
    categories: t({ en: "Categories", es: "Categorías", fr: "Catégories" }),
    discover: t({ en: "Discover", es: "Descubrir", fr: "Découvrir" }),
    tools: t({ en: "Tools", es: "Herramientas", fr: "Outils" }),
    creatives: t({ en: "Creatives", es: "Creativos", fr: "Créatifs" }),
    skills: t({ en: "Skills", es: "Habilidades", fr: "Compétences" }),
    extras: t({ en: "Extras", es: "Extras", fr: "Extras" }),
    submit: t({ en: "Submit", es: "Enviar", fr: "Proposer" }),
    bookmarks: t({ en: "Bookmarks", es: "Guardados", fr: "Favoris" }),
    sponsor: t({ en: "Sponsor", es: "Patrocinar", fr: "Sponsoriser" }),
    skill: t({
      en: "MotionVideo agent skill",
      es: "Habilidad de agente MotionVideo",
      fr: "Compétence d’agent MotionVideo",
    }),
  },
} satisfies Dictionary;
