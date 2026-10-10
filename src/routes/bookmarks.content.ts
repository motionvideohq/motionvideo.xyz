import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "bookmarks-page",
  content: {
    title: t({ en: "Bookmarks", es: "Guardados", fr: "Favoris" }),
    intro: t({
      en: "Videos you saved, newest first.",
      es: "Los vídeos que has guardado, los más recientes primero.",
      fr: "Les vidéos que vous avez enregistrées, les plus récentes d’abord.",
    }),
    emptyTitle: t({
      en: "No bookmarks yet",
      es: "Aún no tienes guardados",
      fr: "Aucun favori pour le moment",
    }),
    emptyDescription: t({
      en: "Use the bookmark button on any video to save it here.",
      es: "Usa el botón de guardar de cualquier vídeo para tenerlo aquí.",
      fr: "Utilisez le bouton favori d’une vidéo pour l’enregistrer ici.",
    }),
    discover: t({
      en: "Discover videos",
      es: "Descubrir vídeos",
      fr: "Découvrir des vidéos",
    }),
  },
} satisfies Dictionary;
