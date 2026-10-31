import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "social-proof",
  content: {
    lovedBy: t({
      en: "Loved by designers and engineers at",
      es: "Encanta a diseñadores e ingenieros de",
      fr: "Apprécié par des designers et ingénieurs de",
      zh: "深受以下公司的设计师和工程师喜爱",
      ko: "다음 회사의 디자이너와 엔지니어가 좋아합니다",
      ja: "以下の企業のデザイナーやエンジニアに愛用されています",
      de: "Beliebt bei Designern und Engineers von",
      pt: "Adorado por designers e engenheiros de",
      ru: "Нравится дизайнерам и инженерам из",
    }),
    testimonials: t({
      en: "What people say",
      es: "Lo que dice la gente",
      fr: "Ce qu’en disent les gens",
      zh: "大家的评价",
      ko: "사람들의 이야기",
      ja: "みんなの声",
      de: "Was andere sagen",
      pt: "O que as pessoas dizem",
      ru: "Что говорят люди",
    }),
    viewOnX: t({
      en: "View on X",
      es: "Ver en X",
      fr: "Voir sur X",
      zh: "在 X 上查看",
      ko: "X에서 보기",
      ja: "Xで見る",
      de: "Auf X ansehen",
      pt: "Ver no X",
      ru: "Открыть в X",
    }),
  },
} satisfies Dictionary;
