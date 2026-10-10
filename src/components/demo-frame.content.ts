import { t } from "intlayer";
import type { Dictionary } from "intlayer";

const demoFrame = {
  key: "demo-frame",
  content: {
    prompt: t({ en: "Prompt:", es: "Instrucción:", fr: "Consigne :" }),
  },
} satisfies Dictionary;

export default demoFrame;
