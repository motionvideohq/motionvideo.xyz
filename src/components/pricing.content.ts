import { t } from "intlayer";
import type { Dictionary } from "intlayer";

const pricing = {
  key: "pricing",
  content: {
    buyNow: t({
      en: "Buy now for",
      es: "Comprar ahora por",
      fr: "Acheter maintenant pour",
      zh: "立即购买，仅需",
    }),
    oneTimePurchase: t({
      en: "One-time purchase",
      es: "Compra única",
      fr: "Achat unique",
      zh: "一次性购买",
    }),
    oneTime: t({
      en: "one-time",
      es: "pago único",
      fr: "paiement unique",
      zh: "一次性",
    }),
    launchOffer: t({
      en: "Launch offer",
      es: "Oferta de lanzamiento",
      fr: "Offre de lancement",
      zh: "首发优惠",
    }),
    live: t({ en: "LIVE", es: "ACTIVA", fr: "EN COURS", zh: "进行中" }),
    left: t({ en: "left", es: "restantes", fr: "restantes", zh: "剩余" }),
    spotsRemaining: t({
      en: "spots remaining",
      es: "plazas restantes",
      fr: "places restantes",
      zh: "个名额",
    }),
    offerEnds: t({
      en: "The launch offer ends after the first 100 purchases. Then the price is $49.",
      es: "La oferta de lanzamiento termina después de las primeras 100 compras. Después, el precio será de 49 USD.",
      fr: "L’offre de lancement se termine après les 100 premiers achats. Le prix passe ensuite à 49 USD.",
      zh: "首发优惠在前 100 笔购买后结束，之后价格为 $49。",
    }),
    perks: [
      t({
        en: "Skills for any coding agent and renderer",
        es: "Habilidades para cualquier agente de programación y renderizador",
        fr: "Compétences pour tout agent de programmation et moteur de rendu",
        zh: "适用于任意编程智能体和渲染器的技能",
      }),
      t({
        en: "Storyboard skills, scene starters, and motion tokens",
        es: "Habilidades de guion gráfico, escenas iniciales y tokens de movimiento",
        fr: "Compétences de storyboard, scènes de départ et tokens d’animation",
        zh: "分镜技能、场景模板和动效 token",
      }),
      t({
        en: "Unlimited personal and client projects",
        es: "Proyectos personales y de clientes ilimitados",
        fr: "Projets personnels et clients illimités",
        zh: "个人和客户项目不限数量",
      }),
      t({
        en: "Updates pushed to the same repository",
        es: "Actualizaciones publicadas en el mismo repositorio",
        fr: "Mises à jour publiées dans le même dépôt",
        zh: "更新推送到同一仓库",
      }),
    ],
  },
} satisfies Dictionary;

export default pricing;
