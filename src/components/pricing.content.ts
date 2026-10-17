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
      ko: "지금 구매:",
    }),
    oneTimePurchase: t({
      en: "One-time purchase",
      es: "Compra única",
      fr: "Achat unique",
      zh: "一次性购买",
      ko: "1회 구매",
    }),
    oneTime: t({
      en: "one-time",
      es: "pago único",
      fr: "paiement unique",
      zh: "一次性",
      ko: "1회 결제",
    }),
    launchOffer: t({
      en: "Launch offer",
      es: "Oferta de lanzamiento",
      fr: "Offre de lancement",
      zh: "首发优惠",
      ko: "출시 기념 할인",
    }),
    live: t({
      en: "LIVE",
      es: "ACTIVA",
      fr: "EN COURS",
      zh: "进行中",
      ko: "LIVE",
    }),
    left: t({
      en: "left",
      es: "restantes",
      fr: "restantes",
      zh: "剩余",
      ko: "남음",
    }),
    spotsRemaining: t({
      en: "spots remaining",
      es: "plazas restantes",
      fr: "places restantes",
      zh: "个名额",
      ko: "자리 남음",
    }),
    offerEnds: t({
      en: "The launch offer ends after the first 100 purchases. Then the price is $49.",
      es: "La oferta de lanzamiento termina después de las primeras 100 compras. Después, el precio será de 49 USD.",
      fr: "L’offre de lancement se termine après les 100 premiers achats. Le prix passe ensuite à 49 USD.",
      zh: "首发优惠在前 100 笔购买后结束，之后价格为 $49。",
      ko: "출시 기념 할인은 첫 100건 구매 후 종료됩니다. 이후 가격은 $49입니다.",
    }),
    perks: [
      t({
        en: "Skills for any coding agent and renderer",
        es: "Habilidades para cualquier agente de programación y renderizador",
        fr: "Compétences pour tout agent de programmation et moteur de rendu",
        zh: "适用于任意编程智能体和渲染器的技能",
        ko: "모든 코딩 에이전트와 렌더러용 스킬",
      }),
      t({
        en: "Storyboard skills, scene starters, and motion tokens",
        es: "Habilidades de guion gráfico, escenas iniciales y tokens de movimiento",
        fr: "Compétences de storyboard, scènes de départ et tokens d’animation",
        zh: "分镜技能、场景模板和动效 token",
        ko: "스토리보드 스킬, 장면 스타터, 모션 토큰",
      }),
      t({
        en: "Unlimited personal and client projects",
        es: "Proyectos personales y de clientes ilimitados",
        fr: "Projets personnels et clients illimités",
        zh: "个人和客户项目不限数量",
        ko: "개인 및 클라이언트 프로젝트 무제한",
      }),
      t({
        en: "Updates pushed to the same repository",
        es: "Actualizaciones publicadas en el mismo repositorio",
        fr: "Mises à jour publiées dans le même dépôt",
        zh: "更新推送到同一仓库",
        ko: "같은 저장소로 업데이트 제공",
      }),
    ],
  },
} satisfies Dictionary;

export default pricing;
