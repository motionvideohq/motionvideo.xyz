import { t } from "intlayer";
import type { Dictionary } from "intlayer";

const privacyContent = {
  key: "legal-privacy",
  content: {
    heading0: t({
      en: "Privacy policy",
      es: "Política de privacidad",
      fr: "Politique de confidentialité",
    }),
    text1: t({
      en: "This policy describes what",
      es: "Esta política describe lo que",
      fr: "Cette politique décrit ce que",
    }),
    text2: t({
      en: "(“we”, “us”, or “our”) processes when you visit",
      es: "(«nosotros» o «nuestro») trata cuando visitas",
      fr: "(« nous » ou « notre ») traite lorsque vous visitez",
    }),
    text3: t({ en: ", buy", es: ", compras", fr: ", achetez" }),
    text4: t({
      en: ", sponsor us, sign in, write to us, join our newsletter list, or submit work to the collection. We do not sell your data, and no advertising trackers run on this site.",
      es: ", nos patrocinas, inicias sesión, nos escribes, te unes a nuestra newsletter o propones trabajo para la colección. No vendemos tus datos y este sitio no utiliza rastreadores publicitarios.",
      fr: ", nous parrainez, vous connectez, nous écrivez, rejoignez notre newsletter ou proposez un travail pour la collection. Nous ne vendons pas vos données et aucun traceur publicitaire n’est utilisé sur ce site.",
    }),
    heading5: t({
      en: "1. What we process",
      es: "1. Qué datos tratamos",
      fr: "1. Ce que nous traitons",
    }),
    text6: t({
      en: "Email address",
      es: "Dirección de correo electrónico",
      fr: "Adresse e-mail",
    }),
    text7: t({
      en: ": you give it to Dodo Payments at checkout, and to us when you sign in. We use it to find your orders at Dodo Payments, to send you a sign-in link, and to email you about delivery of your purchase. Sign-in remains limited to paid customers. Buying, sponsoring, or submitting work does not subscribe you to our newsletter; only submitting the newsletter signup form does.",
      es: ": la facilitas a Dodo Payments al pagar y a nosotros al iniciar sesión. La utilizamos para encontrar tus pedidos en Dodo Payments, enviarte un enlace de inicio de sesión y escribirte sobre la entrega de tu compra. El acceso sigue limitado a clientes con una compra pagada. Comprar, patrocinar o enviar trabajo no te suscribe a nuestra newsletter; solo lo hace enviar el formulario de inscripción a la newsletter.",
      fr: ": vous la communiquez à Dodo Payments lors du paiement et à nous lors de la connexion. Nous l’utilisons pour retrouver vos commandes chez Dodo Payments, vous envoyer un lien de connexion et vous informer de la livraison de votre achat. La connexion reste réservée aux clients ayant payé. Un achat, un parrainage ou une proposition ne vous inscrit pas à notre newsletter ; seul l’envoi du formulaire d’inscription à la newsletter le fait.",
    }),
    text8: t({
      en: "Order details",
      es: "Datos del pedido",
      fr: "Détails de la commande",
    }),
    text9: t({
      en: ": Dodo Payments holds your orders and sponsorship subscriptions: what you bought, when, the amount, and your billing details. We read them from Dodo Payments when needed rather than storing our own copy.",
      es: ": Dodo Payments conserva tus pedidos y suscripciones de patrocinio: qué compraste, cuándo, el importe y tus datos de facturación. Los consultamos en Dodo Payments cuando hace falta en lugar de almacenar una copia propia.",
      fr: ": Dodo Payments conserve vos commandes et abonnements de parrainage : vos achats, leur date, leur montant et vos informations de facturation. Nous les consultons chez Dodo Payments au besoin plutôt que d’en stocker une copie.",
    }),
    text10: t({
      en: "User record",
      es: "Registro de usuario",
      fr: "Compte utilisateur",
    }),
    text11: t({
      en: ": on your first sign-in we save your email address and the time the record was created.",
      es: ": en tu primer inicio de sesión guardamos tu dirección de correo y la fecha de creación del registro.",
      fr: ": lors de votre première connexion, nous enregistrons votre adresse e-mail et la date de création du compte.",
    }),
    text12: t({
      en: "Sign-in links and sessions",
      es: "Enlaces de inicio de sesión y sesiones",
      fr: "Liens de connexion et sessions",
    }),
    text13: t({
      en: ": each emailed link carries a single-use token that works for 15 minutes. Once you sign in, a session cookie keeps you signed in for 7 days. It is HttpOnly and Secure, so page scripts can’t read it and it only travels over HTTPS. Alongside the session we store the IP address and user agent it was opened from. Signing out ends the session.",
      es: ": cada enlace enviado por correo contiene un token de un solo uso válido durante 15 minutos. Una vez que inicias sesión, una cookie de sesión te mantiene conectado durante 7 días. Es HttpOnly y Secure, por lo que los scripts de la página no pueden leerla y solo se transmite por HTTPS. Junto con la sesión guardamos la dirección IP y el agente de usuario desde los que se abrió. Cerrar sesión pone fin a la sesión.",
      fr: ": chaque lien envoyé par e-mail contient un jeton à usage unique valable 15 minutes. Une fois connecté, un cookie de session vous maintient connecté pendant 7 jours. Il est HttpOnly et Secure : les scripts de la page ne peuvent donc pas le lire et il ne transite que par HTTPS. Nous enregistrons avec la session l’adresse IP et l’agent utilisateur à partir desquels elle a été ouverte. La déconnexion met fin à la session.",
    }),
    text14: t({
      en: "GitHub username",
      es: "Nombre de usuario de GitHub",
      fr: "Nom d’utilisateur GitHub",
    }),
    text15: t({
      en: ": connecting your GitHub account in the Dodo Payments customer portal shares your GitHub username with Dodo Payments and GitHub for the repository invite, and GitHub lists you as a collaborator on our private repository, where we can see it.",
      es: ": al conectar tu cuenta de GitHub en el portal de clientes de Dodo Payments, tu nombre de usuario de GitHub se comparte con Dodo Payments y GitHub para la invitación al repositorio, y GitHub te incluye como colaborador de nuestro repositorio privado, donde podemos verlo.",
      fr: ": lorsque vous connectez votre compte GitHub dans le portail client de Dodo Payments, votre nom d’utilisateur GitHub est communiqué à Dodo Payments et à GitHub pour l’invitation au dépôt, et GitHub vous ajoute comme collaborateur de notre dépôt privé, où nous pouvons le voir.",
    }),
    text16: t({
      en: "Contact form messages",
      es: "Mensajes del formulario de contacto",
      fr: "Messages du formulaire de contact",
    }),
    text17: t({
      en: ": the name, email address, subject, and message you enter, sent to our inbox so we can answer you.",
      es: ": el nombre, correo, asunto y mensaje que introduces se envían a nuestra bandeja de entrada para que podamos responderte.",
      fr: ": le nom, l’adresse e-mail, l’objet et le message que vous saisissez sont envoyés dans notre boîte de réception pour que nous puissions vous répondre.",
    }),
    text18: t({
      en: "Rate limits",
      es: "Límites de solicitudes",
      fr: "Limitation des requêtes",
    }),
    text19: t({
      en: ": to keep the contact, newsletter, and submission forms from being flooded, we count their requests per IP address using a shared one-minute limit.",
      es: ": para evitar una avalancha de solicitudes en los formularios de contacto, newsletter y propuestas, contamos sus solicitudes por dirección IP con un límite compartido de un minuto.",
      fr: ": pour éviter de submerger les formulaires de contact, de newsletter et de proposition, nous comptons leurs requêtes par adresse IP avec une limite partagée d’une minute.",
    }),
    text20: t({ en: "Analytics", es: "Analítica", fr: "Statistiques" }),
    text21: t({
      en: ": we use Cloudflare Web Analytics to see how the site is used. When a page loads, a script sends the page address, the referring page, your browser’s user agent, and page load timings to Cloudflare, which reports them to us only as aggregate counts, such as visits per page, top referrers, and countries. It sets no cookies, uses no local storage, and does not fingerprint you or follow you across sites.",
      es: ": utilizamos Cloudflare Web Analytics para saber cómo se utiliza el sitio. Al cargar una página, un script envía a Cloudflare la dirección de la página, la página de origen, el agente de usuario de tu navegador y los tiempos de carga. Cloudflare solo nos los comunica como recuentos agregados, como visitas por página, principales fuentes y países. No establece cookies, no usa almacenamiento local, no crea una huella digital ni te sigue entre sitios.",
      fr: ": nous utilisons Cloudflare Web Analytics pour comprendre l’utilisation du site. Au chargement d’une page, un script envoie à Cloudflare l’adresse de la page, la page d’origine, l’agent utilisateur de votre navigateur et les temps de chargement. Cloudflare nous les communique uniquement sous forme de statistiques agrégées, telles que les visites par page, les principales sources et les pays. Ce service ne dépose aucun cookie, n’utilise pas de stockage local, ne crée pas d’empreinte numérique et ne vous suit pas d’un site à l’autre.",
    }),
    text22: t({
      en: "We use this data to carry out the purchase or sponsorship you asked for, reply when you write to us, maintain the newsletter list you opted into, review community submissions and attribute accepted work, keep the site secure, understand which pages are read, and meet tax and accounting obligations through Dodo Payments. We do not use it for advertising tracking or marketing profiles.",
      es: "Utilizamos estos datos para realizar la compra o el patrocinio solicitados, responderte, mantener la lista de newsletter a la que te has suscrito, revisar propuestas y atribuir el trabajo aceptado, proteger el sitio, comprender qué páginas se leen y cumplir las obligaciones fiscales y contables a través de Dodo Payments. No los utilizamos para rastreo publicitario ni perfiles de marketing.",
      fr: "Nous utilisons ces données pour réaliser l’achat ou le parrainage demandé, répondre à vos messages, gérer la newsletter à laquelle vous avez consenti, examiner les propositions et attribuer les travaux acceptés, sécuriser le site, comprendre quelles pages sont lues et respecter les obligations fiscales et comptables via Dodo Payments. Nous ne les utilisons pas pour le suivi publicitaire ou les profils marketing.",
    }),
    heading23: t({
      en: "2. Who else sees it",
      es: "2. Quién más los ve",
      fr: "2. Qui d’autre les voit",
    }),
    text24: t({
      en: "Dodo Payments",
      es: "Dodo Payments",
      fr: "Dodo Payments",
    }),
    text25: t({
      en: ": the merchant of record. Payments, invoices, taxes, refunds, sponsorship subscriptions, and GitHub repository invites happen there under",
      es: ": el comerciante registrado. Los pagos, facturas, impuestos, reembolsos, suscripciones de patrocinio e invitaciones a repositorios de GitHub se gestionan allí conforme a",
      fr: ": le vendeur officiel. Les paiements, factures, taxes, remboursements, abonnements de parrainage et invitations aux dépôts GitHub sont gérés chez Dodo Payments conformément à",
    }),
    text26: t({
      en: "Dodo Payments’ privacy policy",
      es: "la política de privacidad de Dodo Payments",
      fr: "la politique de confidentialité de Dodo Payments",
    }),
    text27: t({ en: "Cloudflare", es: "Cloudflare", fr: "Cloudflare" }),
    text28: t({
      en: ": hosts the site, our database (D1), the media storage (R2) behind assets.motionvideo.xyz, DNS, and email forwarding, and sees the IP address of every request, as any host does. It also runs the analytics described above, under",
      es: ": aloja el sitio, nuestra base de datos (D1), el almacenamiento multimedia (R2) de assets.motionvideo.xyz, DNS y reenvío de correo, y ve la dirección IP de cada solicitud, como cualquier proveedor de alojamiento. También ofrece la analítica descrita anteriormente, conforme a",
      fr: ": héberge le site, notre base de données (D1), le stockage des médias (R2) derrière assets.motionvideo.xyz, le DNS et le transfert d’e-mails, et voit l’adresse IP de chaque requête, comme tout hébergeur. Il fournit aussi les statistiques décrites ci-dessus, conformément à",
    }),
    text29: t({
      en: "Cloudflare’s privacy policy",
      es: "la política de privacidad de Cloudflare",
      fr: "la politique de confidentialité de Cloudflare",
    }),
    text30: t({ en: "Resend", es: "Resend", fr: "Resend" }),
    text31: t({
      en: ": delivers our emails, such as sign-in links, purchase delivery emails, and contact form messages.",
      es: ": entrega nuestros correos, como enlaces de inicio de sesión, correos de entrega de compras y mensajes del formulario de contacto.",
      fr: ": distribue nos e-mails, notamment les liens de connexion, les e-mails de livraison des achats et les messages du formulaire de contact.",
    }),
    text32: t({ en: "GitHub", es: "GitHub", fr: "GitHub" }),
    text33: t({
      en: ": hosts the private repository that contains the pack.",
      es: ": aloja el repositorio privado que contiene el paquete.",
      fr: ": héberge le dépôt privé contenant le pack.",
    }),
    text34: t({
      en: "Apart from the providers above, we share no personal data unless the law requires it or you have consented to public attribution of an accepted submission. Submission email addresses are never published. Business customers can read our",
      es: "Aparte de los proveedores anteriores, no compartimos datos personales salvo que la ley lo exija o hayas consentido la atribución pública de una propuesta aceptada. Los correos de las propuestas nunca se publican. Los clientes empresariales pueden consultar nuestra",
      fr: "En dehors des prestataires ci-dessus, nous ne partageons aucune donnée personnelle sauf si la loi l’exige ou si vous avez consenti à l’attribution publique d’une proposition acceptée. Les e-mails des propositions ne sont jamais publiés. Les clients professionnels peuvent consulter notre",
    }),
    text35: t({
      en: "data processing addendum",
      es: "adenda de tratamiento de datos",
      fr: "avenant relatif au traitement des données",
    }),
    text36: t({
      en: "for more detail. These providers run infrastructure in several countries, so your data may be processed outside the country you live in; we rely on the transfer safeguards they offer.",
      es: "para obtener más detalles. Estos proveedores operan infraestructura en varios países, por lo que tus datos pueden tratarse fuera del país donde vives; nos basamos en las garantías de transferencia que ofrecen.",
      fr: "pour plus de détails. Ces prestataires exploitent des infrastructures dans plusieurs pays ; vos données peuvent donc être traitées hors de votre pays de résidence. Nous nous appuyons sur les garanties de transfert qu’ils proposent.",
    }),
    heading37: t({
      en: "3. How long",
      es: "3. Durante cuánto tiempo",
      fr: "3. Durées de conservation",
    }),
    text38: t({
      en: "Sign-in links: 15 minutes.",
      es: "Enlaces de inicio de sesión: 15 minutos.",
      fr: "Liens de connexion : 15 minutes.",
    }),
    text39: t({
      en: "Sessions: 7 days, or until you sign out.",
      es: "Sesiones: 7 días o hasta que cierres sesión.",
      fr: "Sessions : 7 jours, ou jusqu’à votre déconnexion.",
    }),
    text40: t({
      en: "Rate limit counts: one minute.",
      es: "Recuentos para los límites de solicitudes: un minuto.",
      fr: "Compteurs de limitation des requêtes : une minute.",
    }),
    text41: t({
      en: "User record: until you ask us to delete it.",
      es: "Registro de usuario: hasta que nos pidas eliminarlo.",
      fr: "Compte utilisateur : jusqu’à votre demande de suppression.",
    }),
    text42: t({
      en: "Contact messages: in our inbox for as long as they help us support you, and deleted on request.",
      es: "Mensajes de contacto: en nuestra bandeja de entrada mientras nos ayuden a darte soporte, y se eliminan a petición.",
      fr: "Messages de contact : dans notre boîte de réception tant qu’ils nous aident à vous assister, et supprimés sur demande.",
    }),
    text43: t({
      en: "Orders, subscriptions, and invoices: under Dodo Payments’ retention rules. Analytics: under Cloudflare’s.",
      es: "Pedidos, suscripciones y facturas: según las reglas de conservación de Dodo Payments. Analítica: según las de Cloudflare.",
      fr: "Commandes, abonnements et factures : selon les règles de conservation de Dodo Payments. Statistiques : selon celles de Cloudflare.",
    }),
    heading44: t({
      en: "4. Your rights",
      es: "4. Tus derechos",
      fr: "4. Vos droits",
    }),
    text45: t({
      en: "Depending on where you live, you may ask what we hold about you, ask us to correct it, or ask us to delete it. Write to",
      es: "Según dónde vivas, puedes preguntar qué datos tenemos sobre ti, pedirnos que los corrijamos o que los eliminemos. Escribe a",
      fr: "Selon votre lieu de résidence, vous pouvez demander quelles données nous détenons sur vous, leur rectification ou leur suppression. Écrivez à",
    }),
    text46: t({
      en: "from the email address you used for your purchase, sponsorship, newsletter signup, or submission so we can find the relevant record. You can withdraw newsletter consent or ask to remove your submission the same way. For purchase-related requests, we also pass deletion requests on to Dodo Payments, where your orders live. You can complain to your local data protection authority. To keep your visits out of our analytics, block",
      es: "desde el correo que usaste para tu compra, patrocinio, inscripción a la newsletter o propuesta para que podamos encontrar el registro correspondiente. Puedes retirar el consentimiento de la newsletter o pedir que eliminemos tu propuesta del mismo modo. Para solicitudes relacionadas con compras, también remitimos las solicitudes de supresión a Dodo Payments, que conserva tus pedidos. Puedes reclamar ante tu autoridad local de protección de datos. Para excluir tus visitas de nuestra analítica, bloquea",
      fr: "depuis l’adresse utilisée pour votre achat, votre parrainage, votre inscription à la newsletter ou votre proposition afin de retrouver le dossier concerné. Vous pouvez retirer votre consentement à la newsletter ou demander la suppression de votre proposition de la même manière. Pour les achats, nous transmettons aussi les demandes de suppression à Dodo Payments, qui conserve vos commandes. Vous pouvez déposer une plainte auprès de votre autorité locale de protection des données. Pour exclure vos visites de nos statistiques, bloquez",
    }),
    text47: t({
      en: "static.cloudflareinsights.com",
      es: "static.cloudflareinsights.com",
      fr: "static.cloudflareinsights.com",
    }),
    text48: t({
      en: "in your browser or with a content blocker.",
      es: "en tu navegador o con un bloqueador de contenido.",
      fr: "dans votre navigateur ou avec un bloqueur de contenu.",
    }),
    heading49: t({ en: "5. Children", es: "5. Menores", fr: "5. Enfants" }),
    text50: t({
      en: "This site is not intended for children under 13, and we do not knowingly process their data. If we learn that we have, we will delete it.",
      es: "Este sitio no está dirigido a menores de 13 años y no tratamos sus datos a sabiendas. Si descubrimos que lo hemos hecho, los eliminaremos.",
      fr: "Ce site ne s’adresse pas aux enfants de moins de 13 ans et nous ne traitons pas sciemment leurs données. Si nous apprenons l’avoir fait, nous les supprimerons.",
    }),
    heading51: t({
      en: "6. Changes to this policy",
      es: "6. Cambios en esta política",
      fr: "6. Modifications de cette politique",
    }),
    text52: t({
      en: "We may change this policy. The date at the top says when it last changed.",
      es: "Podemos cambiar esta política. La fecha de la parte superior indica su última modificación.",
      fr: "Nous pouvons modifier cette politique. La date en haut indique sa dernière modification.",
    }),
    heading53: t({ en: "7. Contact", es: "7. Contacto", fr: "7. Contact" }),
    languagePreference: t({
      en: "Language preference: we store your selected language only in your browser’s localStorage under the key motionvideo-locale. No cookie is used for this preference. It stays until you clear your browser’s site data or choose another language.",
      es: "Preferencia de idioma: guardamos el idioma seleccionado únicamente en el localStorage de tu navegador, con la clave motionvideo-locale. No se utiliza ninguna cookie para esta preferencia. Se conserva hasta que borres los datos del sitio en tu navegador o elijas otro idioma.",
      fr: "Préférence linguistique : nous enregistrons la langue choisie uniquement dans le localStorage de votre navigateur, sous la clé motionvideo-locale. Aucun cookie n’est utilisé pour cette préférence. Elle reste enregistrée jusqu’à ce que vous effaciez les données du site dans votre navigateur ou choisissiez une autre langue.",
    }),
    newsletterHeading: t({
      en: "Newsletter opt-in",
      es: "Consentimiento para la newsletter",
      fr: "Consentement à la newsletter",
    }),
    newsletterData: t({
      en: ": only when you submit the signup form, we store your normalized email address, the time you opted in, and the record’s creation time in our Cloudflare D1 database for MotionVideo updates. Signing up stores your opt-in; it does not send an email. A repeat signup does not create a duplicate.",
      es: ": solo cuando envías el formulario de inscripción, guardamos tu correo normalizado, la fecha de tu suscripción y la fecha de creación del registro en nuestra base de datos Cloudflare D1 para novedades de MotionVideo. La inscripción guarda tu consentimiento; no envía un correo. Una inscripción repetida no crea duplicados.",
      fr: ": uniquement lorsque vous envoyez le formulaire d’inscription, nous enregistrons votre e-mail normalisé, la date de votre inscription et la date de création du dossier dans notre base Cloudflare D1 pour les nouveautés MotionVideo. L’inscription enregistre votre consentement ; elle n’envoie pas d’e-mail. Une nouvelle inscription ne crée pas de doublon.",
    }),
    submissionHeading: t({
      en: "Community submissions",
      es: "Propuestas de la comunidad",
      fr: "Propositions de la communauté",
    }),
    submissionData: t({
      en: ": we store the category, name, email, title, public URL, description, optional video prompt, attribution consent time, creation time, and pending moderation status in Cloudflare D1. We use these to review your submission and contact you about it if needed. Nothing is automatically published. If accepted, your submitted content and name may be public with your consent; your email stays private. Submitting does not sign you in or join the newsletter.",
      es: ": guardamos la categoría, nombre, correo, título, URL pública, descripción, prompt opcional del vídeo, fecha del consentimiento de atribución, fecha de creación y estado pendiente de moderación en Cloudflare D1. Los usamos para revisar tu propuesta y contactarte si es necesario. Nada se publica automáticamente. Si se acepta, tu contenido y nombre pueden hacerse públicos con tu consentimiento; tu correo permanece privado. Enviar no inicia sesión ni te suscribe a la newsletter.",
      fr: ": nous enregistrons la catégorie, le nom, l’e-mail, le titre, l’URL publique, la description, le prompt vidéo facultatif, la date du consentement à l’attribution, la date de création et le statut en attente de modération dans Cloudflare D1. Nous les utilisons pour examiner votre proposition et vous contacter si nécessaire. Rien n’est publié automatiquement. En cas d’acceptation, votre contenu et votre nom peuvent être publics avec votre consentement ; votre e-mail reste privé. Proposer ne vous connecte pas et ne vous inscrit pas à la newsletter.",
    }),
    newsletterRetention: t({
      en: "Newsletter email and opt-in timestamps: until you withdraw consent or ask us to delete the record by contacting us at the address below.",
      es: "Correo de la newsletter y fechas de consentimiento: hasta que retires tu consentimiento o nos pidas eliminar el registro en la dirección de contacto indicada abajo.",
      fr: "E-mail de newsletter et dates de consentement : jusqu’au retrait de votre consentement ou à votre demande de suppression à l’adresse de contact ci-dessous.",
    }),
    submissionRetention: t({
      en: "Community submissions and attribution consent: while needed for moderation and attribution of accepted work, or until you request deletion using the contact address below.",
      es: "Propuestas y consentimiento de atribución: mientras sean necesarios para la moderación y atribución del trabajo aceptado, o hasta que solicites su eliminación en la dirección de contacto indicada abajo.",
      fr: "Propositions et consentement à l’attribution : tant que nécessaires à la modération et à l’attribution des travaux acceptés, ou jusqu’à votre demande de suppression à l’adresse de contact ci-dessous.",
    }),
  },
} satisfies Dictionary;

export default privacyContent;
