import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "design",
  content: {
    brandDescription: t({
      en: "The logomark, app icon and colors, and how to use them.",
      es: "El símbolo, el icono de app y los colores, y cómo usarlos.",
      fr: "Le symbole, l’icône d’application et les couleurs, et comment les utiliser.",
      zh: "Logo 标志、应用图标和配色，以及使用方法。",
      ko: "로고마크, 앱 아이콘, 색상과 사용 방법.",
      ja: "ロゴマーク、アプリアイコン、カラーとその使い方。",
      de: "Bildmarke, App-Icon und Farben, und wie man sie verwendet.",
      pt: "O símbolo, o ícone da app e as cores, e como usá-los.",
      ru: "Логознак, иконка приложения, цвета и правила их использования.",
    }),
    components: t({
      en: "Components",
      es: "Componentes",
      fr: "Composants",
      zh: "组件",
      ko: "컴포넌트",
      ja: "コンポーネント",
      de: "Komponenten",
      pt: "Componentes",
      ru: "Компоненты",
    }),
    componentsDescription: t({
      en: "React components from the site, installable with the shadcn CLI.",
      es: "Componentes de React del sitio, instalables con la CLI de shadcn.",
      fr: "Les composants React du site, installables avec la CLI shadcn.",
      zh: "本站的 React 组件，可通过 shadcn CLI 安装。",
      ko: "이 사이트의 React 컴포넌트. shadcn CLI로 설치할 수 있습니다.",
      ja: "サイトの React コンポーネント。shadcn CLI でインストールできます。",
      de: "React-Komponenten der Website, mit der shadcn CLI installierbar.",
      pt: "Componentes React do site, instaláveis com a CLI do shadcn.",
      ru: "React-компоненты сайта, которые устанавливаются через shadcn CLI.",
    }),
    viewSource: t({
      en: "View source",
      es: "Ver código",
      fr: "Voir le code",
      zh: "查看源码",
      ko: "소스 보기",
      ja: "ソースを見る",
      de: "Quellcode ansehen",
      pt: "Ver código",
      ru: "Исходный код",
    }),
  },
} satisfies Dictionary;
