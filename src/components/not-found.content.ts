import { t } from "intlayer";
import type { Dictionary } from "intlayer";

const notFound = {
  key: "not-found",
  content: {
    notFoundTitle: t({
      en: "This frame didn’t render.",
      es: "Este fotograma no se ha renderizado.",
      fr: "Cette image n’a pas été rendue.",
    }),
    notFoundBody: t({
      en: "The page you’re looking for isn’t in the cut. It may have moved, or the link is wrong.",
      es: "La página que buscas no está en el montaje. Puede que se haya movido o que el enlace sea incorrecto.",
      fr: "La page recherchée ne fait pas partie du montage. Elle a peut-être été déplacée, ou le lien est incorrect.",
    }),
    backHome: t({
      en: "Back to home",
      es: "Volver al inicio",
      fr: "Retour à l’accueil",
    }),
    reportLink: t({
      en: "Report a broken link",
      es: "Notificar un enlace roto",
      fr: "Signaler un lien cassé",
    }),
  },
} satisfies Dictionary;

export default notFound;
