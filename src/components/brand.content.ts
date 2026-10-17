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
      ko: "로고마크를 SVG로 복사",
      ja: "ロゴマークをSVGでコピー",
      de: "Bildmarke als SVG kopieren",
      pt: "Copiar símbolo como SVG",
    }),
    copyLogotype: t({
      en: "Copy logotype as SVG",
      es: "Copiar logotipo como SVG",
      fr: "Copier le logotype en SVG",
      zh: "复制 Logo 字标 SVG",
      ko: "로고타입을 SVG로 복사",
      ja: "ロゴタイプをSVGでコピー",
      de: "Logo als SVG kopieren",
      pt: "Copiar logótipo como SVG",
    }),
    copyAppIcon: t({
      en: "Copy app icon as SVG",
      es: "Copiar icono de app como SVG",
      fr: "Copier l’icône d’app en SVG",
      zh: "复制应用图标 SVG",
      ko: "앱 아이콘을 SVG로 복사",
      ja: "アプリアイコンをSVGでコピー",
      de: "App-Icon als SVG kopieren",
      pt: "Copiar ícone da app como SVG",
    }),
    guidelines: t({
      en: "Brand guidelines",
      es: "Guía de marca",
      fr: "Charte de marque",
      zh: "品牌规范",
      ko: "브랜드 가이드라인",
      ja: "ブランドガイドライン",
      de: "Markenrichtlinien",
      pt: "Diretrizes da marca",
    }),
    download: t({
      en: "Download brand assets",
      es: "Descargar recursos de marca",
      fr: "Télécharger les ressources de marque",
      zh: "下载品牌素材",
      ko: "브랜드 에셋 다운로드",
      ja: "ブランドアセットをダウンロード",
      de: "Marken-Assets herunterladen",
      pt: "Transferir recursos da marca",
    }),
  },
} satisfies Dictionary;
