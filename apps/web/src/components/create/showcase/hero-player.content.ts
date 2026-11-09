import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "showcase-hero-player",
  content: {
    templates: t({
      en: "Templates",
      es: "Plantillas",
      fr: "Modèles",
      zh: "模板",
      ko: "템플릿",
      ja: "テンプレート",
      de: "Vorlagen",
      pt: "Modelos",
      ru: "Шаблоны",
    }),
    player: t({
      en: "Live Showcase preview",
      es: "Vista previa en vivo de Showcase",
      fr: "Aperçu Showcase en direct",
      zh: "Showcase 实时预览",
      ko: "Showcase 실시간 미리보기",
      ja: "Showcase のライブプレビュー",
      de: "Live-Vorschau von Showcase",
      pt: "Prévia ao vivo do Showcase",
      ru: "Живое превью Showcase",
    }),
    useTemplate: t({
      en: "Use this template",
      es: "Usar esta plantilla",
      fr: "Utiliser ce modèle",
      zh: "使用此模板",
      ko: "이 템플릿 사용",
      ja: "このテンプレートを使う",
      de: "Diese Vorlage nutzen",
      pt: "Usar este modelo",
      ru: "Использовать шаблон",
    }),
    rendered: t({
      en: "Rendered live in your browser",
      es: "Renderizado en directo en tu navegador",
      fr: "Rendu en direct dans votre navigateur",
      zh: "在你的浏览器中实时渲染",
      ko: "브라우저에서 실시간 렌더링",
      ja: "ブラウザでリアルタイムにレンダリング",
      de: "Live in deinem Browser gerendert",
      pt: "Renderizado ao vivo no seu navegador",
      ru: "Рендерится прямо в вашем браузере",
    }),
  },
} satisfies Dictionary;
