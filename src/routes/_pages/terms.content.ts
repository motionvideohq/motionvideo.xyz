import { t } from "intlayer";
import type { Dictionary } from "intlayer";

const termsContent = {
  key: "legal-terms",
  content: {
    heading0: t({
      en: "Terms of service",
      es: "Condiciones de servicio",
      fr: "Conditions d’utilisation",
    }),
    text1: t({
      en: "These terms govern your use of",
      es: "Estas condiciones rigen el uso de",
      fr: "Ces conditions régissent votre utilisation de",
    }),
    text2: t({ en: "and the", es: "y del", fr: "et du" }),
    text3: t({
      en: "pack and sponsorships sold on it, operated by",
      es: "paquete y los patrocinios vendidos en este sitio, operado por",
      fr: "pack et des parrainages vendus sur ce site, exploité par",
    }),
    text4: t({
      en: "(“we”, “us”, or “our”). By buying or using",
      es: "(«nosotros» o «nuestro»). Al comprar o utilizar",
      fr: "(« nous » ou « notre »). En achetant ou en utilisant",
    }),
    text5: t({
      en: "you agree to them. If you do not agree, do not buy.",
      es: "aceptas estas condiciones. Si no estás de acuerdo, no compres.",
      fr: ", vous les acceptez. Si vous n’êtes pas d’accord, n’achetez pas.",
    }),
    heading6: t({
      en: "1. What we sell",
      es: "1. Qué vendemos",
      fr: "1. Ce que nous vendons",
    }),
    text7: t({
      en: "is a digital good: a pack of agent skills, which are instruction files plus example code that teach a coding agent (Claude Code, Codex, Cursor, Antigravity, Copilot, and similar tools) to design and animate motion videos, such as showreels, intros, and launch films, from code and your own UI components. Videos are rendered on your computer with open-source programmatic renderers such as Remotion, HyperFrames, Editframe, or fframes.",
      es: "es un producto digital: un paquete de habilidades para agentes, compuesto por archivos de instrucciones y código de ejemplo que enseñan a un agente de programación (Claude Code, Codex, Cursor, Antigravity, Copilot y herramientas similares) a diseñar y animar vídeos, como reels, introducciones y vídeos de lanzamiento, a partir de código y tus propios componentes de interfaz. Los vídeos se renderizan en tu ordenador con renderizadores programáticos de código abierto como Remotion, HyperFrames, Editframe o fframes.",
      fr: "est un produit numérique : un pack de compétences pour agents, composé de fichiers d’instructions et d’exemples de code qui apprennent à un agent de programmation (Claude Code, Codex, Cursor, Antigravity, Copilot et outils similaires) à concevoir et animer des vidéos, telles que des bandes démo, des introductions et des films de lancement, à partir de code et de vos propres composants d’interface. Les vidéos sont rendues sur votre ordinateur avec des moteurs de rendu programmatiques open source tels que Remotion, HyperFrames, Editframe ou fframes.",
    }),
    text8: t({
      en: "It is a one-time purchase. There is no subscription and no physical shipment. We don’t run an AI model or a video generation service; all of the work happens in your tools, on your hardware.",
      es: "Es una compra única. No hay suscripción ni envío físico. No operamos un modelo de IA ni un servicio de generación de vídeos; todo el trabajo se realiza en tus herramientas y en tu equipo.",
      fr: "Il s’agit d’un achat unique. Il n’y a ni abonnement ni livraison physique. Nous n’exploitons ni modèle d’IA ni service de génération vidéo ; tout le travail se fait dans vos outils, sur votre matériel.",
    }),
    heading9: t({ en: "2. Buying", es: "2. Compra", fr: "2. Achat" }),
    text10: t({
      en: "Dodo Payments",
      es: "Dodo Payments",
      fr: "Dodo Payments",
    }),
    text11: t({
      en: "is the merchant of record. Dodo Payments runs the checkout, charges you, issues your invoice, collects and remits taxes, and processes refunds under",
      es: "es el comerciante registrado. Dodo Payments gestiona el pago, te cobra, emite tu factura, recauda y remite los impuestos y procesa los reembolsos conforme a",
      fr: "est le vendeur officiel. Dodo Payments gère le paiement, vous facture, émet votre facture, collecte et reverse les taxes et traite les remboursements selon",
    }),
    merchantTerms: t({
      en: "its terms of use",
      es: "sus condiciones de uso",
      fr: "ses conditions d’utilisation",
    }),
    text11b: t({
      en: ". The price is $29 for the first 100 paid purchases, then $49, paid once. Instant private GitHub access and future repository updates included. The price is shown before you check out, and taxes are added where they apply.",
      es: ". El precio es de $29 para las primeras 100 compras pagadas y después $49, en un solo pago. Incluye acceso instantáneo a GitHub privado y futuras actualizaciones del repositorio. El precio se muestra antes de pagar y se añaden los impuestos aplicables.",
      fr: ". Le prix est de 29 $ pour les 100 premiers achats payés, puis de 49 $, en un seul paiement. L’accès instantané au dépôt GitHub privé et les futures mises à jour du dépôt sont inclus. Le prix est affiché avant le paiement et les taxes applicables sont ajoutées.",
    }),
    heading12: t({
      en: "3. Delivery and access",
      es: "3. Entrega y acceso",
      fr: "3. Livraison et accès",
    }),
    text13: t({
      en: "The pack lives in a private GitHub repository. After checkout you open the Dodo Payments customer portal (linked in Dodo’s payment email, or from your dashboard after signing in with the email you paid with), connect your GitHub account, and Dodo Payments invites it to the repository with read-only access. You need a GitHub account to receive the files.",
      es: "El paquete está en un repositorio privado de GitHub. Tras pagar, abres el portal de clientes de Dodo Payments (enlazado en el correo de pago de Dodo o desde tu panel tras iniciar sesión con el correo que usaste al pagar), conectas tu cuenta de GitHub y Dodo Payments la invita al repositorio con acceso de solo lectura. Necesitas una cuenta de GitHub para recibir los archivos.",
      fr: "Le pack se trouve dans un dépôt GitHub privé. Après le paiement, vous ouvrez le portail client de Dodo Payments (lien dans l’e-mail de paiement de Dodo, ou depuis votre tableau de bord après connexion avec l’adresse utilisée pour payer), connectez votre compte GitHub, et Dodo Payments l’invite au dépôt avec un accès en lecture seule. Vous avez besoin d’un compte GitHub pour recevoir les fichiers.",
    }),
    text14: t({
      en: "There are no passwords. Checkout works as a guest, and to come back you request a sign-in link at the",
      es: "No hay contraseñas. Puedes pagar como invitado y, para volver, solicitas un enlace de acceso en la",
      fr: "Il n’y a pas de mot de passe. Vous pouvez payer en tant qu’invité et, pour revenir, demander un lien de connexion sur la",
    }),
    text15: t({
      en: "sign-in page",
      es: "página de inicio de sesión",
      fr: "page de connexion",
    }),
    text16: t({
      en: ". We only send links to addresses with a paid order, and each link works for 15 minutes. Right after payment, the welcome page sends the first one for you. Anyone who can read that inbox can open your purchase, so keep it secure.",
      es: ". Solo enviamos enlaces a direcciones con un pedido pagado, y cada enlace funciona durante 15 minutos. Justo después del pago, la página de bienvenida envía el primero por ti. Cualquiera que pueda leer esa bandeja de entrada puede acceder a tu compra, así que protégela.",
      fr: ". Nous envoyons des liens uniquement aux adresses associées à une commande payée, et chaque lien fonctionne pendant 15 minutes. Juste après le paiement, la page de bienvenue envoie le premier pour vous. Toute personne pouvant lire cette boîte de réception peut accéder à votre achat ; protégez-la.",
    }),
    text17: t({
      en: "Updates pushed to the same repository are included at no extra cost for as long as the repository is maintained.",
      es: "Las actualizaciones publicadas en el mismo repositorio están incluidas sin coste adicional mientras se mantenga el repositorio.",
      fr: "Les mises à jour publiées dans le même dépôt sont incluses sans coût supplémentaire tant que le dépôt est maintenu.",
    }),
    heading18: t({ en: "4. License", es: "4. Licencia", fr: "4. Licence" }),
    text19: t({
      en: "When you buy",
      es: "Cuando compras",
      fr: "Lorsque vous achetez",
    }),
    text20: t({
      en: ", we grant you a personal, non-exclusive, non-transferable license to use its files. The license is per person.",
      es: ", te concedemos una licencia personal, no exclusiva e intransferible para utilizar sus archivos. La licencia es por persona.",
      fr: ", nous vous accordons une licence personnelle, non exclusive et non transférable pour utiliser ses fichiers. La licence est individuelle.",
    }),
    text21: t({
      en: "You may use the skills in any project you work on, including client work, on any number of machines, and with any agent.",
      es: "Puedes utilizar las habilidades en cualquier proyecto en el que trabajes, incluidos trabajos para clientes, en cualquier número de equipos y con cualquier agente.",
      fr: "Vous pouvez utiliser les compétences dans tout projet auquel vous participez, y compris pour des clients, sur autant de machines que vous le souhaitez et avec tout agent.",
    }),
    text22: t({
      en: "You may not share, sell, publish, or otherwise redistribute the pack’s files, in whole or in part, for example in a public repository, template, or package, or make them available to people who have not bought it.",
      es: "No puedes compartir, vender, publicar ni redistribuir de otro modo los archivos del paquete, total o parcialmente, por ejemplo en un repositorio público, plantilla o paquete, ni ponerlos a disposición de personas que no lo hayan comprado.",
      fr: "Vous ne pouvez pas partager, vendre, publier ni redistribuer autrement les fichiers du pack, en tout ou en partie, par exemple dans un dépôt public, un modèle ou un paquet, ni les mettre à disposition de personnes qui ne l’ont pas acheté.",
    }),
    text23: t({
      en: "What you and your agent make with the pack (videos, code, and other output) is yours to keep, publish, and sell. We claim nothing in it.",
      es: "Lo que tú y tu agente creéis con el paquete (vídeos, código y otros resultados) te pertenece y puedes conservarlo, publicarlo y venderlo. No reclamamos ningún derecho sobre ello.",
      fr: "Ce que vous et votre agent créez avec le pack (vidéos, code et autres résultats) vous appartient ; vous pouvez le conserver, le publier et le vendre. Nous ne revendiquons aucun droit dessus.",
    }),
    text24: t({
      en: "We keep every right in the pack and its files not granted here.",
      es: "Conservamos todos los derechos sobre el paquete y sus archivos que no se conceden aquí.",
      fr: "Nous conservons tous les droits sur le pack et ses fichiers qui ne sont pas accordés ici.",
    }),
    heading25: t({
      en: "5. Refunds",
      es: "5. Reembolsos",
      fr: "5. Remboursements",
    }),
    text26: t({
      en: "Refunds follow our",
      es: "Los reembolsos se rigen por nuestra",
      fr: "Les remboursements suivent notre",
    }),
    text27: t({
      en: "refund policy",
      es: "política de reembolsos",
      fr: "politique de remboursement",
    }),
    text28: t({
      en: ". Where a refund applies, Dodo Payments returns the amount to the original payment method, and repository access, if already granted, ends when the refund is issued.",
      es: ". Cuando corresponde un reembolso, Dodo Payments devuelve el importe al método de pago original y el acceso al repositorio, si ya se ha concedido, termina al emitirse el reembolso.",
      fr: ". Lorsqu’un remboursement s’applique, Dodo Payments restitue le montant sur le moyen de paiement initial, et l’accès au dépôt, s’il a déjà été accordé, prend fin lors du remboursement.",
    }),
    heading29: t({
      en: "8. Acceptable use",
      es: "8. Uso aceptable",
      fr: "8. Utilisation acceptable",
    }),
    text30: t({
      en: "You agree not to:",
      es: "Aceptas no:",
      fr: "Vous vous engagez à ne pas :",
    }),
    text31: t({
      en: "Bypass or attempt to bypass the check that confirms a purchase.",
      es: "Eludir ni intentar eludir la comprobación que confirma una compra.",
      fr: "Contourner ou tenter de contourner la vérification confirmant un achat.",
    }),
    text32: t({
      en: "Share your sign-in links or repository access with others. A sign-in link opens your purchase for whoever holds it until it expires.",
      es: "Compartir tus enlaces de inicio de sesión o tu acceso al repositorio con otras personas. Un enlace de inicio de sesión permite acceder a tu compra a quien lo tenga hasta que caduque.",
      fr: "Partager vos liens de connexion ou votre accès au dépôt avec d’autres personnes. Un lien de connexion permet à quiconque le détient d’accéder à votre achat jusqu’à son expiration.",
    }),
    text33: t({
      en: "Scrape, overload, or otherwise interfere with",
      es: "Extraer datos automáticamente, sobrecargar o interferir de otro modo con",
      fr: "Extraire automatiquement des données, surcharger ou perturber de toute autre manière",
    }),
    text34: t({
      en: "Use the pack to make material that is unlawful or infringes the rights of others.",
      es: "Utilizar el paquete para crear material ilegal o que vulnere los derechos de terceros.",
      fr: "Utiliser le pack pour créer du contenu illégal ou portant atteinte aux droits d’autrui.",
    }),
    text35: t({
      en: "We may remove access from a purchase that is used in breach of these terms.",
      es: "Podemos retirar el acceso a una compra utilizada en incumplimiento de estas condiciones.",
      fr: "Nous pouvons retirer l’accès à un achat utilisé en violation de ces conditions.",
    }),
    heading36: t({
      en: "9. Changes to the pack",
      es: "9. Cambios en el paquete",
      fr: "9. Modifications du pack",
    }),
    text37: t({
      en: "We may update, reorganize, or retire parts of the pack over time, and we may stop selling it. A purchase made before sales stop keeps its access.",
      es: "Podemos actualizar, reorganizar o retirar partes del paquete con el tiempo, y podemos dejar de venderlo. Las compras realizadas antes de que cesen las ventas conservan su acceso.",
      fr: "Nous pouvons mettre à jour, réorganiser ou retirer des parties du pack au fil du temps et cesser de le vendre. Un achat effectué avant l’arrêt des ventes conserve son accès.",
    }),
    heading38: t({
      en: "10. Disclaimer and liability",
      es: "10. Exención de garantías y responsabilidad",
      fr: "10. Exclusion de garanties et responsabilité",
    }),
    text39: t({
      en: "is provided as is. Coding agents are not deterministic, so we do not promise a particular video or result from using the pack. The renderers the skills rely on are third-party projects with their own licenses; if your use needs a paid license from one of them (a Remotion company license, for instance), getting it is up to you.",
      es: "se proporciona tal cual. Los agentes de programación no son deterministas, por lo que no prometemos un vídeo o resultado concreto al utilizar el paquete. Los renderizadores en los que se basan las habilidades son proyectos de terceros con sus propias licencias; si tu uso requiere una licencia de pago de alguno de ellos (por ejemplo, una licencia empresarial de Remotion), obtenerla es tu responsabilidad.",
      fr: "est fourni en l’état. Les agents de programmation ne sont pas déterministes ; nous ne promettons donc aucune vidéo ni aucun résultat particulier lors de l’utilisation du pack. Les moteurs de rendu sur lesquels reposent les compétences sont des projets tiers avec leurs propres licences ; si votre utilisation nécessite une licence payante de l’un d’entre eux (une licence d’entreprise Remotion, par exemple), il vous appartient de l’obtenir.",
    }),
    text40: t({
      en: "To the extent the law allows, our liability for any claim connected to",
      es: "En la medida permitida por la ley, nuestra responsabilidad por cualquier reclamación relacionada con",
      fr: "Dans la mesure permise par la loi, notre responsabilité pour toute réclamation liée à",
    }),
    text41: t({
      en: "is limited to the amount you paid for it. Nothing in these terms limits rights you have as a consumer that cannot be waived.",
      es: "se limita al importe que pagaste por él. Nada de estas condiciones limita los derechos irrenunciables que te corresponden como consumidor.",
      fr: "est limitée au montant que vous avez payé. Aucune disposition de ces conditions ne limite vos droits de consommateur auxquels il ne peut être renoncé.",
    }),
    heading42: t({
      en: "11. Governing law",
      es: "11. Legislación aplicable",
      fr: "11. Droit applicable",
    }),
    text43: t({
      en: "These terms are governed by the laws of",
      es: "Estas condiciones se rigen por las leyes de",
      fr: "Ces conditions sont régies par les lois de",
    }),
    text44: t({
      en: ". Before any formal legal action, you agree to contact us and try to resolve the matter informally for at least 30 days.",
      es: ". Antes de emprender acciones legales formales, aceptas contactarnos e intentar resolver el asunto de manera informal durante al menos 30 días.",
      fr: ". Avant toute action judiciaire formelle, vous acceptez de nous contacter et d’essayer de résoudre le différend à l’amiable pendant au moins 30 jours.",
    }),
    heading45: t({
      en: "12. Changes to these terms",
      es: "12. Cambios en estas condiciones",
      fr: "12. Modifications de ces conditions",
    }),
    text46: t({
      en: "We may change these terms. The date at the top says when they last changed. Changes apply to purchases made and sponsorship months starting after that date.",
      es: "Podemos cambiar estas condiciones. La fecha de la parte superior indica su última modificación. Los cambios se aplican a las compras realizadas y a los meses de patrocinio que empiecen después de esa fecha.",
      fr: "Nous pouvons modifier ces conditions. La date en haut indique leur dernière modification. Les changements s’appliquent aux achats effectués et aux mois de parrainage commençant après cette date.",
    }),
    sponsorHeading: t({
      en: "6. Sponsorships",
      es: "6. Patrocinios",
      fr: "6. Parrainages",
    }),
    sponsorText1: t({
      en: "Sponsors get a labelled placement on the site through a monthly subscription: Diamond at $500, Gold at $250, or Silver at $150 per month, plus taxes where they apply. Dodo Payments bills it as merchant of record, and it renews each month until you cancel.",
      es: "Los patrocinadores obtienen un espacio identificado en el sitio mediante una suscripción mensual: Diamond por $500, Gold por $250 o Silver por $150 al mes, más los impuestos aplicables. Dodo Payments la cobra como comerciante registrado y se renueva cada mes hasta que la canceles.",
      fr: "Les sponsors obtiennent un emplacement identifié sur le site grâce à un abonnement mensuel : Diamond à 500 $, Gold à 250 $ ou Silver à 150 $ par mois, taxes applicables en sus. Dodo Payments le facture en tant que vendeur officiel, et il se renouvelle chaque mois jusqu’à votre résiliation.",
    }),
    sponsorText2: t({
      en: "You can cancel anytime from the Dodo Payments customer portal, linked in your billing emails, or by writing to us. Your placement stays up until the end of the month you paid for, and you are not charged again. A month that has started is not refunded unless the law requires it.",
      es: "Puedes cancelar en cualquier momento desde el portal de clientes de Dodo Payments, enlazado en tus correos de facturación, o escribiéndonos. Tu espacio se mantiene hasta el final del mes pagado y no se te vuelve a cobrar. Un mes ya iniciado no se reembolsa salvo que la ley lo exija.",
      fr: "Vous pouvez résilier à tout moment depuis le portail client de Dodo Payments, accessible via vos e-mails de facturation, ou en nous écrivant. Votre emplacement reste en ligne jusqu’à la fin du mois payé et vous n’êtes plus facturé. Un mois commencé n’est pas remboursé, sauf si la loi l’exige.",
    }),
    sponsorText3: t({
      en: 'Sponsored placements are labelled as sponsored, and their links carry rel="sponsored". Sponsoring never buys inclusion or ranking in the catalogue. We may decline or remove a sponsor whose content is unlawful, misleading, or unrelated to the site; if we remove one, we stop future billing.',
      es: 'Los espacios patrocinados se identifican como patrocinados y sus enlaces llevan rel="sponsored". Patrocinar nunca compra la inclusión ni la posición en el catálogo. Podemos rechazar o retirar a un patrocinador cuyo contenido sea ilegal, engañoso o ajeno al sitio; si lo retiramos, dejamos de cobrar los meses siguientes.',
      fr: 'Les emplacements sponsorisés sont identifiés comme tels et leurs liens portent rel="sponsored". Un parrainage n’achète jamais l’inclusion ni le classement dans le catalogue. Nous pouvons refuser ou retirer un sponsor dont le contenu est illégal, trompeur ou sans rapport avec le site ; dans ce cas, nous arrêtons la facturation future.',
    }),
    worksHeading: t({
      en: "7. Featured work and credits",
      es: "7. Trabajos destacados y créditos",
      fr: "7. Œuvres présentées et crédits",
    }),
    worksText1: t({
      en: "The gallery and the Tools and Creatives directories show work made by others. Each piece is credited and linked to its creator, who keeps every right in it. We mirror the media (videos, posters, avatars, and covers) to our Cloudflare R2 storage and serve it from",
      es: "La galería y los directorios de herramientas y creativos muestran trabajos de otras personas. Cada pieza se atribuye y enlaza a su creador, que conserva todos sus derechos. Copiamos los archivos multimedia (vídeos, carteles, avatares y portadas) en nuestro almacenamiento Cloudflare R2 y los servimos desde",
      fr: "La galerie et les annuaires d’outils et de créatifs présentent des travaux réalisés par d’autres. Chaque œuvre est créditée et liée à son créateur, qui en conserve tous les droits. Nous copions les médias (vidéos, affiches, avatars et couvertures) sur notre stockage Cloudflare R2 et les diffusons depuis",
    }),
    worksText2: t({
      en: "If you made something shown here and want it credited differently or taken down, write to us through the",
      es: "Si has creado algo que aparece aquí y quieres cambiar el crédito o que lo retiremos, escríbenos a través de la",
      fr: "Si vous avez créé une œuvre présentée ici et souhaitez modifier son crédit ou la faire retirer, écrivez-nous via la",
    }),
    worksContact: t({
      en: "contact page",
      es: "página de contacto",
      fr: "page de contact",
    }),
    worksText3: t({ en: "or at", es: "o a", fr: "ou à" }),
    heading47: t({ en: "13. Contact", es: "13. Contacto", fr: "13. Contact" }),
  },
} satisfies Dictionary;

export default termsContent;
