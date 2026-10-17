import { t } from "intlayer";
import type { Dictionary } from "intlayer";

import { SITE } from "@/constants/site";

// Strings for `/templates` and `/templates/$templateId`. The templates
// themselves (titles, prompts, fields) are authored in English in
// src/lib/prompt-templates.ts.
export default {
  key: "templates-page",
  content: {
    title: t({ en: "Templates", es: "Plantillas", fr: "Modèles" }),
    intro: t({
      en: `Prompts written by ${SITE.NAME} to be customized: every part you would change is a field. Fill them in, or copy the prompt as it is.`,
      es: `Prompts escritos por ${SITE.NAME} para personalizarlos: cada parte que cambiarías es un campo. Rellénalos o copia el prompt tal cual.`,
      fr: `Des prompts écrits par ${SITE.NAME} pour être personnalisés : chaque partie que vous changeriez est un champ. Remplissez-les, ou copiez le prompt tel quel.`,
    }),
    relatedVideos: t({
      en: "related videos",
      es: "vídeos relacionados",
      fr: "vidéos associées",
    }),
    back: t({
      en: "Back to the gallery",
      es: "Volver a la galería",
      fr: "Retour à la galerie",
    }),
    madeBy: t({ en: "Made by", es: "Hecho por", fr: "Réalisée par" }),
    withOriginal: t({
      en: "with the original prompt, not with this template.",
      es: "con el prompt original, no con esta plantilla.",
      fr: "avec le prompt original, pas avec ce modèle.",
    }),
    relatedBy: t({
      en: "A related video from the gallery by",
      es: "Un vídeo relacionado de la galería, de",
      fr: "Une vidéo associée de la galerie, par",
    }),
    templatePrompt: t({
      en: "Template prompt",
      es: "Prompt de la plantilla",
      fr: "Prompt du modèle",
    }),
    fieldsHint: t({
      en: "Highlighted parts are fields. Customize them, or copy the prompt with its defaults filled in.",
      es: "Las partes resaltadas son campos. Personalízalas o copia el prompt con los valores predeterminados.",
      fr: "Les parties en surbrillance sont des champs. Personnalisez-les, ou copiez le prompt avec ses valeurs par défaut.",
    }),
    note: t({
      en: `Written by ${SITE.NAME}. Run it with Opus 5.5 at max effort for best results.`,
      es: `Escrito por ${SITE.NAME}. Para obtener los mejores resultados, úsalo con Opus 5.5 con esfuerzo máximo.`,
      fr: `Écrit par ${SITE.NAME}. Pour de meilleurs résultats, utilisez-le avec Opus 5.5 en effort maximal.`,
    }),
    improvements: t({
      en: "What it adds",
      es: "Qué aporta",
      fr: "Ce qu’il apporte",
    }),
    originalPrompt: t({
      en: "Original prompt",
      es: "Prompt original",
      fr: "Prompt original",
    }),
    usedIn: t({
      en: "Used word for word or close to it in",
      es: "Usado literalmente o casi en",
      fr: "Repris mot pour mot ou presque dans",
    }),
    galleryVideos: t({
      en: "gallery videos.",
      es: "vídeos de la galería.",
      fr: "vidéos de la galerie.",
    }),
    madeWithOriginal: t({
      en: "Made with the original prompt",
      es: "Hechos con el prompt original",
      fr: "Réalisées avec le prompt original",
    }),
    related: t({
      en: "Related videos",
      es: "Vídeos relacionados",
      fr: "Vidéos associées",
    }),
  },
} satisfies Dictionary;
