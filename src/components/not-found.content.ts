import { t } from "intlayer";
import type { Dictionary } from "intlayer";

const notFound = {
  key: "not-found",
  content: {
    notFoundTitle: t({
      en: "This frame didn’t render.",
      es: "Este fotograma no se ha renderizado.",
      fr: "Cette image n’a pas été rendue.",
      zh: "这一帧没有渲染出来。",
    }),
    notFoundBody: t({
      en: "The page you’re looking for isn’t in the cut. It may have moved, or the link is wrong.",
      es: "La página que buscas no está en el montaje. Puede que se haya movido o que el enlace sea incorrecto.",
      fr: "La page recherchée ne fait pas partie du montage. Elle a peut-être été déplacée, ou le lien est incorrect.",
      zh: "你要找的页面不在这一版剪辑里。它可能已被移动，或链接有误。",
    }),
    backHome: t({
      en: "Back to home",
      es: "Volver al inicio",
      fr: "Retour à l’accueil",
      zh: "返回首页",
    }),
    reportLink: t({
      en: "Report a broken link",
      es: "Notificar un enlace roto",
      fr: "Signaler un lien cassé",
      zh: "报告失效链接",
    }),
  },
} satisfies Dictionary;

export default notFound;
