import { t } from "intlayer";
import type { Dictionary } from "intlayer";

const page = {
  key: "page",
  content: {
    updated: t({
      en: "Last updated:",
      es: "Última actualización:",
      fr: "Dernière mise à jour :",
    }),
  },
} satisfies Dictionary;

export default page;
