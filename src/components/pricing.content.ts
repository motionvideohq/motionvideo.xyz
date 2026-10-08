import { t } from 'intlayer';
import type { Dictionary } from 'intlayer';

const pricing = {
  key: "pricing",
  content: {
    buyNow: t({ en: "Buy now for", es: "Comprar ahora por", fr: "Acheter maintenant pour" }),
    oneTimePurchase: t({ en: "One-time purchase", es: "Compra única", fr: "Achat unique" }),
    oneTime: t({ en: "one-time", es: "pago único", fr: "paiement unique" }),
    launchOffer: t({ en: "Launch offer", es: "Oferta de lanzamiento", fr: "Offre de lancement" }),
    live: t({ en: "LIVE", es: "ACTIVA", fr: "EN COURS" }),
    left: t({ en: "left", es: "restantes", fr: "restantes" }),
    spotsRemaining: t({ en: "spots remaining", es: "plazas restantes", fr: "places restantes" }),
    offerEnds: t({ en: "The launch offer ends after the first 100 purchases. Then the price is $49.", es: "La oferta de lanzamiento termina después de las primeras 100 compras. Después, el precio será de 49 USD.", fr: "L’offre de lancement se termine après les 100 premiers achats. Le prix passe ensuite à 49 USD." }),
    perks: [
      t({ en: "Skills for any coding agent and renderer", es: "Habilidades para cualquier agente de programación y renderizador", fr: "Compétences pour tout agent de programmation et moteur de rendu" }),
      t({ en: "Storyboard skills, scene starters, and motion tokens", es: "Habilidades de guion gráfico, escenas iniciales y tokens de movimiento", fr: "Compétences de storyboard, scènes de départ et tokens d’animation" }),
      t({ en: "Unlimited personal and client projects", es: "Proyectos personales y de clientes ilimitados", fr: "Projets personnels et clients illimités" }),
      t({ en: "Updates pushed to the same repository", es: "Actualizaciones publicadas en el mismo repositorio", fr: "Mises à jour publiées dans le même dépôt" }),
    ],
  },
} satisfies Dictionary;

export default pricing;
