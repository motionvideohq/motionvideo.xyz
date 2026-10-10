import { t } from "intlayer";
import type { Dictionary } from "intlayer";

import { LINK } from "@/constants/links";

export default {
  key: "contact",
  content: {
    title: t({ en: "Contact", es: "Contacto", fr: "Contact" }),
    intro: t({
      en: "Questions about the pack, a purchase, or a partnership? Send a message and we’ll reply by email.",
      es: "¿Preguntas sobre el paquete, una compra o una colaboración? Envía un mensaje y responderemos por correo electrónico.",
      fr: "Une question sur le pack, un achat ou un partenariat ? Envoyez un message et nous vous répondrons par e-mail.",
    }),
    validationError: t({
      en: "Add your name, a valid email, a subject, and a message of at least 10 characters.",
      es: "Añade tu nombre, un correo válido, un asunto y un mensaje de al menos 10 caracteres.",
      fr: "Ajoutez votre nom, une adresse e-mail valide, un objet et un message d’au moins 10 caractères.",
    }),
    sendError: t({
      en: `Your message couldn’t be sent. Please email ${LINK.EMAIL} instead.`,
      es: `No se pudo enviar tu mensaje. Escribe a ${LINK.EMAIL} en su lugar.`,
      fr: `Votre message n’a pas pu être envoyé. Écrivez plutôt à ${LINK.EMAIL}.`,
    }),
    sent: t({
      en: "Message sent",
      es: "Mensaje enviado",
      fr: "Message envoyé",
    }),
    thanks: t({
      en: "Thanks for writing. We usually reply within two working days.",
      es: "Gracias por escribir. Normalmente respondemos en dos días laborables.",
      fr: "Merci pour votre message. Nous répondons généralement sous deux jours ouvrés.",
    }),
    name: t({ en: "Name", es: "Nombre", fr: "Nom" }),
    namePlaceholder: t({ en: "John Doe", es: "Juan Pérez", fr: "Jean Dupont" }),
    email: t({ en: "Email", es: "Correo electrónico", fr: "E-mail" }),
    emailPlaceholder: t({
      en: "john@doe.com",
      es: "juan@ejemplo.com",
      fr: "jean@exemple.com",
    }),
    inquiry: t({
      en: "Inquiry type",
      es: "Tipo de consulta",
      fr: "Type de demande",
    }),
    inquiryLabels: {
      General: t({ en: "General", es: "General", fr: "Général" }),
      "Purchase & billing": t({
        en: "Purchase & billing",
        es: "Compra y facturación",
        fr: "Achat et facturation",
      }),
      Support: t({ en: "Support", es: "Asistencia", fr: "Assistance" }),
      Partnership: t({
        en: "Partnership",
        es: "Colaboración",
        fr: "Partenariat",
      }),
      Press: t({ en: "Press", es: "Prensa", fr: "Presse" }),
    },
    subject: t({ en: "Subject", es: "Asunto", fr: "Objet" }),
    subjectPlaceholder: t({
      en: "Brief description of your inquiry",
      es: "Breve descripción de tu consulta",
      fr: "Brève description de votre demande",
    }),
    message: t({ en: "Message", es: "Mensaje", fr: "Message" }),
    messagePlaceholder: t({
      en: "Hi, this is my message",
      es: "Hola, este es mi mensaje",
      fr: "Bonjour, voici mon message",
    }),
    sending: t({ en: "Sending…", es: "Enviando…", fr: "Envoi…" }),
    send: t({
      en: "Send message",
      es: "Enviar mensaje",
      fr: "Envoyer le message",
    }),
    or: t({ en: "or", es: "o", fr: "ou" }),
    enter: t({ en: "Enter", es: "Intro", fr: "Entrée" }),
    toSend: t({ en: "to send", es: "para enviar", fr: "pour envoyer" }),
    prefer: t({
      en: "Prefer something else? Email ",
      es: "¿Prefieres otra opción? Escribe a ",
      fr: "Vous préférez un autre moyen ? Écrivez à ",
    }),
    dm: t({
      en: "or send a DM on X to ",
      es: "o envía un mensaje privado en X a ",
      fr: "ou envoyez un message privé sur X à ",
    }),
  },
} satisfies Dictionary;
