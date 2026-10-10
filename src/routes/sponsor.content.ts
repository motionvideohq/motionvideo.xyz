import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "sponsor",
  content: {
    title: t({ en: "Sponsor", es: "Patrocinar", fr: "Sponsoriser" }),
    pitch: t({
      en: "Reach the people who make product films and motion design with AI and code.",
      es: "Llega a quienes crean vídeos de producto y motion design con IA y código.",
      fr: "Touchez celles et ceux qui créent des films produit et du motion design avec l’IA et le code.",
    }),
    note: t({
      en: "MotionVideo stays free and independent through a few labelled placements. Pick a plan below to book one.",
      es: "MotionVideo sigue siendo gratuito e independiente gracias a unos pocos espacios patrocinados y señalizados. Elige un plan para reservar uno.",
      fr: "MotionVideo reste gratuit et indépendant grâce à quelques emplacements sponsorisés et signalés. Choisissez une formule ci-dessous pour en réserver un.",
    }),
    thanksTitle: t({
      en: "Thank you for sponsoring MotionVideo.",
      es: "Gracias por patrocinar MotionVideo.",
      fr: "Merci de sponsoriser MotionVideo.",
    }),
    thanksBody: t({
      en: "Your plan is active. Send a square mark, a name, one line of copy, and a link to",
      es: "Tu plan está activo. Envía un logotipo cuadrado, un nombre, una línea de texto y un enlace a",
      fr: "Votre formule est active. Envoyez un logo carré, un nom, une ligne de texte et un lien à",
    }),
    reach: t({ en: "Reach", es: "Alcance", fr: "Audience" }),
    reachNote: t({
      en: "Counted from the live catalogue.",
      es: "Contado a partir del catálogo publicado.",
      fr: "Compté à partir du catalogue en ligne.",
    }),
    stats: {
      videos: t({
        en: "Motion videos in Discover",
        es: "Vídeos en Descubrir",
        fr: "Vidéos dans Découvrir",
      }),
      creators: t({
        en: "Creators credited and linked",
        es: "Creadores citados y enlazados",
        fr: "Créateurs crédités et liés",
      }),
      tools: t({
        en: "Tools in the directory",
        es: "Herramientas en el directorio",
        fr: "Outils dans l’annuaire",
      }),
      categories: t({
        en: "Discover categories",
        es: "Categorías en Descubrir",
        fr: "Catégories dans Découvrir",
      }),
    },
    sponsors: t({ en: "Sponsors", es: "Patrocinadores", fr: "Sponsors" }),
    takeSlot: t({
      en: "Take this slot",
      es: "Ocupa este espacio",
      fr: "Prendre cette place",
    }),
    plans: t({ en: "Plans", es: "Planes", fr: "Formules" }),
    perMonth: t({ en: "/ month", es: "/ mes", fr: "/ mois" }),
    tiers: {
      diamond: {
        name: t({ en: "Diamond", es: "Diamante", fr: "Diamant" }),
        firstSponsor: t({
          en: "Be the first Diamond sponsor",
          es: "Sé el primer patrocinador Diamante",
          fr: "Devenez le premier sponsor Diamant",
        }),
        choose: t({
          en: "Choose Diamond",
          es: "Elegir Diamante",
          fr: "Choisir Diamant",
        }),
        perks: [
          t({
            en: "Your logo on the sponsors page",
            es: "Tu logotipo en la página de patrocinadores",
            fr: "Votre logo sur la page des sponsors",
          }),
          t({
            en: "A sponsored card in the Discover grid, on every page view",
            es: "Una tarjeta patrocinada en la cuadrícula de Descubrir, en cada visita",
            fr: "Une carte sponsorisée dans la grille Découvrir, à chaque affichage",
          }),
          t({
            en: "A shoutout on X",
            es: "Una mención en X",
            fr: "Une mention sur X",
          }),
          t({
            en: "A shoutout in the newsletter",
            es: "Una mención en la newsletter",
            fr: "Une mention dans la newsletter",
          }),
        ],
      },
      gold: {
        name: t({ en: "Gold", es: "Oro", fr: "Or" }),
        firstSponsor: t({
          en: "Be the first Gold sponsor",
          es: "Sé el primer patrocinador Oro",
          fr: "Devenez le premier sponsor Or",
        }),
        choose: t({ en: "Choose Gold", es: "Elegir Oro", fr: "Choisir Or" }),
        perks: [
          t({
            en: "Your logo on the sponsors page",
            es: "Tu logotipo en la página de patrocinadores",
            fr: "Votre logo sur la page des sponsors",
          }),
          t({
            en: "Top placement on your category’s page",
            es: "Primera posición en la página de tu categoría",
            fr: "Première place sur la page de votre catégorie",
          }),
          t({
            en: "A shoutout on X",
            es: "Una mención en X",
            fr: "Une mention sur X",
          }),
        ],
      },
      silver: {
        name: t({ en: "Silver", es: "Plata", fr: "Argent" }),
        firstSponsor: t({
          en: "Be the first Silver sponsor",
          es: "Sé el primer patrocinador Plata",
          fr: "Devenez le premier sponsor Argent",
        }),
        choose: t({
          en: "Choose Silver",
          es: "Elegir Plata",
          fr: "Choisir Argent",
        }),
        perks: [
          t({
            en: "Your logo on the sponsors page",
            es: "Tu logotipo en la página de patrocinadores",
            fr: "Votre logo sur la page des sponsors",
          }),
          t({
            en: "Highlighted on your category’s page",
            es: "Destacado en la página de tu categoría",
            fr: "Mis en avant sur la page de votre catégorie",
          }),
        ],
      },
    },
    mostImpact: t({
      en: "Most impact",
      es: "Más impacto",
      fr: "Le plus d’impact",
    }),
    customTitle: t({
      en: "Questions, or need a custom package?",
      es: "¿Preguntas o necesitas un paquete a medida?",
      fr: "Des questions, ou besoin d’une offre sur mesure ?",
    }),
    customBody: t({
      en: "Happy to put something together that fits what you have in mind. Reach out directly.",
      es: "Con gusto preparo algo que encaje con lo que tienes en mente. Escríbeme directamente.",
      fr: "Je peux préparer quelque chose qui correspond à ce que vous avez en tête. Écrivez-moi directement.",
    }),
    email: t({ en: "Email me", es: "Escríbeme", fr: "M’écrire" }),
    dmX: t({ en: "DM on X", es: "MD en X", fr: "MP sur X" }),
    faq: t({
      en: "Frequently asked questions",
      es: "Preguntas frecuentes",
      fr: "Questions fréquentes",
    }),
    faqs: [
      {
        question: t({
          en: "Does sponsoring get my work into the catalogue?",
          es: "¿Patrocinar hace que mi trabajo entre en el catálogo?",
          fr: "Sponsoriser fait-il entrer mon travail dans le catalogue ?",
        }),
        answer: t({
          en: "No. Videos, tools, and creatives are picked on merit and none was paid for. Sponsoring buys the placements above, nothing else.",
          es: "No. Los vídeos, herramientas y creativos se eligen por mérito y ninguno se ha pagado. Patrocinar compra los espacios de arriba, nada más.",
          fr: "Non. Les vidéos, outils et créatifs sont choisis au mérite et aucun n’a été payé. Sponsoriser achète les emplacements ci-dessus, rien de plus.",
        }),
      },
      {
        question: t({
          en: "Is it labelled as sponsored?",
          es: "¿Se indica que es patrocinado?",
          fr: "Est-ce signalé comme sponsorisé ?",
        }),
        answer: t({
          en: 'Yes, on the page and as rel="sponsored" in the markup.',
          es: 'Sí, en la página y como rel="sponsored" en el código.',
          fr: 'Oui, sur la page et via rel="sponsored" dans le code.',
        }),
      },
      {
        question: t({
          en: "What do you need from me?",
          es: "¿Qué necesitas de mí?",
          fr: "De quoi avez-vous besoin ?",
        }),
        answer: t({
          en: "A square mark, a name, one line of copy, and a link.",
          es: "Un logotipo cuadrado, un nombre, una línea de texto y un enlace.",
          fr: "Un logo carré, un nom, une ligne de texte et un lien.",
        }),
      },
      {
        question: t({
          en: "Can I stop?",
          es: "¿Puedo cancelar?",
          fr: "Puis-je arrêter ?",
        }),
        answer: t({
          en: "Whenever you want. Plans are monthly and you can cancel anytime. Billing runs through Dodo Payments, our merchant of record.",
          es: "Cuando quieras. Los planes son mensuales y puedes cancelar en cualquier momento. La facturación la gestiona Dodo Payments, nuestro comerciante registrado.",
          fr: "Quand vous voulez. Les formules sont mensuelles et résiliables à tout moment. La facturation passe par Dodo Payments, notre marchand officiel.",
        }),
      },
    ],
  },
} satisfies Dictionary;
