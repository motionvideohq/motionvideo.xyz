import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "prompt-customizer",
  content: {
    formTitle: t({
      en: "Make it yours",
      es: "Hazlo tuyo",
      fr: "Personnalisez-le",
    }),
    formIntro: t({
      en: "Everything is optional. Your details stay in this browser and carry over to the next prompt.",
      es: "Todo es opcional. Tus datos se quedan en este navegador y se aplican a la siguiente instrucción.",
      fr: "Tout est facultatif. Vos informations restent dans ce navigateur et s’appliquent à l’instruction suivante.",
    }),
    details: {
      subject: t({
        en: "What it’s about",
        es: "De qué trata",
        fr: "Sujet",
      }),
      size: t({ en: "Size", es: "Tamaño", fr: "Format" }),
      length: t({
        en: "Length (seconds)",
        es: "Duración (segundos)",
        fr: "Durée (secondes)",
      }),
      colors: t({ en: "Colors", es: "Colores", fr: "Couleurs" }),
      typeface: t({
        en: "Typeface",
        es: "Tipografía",
        fr: "Police",
      }),
      notes: t({
        en: "Anything else",
        es: "Algo más",
        fr: "Autre chose",
      }),
    },
    placeholders: {
      subject: t({
        en: "e.g. the launch of my note-taking app",
        es: "p. ej., el lanzamiento de mi app de notas",
        fr: "p. ex. le lancement de mon app de notes",
      }),
      length: t({ en: "e.g. 20", es: "p. ej., 20", fr: "p. ex. 20" }),
      colors: t({
        en: "e.g. #FF4F1F, cobalt blue, cream",
        es: "p. ej., #FF4F1F, azul cobalto, crema",
        fr: "p. ex. #FF4F1F, bleu cobalt, crème",
      }),
      typeface: t({
        en: "e.g. Inter, Space Grotesk",
        es: "p. ej., Inter, Space Grotesk",
        fr: "p. ex. Inter, Space Grotesk",
      }),
      notes: t({
        en: "e.g. end on my logo, no music",
        es: "p. ej., terminar con mi logo, sin música",
        fr: "p. ex. finir sur mon logo, sans musique",
      }),
    },
    sizeAsWritten: t({
      en: "As in the prompt",
      es: "Como en la instrucción",
      fr: "Comme dans l’instruction",
    }),
    sizeDefault: t({
      en: "Default",
      es: "Predeterminado",
      fr: "Par défaut",
    }),
    sizeNames: {
      "1920x1080": t({
        en: "Landscape 16:9",
        es: "Horizontal 16:9",
        fr: "Paysage 16:9",
      }),
      "1080x1920": t({
        en: "Vertical 9:16",
        es: "Vertical 9:16",
        fr: "Vertical 9:16",
      }),
      "1080x1080": t({ en: "Square", es: "Cuadrado", fr: "Carré" }),
      "1080x1350": t({
        en: "Portrait 4:5",
        es: "Retrato 4:5",
        fr: "Portrait 4:5",
      }),
    },
    dialsTitle: t({ en: "Dials", es: "Controles", fr: "Réglages" }),
    dials: {
      creativity: t({
        en: "Creativity",
        es: "Creatividad",
        fr: "Créativité",
      }),
      pace: t({ en: "Pace", es: "Ritmo", fr: "Rythme" }),
      polish: t({ en: "Polish", es: "Acabado", fr: "Finition" }),
    },
    // Five stops per dial, from the lowest to the highest; the middle one
    // leaves the prompt as written.
    stops: {
      creativity: [
        t({ en: "Safe", es: "Segura", fr: "Sage" }),
        t({ en: "Restrained", es: "Contenida", fr: "Retenue" }),
        t({ en: "Balanced", es: "Equilibrada", fr: "Équilibrée" }),
        t({ en: "Bold", es: "Audaz", fr: "Audacieuse" }),
        t({ en: "Wild", es: "Desatada", fr: "Débridée" }),
      ],
      pace: [
        t({ en: "Calm", es: "Tranquilo", fr: "Calme" }),
        t({ en: "Relaxed", es: "Pausado", fr: "Posé" }),
        t({ en: "Balanced", es: "Equilibrado", fr: "Équilibré" }),
        t({ en: "Brisk", es: "Ágil", fr: "Vif" }),
        t({ en: "Frantic", es: "Frenético", fr: "Effréné" }),
      ],
      polish: [
        t({ en: "Quick", es: "Rápido", fr: "Rapide" }),
        t({ en: "Light", es: "Ligero", fr: "Léger" }),
        t({ en: "Standard", es: "Estándar", fr: "Standard" }),
        t({ en: "Thorough", es: "Minucioso", fr: "Minutieux" }),
        t({ en: "Obsessive", es: "Obsesivo", fr: "Obsessionnel" }),
      ],
    },
    reset: t({ en: "Reset", es: "Restablecer", fr: "Réinitialiser" }),
    resultTitle: t({
      en: "Your prompt",
      es: "Tu instrucción",
      fr: "Votre instruction",
    }),
    genericIntro: t({
      en: "The highlighted part at the end is added from your details and dials. Where it disagrees with the prompt, it wins.",
      es: "La parte resaltada al final sale de tus datos y controles. Si contradice la instrucción, prevalece.",
      fr: "La partie surlignée à la fin vient de vos informations et réglages. En cas de conflit avec l’instruction, elle l’emporte.",
    }),
    templateIntro: t({
      en: "Highlighted parts come from the fields. Empty fields keep the default shown in the prompt.",
      es: "Las partes resaltadas salen de los campos. Los campos vacíos mantienen el valor predeterminado que se ve en la instrucción.",
      fr: "Les parties surlignées viennent des champs. Un champ vide garde la valeur par défaut visible dans l’instruction.",
    }),
    runWith: t({
      en: "For best results, run it with",
      es: "Para obtener los mejores resultados, úsala con",
      fr: "Pour de meilleurs résultats, utilisez-la avec",
    }),
    runWithAgent: t({
      en: "Paste it into a coding agent that can write and render code, such as Claude Code or Codex.",
      es: "Pégala en un agente de programación que pueda escribir y renderizar código, como Claude Code o Codex.",
      fr: "Collez-la dans un agent de programmation capable d’écrire et de rendre du code, comme Claude Code ou Codex.",
    }),
  },
} satisfies Dictionary;
