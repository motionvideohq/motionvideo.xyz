import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "features",
  content: {
    features: [
      {
        art: "skills",
        title: t({
          en: "Agent skills",
          es: "Habilidades para agentes",
          fr: "Compétences pour agents",
          zh: "智能体技能",
        }),
        body: t({
          en: "Instruction files that cover storyboarding, choreography, pacing, and typography in motion, loaded by your agent only when it needs them.",
          es: "Archivos de instrucciones sobre guiones gráficos, coreografía, ritmo y tipografía en movimiento, que tu agente carga solo cuando los necesita.",
          fr: "Des fichiers d’instructions sur le storyboard, la chorégraphie, le rythme et la typographie en mouvement, chargés par votre agent uniquement au besoin.",
          zh: "涵盖分镜、编排、节奏和动态排版的指令文件，智能体只在需要时加载。",
        }),
      },
      {
        art: "scenes",
        title: t({
          en: "Scene starters",
          es: "Escenas iniciales",
          fr: "Scènes de départ",
          zh: "场景模板",
        }),
        body: t({
          en: "Ready-to-fork compositions for showreels, title sequences, launch films, and changelog clips, so your agent never starts from an empty file.",
          es: "Composiciones listas para adaptar a reels, secuencias de títulos, vídeos de lanzamiento y clips de novedades, para que tu agente nunca empiece con un archivo vacío.",
          fr: "Des compositions prêtes à adapter pour les bandes démo, génériques, films de lancement et clips de nouveautés, afin que votre agent ne parte jamais d’un fichier vide.",
          zh: "可直接 fork 的作品集集锦、标题序列、发布影片和更新日志短片合成，让你的智能体永远不必从空文件开始。",
        }),
      },
      {
        art: "motion",
        title: t({
          en: "Motion tokens",
          es: "Valores de movimiento",
          fr: "Paramètres de mouvement",
          zh: "动效 token",
        }),
        body: t({
          en: "Spring, easing, and timing values tuned for motion design, kept in one place so every scene moves with the same rhythm.",
          es: "Valores de resorte, aceleración y duración ajustados para el diseño de movimiento, reunidos para que todas las escenas sigan el mismo ritmo.",
          fr: "Des valeurs de ressort, d’accélération et de durée adaptées au motion design, regroupées pour que chaque scène garde le même rythme.",
          zh: "为动效设计调校的弹簧、缓动和时间参数，集中管理，让每个场景都保持同样的节奏。",
        }),
      },
      {
        art: "renderers",
        title: t({
          en: "Renderer guides",
          es: "Guías de renderizado",
          fr: "Guides des moteurs de rendu",
          zh: "渲染器指南",
        }),
        body: t({
          en: "Setup notes for Remotion, HyperFrames, Editframe, and fframes, so the same scene plan works with your stack.",
          es: "Notas de configuración para Remotion, HyperFrames, Editframe y fframes, para que el mismo plan de escenas funcione con tus herramientas.",
          fr: "Des notes de configuration pour Remotion, HyperFrames, Editframe et fframes, afin que le même plan de scènes fonctionne avec vos outils.",
          zh: "Remotion、HyperFrames、Editframe 和 fframes 的配置说明，让同一份场景方案适配你的技术栈。",
        }),
      },
    ],
  },
} satisfies Dictionary;
