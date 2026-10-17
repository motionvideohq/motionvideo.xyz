import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "customize-page",
  content: {
    title: t({
      en: "Customize a prompt",
      es: "Personaliza una instrucción",
      fr: "Personnalisez une instruction",
    }),
    intro: t({
      en: "Pick a prompt, add your subject, colors and size, and turn three dials for creativity, pace and polish. It’s free, and your details stay in your browser.",
      es: "Elige una instrucción, añade tu tema, colores y tamaño, y ajusta tres controles de creatividad, ritmo y acabado. Es gratis y tus datos se quedan en tu navegador.",
      fr: "Choisissez une instruction, ajoutez votre sujet, vos couleurs et votre format, puis ajustez trois réglages : créativité, rythme et finition. C’est gratuit, et vos informations restent dans votre navigateur.",
    }),
    templatesTitle: t({
      en: "Templates",
      es: "Plantillas",
      fr: "Modèles",
    }),
    templatesIntro: t({
      en: "Prompts written by MotionVideo, with a field for every part you would change.",
      es: "Instrucciones escritas por MotionVideo, con un campo para cada parte que querrías cambiar.",
      fr: "Des instructions écrites par MotionVideo, avec un champ pour chaque partie à modifier.",
    }),
    customize: t({
      en: "Customize",
      es: "Personalizar",
      fr: "Personnaliser",
    }),
    galleryTitle: t({
      en: "Prompts from the gallery",
      es: "Instrucciones de la galería",
      fr: "Instructions de la galerie",
    }),
    galleryIntro: t({
      en: "Every prompt shared with a video in the gallery. Your details are added at the end, in a short brief the model follows.",
      es: "Todas las instrucciones compartidas con un vídeo de la galería. Tus datos se añaden al final, en un breve resumen que el modelo sigue.",
      fr: "Toutes les instructions partagées avec une vidéo de la galerie. Vos informations sont ajoutées à la fin, dans un court brief que le modèle suit.",
    }),
    filterCategory: t({
      en: "Filter by category",
      es: "Filtrar por categoría",
      fr: "Filtrer par catégorie",
    }),
    noPrompts: t({
      en: "No prompts in this category yet.",
      es: "Todavía no hay instrucciones en esta categoría.",
      fr: "Aucune instruction dans cette catégorie pour l’instant.",
    }),
    allPrompts: t({
      en: "All prompts",
      es: "Todas las instrucciones",
      fr: "Toutes les instructions",
    }),
    customizeTitle: t({
      en: "Customize:",
      es: "Personalizar:",
      fr: "Personnaliser :",
    }),
    postBy: t({
      en: "The prompt comes from a post by",
      es: "La instrucción viene de una publicación de",
      fr: "L’instruction vient d’une publication de",
    }),
    sharedBy: t({
      en: "Prompt shared by",
      es: "Instrucción compartida por",
      fr: "Instruction partagée par",
    }),
    watchVideo: t({
      en: "Watch the video",
      es: "Ver el vídeo",
      fr: "Voir la vidéo",
    }),
    originalBy: t({
      en: "Original prompt by",
      es: "Instrucción original de",
      fr: "Instruction originale de",
    }),
    rewriteBefore: t({
      en: "The form below uses",
      es: "El formulario de abajo usa",
      fr: "Le formulaire ci-dessous utilise",
    }),
    rewriteAfter: t({
      en: ", MotionVideo’s rewrite of this prompt: the same idea, with the structure, timing and rendering steps it leaves out.",
      es: ", la reescritura de esta instrucción hecha por MotionVideo: la misma idea, con la estructura, el ritmo y los pasos de renderizado que le faltan.",
      fr: ", la réécriture de cette instruction par MotionVideo : la même idée, avec la structure, le rythme et les étapes de rendu qui lui manquent.",
    }),
    madeBy: t({ en: "Made by", es: "Hecho por", fr: "Réalisé par" }),
    withOriginal: t({
      en: "with the original prompt this template rewrites. No video has been made with the template itself yet.",
      es: "con la instrucción original que esta plantilla reescribe. Todavía no se ha hecho ningún vídeo con la propia plantilla.",
      fr: "avec l’instruction originale que ce modèle réécrit. Aucune vidéo n’a encore été réalisée avec le modèle lui-même.",
    }),
    relatedBy: t({
      en: "A related video by",
      es: "Un vídeo relacionado de",
      fr: "Une vidéo liée de",
    }),
    withOwnPrompt: t({
      en: ", made with its own prompt. No video has been made with this template yet.",
      es: ", hecho con su propia instrucción. Todavía no se ha hecho ningún vídeo con esta plantilla.",
      fr: ", réalisée avec sa propre instruction. Aucune vidéo n’a encore été réalisée avec ce modèle.",
    }),
  },
} satisfies Dictionary;
