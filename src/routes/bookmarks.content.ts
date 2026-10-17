import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "bookmarks-page",
  content: {
    title: t({ en: "Bookmarks", es: "Guardados", fr: "Favoris", zh: "收藏" }),
    intro: t({
      en: "Videos, tools, creatives, skills, and extras you saved, newest first.",
      es: "Los vídeos, herramientas, creativos, habilidades y extras que has guardado, los más recientes primero.",
      fr: "Les vidéos, outils, créatifs, compétences et extras que vous avez enregistrés, les plus récents d’abord.",
      zh: "你保存的视频、工具、创意团队、技能和其他资源，按最新排序。",
    }),
    filterKind: t({
      en: "Filter by type",
      es: "Filtrar por tipo",
      fr: "Filtrer par type",
      zh: "按类型筛选",
    }),
    all: t({ en: "All", es: "Todo", fr: "Tout", zh: "全部" }),
    // Chip labels, keyed by bookmark kind.
    kinds: {
      video: t({ en: "Videos", es: "Vídeos", fr: "Vidéos", zh: "视频" }),
      tool: t({ en: "Tools", es: "Herramientas", fr: "Outils", zh: "工具" }),
      studio: t({
        en: "Creatives",
        es: "Creativos",
        fr: "Créatifs",
        zh: "创意团队",
      }),
      skill: t({
        en: "Skills",
        es: "Habilidades",
        fr: "Compétences",
        zh: "技能",
      }),
      extra: t({ en: "Extras", es: "Extras", fr: "Extras", zh: "其他资源" }),
    },
    emptyTitle: t({
      en: "No bookmarks yet",
      es: "Aún no tienes guardados",
      fr: "Aucun favori pour le moment",
      zh: "还没有收藏",
    }),
    emptyDescription: t({
      en: "Use the bookmark button on any video, tool, creative, skill, or extra to save it here.",
      es: "Usa el botón de guardar de cualquier vídeo, herramienta, creativo, habilidad o extra para tenerlo aquí.",
      fr: "Utilisez le bouton favori d’une vidéo, d’un outil, d’un créatif, d’une compétence ou d’un extra pour l’enregistrer ici.",
      zh: "在任意视频、工具、创意团队、技能或其他资源上点击收藏按钮，即可保存到这里。",
    }),
    discover: t({
      en: "Discover videos",
      es: "Descubrir vídeos",
      fr: "Découvrir des vidéos",
      zh: "发现视频",
    }),
  },
} satisfies Dictionary;
