import { t } from "intlayer";
import type { Dictionary } from "intlayer";

const refundsContent = {
  key: "legal-refunds",
  content: {
    heading0: t({
      en: "Refund policy",
      es: "Política de reembolsos",
      fr: "Politique de remboursement",
      zh: "退款政策",
    }),
    text1: t({
      en: "This policy covers one-time purchases of",
      es: "Esta política cubre las compras únicas de",
      fr: "Cette politique couvre les achats uniques de",
      zh: "本政策适用于一次性购买的",
    }),
    text2: t({
      en: ", sold by",
      es: ", vendido por",
      fr: ", vendu par",
      zh: "（由",
    }),
    text3: t({
      en: ", and sponsorships. Dodo Payments, our merchant of record, processes every payment and refund. It sits alongside our",
      es: ", y los patrocinios. Dodo Payments, nuestro comerciante registrado, procesa todos los pagos y reembolsos. Complementa nuestras",
      fr: ", ainsi que les parrainages. Dodo Payments, notre vendeur officiel, traite tous les paiements et remboursements. Elle complète nos",
      zh: "销售）以及赞助。我们的记录商户 Dodo Payments 处理所有付款和退款。本政策与我们的",
    }),
    text4: t({
      en: "terms of service",
      es: "condiciones de servicio",
      fr: "conditions d’utilisation",
      zh: "服务条款",
    }),
    heading5: t({
      en: "1. What you are buying",
      es: "1. Qué compras",
      fr: "1. Ce que vous achetez",
      zh: "1. 你购买的是什么",
    }),
    text6: t({
      en: "is a digital pack delivered as read-only access to a private GitHub repository. There is no physical shipment and no subscription. The price is $29 for the first 100 paid purchases, then $49, paid once. Instant private GitHub access and future repository updates included. After checkout you claim repository access by connecting your GitHub account in the Dodo Payments customer portal. Access includes future updates to the same repository at no extra cost.",
      es: "es un paquete digital entregado mediante acceso de solo lectura a un repositorio privado de GitHub. No hay envío físico ni suscripción. El precio es de $29 para las primeras 100 compras pagadas y después $49, en un solo pago. Incluye acceso instantáneo a GitHub privado y futuras actualizaciones del repositorio. Tras pagar, solicitas acceso al repositorio conectando tu cuenta de GitHub en el portal de clientes de Dodo Payments. El acceso incluye futuras actualizaciones del mismo repositorio sin coste adicional.",
      fr: "est un pack numérique livré sous forme d’accès en lecture seule à un dépôt GitHub privé. Il n’y a ni livraison physique ni abonnement. Le prix est de 29 $ pour les 100 premiers achats payés, puis de 49 $, en un seul paiement. L’accès instantané au dépôt GitHub privé et les futures mises à jour du dépôt sont inclus. Après le paiement, vous demandez l’accès au dépôt en connectant votre compte GitHub dans le portail client de Dodo Payments. L’accès comprend les futures mises à jour du même dépôt sans coût supplémentaire.",
      zh: "是一套数字内容包，以私有 GitHub 仓库只读访问权限的形式交付。没有实物发货，也没有订阅。前 100 笔付费购买价格为 $29，之后为 $49，一次性付款。包含即时私有 GitHub 访问权限和仓库的后续更新。结账后，你需在 Dodo Payments 客户门户中关联 GitHub 账号来领取仓库访问权限。访问权限包含同一仓库的后续更新，无需额外付费。",
    }),
    heading7: t({
      en: "2. Before delivery",
      es: "2. Antes de la entrega",
      fr: "2. Avant la livraison",
      zh: "2. 交付之前",
    }),
    text8: t({
      en: "Until you have claimed repository access, you can cancel your order for a full refund. Write to",
      es: "Hasta que hayas solicitado acceso al repositorio, puedes cancelar tu pedido y obtener un reembolso completo. Escribe a",
      fr: "Tant que vous n’avez pas demandé l’accès au dépôt, vous pouvez annuler votre commande pour obtenir un remboursement intégral. Écrivez à",
      zh: "在你领取仓库访问权限之前，你可以取消订单并获得全额退款。请写信至",
    }),
    text9: t({
      en: "; you do not need to give a reason.",
      es: "; no necesitas dar ningún motivo.",
      fr: "; vous n’avez pas à donner de motif.",
      zh: "；无需说明理由。",
    }),
    heading10: t({
      en: "3. Right of withdrawal for consumers in the EU and UK",
      es: "3. Derecho de desistimiento para consumidores de la UE y el Reino Unido",
      fr: "3. Droit de rétractation pour les consommateurs de l’UE et du Royaume-Uni",
      zh: "3. 欧盟和英国消费者的撤回权",
    }),
    text11: t({
      en: "Consumers normally have 14 days to withdraw from a purchase of digital content. Because the pack is digital content, that right ends once delivery starts.",
      es: "Los consumidores normalmente tienen 14 días para desistir de una compra de contenido digital. Como el paquete es contenido digital, ese derecho termina cuando comienza la entrega.",
      fr: "Les consommateurs disposent normalement de 14 jours pour se rétracter après un achat de contenu numérique. Le pack étant un contenu numérique, ce droit prend fin dès le début de la livraison.",
      zh: "消费者购买数字内容通常享有 14 天的撤回期。由于本技能包属于数字内容，该权利在交付开始后即终止。",
    }),
    text12: t({
      en: "By claiming repository access, you ask us to begin delivery and acknowledge that you lose the right of withdrawal once access has been granted to you. If you would prefer to keep the 14-day period, do not claim access and write to us instead.",
      es: "Al solicitar acceso al repositorio, nos pides que iniciemos la entrega y reconoces que pierdes el derecho de desistimiento una vez que se te haya concedido acceso. Si prefieres conservar el plazo de 14 días, no solicites acceso y escríbenos en su lugar.",
      fr: "En demandant l’accès au dépôt, vous nous demandez de commencer la livraison et reconnaissez perdre votre droit de rétractation une fois l’accès accordé. Si vous préférez conserver le délai de 14 jours, ne demandez pas l’accès et écrivez-nous à la place.",
      zh: "领取仓库访问权限即表示你要求我们开始交付，并确认一旦获得访问权限即丧失撤回权。如果你希望保留 14 天撤回期，请不要领取访问权限，而是写信给我们。",
    }),
    heading13: t({
      en: "4. Refunds we do give after delivery",
      es: "4. Reembolsos que sí concedemos después de la entrega",
      fr: "4. Remboursements accordés après la livraison",
      zh: "4. 交付后我们仍会退款的情形",
    }),
    text14: t({
      en: "You were charged twice, or charged for something you did not buy.",
      es: "Se te ha cobrado dos veces o por algo que no compraste.",
      fr: "Vous avez été facturé deux fois ou pour quelque chose que vous n’avez pas acheté.",
      zh: "你被重复扣款，或因未购买的商品被扣款。",
    }),
    text15: t({
      en: "Repository access never reached you, and we could not fix it for you.",
      es: "Nunca recibiste acceso al repositorio y no pudimos solucionarlo.",
      fr: "Vous n’avez jamais reçu l’accès au dépôt et nous n’avons pas pu résoudre le problème.",
      zh: "你始终未获得仓库访问权限，且我们无法为你解决。",
    }),
    text16: t({
      en: "The pack does not do what this site says it does, and we cannot resolve it with you.",
      es: "El paquete no hace lo que este sitio afirma y no podemos resolverlo contigo.",
      fr: "Le pack ne fait pas ce que ce site annonce et nous ne pouvons pas résoudre le problème avec vous.",
      zh: "技能包未能实现本网站所述的功能，且我们无法与你协商解决。",
    }),
    text17: t({
      en: "Where a refund applies, Dodo Payments, as merchant of record, returns the full amount to the original payment method. Repository access, if already granted, ends when the refund is issued. This does not limit any rights you have under the law where you live.",
      es: "Cuando corresponde un reembolso, Dodo Payments, como comerciante registrado, devuelve el importe completo al método de pago original. El acceso al repositorio, si ya se ha concedido, termina al emitirse el reembolso. Esto no limita ningún derecho que te corresponda conforme a la legislación del lugar donde vives.",
      fr: "Lorsqu’un remboursement s’applique, Dodo Payments, en tant que vendeur officiel, restitue l’intégralité du montant sur le moyen de paiement initial. L’accès au dépôt, s’il a déjà été accordé, prend fin lors du remboursement. Cela ne limite aucun droit prévu par la législation de votre lieu de résidence.",
      zh: "符合退款条件时，Dodo Payments 作为记录商户会将全款退回原付款方式。如已授予仓库访问权限，退款发放时访问权限即终止。这不限制你依据居住地法律享有的任何权利。",
    }),
    heading18: t({
      en: "5. How to ask",
      es: "5. Cómo solicitarlo",
      fr: "5. Comment faire une demande",
      zh: "5. 如何申请",
    }),
    text19: t({
      en: "Write to",
      es: "Escribe a",
      fr: "Écrivez à",
      zh: "请用结账时使用的邮箱地址写信至",
    }),
    text20: t({
      en: "from the email address you used at checkout and tell us what went wrong. We answer every request, usually within two working days.",
      es: "desde la dirección de correo que usaste al pagar y cuéntanos qué ocurrió. Respondemos a todas las solicitudes, normalmente en dos días laborables.",
      fr: "depuis l’adresse utilisée lors du paiement et expliquez ce qui s’est passé. Nous répondons à chaque demande, généralement sous deux jours ouvrés.",
      zh: "，并告诉我们出了什么问题。我们会回复每一个请求，通常在两个工作日内。",
    }),
    heading21: t({
      en: "6. Chargebacks",
      es: "6. Contracargos",
      fr: "6. Contestations de paiement",
      zh: "6. 拒付",
    }),
    text22: t({
      en: "If something is wrong, contact us first. A chargeback opened without contacting us suspends access to the pack while the bank reviews it, which is slower for everyone than a refund we issue directly.",
      es: "Si hay algún problema, contáctanos primero. Un contracargo iniciado sin contactarnos suspende el acceso al paquete mientras el banco lo revisa, lo cual es más lento para todos que un reembolso emitido directamente por nosotros.",
      fr: "En cas de problème, contactez-nous d’abord. Une contestation de paiement ouverte sans nous contacter suspend l’accès au pack pendant l’examen par la banque, ce qui est plus lent pour tout le monde qu’un remboursement que nous effectuons directement.",
      zh: "如有问题，请先联系我们。未联系我们就发起的拒付会在银行审核期间暂停你对技能包的访问，这对所有人来说都比我们直接退款更慢。",
    }),
    sponsorHeading: t({
      en: "7. Sponsorships",
      es: "7. Patrocinios",
      fr: "7. Parrainages",
      zh: "7. 赞助",
    }),
    sponsorText1: t({
      en: "Sponsorships cost Diamond $250, Gold $150, or Silver $100, either per month as a subscription or once for a single 30-day run. You can cancel a subscription anytime from the Dodo Payments customer portal, linked in your billing emails, or by writing to us. Your placement stays up until the end of the month you paid for, and you are not charged again. A 30-day run never renews and ends on its own.",
      es: "Los patrocinios cuestan Diamond $250, Gold $150 o Silver $100, al mes como suscripción o una sola vez por una campaña de 30 días. Puedes cancelar una suscripción en cualquier momento desde el portal de clientes de Dodo Payments, enlazado en tus correos de facturación, o escribiéndonos. Tu espacio se mantiene hasta el final del mes pagado y no se te vuelve a cobrar. Una campaña de 30 días nunca se renueva y termina sola.",
      fr: "Les parrainages coûtent Diamond 250 $, Gold 150 $ ou Silver 100 $, par mois en abonnement ou une seule fois pour une diffusion de 30 jours. Vous pouvez résilier un abonnement à tout moment depuis le portail client de Dodo Payments, accessible via vos e-mails de facturation, ou en nous écrivant. Votre emplacement reste en ligne jusqu’à la fin du mois payé et vous n’êtes plus facturé. Une diffusion de 30 jours n’est jamais renouvelée et s’arrête d’elle-même.",
      zh: "赞助价格为钻石 $250、黄金 $150 或白银 $100，可按月订阅，也可一次性购买单期 30 天。你可以随时通过账单邮件中链接的 Dodo Payments 客户门户或写信给我们取消订阅。你的展示位会保留到已付费月份结束，之后不会再扣费。30 天单期不会续订，到期自动结束。",
    }),
    sponsorText2: t({
      en: "A month or 30-day run that has started is not refunded. If we decline your placement before it ever goes live, we refund it in full. Otherwise refunds apply only where you were charged twice or for something you did not buy, or where the law where you live requires it. Where a refund applies, Dodo Payments returns it to the original payment method.",
      es: "Un mes o una campaña de 30 días ya iniciados no se reembolsan. Si rechazamos tu espacio antes de que se publique, te lo reembolsamos íntegramente. En otros casos solo hay reembolso si se te ha cobrado dos veces o por algo que no compraste, o que la legislación del lugar donde vives lo exija. Cuando corresponde un reembolso, Dodo Payments lo devuelve al método de pago original.",
      fr: "Un mois ou une diffusion de 30 jours commencés ne sont pas remboursés. Si nous refusons votre emplacement avant sa mise en ligne, nous le remboursons intégralement. Sinon, un remboursement ne s’applique que si vous avez été facturé deux fois ou pour quelque chose que vous n’avez pas acheté, ou si la législation de votre lieu de résidence l’exige. Lorsqu’un remboursement s’applique, Dodo Payments le restitue sur le moyen de paiement initial.",
      zh: "已开始的月份或 30 天单期不予退款。如果我们在你的展示位上线前拒绝了它，我们会全额退款。除此之外，仅在你被重复扣款、因未购买的商品被扣款，或你居住地法律要求时才退款。符合退款条件时，Dodo Payments 会将款项退回原付款方式。",
    }),
  },
} satisfies Dictionary;

export default refundsContent;
