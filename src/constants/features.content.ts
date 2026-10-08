import { t } from 'intlayer';
import type { Dictionary } from 'intlayer';

export default {
  key: "features",
  content: {
    features: [
      { art: "skills", title: t({ en: "Agent skills", es: "Habilidades para agentes", fr: "Compétences pour agents" }), body: t({ en: "Instruction files that cover storyboarding, choreography, pacing, and typography in motion, loaded by your agent only when it needs them.", es: "Archivos de instrucciones sobre guiones gráficos, coreografía, ritmo y tipografía en movimiento, que tu agente carga solo cuando los necesita.", fr: "Des fichiers d’instructions sur le storyboard, la chorégraphie, le rythme et la typographie en mouvement, chargés par votre agent uniquement au besoin." }) },
      { art: "scenes", title: t({ en: "Scene starters", es: "Escenas iniciales", fr: "Scènes de départ" }), body: t({ en: "Ready-to-fork compositions for showreels, title sequences, launch films, and changelog clips, so your agent never starts from an empty file.", es: "Composiciones listas para adaptar a reels, secuencias de títulos, vídeos de lanzamiento y clips de novedades, para que tu agente nunca empiece con un archivo vacío.", fr: "Des compositions prêtes à adapter pour les bandes démo, génériques, films de lancement et clips de nouveautés, afin que votre agent ne parte jamais d’un fichier vide." }) },
      { art: "motion", title: t({ en: "Motion tokens", es: "Valores de movimiento", fr: "Paramètres de mouvement" }), body: t({ en: "Spring, easing, and timing values tuned for motion design, kept in one place so every scene moves with the same rhythm.", es: "Valores de resorte, aceleración y duración ajustados para el diseño de movimiento, reunidos para que todas las escenas sigan el mismo ritmo.", fr: "Des valeurs de ressort, d’accélération et de durée adaptées au motion design, regroupées pour que chaque scène garde le même rythme." }) },
      { art: "renderers", title: t({ en: "Renderer guides", es: "Guías de renderizado", fr: "Guides des moteurs de rendu" }), body: t({ en: "Setup notes for Remotion, HyperFrames, Editframe, and fframes, so the same scene plan works with your stack.", es: "Notas de configuración para Remotion, HyperFrames, Editframe y fframes, para que el mismo plan de escenas funcione con tus herramientas.", fr: "Des notes de configuration pour Remotion, HyperFrames, Editframe et fframes, afin que le même plan de scènes fonctionne avec vos outils." }) },
    ],
  },
} satisfies Dictionary;
