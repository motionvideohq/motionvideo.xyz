import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "featured-page",
  content: {
    title: t({
      en: "Featured",
      es: "Destacados",
      fr: "À l’honneur",
      zh: "精选",
      ko: "추천",
    }),
    intro: t({
      en: "Work you submitted, credited to you.",
      es: "Trabajo que has enviado, acreditado a ti.",
      fr: "Les œuvres que vous avez proposées, créditées à votre nom.",
      zh: "你提交的、署名为你的作品。",
      ko: "제출하신 작업물로, 출처가 귀하로 표기됩니다.",
    }),
    featuredHeading: t({
      en: "Featured work",
      es: "Trabajo destacado",
      fr: "Œuvres à l’honneur",
      zh: "精选作品",
      ko: "추천 작업물",
    }),
    submissionsHeading: t({
      en: "Your submissions",
      es: "Tus envíos",
      fr: "Vos propositions",
      zh: "你的提交",
      ko: "내 제출물",
    }),
    status: {
      pending: t({
        en: "Under review",
        es: "En revisión",
        fr: "En cours d’examen",
        zh: "审核中",
        ko: "검토 중",
      }),
      featured: t({
        en: "Featured",
        es: "Destacado",
        fr: "À l’honneur",
        zh: "已精选",
        ko: "추천됨",
      }),
      declined: t({
        en: "Not selected",
        es: "No seleccionado",
        fr: "Non retenu",
        zh: "未入选",
        ko: "선정되지 않음",
      }),
    },
    viewFeatured: t({
      en: "View featured",
      es: "Ver destacado",
      fr: "Voir l’œuvre",
      zh: "查看精选",
      ko: "추천 보기",
    }),
    visit: t({
      en: "Visit website",
      es: "Visitar sitio web",
      fr: "Visiter le site",
      zh: "访问网站",
      ko: "웹사이트 방문",
    }),
    newTab: t({
      en: "opens in a new tab",
      es: "se abre en una pestaña nueva",
      fr: "s’ouvre dans un nouvel onglet",
      zh: "在新标签页中打开",
      ko: "새 탭에서 열림",
    }),
    emptyTitle: t({
      en: "None of your work has been featured yet",
      es: "Aún no se ha destacado nada de tu trabajo",
      fr: "Aucune de vos œuvres n’a encore été mise à l’honneur",
      zh: "你的作品还没有被精选",
      ko: "아직 추천된 작업물이 없습니다",
    }),
    emptyDescription: t({
      en: "Work credited to you will appear here.",
      es: "El trabajo acreditado a ti aparecerá aquí.",
      fr: "Les œuvres créditées à votre nom apparaîtront ici.",
      zh: "署名为你的作品会显示在这里。",
      ko: "귀하로 출처가 표기된 작업물이 여기에 표시됩니다.",
    }),
    submit: t({
      en: "Submit your work",
      es: "Envía tu trabajo",
      fr: "Proposez votre œuvre",
      zh: "提交你的作品",
      ko: "작업물 제출하기",
    }),
  },
} satisfies Dictionary;
