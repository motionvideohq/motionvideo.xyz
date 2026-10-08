import { t } from 'intlayer';
import type { Dictionary } from 'intlayer';

const chrome = {
  key: "chrome",
  content: {
    language: t({ en: "Language", es: "Idioma", fr: "Langue" }),
    dashboard: t({ en: "Dashboard", es: "Panel", fr: "Tableau de bord" }),
    access: t({ en: "Access", es: "Acceso", fr: "Accès" }),
    tagline: t({ en: "Motion design, written in code.", es: "Diseño de movimiento, escrito en código.", fr: "Le motion design, écrit en code." }),
    githubRepository: t({ en: "GitHub repository", es: "Repositorio de GitHub", fr: "Dépôt GitHub" }),
    starGithub: t({ en: "Star on GitHub", es: "Dale una estrella en GitHub", fr: "Ajouter une étoile sur GitHub" }),
    followX: t({ en: "Follow on X", es: "Síguenos en X", fr: "Nous suivre sur X" }),
    footer: t({ en: "Footer", es: "Pie de página", fr: "Pied de page" }),
    product: t({ en: "Product", es: "Producto", fr: "Produit" }),
    features: t({ en: "Features", es: "Funciones", fr: "Fonctionnalités" }),
    howItWorks: t({ en: "How it works", es: "Cómo funciona", fr: "Comment ça marche" }),
    pricing: t({ en: "Pricing", es: "Precio", fr: "Tarif" }),
    faq: t({ en: "FAQ", es: "Preguntas frecuentes", fr: "Questions fréquentes" }),
    company: t({ en: "Company", es: "Empresa", fr: "Entreprise" }),
    about: t({ en: "About", es: "Acerca de", fr: "À propos" }),
    brand: t({ en: "Brand", es: "Marca", fr: "Marque" }),
    contact: t({ en: "Contact", es: "Contacto", fr: "Contact" }),
    legal: t({ en: "Legal", es: "Legal", fr: "Informations légales" }),
    terms: t({ en: "Terms of service", es: "Términos de servicio", fr: "Conditions d’utilisation" }),
    privacy: t({ en: "Privacy policy", es: "Política de privacidad", fr: "Politique de confidentialité" }),
    refunds: t({ en: "Refund policy", es: "Política de reembolsos", fr: "Politique de remboursement" }),
    dpa: t({ en: "DPA", es: "Acuerdo de tratamiento de datos", fr: "Accord de traitement des données" }),
    otherProducts: t({ en: "Other products", es: "Otros productos", fr: "Autres produits" }),
    andMore: t({ en: "and more", es: "y más", fr: "et plus" }),
    labsProjects: t({ en: "Shadcn Labs projects", es: "Proyectos de Shadcn Labs", fr: "Projets Shadcn Labs" }),
    builtBy: t({ en: "Built by", es: "Creado por", fr: "Créé par" }),
    toggleTheme: t({ en: "Toggle theme", es: "Cambiar tema", fr: "Changer de thème" }),
    frameMissing: t({ en: "Frame missing", es: "Fotograma ausente", fr: "Image manquante" }),
    notFoundTitle: t({ en: "This frame didn’t render.", es: "Este fotograma no se ha renderizado.", fr: "Cette image n’a pas été rendue." }),
    notFoundBody: t({ en: "The page you’re looking for isn’t in the cut. It may have moved, or the link is wrong.", es: "La página que buscas no está en el montaje. Puede que se haya movido o que el enlace sea incorrecto.", fr: "La page recherchée ne fait pas partie du montage. Elle a peut-être été déplacée, ou le lien est incorrect." }),
    backHome: t({ en: "Back to home", es: "Volver al inicio", fr: "Retour à l’accueil" }),
    reportLink: t({ en: "Report a broken link", es: "Notificar un enlace roto", fr: "Signaler un lien cassé" }),
    updated: t({ en: "Last updated:", es: "Última actualización:", fr: "Dernière mise à jour :" }),
    prompt: t({ en: "Prompt:", es: "Instrucción:", fr: "Consigne :" }),
  },
} satisfies Dictionary;

export default chrome;
