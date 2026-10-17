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
      ko: "이 프레임을 렌더링하지 못했습니다.",
      ja: "このフレームはレンダリングされませんでした。",
      de: "Dieser Frame wurde nicht gerendert.",
      pt: "Este fotograma não foi renderizado.",
      ru: "Этот кадр не отрисовался.",
    }),
    notFoundBody: t({
      en: "The page you’re looking for isn’t in the cut. It may have moved, or the link is wrong.",
      es: "La página que buscas no está en el montaje. Puede que se haya movido o que el enlace sea incorrecto.",
      fr: "La page recherchée ne fait pas partie du montage. Elle a peut-être été déplacée, ou le lien est incorrect.",
      zh: "你要找的页面不在这一版剪辑里。它可能已被移动，或链接有误。",
      ko: "찾으시는 페이지가 없습니다. 이동되었거나 링크가 잘못되었을 수 있습니다.",
      ja: "お探しのページは見つかりませんでした。移動したか、リンクが間違っている可能性があります。",
      de: "Die gesuchte Seite hat es nicht in den Schnitt geschafft. Vielleicht wurde sie verschoben oder der Link ist falsch.",
      pt: "A página que procuras não entrou na montagem. Pode ter sido movida ou a ligação está errada.",
      ru: "Страницы, которую вы ищете, нет в монтаже. Возможно, она переехала или ссылка неверна.",
    }),
    backHome: t({
      en: "Back to home",
      es: "Volver al inicio",
      fr: "Retour à l’accueil",
      zh: "返回首页",
      ko: "홈으로 돌아가기",
      ja: "ホームに戻る",
      de: "Zur Startseite",
      pt: "Voltar ao início",
      ru: "На главную",
    }),
    reportLink: t({
      en: "Report a broken link",
      es: "Notificar un enlace roto",
      fr: "Signaler un lien cassé",
      zh: "报告失效链接",
      ko: "깨진 링크 신고",
      ja: "リンク切れを報告",
      de: "Defekten Link melden",
      pt: "Reportar uma ligação partida",
      ru: "Сообщить о битой ссылке",
    }),
  },
} satisfies Dictionary;

export default notFound;
