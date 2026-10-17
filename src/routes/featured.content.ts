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
    }),
    intro: t({
      en: "Work you submitted, credited to you.",
      es: "Trabajo que has enviado, acreditado a ti.",
      fr: "Les œuvres que vous avez proposées, créditées à votre nom.",
      zh: "你提交的、署名为你的作品。",
    }),
    featuredHeading: t({
      en: "Featured work",
      es: "Trabajo destacado",
      fr: "Œuvres à l’honneur",
      zh: "精选作品",
    }),
    submissionsHeading: t({
      en: "Your submissions",
      es: "Tus envíos",
      fr: "Vos propositions",
      zh: "你的提交",
    }),
    status: {
      pending: t({
        en: "Under review",
        es: "En revisión",
        fr: "En cours d’examen",
        zh: "审核中",
      }),
      featured: t({
        en: "Featured",
        es: "Destacado",
        fr: "À l’honneur",
        zh: "已精选",
      }),
      declined: t({
        en: "Not selected",
        es: "No seleccionado",
        fr: "Non retenu",
        zh: "未入选",
      }),
    },
    viewFeatured: t({
      en: "View featured",
      es: "Ver destacado",
      fr: "Voir l’œuvre",
      zh: "查看精选",
    }),
    visit: t({
      en: "Visit website",
      es: "Visitar sitio web",
      fr: "Visiter le site",
      zh: "访问网站",
    }),
    newTab: t({
      en: "opens in a new tab",
      es: "se abre en una pestaña nueva",
      fr: "s’ouvre dans un nouvel onglet",
      zh: "在新标签页中打开",
    }),
    emptyTitle: t({
      en: "None of your work has been featured yet",
      es: "Aún no se ha destacado nada de tu trabajo",
      fr: "Aucune de vos œuvres n’a encore été mise à l’honneur",
      zh: "你的作品还没有被精选",
    }),
    emptyDescription: t({
      en: "Work credited to you will appear here.",
      es: "El trabajo acreditado a ti aparecerá aquí.",
      fr: "Les œuvres créditées à votre nom apparaîtront ici.",
      zh: "署名为你的作品会显示在这里。",
    }),
    submit: t({
      en: "Submit your work",
      es: "Envía tu trabajo",
      fr: "Proposez votre œuvre",
      zh: "提交你的作品",
    }),
  },
} satisfies Dictionary;
