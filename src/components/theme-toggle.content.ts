import { t } from "intlayer";
import type { Dictionary } from "intlayer";

const themeToggle = {
  key: "theme-toggle",
  content: {
    toggleTheme: t({
      en: "Toggle theme",
      es: "Cambiar tema",
      fr: "Changer de thème",
      zh: "切换主题",
      ko: "테마 전환",
    }),
  },
} satisfies Dictionary;

export default themeToggle;
