import { t } from 'intlayer';
import type { Dictionary } from 'intlayer';
import { SITE } from "@/constants/site";

export default {
  key: "brand",
  content: {
    title: t({ en: "Brand", es: "Marca", fr: "Marque" }),
    intro: t({ en: `Logos and colors for writing about ${SITE.NAME}. There is a logomark only; set the name in plain text next to it.`, es: `Logotipos y colores para escribir sobre ${SITE.NAME}. Solo hay un símbolo; coloca el nombre en texto a su lado.`, fr: `Logos et couleurs pour parler de ${SITE.NAME}. Seul un symbole est fourni ; placez le nom en texte à côté.` }),
    logomark: t({ en: "Logomark", es: "Símbolo", fr: "Symbole" }),
    assetNames: [t({ en: "Logomark, black", es: "Símbolo, negro", fr: "Symbole, noir" }), t({ en: "Logomark, white", es: "Símbolo, blanco", fr: "Symbole, blanc" }), t({ en: "App icon", es: "Icono de aplicación", fr: "Icône d’application" })],
    colors: t({ en: "Colors", es: "Colores", fr: "Couleurs" }),
    colorNames: [t({ en: "Yellow", es: "Amarillo", fr: "Jaune" }), t({ en: "Light yellow", es: "Amarillo claro", fr: "Jaune clair" }), t({ en: "Black", es: "Negro", fr: "Noir" })],
    usage: t({ en: "Usage", es: "Uso", fr: "Utilisation" }),
    nameRule: t({ en: `Write the name as ${SITE.NAME}: one word, capital M and V.`, es: `Escribe el nombre como ${SITE.NAME}: una palabra, con M y V mayúsculas.`, fr: `Écrivez le nom ${SITE.NAME} : un seul mot, avec M et V majuscules.` }),
    spacing: t({ en: "Keep clear space around the logomark of at least half its height.", es: "Deja un espacio libre alrededor del símbolo de al menos la mitad de su altura.", fr: "Laissez autour du symbole un espace libre d’au moins la moitié de sa hauteur." }),
    effects: t({ en: "Don’t stretch, rotate, recolor outside the palette, or add effects.", es: "No estires, gires, uses colores fuera de la paleta ni añadas efectos.", fr: "Ne l’étirez pas, ne le faites pas pivoter, n’utilisez pas de couleurs hors palette et n’ajoutez pas d’effets." }),
    endorsement: t({ en: "Don’t use the mark in a way that suggests we endorse your product.", es: "No uses la marca de forma que sugiera que respaldamos tu producto.", fr: "N’utilisez pas la marque d’une manière qui suggère que nous recommandons votre produit." }),
    questions: t({ en: "Questions or a press request? ", es: "¿Preguntas o una solicitud de prensa? ", fr: "Une question ou une demande de presse ? " }),
  },
} satisfies Dictionary;
