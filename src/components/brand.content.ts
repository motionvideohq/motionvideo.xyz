import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "brand-menu",
  content: {
    copyLogomark: t({
      en: "Copy logomark as SVG",
      es: "Copiar símbolo como SVG",
      fr: "Copier le symbole en SVG",
      zh: "复制 Logo 标志 SVG",
    }),
    copyLogotype: t({
      en: "Copy logotype as SVG",
      es: "Copiar logotipo como SVG",
      fr: "Copier le logotype en SVG",
      zh: "复制 Logo 字标 SVG",
    }),
    copyAppIcon: t({
      en: "Copy app icon as SVG",
      es: "Copiar icono de app como SVG",
      fr: "Copier l’icône d’app en SVG",
      zh: "复制应用图标 SVG",
    }),
    guidelines: t({
      en: "Brand guidelines",
      es: "Guía de marca",
      fr: "Charte de marque",
      zh: "品牌规范",
    }),
    download: t({
      en: "Download brand assets",
      es: "Descargar recursos de marca",
      fr: "Télécharger les ressources de marque",
      zh: "下载品牌素材",
    }),
  },
} satisfies Dictionary;
