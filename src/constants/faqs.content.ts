import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "faqs",
  content: {
    faqs: [
      {
        question: t({
          en: "Do I need motion design experience?",
          es: "¿Necesito experiencia en diseño de movimiento?",
          fr: "Ai-je besoin d’expérience en motion design ?",
          zh: "我需要动效设计经验吗？",
        }),
        answer: t({
          en: "No. The skills carry the motion knowledge: easing, overlap, holds, and pacing. You describe the result in plain words and review a storyboard before anything is rendered.",
          es: "No. Las habilidades aportan los conocimientos de movimiento: aceleración, superposición, pausas y ritmo. Describes el resultado con palabras sencillas y revisas un guion gráfico antes de renderizar nada.",
          fr: "Non. Les compétences apportent le savoir du mouvement : accélération, chevauchements, pauses et rythme. Vous décrivez le résultat en mots simples et examinez un storyboard avant tout rendu.",
          zh: "不需要。技能本身承载了动效知识：缓动、重叠、停顿和节奏。你只需用平实的语言描述想要的效果，并在渲染前审阅分镜。",
        }),
      },
      {
        question: t({
          en: "What kind of videos can I make?",
          es: "¿Qué tipo de vídeos puedo crear?",
          fr: "Quels types de vidéos puis-je créer ?",
          zh: "我能做出什么样的视频？",
        }),
        answer: t({
          en: "Anything built from motion and type: portfolio showreels, intros, title sequences, launch films, and feature updates.",
          es: "Todo lo basado en movimiento y tipografía: reels de portafolio, intros, secuencias de títulos, vídeos de lanzamiento y novedades de funciones.",
          fr: "Tout ce qui repose sur le mouvement et la typographie : bandes démo de portfolio, intros, génériques, films de lancement et nouveautés produit.",
          zh: "任何由动效和文字构成的内容：作品集集锦、片头、标题序列、发布影片和功能更新视频。",
        }),
      },
      {
        question: t({
          en: "Which coding agents are supported?",
          es: "¿Qué agentes de programación son compatibles?",
          fr: "Quels agents de programmation sont compatibles ?",
          zh: "支持哪些编程智能体？",
        }),
        answer: t({
          en: "Any agent that can read instruction files from your repository, including Claude Code, Codex, Cursor, Antigravity, and GitHub Copilot.",
          es: "Cualquier agente que pueda leer archivos de instrucciones de tu repositorio, incluidos Claude Code, Codex, Cursor, Antigravity y GitHub Copilot.",
          fr: "Tout agent capable de lire les fichiers d’instructions de votre dépôt, notamment Claude Code, Codex, Cursor, Antigravity et GitHub Copilot.",
          zh: "任何能读取仓库中指令文件的智能体，包括 Claude Code、Codex、Cursor、Antigravity 和 GitHub Copilot。",
        }),
      },
      {
        question: t({
          en: "Which renderer should I pick?",
          es: "¿Qué motor de renderizado debo elegir?",
          fr: "Quel moteur de rendu choisir ?",
          zh: "我该选哪个渲染器？",
        }),
        answer: t({
          en: "Use whichever fits your project. Remotion suits React codebases, HyperFrames and Editframe work from HTML, and fframes renders on the GPU. Check each renderer’s own license for commercial use.",
          es: "Usa el que encaje con tu proyecto. Remotion es adecuado para React, HyperFrames y Editframe trabajan con HTML, y fframes renderiza en la GPU. Consulta la licencia de cada motor para el uso comercial.",
          fr: "Choisissez celui qui convient à votre projet. Remotion convient à React, HyperFrames et Editframe utilisent HTML, et fframes effectue le rendu sur GPU. Consultez la licence de chaque moteur pour un usage commercial.",
          zh: "选适合你项目的即可。Remotion 适合 React 代码库，HyperFrames 和 Editframe 基于 HTML，fframes 使用 GPU 渲染。商业使用请查看各渲染器自己的许可证。",
        }),
      },
      {
        question: t({
          en: "How do I get the files after paying?",
          es: "¿Cómo obtengo los archivos después de pagar?",
          fr: "Comment obtenir les fichiers après le paiement ?",
          zh: "付款后如何获取文件？",
        }),
        answer: t({
          en: "Checkout needs no account. Right after paying, sign in with the email you paid with, open the Dodo Payments customer portal from your dashboard, and connect your GitHub account. Dodo Payments then invites you to the private repository.",
          es: "No necesitas una cuenta para pagar. Después de pagar, inicia sesión con el correo que usaste, abre el portal de clientes de Dodo Payments desde tu panel y conecta tu cuenta de GitHub. Dodo Payments te invitará entonces al repositorio privado.",
          fr: "Aucun compte n’est nécessaire pour payer. Après le paiement, connectez-vous avec l’e-mail utilisé, ouvrez le portail client Dodo Payments depuis votre tableau de bord et connectez votre compte GitHub. Dodo Payments vous invite alors au dépôt privé.",
          zh: "结账无需账号。付款后立即用付款邮箱登录，从控制台打开 Dodo Payments 客户门户，并关联你的 GitHub 账号。随后 Dodo Payments 会邀请你加入私有仓库。",
        }),
      },
      {
        question: t({
          en: "Can I use it for client projects?",
          es: "¿Puedo usarlo para proyectos de clientes?",
          fr: "Puis-je l’utiliser pour des projets clients ?",
          zh: "可以用于客户项目吗？",
        }),
        answer: t({
          en: "Yes. The license is per person and covers every project you work on, including work for clients.",
          es: "Sí. La licencia es por persona y cubre todos tus proyectos, incluidos los trabajos para clientes.",
          fr: "Oui. La licence est individuelle et couvre tous vos projets, y compris ceux réalisés pour des clients.",
          zh: "可以。许可证按人授权，涵盖你参与的所有项目，包括为客户做的工作。",
        }),
      },
      {
        question: t({
          en: "Can I get a refund?",
          es: "¿Puedo obtener un reembolso?",
          fr: "Puis-je obtenir un remboursement ?",
          zh: "可以退款吗？",
        }),
        answer: t({
          en: "Yes. Email us before you claim repository access for a full refund. After that, see our refund policy if you have a problem with your order or access.",
          es: "Sí. Escríbenos antes de solicitar acceso al repositorio para recibir un reembolso completo. Después, consulta nuestra política de reembolsos si tienes algún problema con tu pedido o acceso.",
          fr: "Oui. Écrivez-nous avant de demander l’accès au dépôt pour obtenir un remboursement intégral. Ensuite, consultez notre politique de remboursement en cas de problème avec votre commande ou votre accès.",
          zh: "可以。在领取仓库访问权限前给我们发邮件即可全额退款。之后如果订单或访问出现问题，请参阅我们的退款政策。",
        }),
      },
    ],
  },
} satisfies Dictionary;
