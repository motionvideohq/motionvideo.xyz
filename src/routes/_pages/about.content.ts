import { t } from "intlayer";
import type { Dictionary } from "intlayer";

import { SITE } from "@/constants/site";

export default {
  key: "about",
  content: {
    title: t({
      en: `About ${SITE.NAME}`,
      es: `Acerca de ${SITE.NAME}`,
      fr: `À propos de ${SITE.NAME}`,
      zh: `关于 ${SITE.NAME}`,
    }),
    intro: t({
      en: "A small, independent product for developers who would rather write motion than keyframe it.",
      es: "Un pequeño producto independiente para desarrolladores que prefieren escribir movimiento a usar fotogramas clave.",
      fr: "Un petit produit indépendant pour les développeurs qui préfèrent écrire le mouvement plutôt que créer des images clés.",
      zh: "一款小而独立的产品，献给宁愿写代码做动效、也不愿手打关键帧的开发者。",
    }),
    why: t({
      en: "Why it exists",
      es: "Por qué existe",
      fr: "Pourquoi ce produit existe",
      zh: "为什么做它",
    }),
    reason: t({
      en: "Motion design makes a portfolio, a launch, or a small update feel crafted, but it usually means keyframe tools, a lot of practice, or a motion designer’s calendar. Most developers skip it, or settle for a screen recording.",
      es: "El diseño de movimiento da un acabado cuidado a un portafolio, un lanzamiento o una pequeña actualización, pero suele requerir herramientas de fotogramas clave, mucha práctica o la disponibilidad de un diseñador. La mayoría de los desarrolladores lo omiten o se conforman con una grabación de pantalla.",
      fr: "Le motion design donne un aspect soigné à un portfolio, un lancement ou une petite mise à jour, mais nécessite généralement des outils d’images clés, beaucoup de pratique ou la disponibilité d’un spécialiste. La plupart des développeurs s’en passent ou se contentent d’un enregistrement d’écran.",
      zh: "动效设计能让作品集、产品发布或一次小更新显得精致，但通常意味着关键帧工具、大量练习，或者排队等动效设计师的档期。大多数开发者干脆跳过，或者用录屏凑合。",
    }),
    knowledge: t({
      en: `Coding agents can already write animation code. What they lack is taste: how long to hold, what overlaps, which easing feels right. ${SITE.NAME} writes that knowledge down so your agent can storyboard and animate showreels, intros, and launch films on its own, and redo them whenever something changes.`,
      es: `Los agentes de programación ya pueden escribir código de animación. Les falta criterio: cuánto mantener una escena, qué se superpone y qué aceleración resulta natural. ${SITE.NAME} documenta ese conocimiento para que tu agente cree guiones gráficos y anime reels, intros y vídeos de lanzamiento por sí solo, y los rehaga cuando algo cambie.`,
      fr: `Les agents de programmation savent déjà écrire du code d’animation. Il leur manque le sens du mouvement : la durée des pauses, les chevauchements et les courbes d’accélération adaptées. ${SITE.NAME} consigne ce savoir pour que votre agent crée des storyboards et anime des bandes démo, des intros et des films de lancement, puis les refasse à chaque changement.`,
      zh: `编程智能体已经会写动画代码，它们缺的是品味：该停多久、哪些元素重叠、哪种缓动感觉对。${SITE.NAME} 把这些知识写下来，让你的智能体能自己为作品集集锦、片头和发布影片做分镜和动画，并在内容变化时随时重做。`,
    }),
    what: t({
      en: "What it is",
      es: "Qué es",
      fr: "Ce que c’est",
      zh: "它是什么",
    }),
    product: t({
      en: `${SITE.NAME} is a pack of agent skills: instruction files, scene starters, and motion tokens that live in your repository. Your own agent reads them, writes the scenes in code, and renders them on your machine with an open-source renderer such as Remotion, HyperFrames, Editframe, or fframes. There is no hosted service, no credits, and no subscription.`,
      es: `${SITE.NAME} es un paquete de habilidades para agentes: archivos de instrucciones, escenas iniciales y valores de movimiento que viven en tu repositorio. Tu agente los lee, escribe las escenas en código y las renderiza en tu equipo con un motor de código abierto como Remotion, HyperFrames, Editframe o fframes. No hay servicio alojado, créditos ni suscripción.`,
      fr: `${SITE.NAME} est un pack de compétences pour agents : fichiers d’instructions, scènes de départ et paramètres de mouvement dans votre dépôt. Votre agent les lit, écrit les scènes en code et les rend sur votre machine avec un moteur open source comme Remotion, HyperFrames, Editframe ou fframes. Aucun service hébergé, crédit ou abonnement.`,
      zh: `${SITE.NAME} 是一套智能体技能包：存放在你仓库里的指令文件、场景模板和动效 token。你自己的智能体读取它们，用代码编写场景，并在你的电脑上用 Remotion、HyperFrames、Editframe 或 fframes 等开源渲染器渲染。没有托管服务，没有点数，也没有订阅。`,
    }),
    who: t({
      en: "Who makes it",
      es: "Quién lo crea",
      fr: "Qui le crée",
      zh: "谁在做",
    }),
    built: t({
      en: `${SITE.NAME} is built by `,
      es: `${SITE.NAME} está creado por `,
      fr: `${SITE.NAME} est créé par `,
      zh: `${SITE.NAME} 由 `,
    }),
    author: t({
      en: `, a frontend engineer in ${SITE.LEGAL.JURISDICTION} who cares about visual craft and runs `,
      es: `, un ingeniero frontend en ${SITE.LEGAL.JURISDICTION} que cuida el diseño visual y dirige `,
      fr: `, un ingénieur frontend en ${SITE.LEGAL.JURISDICTION} attentif à la qualité visuelle et qui dirige `,
      zh: `打造，他是一名身在 ${SITE.LEGAL.JURISDICTION} 的前端工程师，注重视觉品质，同时运营 `,
    }),
    website: t({
      en: ". This website is ",
      es: ". Este sitio web es ",
      fr: ". Ce site est ",
      zh: "。本网站",
    }),
    openSource: t({
      en: "open source",
      es: "de código abierto",
      fr: "open source",
      zh: "开源",
    }),
    separately: t({
      en: "; the skill pack is sold separately.",
      es: "; el paquete de habilidades se vende por separado.",
      fr: "; le pack de compétences est vendu séparément.",
      zh: "；技能包单独销售。",
    }),
  },
} satisfies Dictionary;
