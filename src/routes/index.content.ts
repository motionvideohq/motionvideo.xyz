import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "motion-gallery",
  content: {
    eyebrow: t({
      en: "The motion library",
      es: "La biblioteca de movimiento",
      fr: "La bibliothèque du mouvement",
    }),
    title: t({
      en: "Motion worth making.",
      es: "Movimiento que inspira.",
      fr: "Du mouvement qui inspire.",
    }),
    intro: t({
      en: "A collection of AI-made videos, with the prompts and skills behind them. Find a starting point. Make it your own.",
      es: "Una colección de vídeos creados con IA, con las instrucciones y habilidades que los hicieron posibles. Encuentra un punto de partida y hazlo tuyo.",
      fr: "Une collection de vidéos créées avec l’IA, avec leurs instructions et compétences. Trouvez un point de départ. Faites-en votre création.",
    }),
    submitVideo: t({
      en: "Submit a video",
      es: "Enviar un vídeo",
      fr: "Proposer une vidéo",
    }),
    surprise: t({ en: "Surprise me", es: "Sorpréndeme", fr: "Surprenez-moi" }),
    browse: t({
      en: "Explore the collection",
      es: "Explorar la colección",
      fr: "Explorer la collection",
    }),
    all: t({ en: "All", es: "Todos", fr: "Tous" }),
    prompt: t({ en: "Prompt", es: "Instrucción", fr: "Instruction" }),
    skill: t({ en: "Skill", es: "Habilidad", fr: "Compétence" }),
    filterType: t({
      en: "Filter by resource",
      es: "Filtrar por recurso",
      fr: "Filtrer par ressource",
    }),
    filterCategory: t({
      en: "Filter by category",
      es: "Filtrar por categoría",
      fr: "Filtrer par catégorie",
    }),
    sort: t({
      en: "Sort videos",
      es: "Ordenar vídeos",
      fr: "Trier les vidéos",
    }),
    popular: t({ en: "Popular", es: "Populares", fr: "Populaires" }),
    newest: t({
      en: "Newest first",
      es: "Más recientes",
      fr: "Les plus récentes",
    }),
    oldest: t({
      en: "Oldest first",
      es: "Más antiguos",
      fr: "Les plus anciennes",
    }),
    pause: t({
      en: "Pause previews",
      es: "Pausar vistas previas",
      fr: "Suspendre les aperçus",
    }),
    play: t({
      en: "Play previews",
      es: "Reproducir vistas previas",
      fr: "Lire les aperçus",
    }),
    noResults: t({
      en: "No videos found.",
      es: "No se encontraron vídeos.",
      fr: "Aucune vidéo trouvée.",
    }),
    tryAgain: t({
      en: "Try another category or resource type.",
      es: "Prueba otra categoría o tipo de recurso.",
      fr: "Essayez une autre catégorie ou un autre type de ressource.",
    }),
    watch: t({ en: "Watch video", es: "Ver vídeo", fr: "Voir la vidéo" }),
    open: t({ en: "Open", es: "Abrir", fr: "Ouvrir" }),
    previous: t({
      en: "Previous video",
      es: "Vídeo anterior",
      fr: "Vidéo précédente",
    }),
    next: t({ en: "Next video", es: "Vídeo siguiente", fr: "Vidéo suivante" }),
    noPrevious: t({
      en: "This is the first video",
      es: "Este es el primer vídeo",
      fr: "C’est la première vidéo",
    }),
    noNext: t({
      en: "This is the last video",
      es: "Este es el último vídeo",
      fr: "C’est la dernière vidéo",
    }),
    creator: t({ en: "Creator", es: "Creador", fr: "Créateur" }),
    close: t({ en: "Close video", es: "Cerrar vídeo", fr: "Fermer la vidéo" }),
    copy: t({
      en: "Copy prompt",
      es: "Copiar instrucción",
      fr: "Copier l’instruction",
    }),
    copied: t({ en: "Copied", es: "Copiado", fr: "Copiée" }),
    copyError: t({
      en: "Clipboard unavailable. Select and copy the prompt below.",
      es: "Portapapeles no disponible. Selecciona y copia la instrucción de abajo.",
      fr: "Presse-papiers indisponible. Sélectionnez et copiez l’instruction ci-dessous.",
    }),
    unavailablePrompt: t({
      en: "The prompt is not published in this collection. Check the creator’s original post for more context.",
      es: "La instrucción no está publicada en esta colección. Consulta la publicación original del creador.",
      fr: "L’instruction n’est pas publiée dans cette collection. Consultez la publication originale du créateur.",
    }),
    viewSkill: t({
      en: "View creator’s skill",
      es: "Ver habilidad del creador",
      fr: "Voir la compétence du créateur",
    }),
    originalPost: t({
      en: "Open on X",
      es: "Abrir en X",
      fr: "Ouvrir sur X",
    }),
    category: t({ en: "Category", es: "Categoría", fr: "Catégorie" }),
    type: t({ en: "Type", es: "Tipo", fr: "Type" }),
    previewError: t({
      en: "Preview unavailable",
      es: "Vista previa no disponible",
      fr: "Aperçu indisponible",
    }),
    videoError: t({
      en: "This hosted video could not load. You can still watch it in the original post.",
      es: "No se pudo cargar el vídeo alojado. Puedes verlo en la publicación original.",
      fr: "Cette vidéo n’a pas pu être chargée. Vous pouvez la regarder dans la publication originale.",
    }),
    categories: {
      "product-ui": t({
        en: "Product UI",
        es: "Interfaz de producto",
        fr: "Interface produit",
      }),
      phone: t({ en: "Phone", es: "Móvil", fr: "Téléphone" }),
      charts: t({ en: "Charts", es: "Gráficos", fr: "Graphiques" }),
      diagrams: t({ en: "Diagrams", es: "Diagramas", fr: "Diagrammes" }),
      "kinetic-type": t({
        en: "Kinetic type",
        es: "Tipografía cinética",
        fr: "Typographie animée",
      }),
      // Source catalog category, not an implementation-structure name.
      // oxlint-disable-next-line anti-slop/no-shape-in-symbol-names
      shapes: t({ en: "Shapes", es: "Formas", fr: "Formes" }),
      particles: t({ en: "Particles", es: "Partículas", fr: "Particules" }),
      characters: t({ en: "Characters", es: "Personajes", fr: "Personnages" }),
      photos: t({ en: "Photos", es: "Fotos", fr: "Photos" }),
      music: t({ en: "Music", es: "Música", fr: "Musique" }),
      code: t({ en: "Code", es: "Código", fr: "Code" }),
    },
    // Intro heading and copy on each category page, e.g. /category/product-ui.
    categoryTitles: {
      "product-ui": t({
        en: "Product UI motion videos.",
        es: "Vídeos motion de interfaces de producto.",
        fr: "Vidéos motion d’interfaces produit.",
      }),
      phone: t({
        en: "Phone and app motion videos.",
        es: "Vídeos motion de móviles y apps.",
        fr: "Vidéos motion de téléphones et d’apps.",
      }),
      charts: t({
        en: "Animated charts and data.",
        es: "Gráficos y datos animados.",
        fr: "Graphiques et données animés.",
      }),
      diagrams: t({
        en: "Animated diagrams.",
        es: "Diagramas animados.",
        fr: "Diagrammes animés.",
      }),
      "kinetic-type": t({
        en: "Kinetic typography.",
        es: "Tipografía cinética.",
        fr: "Typographie animée.",
      }),
      // oxlint-disable-next-line anti-slop/no-shape-in-symbol-names
      shapes: t({
        en: "Shapes in motion.",
        es: "Formas en movimiento.",
        fr: "Formes en mouvement.",
      }),
      particles: t({
        en: "Particle animations.",
        es: "Animaciones de partículas.",
        fr: "Animations de particules.",
      }),
      characters: t({
        en: "Character animations.",
        es: "Animaciones de personajes.",
        fr: "Animations de personnages.",
      }),
      photos: t({
        en: "Photos in motion.",
        es: "Fotos en movimiento.",
        fr: "Photos en mouvement.",
      }),
      music: t({
        en: "Motion set to music.",
        es: "Movimiento al ritmo de la música.",
        fr: "Le mouvement en musique.",
      }),
      code: t({
        en: "Code in motion.",
        es: "Código en movimiento.",
        fr: "Le code en mouvement.",
      }),
    },
    categoryIntros: {
      "product-ui": t({
        en: "AI-made videos of product interfaces: dashboards, app walkthroughs, and launch films, with the prompts and skills behind them.",
        es: "Vídeos creados con IA de interfaces de producto: paneles, recorridos por apps y vídeos de lanzamiento, con las instrucciones y habilidades que los hicieron posibles.",
        fr: "Des vidéos créées avec l’IA autour d’interfaces produit : tableaux de bord, démonstrations d’apps et films de lancement, avec leurs instructions et compétences.",
      }),
      phone: t({
        en: "AI-made videos of phones and mobile apps: animated screens, device mockups, and app launches, with the prompts and skills behind them.",
        es: "Vídeos creados con IA de móviles y apps: pantallas animadas, maquetas de dispositivos y lanzamientos de apps, con las instrucciones y habilidades que los hicieron posibles.",
        fr: "Des vidéos créées avec l’IA autour des téléphones et des apps mobiles : écrans animés, maquettes d’appareils et lancements d’apps, avec leurs instructions et compétences.",
      }),
      charts: t({
        en: "AI-made videos of charts and data: animated graphs, metrics, and number reveals, with the prompts and skills behind them.",
        es: "Vídeos creados con IA de gráficos y datos: gráficas animadas, métricas y cifras reveladas, con las instrucciones y habilidades que los hicieron posibles.",
        fr: "Des vidéos créées avec l’IA autour des graphiques et des données : courbes animées, indicateurs et chiffres révélés, avec leurs instructions et compétences.",
      }),
      diagrams: t({
        en: "AI-made videos of diagrams: animated flows, architectures, and explainers, with the prompts and skills behind them.",
        es: "Vídeos creados con IA de diagramas: flujos animados, arquitecturas y explicaciones, con las instrucciones y habilidades que los hicieron posibles.",
        fr: "Des vidéos créées avec l’IA autour des diagrammes : flux animés, architectures et explications, avec leurs instructions et compétences.",
      }),
      "kinetic-type": t({
        en: "AI-made kinetic typography: animated text, titles, and type-driven videos, with the prompts and skills behind them.",
        es: "Tipografía cinética creada con IA: texto animado, títulos y vídeos tipográficos, con las instrucciones y habilidades que los hicieron posibles.",
        fr: "De la typographie animée créée avec l’IA : textes, titres et vidéos typographiques, avec leurs instructions et compétences.",
      }),
      // oxlint-disable-next-line anti-slop/no-shape-in-symbol-names
      shapes: t({
        en: "AI-made videos of shapes and geometry: abstract loops, morphing forms, and graphic animation, with the prompts and skills behind them.",
        es: "Vídeos creados con IA de formas y geometría: bucles abstractos, formas que se transforman y animación gráfica, con las instrucciones y habilidades que los hicieron posibles.",
        fr: "Des vidéos créées avec l’IA autour des formes et de la géométrie : boucles abstraites, formes qui se métamorphosent et animation graphique, avec leurs instructions et compétences.",
      }),
      particles: t({
        en: "AI-made particle animations: swarms, dots, and generative motion, with the prompts and skills behind them.",
        es: "Animaciones de partículas creadas con IA: enjambres, puntos y movimiento generativo, con las instrucciones y habilidades que los hicieron posibles.",
        fr: "Des animations de particules créées avec l’IA : essaims, points et mouvement génératif, avec leurs instructions et compétences.",
      }),
      characters: t({
        en: "AI-made character animations: mascots, avatars, and illustrated motion, with the prompts and skills behind them.",
        es: "Animaciones de personajes creadas con IA: mascotas, avatares y movimiento ilustrado, con las instrucciones y habilidades que los hicieron posibles.",
        fr: "Des animations de personnages créées avec l’IA : mascottes, avatars et illustrations animées, avec leurs instructions et compétences.",
      }),
      photos: t({
        en: "AI-made videos built from photos: slideshows, collages, and photo animation, with the prompts and skills behind them.",
        es: "Vídeos creados con IA a partir de fotos: presentaciones, collages y animación fotográfica, con las instrucciones y habilidades que los hicieron posibles.",
        fr: "Des vidéos créées avec l’IA à partir de photos : diaporamas, collages et photos animées, avec leurs instructions et compétences.",
      }),
      music: t({
        en: "AI-made videos set to music: beat-synced edits, visualizers, and audio-reactive animation, with the prompts and skills behind them.",
        es: "Vídeos creados con IA al ritmo de la música: montajes sincronizados, visualizadores y animación reactiva al audio, con las instrucciones y habilidades que los hicieron posibles.",
        fr: "Des vidéos créées avec l’IA en musique : montages calés sur le rythme, visualiseurs et animations réactives au son, avec leurs instructions et compétences.",
      }),
      code: t({
        en: "AI-made videos of code: animated editors, terminals, and developer tool launches, with the prompts and skills behind them.",
        es: "Vídeos creados con IA sobre código: editores animados, terminales y lanzamientos de herramientas para desarrolladores, con las instrucciones y habilidades que los hicieron posibles.",
        fr: "Des vidéos créées avec l’IA autour du code : éditeurs animés, terminaux et lancements d’outils pour développeurs, avec leurs instructions et compétences.",
      }),
    },
  },
} satisfies Dictionary;
