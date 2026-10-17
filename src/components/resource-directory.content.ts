import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "resource-directory",
  content: {
    // "All" page heading and intro for each section.
    titles: {
      tool: t({
        en: "Tools for motion.",
        es: "Herramientas.",
        fr: "Outils motion.",
        zh: "动效工具。",
      }),
      studio: t({
        en: "Creative partners.",
        es: "Socios creativos.",
        fr: "Partenaires créatifs.",
        zh: "创意伙伴。",
      }),
      skill: t({
        en: "Agent skills.",
        es: "Skills para agentes.",
        fr: "Skills d’agents.",
        zh: "智能体技能。",
      }),
      extra: t({
        en: "Extras for makers.",
        es: "Extras útiles.",
        fr: "Extras utiles.",
        zh: "创作者资源。",
      }),
    },
    intros: {
      tool: t({
        en: "Editors, motion tools, AI video generators and mockup kits for your next product film.",
        es: "Editores, herramientas de motion, generadores de video con IA y mockups para tu próximo film.",
        fr: "Éditeurs, outils motion, générateurs vidéo IA et mockups pour votre prochain film produit.",
        zh: "剪辑软件、动效工具、AI 视频生成器和样机套件，助你打造下一支产品影片。",
      }),
      studio: t({
        en: "Motion studios and independent designers who make memorable product films. Reach out directly.",
        es: "Estudios y diseñadores de motion que crean films de producto memorables. Contáctalos directamente.",
        fr: "Studios et designers motion indépendants qui créent des films produit marquants. Contactez-les.",
        zh: "制作令人难忘的产品影片的动效工作室和独立设计师。可直接联系。",
      }),
      skill: t({
        en: "Open-source skills that let your coding agent write, animate and render motion videos.",
        es: "Skills de código abierto para que tu agente escriba, anime y renderice videos de motion.",
        fr: "Des skills open source pour que votre agent écrive, anime et rende des vidéos motion.",
        zh: "让你的编程智能体编写、制作动画并渲染动效视频的开源技能。",
      }),
      extra: t({
        en: "Articles, guides and references for making motion videos and product films.",
        es: "Artículos, guías y referencias para crear videos de motion y films de producto.",
        fr: "Articles, guides et références pour créer des vidéos motion et des films produit.",
        zh: "关于制作动效视频和产品影片的文章、指南和参考资料。",
      }),
    },
    submit: {
      tool: t({
        en: "Submit a tool",
        es: "Enviar una herramienta",
        fr: "Proposer un outil",
        zh: "提交工具",
      }),
      studio: t({
        en: "Submit a creative",
        es: "Enviar un creativo",
        fr: "Proposer un créatif",
        zh: "提交创意团队",
      }),
      skill: t({
        en: "Submit a skill",
        es: "Enviar una habilidad",
        fr: "Proposer une compétence",
        zh: "提交技能",
      }),
      extra: t({
        en: "Submit a resource",
        es: "Enviar un recurso",
        fr: "Proposer une ressource",
        zh: "提交资源",
      }),
    },
    categories: t({
      en: "Filter by category",
      es: "Filtrar por categoría",
      fr: "Filtrer par catégorie",
      zh: "按分类筛选",
    }),
    all: t({ en: "All", es: "Todo", fr: "Tout", zh: "全部" }),
    // Chip and card labels, keyed by section and URL slug.
    labels: {
      tool: {
        ai: t({ en: "AI", es: "IA", fr: "IA", zh: "AI" }),
        editors: t({
          en: "Editors",
          es: "Editores",
          fr: "Montage",
          zh: "剪辑",
        }),
        mockups: t({
          en: "Mockups",
          es: "Maquetas",
          fr: "Maquettes",
          zh: "样机",
        }),
        motion: t({
          en: "Motion",
          es: "Movimiento",
          fr: "Motion design",
          zh: "动效",
        }),
      },
      studio: {
        studios: t({
          en: "Studios",
          es: "Estudios",
          fr: "Studios",
          zh: "工作室",
        }),
        designers: t({
          en: "Designers",
          es: "Diseñadores",
          fr: "Designers",
          zh: "设计师",
        }),
      },
      skill: {
        motion: t({
          en: "Motion graphics",
          es: "Motion graphics",
          fr: "Motion design",
          zh: "动态图形",
        }),
        "product-films": t({
          en: "Product films",
          es: "Vídeos de producto",
          fr: "Films produit",
          zh: "产品影片",
        }),
        "ai-video": t({
          en: "AI video",
          es: "Vídeo con IA",
          fr: "Vidéo IA",
          zh: "AI 视频",
        }),
      },
      extra: {
        articles: t({
          en: "Articles",
          es: "Artículos",
          fr: "Articles",
          zh: "文章",
        }),
        resources: t({
          en: "Resources",
          es: "Recursos",
          fr: "Ressources",
          zh: "资源",
        }),
      },
    },
    // Intro heading on each category page, e.g. /tools/ai.
    headings: {
      tool: {
        ai: t({
          en: "AI video tools.",
          es: "Video con IA.",
          fr: "Vidéo IA.",
          zh: "AI 视频工具。",
        }),
        editors: t({
          en: "Video editors.",
          es: "Editores de video.",
          fr: "Éditeurs vidéo.",
          zh: "视频剪辑软件。",
        }),
        mockups: t({
          en: "Mockup tools.",
          es: "Mockups.",
          fr: "Mockups.",
          zh: "样机工具。",
        }),
        motion: t({
          en: "Motion design tools.",
          es: "Diseño de motion.",
          fr: "Outils de motion.",
          zh: "动效设计工具。",
        }),
      },
      studio: {
        studios: t({
          en: "Motion studios.",
          es: "Estudios de motion.",
          fr: "Studios motion.",
          zh: "动效工作室。",
        }),
        designers: t({
          en: "Motion designers.",
          es: "Diseñadores.",
          fr: "Designers motion.",
          zh: "动效设计师。",
        }),
      },
      skill: {
        motion: t({
          en: "Motion graphics.",
          es: "Motion graphics.",
          fr: "Motion design.",
          zh: "动态图形。",
        }),
        "product-films": t({
          en: "Product film skills.",
          es: "Films de producto.",
          fr: "Films produit.",
          zh: "产品影片技能。",
        }),
        "ai-video": t({
          en: "AI video skills.",
          es: "Video con IA.",
          fr: "Vidéo IA.",
          zh: "AI 视频技能。",
        }),
      },
      extra: {
        articles: t({
          en: "X articles.",
          es: "Artículos de X.",
          fr: "Articles X.",
          zh: "X 文章。",
        }),
        resources: t({
          en: "Resources.",
          es: "Recursos.",
          fr: "Ressources.",
          zh: "资源。",
        }),
      },
    },
    descriptions: {
      tool: {
        ai: t({
          en: "AI video generators, avatars, voiceovers and AI-assisted editing for product films.",
          es: "Generadores de video con IA, avatares, voces y edición asistida para films de producto.",
          fr: "Générateurs vidéo IA, avatars, voix off et montage assisté pour films produit.",
          zh: "用于产品影片的 AI 视频生成、数字人、配音和 AI 辅助剪辑。",
        }),
        editors: t({
          en: "Video editors for product films, from browser and text-based to AI-assisted cutting.",
          es: "Editores para films de producto: en el navegador, basados en texto o asistidos por IA.",
          fr: "Éditeurs pour films produit : dans le navigateur, par le texte ou assistés par IA.",
          zh: "适用于产品影片的视频剪辑软件，从浏览器端、基于文本到 AI 辅助剪辑。",
        }),
        mockups: t({
          en: "Device and UI mockups for product videos: cinematic screens and product shots.",
          es: "Mockups de dispositivos e interfaces para videos: pantallas cinematográficas y tomas de producto.",
          fr: "Mockups d’appareils et d’interfaces : écrans cinématiques et plans produit.",
          zh: "产品视频用的设备和 UI 样机：电影感屏幕与产品镜头。",
        }),
        motion: t({
          en: "Motion design tools and templates for launch videos, animated UI and product films.",
          es: "Herramientas y plantillas para videos de lanzamiento, interfaces animadas y films.",
          fr: "Outils et modèles pour vidéos de lancement, interfaces animées et films produit.",
          zh: "用于发布视频、UI 动画和产品影片的动效设计工具与模板。",
        }),
      },
      studio: {
        studios: t({
          en: "Studios that make launch films and brand videos. Browse their work and reach out directly.",
          es: "Estudios que crean films de lanzamiento y videos de marca. Mira su trabajo y escríbeles.",
          fr: "Des studios qui créent films de lancement et vidéos de marque. Voyez leur travail, écrivez-leur.",
          zh: "制作发布影片和品牌视频的工作室。浏览作品并直接联系。",
        }),
        designers: t({
          en: "Independent designers who make memorable product films. Browse their work and reach out.",
          es: "Diseñadores independientes que crean films de producto memorables. Mira su trabajo y escríbeles.",
          fr: "Des designers indépendants aux films produit marquants. Voyez leur travail, écrivez-leur.",
          zh: "制作令人难忘的产品影片的独立设计师。浏览作品并取得联系。",
        }),
      },
      skill: {
        motion: t({
          en: "Code-rendered motion: animated HTML, Remotion and whiteboard videos your agent renders.",
          es: "Motion renderizado en código: HTML animado, Remotion y pizarras que renderiza tu agente.",
          fr: "Du motion rendu en code : HTML animé, Remotion et tableaux blancs rendus par votre agent.",
          zh: "代码渲染的动效：由智能体渲染的 HTML 动画、Remotion 和白板视频。",
        }),
        "product-films": t({
          en: "Skills that turn your real product into demos and launch films, made by your agent.",
          es: "Skills que convierten tu producto real en demos y lanzamientos hechos por tu agente.",
          fr: "Des skills qui font de votre produit des démos et films de lancement, par votre agent.",
          zh: "把你的真实产品变成演示和发布影片的技能，由你的智能体完成。",
        }),
        "ai-video": t({
          en: "Skills for AI video production, from script and generated footage to voiceover and final cut.",
          es: "Skills para producir video con IA: guion, metraje generado, voz y montaje final.",
          fr: "Des skills de production vidéo IA : script, images générées, voix off et montage final.",
          zh: "AI 视频制作技能，从脚本、生成素材到配音和成片。",
        }),
      },
      extra: {
        articles: t({
          en: "Long-form X articles on making motion videos with Claude Opus: workflows, prompts, breakdowns.",
          es: "Artículos largos de X sobre hacer motion con Claude Opus: flujos, prompts y análisis.",
          fr: "Articles X sur le motion avec Claude Opus : méthodes, prompts et décryptages.",
          zh: "关于用 Claude Opus 制作动效视频的 X 长文：工作流、提示词、拆解。",
        }),
        resources: t({
          en: "References and archives for making motion videos and product films.",
          es: "Referencias y archivos para crear videos de motion y films de producto.",
          fr: "Références et archives pour créer des vidéos motion et des films produit.",
          zh: "制作动效视频和产品影片的参考资料与存档。",
        }),
      },
    },
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
    surprise: t({
      en: "Surprise me",
      es: "Sorpréndeme",
      fr: "Surprenez-moi",
      zh: "随便看看",
    }),
  },
} satisfies Dictionary;
