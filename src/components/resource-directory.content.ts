import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "resource-directory",
  content: {
    // "All" page heading and intro for each section.
    titles: {
      tool: t({
        en: "Tools that make things move.",
        es: "Herramientas que dan movimiento.",
        fr: "Les outils qui donnent vie aux idées.",
      }),
      studio: t({
        en: "Find your next creative partner.",
        es: "Encuentra tu próximo colaborador creativo.",
        fr: "Trouvez votre prochain partenaire créatif.",
      }),
      skill: t({
        en: "Agent skills for motion video.",
        es: "Habilidades de agente para vídeo motion.",
        fr: "Compétences d’agent pour la vidéo motion.",
      }),
      extra: t({
        en: "Extras for motion makers.",
        es: "Extras para creadores de motion.",
        fr: "Extras pour les créateurs de motion.",
      }),
    },
    intros: {
      tool: t({
        en: "Editors, motion tools, AI video generators, and mockup kits for your next product film. Pick a category, open a site, and find what fits your workflow.",
        es: "Editores, herramientas de movimiento, generadores de vídeo con IA y kits de maquetas para tu próximo vídeo de producto. Elige una categoría, abre un sitio y encuentra lo que encaja con tu flujo de trabajo.",
        fr: "Montage, motion design, génération vidéo par IA et kits de maquettes pour votre prochain film produit. Choisissez une catégorie, ouvrez un site et trouvez ce qui convient à votre façon de travailler.",
      }),
      studio: t({
        en: "Motion studios and independent designers who make memorable product films. Browse their work, visit their portfolios, and reach out directly.",
        es: "Estudios de movimiento y diseñadores independientes que crean vídeos de producto memorables. Explora su trabajo, visita sus portafolios y contáctalos directamente.",
        fr: "Des studios de motion design et des designers indépendants qui créent des films produit mémorables. Parcourez leurs travaux, visitez leurs portfolios et contactez-les directement.",
      }),
      skill: t({
        en: "Open-source agent skills for making motion videos and product films with AI coding agents. Install one, describe your film, and let your agent write, animate, and render it in code.",
        es: "Habilidades de agente de código abierto para crear vídeos motion y vídeos de producto con agentes de programación con IA. Instala una, describe tu vídeo y deja que tu agente lo escriba, lo anime y lo renderice en código.",
        fr: "Des compétences d’agent open source pour créer des vidéos motion et des films produit avec des agents de code IA. Installez-en une, décrivez votre film et laissez votre agent l’écrire, l’animer et le rendre en code.",
      }),
      extra: t({
        en: "Guides, references, and other resources for making motion videos and product films that don’t fit anywhere else.",
        es: "Guías, referencias y otros recursos para crear vídeos motion y vídeos de producto que no encajan en ninguna otra sección.",
        fr: "Guides, références et autres ressources pour créer des vidéos motion et des films produit qui ne trouvent leur place nulle part ailleurs.",
      }),
    },
    submit: {
      tool: t({
        en: "Submit a tool",
        es: "Enviar una herramienta",
        fr: "Proposer un outil",
      }),
      studio: t({
        en: "Submit a creative",
        es: "Enviar un creativo",
        fr: "Proposer un créatif",
      }),
      skill: t({
        en: "Submit a skill",
        es: "Enviar una habilidad",
        fr: "Proposer une compétence",
      }),
      extra: t({
        en: "Submit a resource",
        es: "Enviar un recurso",
        fr: "Proposer une ressource",
      }),
    },
    categories: t({
      en: "Filter by category",
      es: "Filtrar por categoría",
      fr: "Filtrer par catégorie",
    }),
    all: t({ en: "All", es: "Todo", fr: "Tout" }),
    // Chip and card labels, keyed by section and URL slug.
    labels: {
      tool: {
        ai: t({ en: "AI", es: "IA", fr: "IA" }),
        editors: t({ en: "Editors", es: "Editores", fr: "Montage" }),
        mockups: t({ en: "Mockups", es: "Maquetas", fr: "Maquettes" }),
        motion: t({ en: "Motion", es: "Movimiento", fr: "Motion design" }),
      },
      studio: {
        studios: t({ en: "Studios", es: "Estudios", fr: "Studios" }),
        designers: t({ en: "Designers", es: "Diseñadores", fr: "Designers" }),
      },
      skill: {
        motion: t({
          en: "Motion graphics",
          es: "Motion graphics",
          fr: "Motion design",
        }),
        "product-films": t({
          en: "Product films",
          es: "Vídeos de producto",
          fr: "Films produit",
        }),
        "ai-video": t({ en: "AI video", es: "Vídeo con IA", fr: "Vidéo IA" }),
      },
      extra: {
        articles: t({ en: "Articles", es: "Artículos", fr: "Articles" }),
        resources: t({ en: "Resources", es: "Recursos", fr: "Ressources" }),
      },
    },
    // Intro heading on each category page, e.g. /tools/ai.
    headings: {
      tool: {
        ai: t({
          en: "AI video tools.",
          es: "Herramientas de vídeo con IA.",
          fr: "Outils vidéo IA.",
        }),
        editors: t({
          en: "Video editors.",
          es: "Editores de vídeo.",
          fr: "Logiciels de montage vidéo.",
        }),
        mockups: t({
          en: "Mockup tools.",
          es: "Herramientas de maquetas.",
          fr: "Outils de maquettes.",
        }),
        motion: t({
          en: "Motion design tools.",
          es: "Herramientas de motion design.",
          fr: "Outils de motion design.",
        }),
      },
      studio: {
        studios: t({
          en: "Motion design studios.",
          es: "Estudios de motion design.",
          fr: "Studios de motion design.",
        }),
        designers: t({
          en: "Independent motion designers.",
          es: "Diseñadores de motion independientes.",
          fr: "Motion designers indépendants.",
        }),
      },
      skill: {
        motion: t({
          en: "Agent skills for motion graphics.",
          es: "Habilidades de agente para motion graphics.",
          fr: "Compétences d’agent pour le motion design.",
        }),
        "product-films": t({
          en: "Agent skills for product films.",
          es: "Habilidades de agente para vídeos de producto.",
          fr: "Compétences d’agent pour les films produit.",
        }),
        "ai-video": t({
          en: "Agent skills for AI video.",
          es: "Habilidades de agente para vídeo con IA.",
          fr: "Compétences d’agent pour la vidéo IA.",
        }),
      },
      extra: {
        articles: t({
          en: "Articles on motion video with Claude Opus.",
          es: "Artículos sobre vídeo motion con Claude Opus.",
          fr: "Articles sur la vidéo motion avec Claude Opus.",
        }),
        resources: t({
          en: "Resources for motion makers.",
          es: "Recursos para creadores de motion.",
          fr: "Ressources pour les créateurs de motion.",
        }),
      },
    },
    descriptions: {
      tool: {
        ai: t({
          en: "AI video generators, avatars, voiceovers, and AI-assisted editing for product films. Open a site and find what fits your workflow.",
          es: "Generadores de vídeo con IA, avatares, locuciones y edición asistida por IA para vídeos de producto. Abre un sitio y encuentra lo que encaja con tu flujo de trabajo.",
          fr: "Génération vidéo par IA, avatars, voix off et montage assisté par IA pour vos films produit. Ouvrez un site et trouvez ce qui convient à votre façon de travailler.",
        }),
        editors: t({
          en: "Video editors for product films, from browser-based editors to text-based and AI-assisted cutting.",
          es: "Editores de vídeo para vídeos de producto, desde editores en el navegador hasta la edición basada en texto o asistida por IA.",
          fr: "Des logiciels de montage pour vos films produit, du montage dans le navigateur au montage par le texte ou assisté par IA.",
        }),
        mockups: t({
          en: "Device and UI mockups for product videos: cinematic screens and product shots for software.",
          es: "Maquetas de dispositivos e interfaces para vídeos de producto: pantallas cinematográficas y fotos de producto para software.",
          fr: "Maquettes d’appareils et d’interfaces pour vos vidéos produit : écrans cinématographiques et visuels produit pour logiciels.",
        }),
        motion: t({
          en: "Motion design tools and templates for launch videos, animated UI, and product films.",
          es: "Herramientas y plantillas de motion design para vídeos de lanzamiento, interfaces animadas y vídeos de producto.",
          fr: "Outils et modèles de motion design pour vos vidéos de lancement, interfaces animées et films produit.",
        }),
      },
      studio: {
        studios: t({
          en: "Motion studios that make product launch films and brand videos. Browse their work, visit their portfolios, and reach out directly.",
          es: "Estudios de motion que crean vídeos de lanzamiento y de marca. Explora su trabajo, visita sus portafolios y contáctalos directamente.",
          fr: "Des studios de motion design qui réalisent des films de lancement et des vidéos de marque. Parcourez leurs travaux, visitez leurs portfolios et contactez-les directement.",
        }),
        designers: t({
          en: "Independent motion designers who make memorable product films. Browse their work, visit their portfolios, and reach out directly.",
          es: "Diseñadores de motion independientes que crean vídeos de producto memorables. Explora su trabajo, visita sus portafolios y contáctalos directamente.",
          fr: "Des motion designers indépendants qui créent des films produit mémorables. Parcourez leurs travaux, visitez leurs portfolios et contactez-les directement.",
        }),
      },
      skill: {
        motion: t({
          en: "Skills that teach your coding agent code-rendered motion: animated HTML, Remotion, and whiteboard videos it writes and renders itself.",
          es: "Habilidades que enseñan a tu agente de programación a crear motion renderizado en código: HTML animado, Remotion y vídeos de pizarra que escribe y renderiza por sí mismo.",
          fr: "Des compétences qui apprennent à votre agent de code le motion rendu en code : HTML animé, Remotion et vidéos tableau blanc qu’il écrit et rend lui-même.",
        }),
        "product-films": t({
          en: "Skills that turn your real product into demos and launch films, directed and rendered by your agent.",
          es: "Habilidades que convierten tu producto real en demos y vídeos de lanzamiento, dirigidos y renderizados por tu agente.",
          fr: "Des compétences qui transforment votre vrai produit en démos et films de lancement, réalisés et rendus par votre agent.",
        }),
        "ai-video": t({
          en: "Skills for AI video production, from script and generated footage to voiceover and final cut.",
          es: "Habilidades para la producción de vídeo con IA, del guion y las imágenes generadas a la locución y el montaje final.",
          fr: "Des compétences pour la production vidéo par IA, du script et des images générées à la voix off et au montage final.",
        }),
      },
      extra: {
        articles: t({
          en: "Long-form X articles from creators on making animation and motion videos with Claude Opus: workflows, prompts, and breakdowns.",
          es: "Artículos largos de X en los que sus creadores explican cómo hacen animaciones y vídeos motion con Claude Opus: flujos de trabajo, prompts y análisis.",
          fr: "Des articles X détaillés où leurs créateurs expliquent comment ils réalisent animations et vidéos motion avec Claude Opus : méthodes, prompts et making-of.",
        }),
        resources: t({
          en: "References and archives for making motion videos and product films.",
          es: "Referencias y archivos para crear vídeos motion y vídeos de producto.",
          fr: "Références et archives pour créer des vidéos motion et des films produit.",
        }),
      },
    },
    visit: t({
      en: "Visit website",
      es: "Visitar sitio web",
      fr: "Visiter le site",
    }),
    newTab: t({
      en: "opens in a new tab",
      es: "se abre en una pestaña nueva",
      fr: "s’ouvre dans un nouvel onglet",
    }),
    surprise: t({ en: "Surprise me", es: "Sorpréndeme", fr: "Surprenez-moi" }),
  },
} satisfies Dictionary;
