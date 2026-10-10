import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "site-footer",
  content: {
    githubRepository: t({
      en: "GitHub repository",
      es: "Repositorio de GitHub",
      fr: "Dépôt GitHub",
    }),
    starGithub: t({
      en: "Star on GitHub",
      es: "Dale una estrella en GitHub",
      fr: "Ajouter une étoile sur GitHub",
    }),
    followX: t({
      en: "Follow on X",
      es: "Síguenos en X",
      fr: "Nous suivre sur X",
    }),
    footer: t({ en: "Footer", es: "Pie de página", fr: "Pied de page" }),
    builtBy: t({ en: "Built by", es: "Creado por", fr: "Créé par" }),
    company: t({ en: "Company", es: "Empresa", fr: "Entreprise" }),
    about: t({ en: "About", es: "Acerca de", fr: "À propos" }),
    brand: t({ en: "Brand", es: "Marca", fr: "Marque" }),
    contact: t({ en: "Contact", es: "Contacto", fr: "Contact" }),
    sponsor: t({ en: "Sponsor", es: "Patrocinar", fr: "Sponsoriser" }),
    legal: t({ en: "Legal", es: "Legal", fr: "Mentions légales" }),
    terms: t({
      en: "Terms of service",
      es: "Términos de servicio",
      fr: "Conditions d’utilisation",
    }),
    privacy: t({
      en: "Privacy policy",
      es: "Política de privacidad",
      fr: "Politique de confidentialité",
    }),
    refunds: t({
      en: "Refund policy",
      es: "Política de reembolso",
      fr: "Politique de remboursement",
    }),
    dpa: t({
      en: "DPA",
      es: "Acuerdo de tratamiento de datos",
      fr: "Accord de traitement des données",
    }),
    otherProducts: t({
      en: "Other products",
      es: "Otros productos",
      fr: "Autres produits",
    }),
    labsProjects: t({
      en: "Shadcn Labs projects",
      es: "Proyectos de Shadcn Labs",
      fr: "Projets Shadcn Labs",
    }),
  },
} satisfies Dictionary;
