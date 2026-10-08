import { t } from 'intlayer';
import type { Dictionary } from 'intlayer';

const account = {
  key: "account",
  content: {
    terms: t({ en: "Terms", es: "Términos", fr: "Conditions" }),
    privacy: t({ en: "Privacy", es: "Privacidad", fr: "Confidentialité" }),
    signInTitle: t({ en: "Sign in to your purchase", es: "Accede a tu compra", fr: "Accédez à votre achat" }),
    dontOwn: t({ en: "Don’t own", es: "¿Aún no tienes", fr: "Vous n’avez pas encore" }),
    yet: t({ en: "yet?", es: "?", fr: "?" }),
    buyHere: t({ en: "Buy it here", es: "Cómpralo aquí", fr: "Achetez-le ici" }),
    email: t({ en: "Email", es: "Correo electrónico", fr: "Adresse e-mail" }),
    emailPlaceholder: t({ en: "you@example.com", es: "tu@ejemplo.com", fr: "vous@exemple.com" }),
    sending: t({ en: "Sending…", es: "Enviando…", fr: "Envoi en cours…" }),
    sendLink: t({ en: "Send link", es: "Enviar enlace", fr: "Envoyer le lien" }),
    checkEmail: t({ en: "Check your email", es: "Revisa tu correo", fr: "Consultez votre messagerie" }),
    sentLink: t({ en: "We sent a sign-in link to", es: "Hemos enviado un enlace de acceso a", fr: "Nous avons envoyé un lien de connexion à" }),
    expires: t({ en: "It expires in 15 minutes.", es: "Caduca en 15 minutos.", fr: "Il expire dans 15 minutes." }),
    invalidLink: t({ en: "That sign-in link is invalid or expired. Request a new one.", es: "Ese enlace de acceso no es válido o ha caducado. Solicita uno nuevo.", fr: "Ce lien de connexion est invalide ou a expiré. Demandez-en un nouveau." }),
    sendError: t({ en: "Could not send the sign-in link. Try again.", es: "No se ha podido enviar el enlace de acceso. Inténtalo de nuevo.", fr: "Impossible d’envoyer le lien de connexion. Réessayez." }),
    thanks: t({ en: "Thanks for buying", es: "Gracias por comprar", fr: "Merci d’avoir acheté" }),
    sendingLink: t({ en: "Sending your sign-in link to", es: "Enviando tu enlace de acceso a", fr: "Envoi de votre lien de connexion à" }),
    sendAgain: t({ en: "Send the link again", es: "Enviar el enlace de nuevo", fr: "Renvoyer le lien" }),
    paymentDelayed: t({ en: "Your payment went through, but it hasn’t reached us yet. Try again in a moment, or sign in later with", es: "Tu pago se ha realizado, pero aún no lo hemos recibido. Inténtalo de nuevo en un momento o accede más tarde con", fr: "Votre paiement a réussi, mais sa confirmation ne nous est pas encore parvenue. Réessayez dans un instant, ou connectez-vous plus tard avec" }),
    confirming: t({ en: "Confirming your payment", es: "Confirmando tu pago", fr: "Confirmation de votre paiement" }),
    checkAgain: t({ en: "Check again", es: "Comprobar de nuevo", fr: "Vérifier à nouveau" }),
    seconds: t({ en: "This usually takes a few seconds.", es: "Esto suele tardar unos segundos.", fr: "Cela prend généralement quelques secondes." }),
    opening: t({ en: "Opening…", es: "Abriendo…", fr: "Ouverture en cours…" }),
    portal: t({ en: "Open customer portal", es: "Abrir el portal de clientes", fr: "Ouvrir le portail client" }),
    portalPreview: t({ en: "Customer portal (preview)", es: "Portal de clientes (vista previa)", fr: "Portail client (aperçu)" }),
    own: t({ en: "You own", es: "Ya tienes", fr: "Vous possédez" }),
    portalDescription: t({ en: "Open the customer portal to connect your GitHub account and get access to the private skill pack repository. Receipts and invoices live there too.", es: "Abre el portal de clientes para conectar tu cuenta de GitHub y acceder al repositorio privado del paquete de habilidades. Allí también encontrarás los recibos y las facturas.", fr: "Ouvrez le portail client pour connecter votre compte GitHub et accéder au dépôt privé du pack de compétences. Vous y trouverez également vos reçus et factures." }),
    get: t({ en: "Get", es: "Consigue", fr: "Obtenez" }),
    purchaseDescription: t({ en: "One-time purchase. You’ll get access to the private skill pack repository and every future update.", es: "Compra única. Tendrás acceso al repositorio privado del paquete de habilidades y a todas las futuras actualizaciones.", fr: "Achat unique. Vous aurez accès au dépôt privé du pack de compétences et à toutes les mises à jour futures." }),
    dashboard: t({ en: "Dashboard", es: "Panel", fr: "Tableau de bord" }),
    localPreview: t({ en: "Local UI preview", es: "Vista previa local de la interfaz", fr: "Aperçu local de l’interface" }),
    signOut: t({ en: "Sign out", es: "Cerrar sesión", fr: "Se déconnecter" }),
  },
} satisfies Dictionary;

export default account;
