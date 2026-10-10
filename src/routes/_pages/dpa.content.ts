import { t } from "intlayer";
import type { Dictionary } from "intlayer";

const dpaContent = {
  key: "legal-dpa",
  content: {
    heading0: t({
      en: "Data processing addendum",
      es: "Adenda de tratamiento de datos",
      fr: "Avenant relatif au traitement des données",
    }),
    text1: t({
      en: "This addendum is for companies and other organizations that buy",
      es: "Esta adenda está dirigida a empresas y otras organizaciones que compran",
      fr: "Cet avenant s’adresse aux entreprises et autres organisations qui achètent",
    }),
    text2: t({
      en: ". It explains, in plain language, how",
      es: ". Explica, en lenguaje sencillo, cómo",
      fr: ". Il explique, en termes simples, comment",
    }),
    text3: t({
      en: "handles personal data connected to a business purchase. It supplements our",
      es: "trata los datos personales relacionados con una compra empresarial. Complementa nuestras",
      fr: "traite les données personnelles liées à un achat professionnel. Il complète nos",
    }),
    text4: t({
      en: "terms of service",
      es: "condiciones de servicio",
      fr: "conditions d’utilisation",
    }),
    text5: t({ en: "and", es: "y", fr: "et notre" }),
    text6: t({
      en: "privacy policy",
      es: "política de privacidad",
      fr: "politique de confidentialité",
    }),
    text7: t({
      en: ", and applies automatically to every business order.",
      es: ", y se aplica automáticamente a todos los pedidos empresariales.",
      fr: ", et s’applique automatiquement à toute commande professionnelle.",
    }),
    heading8: t({ en: "Scope", es: "Ámbito", fr: "Périmètre" }),
    text9: t({
      en: "is a set of files that you run with your own coding agent on your own machines. We don’t host your code, your components, or the videos you render, and we never receive them. The only personal data this addendum covers is the small amount needed to sell and deliver the pack: mainly the email addresses, GitHub usernames, and sign-in sessions of the people at your organization who use it.",
      es: "es un conjunto de archivos que ejecutas con tu propio agente de programación en tus equipos. No alojamos tu código, tus componentes ni los vídeos que renderizas, y nunca los recibimos. Los únicos datos personales cubiertos por esta adenda son los pocos necesarios para vender y entregar el paquete: principalmente las direcciones de correo, los nombres de usuario de GitHub y las sesiones de inicio de sesión de las personas de tu organización que lo utilizan.",
      fr: "est un ensemble de fichiers que vous exécutez avec votre propre agent de programmation sur vos propres machines. Nous n’hébergeons ni votre code, ni vos composants, ni les vidéos que vous rendez, et nous ne les recevons jamais. Les seules données personnelles couvertes par cet avenant sont les quelques données nécessaires à la vente et à la livraison du pack : principalement les adresses e-mail, les noms d’utilisateur GitHub et les sessions de connexion des personnes de votre organisation qui l’utilisent.",
    }),
    heading10: t({
      en: "Who is responsible for what",
      es: "Responsabilidades",
      fr: "Répartition des responsabilités",
    }),
    text11: t({
      en: "For data collected through",
      es: "Para los datos recopilados a través de",
      fr: "Pour les données collectées directement via",
    }),
    text12: t({
      en: "itself (sessions, sign-in tokens, request counts, contact messages), we act as the controller.",
      es: "(sesiones, tokens de inicio de sesión, recuentos de solicitudes y mensajes de contacto), actuamos como responsables del tratamiento.",
      fr: "(sessions, jetons de connexion, compteurs de requêtes, messages de contact), nous agissons en tant que responsable du traitement.",
    }),
    text13: t({
      en: "Where a purchase involves data about your staff, such as the address a colleague uses to sign in or the GitHub account they link, we use it only to deliver and support the purchase you made, and for no other purpose.",
      es: "Cuando una compra implica datos de tu personal, como la dirección que usa un compañero para iniciar sesión o la cuenta de GitHub que vincula, los utilizamos únicamente para entregar y dar soporte a tu compra, y para ningún otro fin.",
      fr: "Lorsqu’un achat implique des données concernant votre personnel, comme l’adresse qu’un collègue utilise pour se connecter ou le compte GitHub qu’il associe, nous les utilisons uniquement pour livrer et assurer le support de votre achat, à aucune autre fin.",
    }),
    text14: t({
      en: "Dodo Payments is the merchant of record and handles payment and billing data under its own terms as an independent party.",
      es: "Dodo Payments es el comerciante registrado y trata los datos de pago y facturación conforme a sus propias condiciones como parte independiente.",
      fr: "Dodo Payments est le vendeur officiel et traite les données de paiement et de facturation selon ses propres conditions en tant que partie indépendante.",
    }),
    heading15: t({
      en: "Subprocessors",
      es: "Subencargados del tratamiento",
      fr: "Sous-traitants ultérieurs",
    }),
    text16: t({
      en: "We rely on the following providers:",
      es: "Utilizamos los siguientes proveedores:",
      fr: "Nous faisons appel aux prestataires suivants :",
    }),
    text17: t({
      en: "Dodo Payments",
      es: "Dodo Payments",
      fr: "Dodo Payments",
    }),
    text18: t({
      en: ": checkout, payments, subscriptions, invoicing, tax, refunds, and repository invites.",
      es: ": pago, cobros, suscripciones, facturación, impuestos, reembolsos e invitaciones al repositorio.",
      fr: ": paiement, encaissement, abonnements, facturation, taxes, remboursements et invitations au dépôt.",
    }),
    text19: t({ en: "Cloudflare", es: "Cloudflare", fr: "Cloudflare" }),
    text20: t({
      en: ": hosting, database (D1), media storage (R2), DNS, email forwarding, and cookieless web analytics.",
      es: ": alojamiento, base de datos (D1), almacenamiento multimedia (R2), DNS, reenvío de correo y analítica web sin cookies.",
      fr: ": hébergement, base de données (D1), stockage des médias (R2), DNS, transfert d’e-mails et statistiques web sans cookies.",
    }),
    text21: t({ en: "Resend", es: "Resend", fr: "Resend" }),
    text22: t({
      en: ": transactional email.",
      es: ": correo transaccional.",
      fr: ": e-mails transactionnels.",
    }),
    text23: t({ en: "GitHub", es: "GitHub", fr: "GitHub" }),
    text24: t({
      en: ": hosting of the private repository.",
      es: ": alojamiento del repositorio privado.",
      fr: ": hébergement du dépôt privé.",
    }),
    text25: t({
      en: "If we add or swap a subprocessor, this list is updated and the date at the top of the page changes.",
      es: "Si añadimos o sustituimos un subencargado, actualizamos esta lista y la fecha de la parte superior de la página.",
      fr: "Si nous ajoutons ou remplaçons un sous-traitant, cette liste est mise à jour et la date en haut de la page change.",
    }),
    heading26: t({
      en: "How the data is protected",
      es: "Cómo se protegen los datos",
      fr: "Protection des données",
    }),
    text27: t({
      en: "All traffic to the site is encrypted with HTTPS.",
      es: "Todo el tráfico al sitio está cifrado mediante HTTPS.",
      fr: "Tout le trafic vers le site est chiffré via HTTPS.",
    }),
    text28: t({
      en: "Session cookies are HttpOnly and Secure, sessions end after 7 days, and sign-in links expire after 15 minutes.",
      es: "Las cookies de sesión son HttpOnly y Secure, las sesiones terminan después de 7 días y los enlaces de inicio de sesión caducan después de 15 minutos.",
      fr: "Les cookies de session sont HttpOnly et Secure, les sessions prennent fin après 7 jours et les liens de connexion expirent après 15 minutes.",
    }),
    text29: t({
      en: "Access to the production systems, the database, and the repository settings is limited to",
      es: "El acceso a los sistemas de producción, la base de datos y la configuración del repositorio se limita a",
      fr: "L’accès aux systèmes de production, à la base de données et aux paramètres du dépôt est limité à",
    }),
    text30: t({
      en: "We collect as little as possible: no passwords, no payment card data, no advertising trackers, no analytics cookies, and no copy of the work you create.",
      es: "Recopilamos lo mínimo posible: ninguna contraseña, ningún dato de tarjetas de pago, ningún rastreador publicitario, ninguna cookie de analítica y ninguna copia del trabajo que creas.",
      fr: "Nous collectons le moins possible : aucun mot de passe, aucune donnée de carte bancaire, aucun traceur publicitaire, aucun cookie de statistiques et aucune copie du travail que vous créez.",
    }),
    heading31: t({
      en: "Transfers across borders",
      es: "Transferencias internacionales",
      fr: "Transferts internationaux",
    }),
    text32: t({
      en: "We operate from",
      es: "Operamos desde",
      fr: "Nous opérons depuis",
    }),
    text33: t({
      en: ", and our subprocessors run infrastructure in multiple regions, including the United States. Data may therefore be processed outside your country. We use providers that offer recognized transfer safeguards, such as the EU Standard Contractual Clauses, where these are required.",
      es: ", y nuestros subencargados tienen infraestructura en varias regiones, incluidos Estados Unidos. Por tanto, los datos pueden tratarse fuera de tu país. Utilizamos proveedores que ofrecen garantías de transferencia reconocidas, como las cláusulas contractuales tipo de la UE, cuando son necesarias.",
      fr: ", et nos sous-traitants exploitent des infrastructures dans plusieurs régions, notamment aux États-Unis. Les données peuvent donc être traitées hors de votre pays. Nous utilisons des prestataires offrant des garanties de transfert reconnues, telles que les clauses contractuelles types de l’UE, lorsque cela est requis.",
    }),
    heading34: t({
      en: "Security incidents",
      es: "Incidentes de seguridad",
      fr: "Incidents de sécurité",
    }),
    text35: t({
      en: "If we become aware of a breach affecting personal data related to your organization, we will notify you without undue delay, tell you what we know, and keep you updated on the steps we take in response.",
      es: "Si tenemos conocimiento de una brecha que afecte a datos personales relacionados con tu organización, te avisaremos sin demora indebida, te comunicaremos lo que sabemos y te mantendremos informado de las medidas que adoptemos.",
      fr: "Si nous avons connaissance d’une violation affectant des données personnelles liées à votre organisation, nous vous en informerons sans retard injustifié, vous communiquerons ce que nous savons et vous tiendrons au courant des mesures prises en réponse.",
    }),
    heading36: t({
      en: "Requests from individuals",
      es: "Solicitudes de particulares",
      fr: "Demandes des personnes concernées",
    }),
    text37: t({
      en: "Your staff, or you on their behalf, can ask for access, correction, or deletion of their data by writing to",
      es: "Tu personal, o tú en su nombre, puede solicitar acceso, rectificación o supresión de sus datos escribiendo a",
      fr: "Votre personnel, ou vous en son nom, peut demander l’accès, la rectification ou la suppression de ses données en écrivant à",
    }),
    text38: t({
      en: ". If a request reaches us that concerns your organization, we will help you respond to it.",
      es: ". Si recibimos una solicitud relacionada con tu organización, te ayudaremos a responderla.",
      fr: ". Si nous recevons une demande concernant votre organisation, nous vous aiderons à y répondre.",
    }),
    heading39: t({ en: "Deletion", es: "Supresión", fr: "Suppression" }),
    text40: t({
      en: "On request, we delete the user records and sessions linked to your organization and remove the associated GitHub accounts from the repository, which ends their access. Billing records held by Dodo Payments are kept for as long as tax law requires.",
      es: "Cuando se nos solicita, eliminamos los registros de usuario y las sesiones vinculados a tu organización y retiramos las cuentas de GitHub asociadas del repositorio, lo que pone fin a su acceso. Dodo Payments conserva los registros de facturación durante el tiempo exigido por la legislación fiscal.",
      fr: "Sur demande, nous supprimons les comptes utilisateurs et les sessions liés à votre organisation et retirons du dépôt les comptes GitHub associés, mettant fin à leur accès. Les documents de facturation détenus par Dodo Payments sont conservés aussi longtemps que la législation fiscale l’exige.",
    }),
    heading41: t({
      en: "Getting a signed copy",
      es: "Obtener una copia firmada",
      fr: "Obtenir une copie signée",
    }),
    text42: t({
      en: "If your procurement process needs a countersigned version of this addendum, email",
      es: "Si tu proceso de compras requiere una versión de esta adenda firmada por ambas partes, escribe a",
      fr: "Si votre procédure d’achat nécessite une version de cet avenant contresignée, envoyez un e-mail à",
    }),
    text43: t({
      en: "with your organization’s legal name, address, and the email used for the order. We will send back a copy for signature.",
      es: "con la razón social de tu organización, su dirección y el correo utilizado para el pedido. Te enviaremos una copia para firmar.",
      fr: "avec la dénomination légale de votre organisation, son adresse et l’e-mail utilisé pour la commande. Nous vous enverrons une copie à signer.",
    }),
  },
} satisfies Dictionary;

export default dpaContent;
