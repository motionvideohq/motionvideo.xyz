import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "sponsor",
  content: {
    seePlans: t({
      en: "See plans",
      es: "Ver planes",
      fr: "Voir les formules",
      zh: "查看方案",
    }),
    limited: t({
      en: "Limited availability",
      es: "Disponibilidad limitada",
      fr: "Places limitées",
      zh: "名额有限",
    }),
    pitch: t({
      en: "Reach the people who make product films and motion design with AI and code.",
      es: "Llega a quienes crean vídeos de producto y motion design con IA y código.",
      fr: "Touchez celles et ceux qui créent des films produit et du motion design avec l’IA et le code.",
      zh: "触达用 AI 和代码制作产品影片与动效设计的人。",
    }),
    note: t({
      en: "MotionVideo stays free and independent through a few labelled placements. Pick a plan below to book one.",
      es: "MotionVideo sigue siendo gratuito e independiente gracias a unos pocos espacios patrocinados y señalizados. Elige un plan para reservar uno.",
      fr: "MotionVideo reste gratuit et indépendant grâce à quelques emplacements sponsorisés et signalés. Choisissez une formule ci-dessous pour en réserver un.",
      zh: "MotionVideo 依靠少量带标注的展示位保持免费和独立。在下方选择一个方案即可预订。",
    }),
    soldOut: t({ en: "Sold out", es: "Agotado", fr: "Complet", zh: "已售罄" }),
    sponsors: t({
      en: "Sponsors",
      es: "Patrocinadores",
      fr: "Sponsors",
      zh: "赞助商",
    }),
    founding: t({
      en: "Founding",
      es: "Fundadores",
      fr: "Fondateurs",
      zh: "创始赞助",
    }),
    takeSlot: t({
      en: "Take this slot",
      es: "Ocupa este espacio",
      fr: "Prendre cette place",
      zh: "占用此位置",
    }),
    sponsorsSeats: t({
      en: "All seats are taken",
      es: "Todos los espacios están ocupados",
      fr: "Toutes les places sont prises",
      zh: "所有名额已满",
    }),
    plans: t({ en: "Plans", es: "Planes", fr: "Formules", zh: "方案" }),
    perMonth: t({ en: "/ month", es: "/ mes", fr: "/ mois", zh: "/ 月" }),
    tiers: {
      diamond: {
        name: t({ en: "Diamond", es: "Diamante", fr: "Diamant", zh: "钻石" }),
        firstSponsor: t({
          en: "Be the first Diamond sponsor",
          es: "Sé el primer patrocinador Diamante",
          fr: "Devenez le premier sponsor Diamant",
          zh: "成为首位钻石赞助商",
        }),
        join: t({
          en: "Become a Diamond sponsor",
          es: "Hazte patrocinador Diamante",
          fr: "Devenez sponsor Diamant",
          zh: "成为钻石赞助商",
        }),
        choose: t({
          en: "Choose Diamond",
          es: "Elegir Diamante",
          fr: "Choisir Diamant",
          zh: "选择钻石",
        }),
        perks: [
          t({
            en: "Your logo on the sponsors page",
            es: "Tu logotipo en la página de patrocinadores",
            fr: "Votre logo sur la page des sponsors",
            zh: "你的 Logo 展示在赞助商页面",
          }),
          t({
            en: "The sponsored card on every page, shown first",
            es: "La tarjeta patrocinada en cada página, en primer lugar",
            fr: "La carte sponsorisée sur chaque page, en premier",
            zh: "每个页面都展示赞助卡片，且排在最前",
          }),
          t({
            en: "Your logo in the sponsor slots on every page",
            es: "Tu logotipo en los espacios de patrocinio de cada página",
            fr: "Votre logo dans les emplacements sponsors de chaque page",
            zh: "你的 Logo 出现在每个页面的赞助位",
          }),
          t({
            en: "A shoutout on X",
            es: "Una mención en X",
            fr: "Une mention sur X",
            zh: "在 X 上推荐一次",
          }),
        ],
      },
      gold: {
        name: t({ en: "Gold", es: "Oro", fr: "Or", zh: "黄金" }),
        firstSponsor: t({
          en: "Be the first Gold sponsor",
          es: "Sé el primer patrocinador Oro",
          fr: "Devenez le premier sponsor Or",
          zh: "成为首位黄金赞助商",
        }),
        join: t({
          en: "Become a Gold sponsor",
          es: "Hazte patrocinador Oro",
          fr: "Devenez sponsor Or",
          zh: "成为黄金赞助商",
        }),
        choose: t({
          en: "Choose Gold",
          es: "Elegir Oro",
          fr: "Choisir Or",
          zh: "选择黄金",
        }),
        perks: [
          t({
            en: "Your logo on the sponsors page",
            es: "Tu logotipo en la página de patrocinadores",
            fr: "Votre logo sur la page des sponsors",
            zh: "你的 Logo 展示在赞助商页面",
          }),
          t({
            en: "The sponsored card on your category’s page, after Diamond",
            es: "La tarjeta patrocinada en la página de tu categoría, tras Diamante",
            fr: "La carte sponsorisée sur la page de votre catégorie, après Diamant",
            zh: "在你所选分类页面展示赞助卡片，排在钻石之后",
          }),
          t({
            en: "Your logo in that page’s sponsor slots",
            es: "Tu logotipo en los espacios de patrocinio de esa página",
            fr: "Votre logo dans les emplacements sponsors de cette page",
            zh: "你的 Logo 出现在该页面的赞助位",
          }),
          t({
            en: "A shoutout on X",
            es: "Una mención en X",
            fr: "Une mention sur X",
            zh: "在 X 上推荐一次",
          }),
        ],
      },
      silver: {
        name: t({ en: "Silver", es: "Plata", fr: "Argent", zh: "白银" }),
        firstSponsor: t({
          en: "Be the first Silver sponsor",
          es: "Sé el primer patrocinador Plata",
          fr: "Devenez le premier sponsor Argent",
          zh: "成为首位白银赞助商",
        }),
        join: t({
          en: "Become a Silver sponsor",
          es: "Hazte patrocinador Plata",
          fr: "Devenez sponsor Argent",
          zh: "成为白银赞助商",
        }),
        choose: t({
          en: "Choose Silver",
          es: "Elegir Plata",
          fr: "Choisir Argent",
          zh: "选择白银",
        }),
        perks: [
          t({
            en: "Your logo on the sponsors page",
            es: "Tu logotipo en la página de patrocinadores",
            fr: "Votre logo sur la page des sponsors",
            zh: "你的 Logo 展示在赞助商页面",
          }),
          t({
            en: "The sponsored card on your category’s page, after Diamond and Gold",
            es: "La tarjeta patrocinada en la página de tu categoría, tras Diamante y Oro",
            fr: "La carte sponsorisée sur la page de votre catégorie, après Diamant et Or",
            zh: "在你所选分类页面展示赞助卡片，排在钻石和黄金之后",
          }),
        ],
      },
    },
    mostImpact: t({
      en: "Most impact",
      es: "Más impacto",
      fr: "Le plus d’impact",
      zh: "曝光最大",
    }),
    customTitle: t({
      en: "Questions, or need a custom package?",
      es: "¿Preguntas o necesitas un paquete a medida?",
      fr: "Des questions, ou besoin d’une offre sur mesure ?",
      zh: "有疑问，或需要定制方案？",
    }),
    customBody: t({
      en: "Happy to put something together that fits what you have in mind. Reach out directly.",
      es: "Con gusto preparo algo que encaje con lo que tienes en mente. Escríbeme directamente.",
      fr: "Je peux préparer quelque chose qui correspond à ce que vous avez en tête. Écrivez-moi directement.",
      zh: "很乐意为你量身定制合适的方案。欢迎直接联系。",
    }),
    email: t({
      en: "Email me",
      es: "Escríbeme",
      fr: "M’écrire",
      zh: "给我发邮件",
    }),
    dmX: t({ en: "DM on X", es: "MD en X", fr: "MP sur X", zh: "在 X 上私信" }),
    faq: t({
      en: "Frequently asked questions",
      es: "Preguntas frecuentes",
      fr: "Questions fréquentes",
      zh: "常见问题",
    }),
    faqs: [
      {
        question: t({
          en: "Does sponsoring get my work into the catalogue?",
          es: "¿Patrocinar hace que mi trabajo entre en el catálogo?",
          fr: "Sponsoriser fait-il entrer mon travail dans le catalogue ?",
          zh: "赞助能让我的作品被收录吗？",
        }),
        answer: t({
          en: "No. Videos, tools, and creatives are picked on merit and none was paid for. Sponsoring buys the placements above, nothing else.",
          es: "No. Los vídeos, herramientas y creativos se eligen por mérito y ninguno se ha pagado. Patrocinar compra los espacios de arriba, nada más.",
          fr: "Non. Les vidéos, outils et créatifs sont choisis au mérite et aucun n’a été payé. Sponsoriser achète les emplacements ci-dessus, rien de plus.",
          zh: "不能。视频、工具和创意团队均按质量挑选，没有任何一个是付费收录的。赞助只购买上述展示位，别无其他。",
        }),
      },
      {
        question: t({
          en: "Is it labelled as sponsored?",
          es: "¿Se indica que es patrocinado?",
          fr: "Est-ce signalé comme sponsorisé ?",
          zh: "会标注为赞助吗？",
        }),
        answer: t({
          en: 'Yes, on the page and as rel="sponsored" in the markup.',
          es: 'Sí, en la página y como rel="sponsored" en el código.',
          fr: 'Oui, sur la page et via rel="sponsored" dans le code.',
          zh: '会，页面上有标注，标记中也带有 rel="sponsored"。',
        }),
      },
      {
        question: t({
          en: "What do you need from me?",
          es: "¿Qué necesitas de mí?",
          fr: "De quoi avez-vous besoin ?",
          zh: "需要我提供什么？",
        }),
        answer: t({
          en: "A square mark, a name, a link, one line of copy, a cover image, and a category for Gold and Silver. You add them before checkout and can change them anytime on your Sponsorships page; the placement goes live once we have reviewed it.",
          es: "Un logotipo cuadrado, un nombre, un enlace, una línea de texto, una imagen de portada y una categoría para Oro y Plata. Los añades antes de pagar y puedes cambiarlos cuando quieras en tu página de Patrocinios; el espacio se publica cuando lo hayamos revisado.",
          fr: "Un logo carré, un nom, un lien, une ligne de texte, une image de couverture, et une catégorie pour Or et Argent. Vous les ajoutez avant le paiement et pouvez les modifier à tout moment sur votre page Parrainages ; l’emplacement est publié dès que nous l’avons validé.",
          zh: "一个方形标志、名称、链接、一句文案、一张封面图，黄金和白银还需选择分类。你在结账前添加，之后可随时在“赞助合作”页面修改；展示位经我们审核后上线。",
        }),
      },
      {
        question: t({
          en: "Can I stop?",
          es: "¿Puedo cancelar?",
          fr: "Puis-je arrêter ?",
          zh: "可以停止吗？",
        }),
        answer: t({
          en: "Whenever you want. Monthly plans cancel anytime, and a one-off run simply ends after its 30 days. Billing runs through Dodo Payments, our merchant of record.",
          es: "Cuando quieras. Los planes mensuales se cancelan en cualquier momento y una campaña única termina sola a los 30 días. La facturación la gestiona Dodo Payments, nuestro comerciante registrado.",
          fr: "Quand vous voulez. Les formules mensuelles sont résiliables à tout moment, et une diffusion ponctuelle s’arrête d’elle-même après 30 jours. La facturation passe par Dodo Payments, notre marchand officiel.",
          zh: "随时都可以。月度方案可随时取消，一次性单期在 30 天后自动结束。账单由我们的记录商户 Dodo Payments 处理。",
        }),
      },
    ],
  },
} satisfies Dictionary;
