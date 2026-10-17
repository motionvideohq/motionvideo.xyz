import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "keyboard-shortcuts",
  content: {
    title: t({
      en: "Keyboard shortcuts",
      es: "Atajos de teclado",
      fr: "Raccourcis clavier",
      zh: "键盘快捷键",
    }),
    description: t({
      en: "Press a key anywhere outside a text field.",
      es: "Pulsa una tecla en cualquier lugar fuera de un campo de texto.",
      fr: "Appuyez sur une touche n’importe où, hors d’un champ de texte.",
      zh: "在文本框以外的任意位置按键即可。",
    }),
    general: t({ en: "General", es: "General", fr: "Général", zh: "通用" }),
    sections: t({
      en: "Sections",
      es: "Secciones",
      fr: "Sections",
      zh: "栏目",
    }),
    account: t({ en: "Account", es: "Cuenta", fr: "Compte", zh: "账号" }),
    videos: t({ en: "Videos", es: "Videos", fr: "Vidéos", zh: "视频" }),
    search: t({ en: "Search", es: "Buscar", fr: "Rechercher", zh: "搜索" }),
    toggleTheme: t({
      en: "Toggle theme",
      es: "Cambiar tema",
      fr: "Changer de thème",
      zh: "切换主题",
    }),
    toggleSounds: t({
      en: "Mute or unmute sounds",
      es: "Silenciar o activar sonidos",
      fr: "Couper ou activer les sons",
      zh: "静音或取消静音",
    }),
    toggleCursors: t({
      en: "Show or hide live cursors",
      es: "Mostrar u ocultar cursores en vivo",
      fr: "Afficher ou masquer les curseurs en direct",
      zh: "显示或隐藏实时光标",
    }),
    showShortcuts: t({
      en: "Show keyboard shortcuts",
      es: "Mostrar atajos de teclado",
      fr: "Afficher les raccourcis clavier",
      zh: "显示键盘快捷键",
    }),
    previousVideo: t({
      en: "Previous video",
      es: "Video anterior",
      fr: "Vidéo précédente",
      zh: "上一个视频",
    }),
    nextVideo: t({
      en: "Next video",
      es: "Video siguiente",
      fr: "Vidéo suivante",
      zh: "下一个视频",
    }),
    closeVideo: t({
      en: "Close video",
      es: "Cerrar video",
      fr: "Fermer la vidéo",
      zh: "关闭视频",
    }),
  },
} satisfies Dictionary;
