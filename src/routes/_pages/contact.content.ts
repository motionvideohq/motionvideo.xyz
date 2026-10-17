import { t } from "intlayer";
import type { Dictionary } from "intlayer";

import { LINK } from "@/constants/links";

export default {
  key: "contact",
  content: {
    title: t({ en: "Contact", es: "Contacto", fr: "Contact", zh: "联系我们" }),
    intro: t({
      en: "Questions about the pack, a purchase, or a partnership? Send a message and we’ll reply by email.",
      es: "¿Preguntas sobre el paquete, una compra o una colaboración? Envía un mensaje y responderemos por correo electrónico.",
      fr: "Une question sur le pack, un achat ou un partenariat ? Envoyez un message et nous vous répondrons par e-mail.",
      zh: "关于技能包、购买或合作有疑问？发送消息，我们会通过邮件回复。",
    }),
    validationError: t({
      en: "Add your name, a valid email, a subject, and a message of at least 10 characters.",
      es: "Añade tu nombre, un correo válido, un asunto y un mensaje de al menos 10 caracteres.",
      fr: "Ajoutez votre nom, une adresse e-mail valide, un objet et un message d’au moins 10 caractères.",
      zh: "请填写姓名、有效邮箱、主题，以及至少 10 个字符的消息。",
    }),
    sendError: t({
      en: `Your message couldn’t be sent. Please email ${LINK.EMAIL} instead.`,
      es: `No se pudo enviar tu mensaje. Escribe a ${LINK.EMAIL} en su lugar.`,
      fr: `Votre message n’a pas pu être envoyé. Écrivez plutôt à ${LINK.EMAIL}.`,
      zh: `消息发送失败。请改为发邮件至 ${LINK.EMAIL}。`,
    }),
    sent: t({
      en: "Message sent",
      es: "Mensaje enviado",
      fr: "Message envoyé",
      zh: "消息已发送",
    }),
    thanks: t({
      en: "Thanks for writing. We usually reply within two working days.",
      es: "Gracias por escribir. Normalmente respondemos en dos días laborables.",
      fr: "Merci pour votre message. Nous répondons généralement sous deux jours ouvrés.",
      zh: "感谢来信。我们通常会在两个工作日内回复。",
    }),
    name: t({ en: "Name", es: "Nombre", fr: "Nom", zh: "姓名" }),
    namePlaceholder: t({
      en: "John Doe",
      es: "Juan Pérez",
      fr: "Jean Dupont",
      zh: "张三",
    }),
    email: t({
      en: "Email",
      es: "Correo electrónico",
      fr: "E-mail",
      zh: "邮箱",
    }),
    emailPlaceholder: t({
      en: "john@doe.com",
      es: "juan@ejemplo.com",
      fr: "jean@exemple.com",
      zh: "john@doe.com",
    }),
    inquiry: t({
      en: "Inquiry type",
      es: "Tipo de consulta",
      fr: "Type de demande",
      zh: "咨询类型",
    }),
    inquiryLabels: {
      General: t({
        en: "General",
        es: "General",
        fr: "Général",
        zh: "一般咨询",
      }),
      "Purchase & billing": t({
        en: "Purchase & billing",
        es: "Compra y facturación",
        fr: "Achat et facturation",
        zh: "购买与账单",
      }),
      Support: t({
        en: "Support",
        es: "Asistencia",
        fr: "Assistance",
        zh: "支持",
      }),
      Partnership: t({
        en: "Partnership",
        es: "Colaboración",
        fr: "Partenariat",
        zh: "合作",
      }),
      Press: t({ en: "Press", es: "Prensa", fr: "Presse", zh: "媒体" }),
      "Removal or credit": t({
        en: "Removal or credit",
        es: "Retirada o crédito",
        fr: "Retrait ou crédit",
        zh: "移除或署名",
      }),
    },
    subject: t({ en: "Subject", es: "Asunto", fr: "Objet", zh: "主题" }),
    subjectPlaceholder: t({
      en: "Brief description of your inquiry",
      es: "Breve descripción de tu consulta",
      fr: "Brève description de votre demande",
      zh: "简要描述你的问题",
    }),
    message: t({ en: "Message", es: "Mensaje", fr: "Message", zh: "消息" }),
    messagePlaceholder: t({
      en: "Hi, this is my message",
      es: "Hola, este es mi mensaje",
      fr: "Bonjour, voici mon message",
      zh: "你好，这是我的消息",
    }),
    sending: t({
      en: "Sending…",
      es: "Enviando…",
      fr: "Envoi…",
      zh: "发送中…",
    }),
    send: t({
      en: "Send message",
      es: "Enviar mensaje",
      fr: "Envoyer le message",
      zh: "发送消息",
    }),
    enter: t({ en: "Enter", es: "Intro", fr: "Entrée", zh: "Enter" }),
    toSend: t({
      en: "to send",
      es: "para enviar",
      fr: "pour envoyer",
      zh: "发送",
    }),
    prefer: t({
      en: "Prefer something else? Email ",
      es: "¿Prefieres otra opción? Escribe a ",
      fr: "Vous préférez un autre moyen ? Écrivez à ",
      zh: "想用别的方式？发邮件至 ",
    }),
    dm: t({
      en: "or send a DM on X to ",
      es: "o envía un mensaje privado en X a ",
      fr: "ou envoyez un message privé sur X à ",
      zh: "或在 X 上私信 ",
    }),
  },
} satisfies Dictionary;
