import { t } from "intlayer";
import type { Dictionary } from "intlayer";

import { SITE } from "@/constants/site";

export default {
  key: "brand",
  content: {
    title: t({ en: "Brand", es: "Marca", fr: "Marque", zh: "品牌" }),
    intro: t({
      en: `Logos and colors for writing about ${SITE.NAME}. There is a logomark only; set the name in plain text next to it.`,
      es: `Logotipos y colores para escribir sobre ${SITE.NAME}. Solo hay un símbolo; coloca el nombre en texto a su lado.`,
      fr: `Logos et couleurs pour parler de ${SITE.NAME}. Seul un symbole est fourni ; placez le nom en texte à côté.`,
      zh: `撰写 ${SITE.NAME} 相关内容时可使用的 Logo 和颜色。我们只有 Logo 标志；请在其旁边以纯文本写出名称。`,
    }),
    logomark: t({
      en: "Logomark",
      es: "Símbolo",
      fr: "Symbole",
      zh: "Logo 标志",
    }),
    assetNames: [
      t({
        en: "Logomark, black",
        es: "Símbolo, negro",
        fr: "Symbole, noir",
        zh: "Logo 标志，黑色",
      }),
      t({
        en: "Logomark, white",
        es: "Símbolo, blanco",
        fr: "Symbole, blanc",
        zh: "Logo 标志，白色",
      }),
      t({
        en: "App icon",
        es: "Icono de aplicación",
        fr: "Icône d’application",
        zh: "应用图标",
      }),
    ],
    colors: t({ en: "Colors", es: "Colores", fr: "Couleurs", zh: "颜色" }),
    colorNames: [
      t({ en: "Yellow", es: "Amarillo", fr: "Jaune", zh: "黄色" }),
      t({
        en: "Light yellow",
        es: "Amarillo claro",
        fr: "Jaune clair",
        zh: "浅黄色",
      }),
      t({ en: "Black", es: "Negro", fr: "Noir", zh: "黑色" }),
    ],
    usage: t({ en: "Usage", es: "Uso", fr: "Utilisation", zh: "使用规范" }),
    nameRule: t({
      en: `Write the name as ${SITE.NAME}: one word, capital M and V.`,
      es: `Escribe el nombre como ${SITE.NAME}: una palabra, con M y V mayúsculas.`,
      fr: `Écrivez le nom ${SITE.NAME} : un seul mot, avec M et V majuscules.`,
      zh: `名称请写作 ${SITE.NAME}：一个词，M 和 V 大写。`,
    }),
    spacing: t({
      en: "Keep clear space around the logomark of at least half its height.",
      es: "Deja un espacio libre alrededor del símbolo de al menos la mitad de su altura.",
      fr: "Laissez autour du symbole un espace libre d’au moins la moitié de sa hauteur.",
      zh: "Logo 标志四周至少保留其高度一半的留白。",
    }),
    effects: t({
      en: "Don’t stretch, rotate, recolor outside the palette, or add effects.",
      es: "No estires, gires, uses colores fuera de la paleta ni añadas efectos.",
      fr: "Ne l’étirez pas, ne le faites pas pivoter, n’utilisez pas de couleurs hors palette et n’ajoutez pas d’effets.",
      zh: "请勿拉伸、旋转、使用调色板以外的颜色或添加特效。",
    }),
    endorsement: t({
      en: "Don’t use the mark in a way that suggests we endorse your product.",
      es: "No uses la marca de forma que sugiera que respaldamos tu producto.",
      fr: "N’utilisez pas la marque d’une manière qui suggère que nous recommandons votre produit.",
      zh: "请勿以暗示我们为你的产品背书的方式使用标志。",
    }),
    questions: t({
      en: "Questions or a press request? ",
      es: "¿Preguntas o una solicitud de prensa? ",
      fr: "Une question ou une demande de presse ? ",
      zh: "有疑问或媒体需求？",
    }),
  },
} satisfies Dictionary;
