import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "motion-creator",
  content: {
    title: t({
      en: "Motion videos by {name}",
      es: "Vídeos de motion de {name}",
      fr: "Vidéos motion de {name}",
      zh: "{name} 的动态视频",
      ko: "{name}의 모션 영상",
      ja: "{name}のモーション動画",
      de: "Motion-Videos von {name}",
      pt: "Vídeos de motion de {name}",
      ru: "Моушн-видео от {name}",
    }),
    description: t({
      en: "Explore their motion videos and their prompts/skills behind them.",
      es: "Explora sus vídeos de motion y los prompts/skills detrás de ellos.",
      fr: "Explorez ses vidéos motion et les prompts/skills à leur origine.",
      zh: "探索创作者的动态视频及其背后的提示词/技能。",
      ko: "모션 영상과 그 뒤에 담긴 프롬프트/스킬을 살펴보세요.",
      ja: "モーション動画と、その制作に使われたプロンプト/スキルを探索。",
      de: "Entdecke ihre Motion-Videos und die Prompts/Skills dahinter.",
      pt: "Explore seus vídeos de motion e os prompts/skills por trás deles.",
      ru: "Смотрите моушн-видео и изучайте промпты/навыки, стоящие за ними.",
    }),
  },
} satisfies Dictionary;
