import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "site-footer",
  content: {
    githubRepository: t({
      en: "GitHub repository",
      es: "Repositorio de GitHub",
      fr: "Dépôt GitHub",
      zh: "GitHub 仓库",
    }),
    starGithub: t({
      en: "Star on GitHub",
      es: "Dale una estrella en GitHub",
      fr: "Ajouter une étoile sur GitHub",
      zh: "在 GitHub 上 Star",
    }),
    followX: t({
      en: "Follow on X",
      es: "Síguenos en X",
      fr: "Nous suivre sur X",
      zh: "在 X 上关注",
    }),
    footer: t({
      en: "Footer",
      es: "Pie de página",
      fr: "Pied de page",
      zh: "页脚",
    }),
    builtBy: t({
      en: "Built by",
      es: "Creado por",
      fr: "Créé par",
      zh: "作者",
    }),
    company: t({ en: "Company", es: "Empresa", fr: "Entreprise", zh: "公司" }),
    about: t({ en: "About", es: "Acerca de", fr: "À propos", zh: "关于" }),
    brand: t({ en: "Brand", es: "Marca", fr: "Marque", zh: "品牌" }),
    contact: t({ en: "Contact", es: "Contacto", fr: "Contact", zh: "联系" }),
    sponsor: t({
      en: "Sponsor",
      es: "Patrocinar",
      fr: "Sponsoriser",
      zh: "赞助",
    }),
    legal: t({ en: "Legal", es: "Legal", fr: "Mentions légales", zh: "法律" }),
    terms: t({
      en: "Terms of service",
      es: "Términos de servicio",
      fr: "Conditions d’utilisation",
      zh: "服务条款",
    }),
    privacy: t({
      en: "Privacy policy",
      es: "Política de privacidad",
      fr: "Politique de confidentialité",
      zh: "隐私政策",
    }),
    refunds: t({
      en: "Refund policy",
      es: "Política de reembolso",
      fr: "Politique de remboursement",
      zh: "退款政策",
    }),
    otherProducts: t({
      en: "Other products",
      es: "Otros productos",
      fr: "Autres produits",
      zh: "其他产品",
    }),
    labsProjects: t({
      en: "Shadcn Labs projects",
      es: "Proyectos de Shadcn Labs",
      fr: "Projets Shadcn Labs",
      zh: "Shadcn Labs 项目",
    }),
  },
} satisfies Dictionary;
