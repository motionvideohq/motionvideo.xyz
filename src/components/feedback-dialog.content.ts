import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "feedback-dialog",
  content: {
    trigger: t({ en: "Feedback", es: "Comentarios", fr: "Avis", zh: "反馈" }),
    title: t({
      en: "Share feedback",
      es: "Envía tus comentarios",
      fr: "Donnez votre avis",
      zh: "分享反馈",
    }),
    description: t({
      en: "What works, what’s missing, what broke. Every message is read.",
      es: "Qué funciona, qué falta, qué se rompió. Leemos cada mensaje.",
      fr: "Ce qui marche, ce qui manque, ce qui casse. Chaque message est lu.",
      zh: "哪些好用、缺了什么、哪里出错了。每条消息我们都会阅读。",
    }),
    moodLabel: t({
      en: "How is MotionVideo so far?",
      es: "¿Qué te parece MotionVideo hasta ahora?",
      fr: "Que pensez-vous de MotionVideo jusqu’ici ?",
      zh: "目前觉得 MotionVideo 怎么样？",
    }),
    moods: {
      love: t({ en: "Love it", es: "Me encanta", fr: "J’adore", zh: "很喜欢" }),
      okay: t({ en: "It’s okay", es: "Está bien", fr: "Pas mal", zh: "还行" }),
      bad: t({
        en: "Not great",
        es: "No me convence",
        fr: "Bof",
        zh: "不太好",
      }),
    },
    message: t({
      en: "Your feedback",
      es: "Tus comentarios",
      fr: "Votre avis",
      zh: "你的反馈",
    }),
    messagePlaceholder: t({
      en: "Tell us anything: an idea, a bug, a video we should add…",
      es: "Cuéntanos lo que quieras: una idea, un error, un vídeo que deberíamos añadir…",
      fr: "Dites-nous tout : une idée, un bug, une vidéo à ajouter…",
      zh: "随便说：一个想法、一个 bug、一个我们该收录的视频…",
    }),
    email: t({
      en: "Email (optional, if you’d like a reply)",
      es: "Correo (opcional, si quieres respuesta)",
      fr: "E-mail (facultatif, pour recevoir une réponse)",
      zh: "邮箱（可选，如需回复）",
    }),
    emailPlaceholder: t({
      en: "you@example.com",
      es: "tu@ejemplo.com",
      fr: "vous@exemple.com",
      zh: "you@example.com",
    }),
    signedInAs: t({
      en: "We’ll reply to your account email if needed.",
      es: "Te responderemos al correo de tu cuenta si hace falta.",
      fr: "Nous répondrons à l’e-mail de votre compte si besoin.",
      zh: "如有需要，我们会回复到你的账号邮箱。",
    }),
    send: t({
      en: "Send feedback",
      es: "Enviar",
      fr: "Envoyer",
      zh: "发送反馈",
    }),
    sending: t({
      en: "Sending…",
      es: "Enviando…",
      fr: "Envoi…",
      zh: "发送中…",
    }),
    enter: t({ en: "Enter", es: "Intro", fr: "Entrée", zh: "Enter" }),
    toSend: t({
      en: "to send",
      es: "para enviar",
      fr: "pour envoyer",
      zh: "发送",
    }),
    validationError: t({
      en: "Write a few words, and check the email address if you added one.",
      es: "Escribe unas palabras y revisa el correo si lo añadiste.",
      fr: "Écrivez quelques mots et vérifiez l’e-mail si vous en avez saisi un.",
      zh: "请写几句话，如填写了邮箱请检查是否正确。",
    }),
    rateLimitError: t({
      en: "Too many messages. Try again in a minute.",
      es: "Demasiados mensajes. Inténtalo de nuevo en un minuto.",
      fr: "Trop de messages. Réessayez dans une minute.",
      zh: "消息过多，请一分钟后再试。",
    }),
    sendError: t({
      en: "Couldn’t send that. Please try again.",
      es: "No se pudo enviar. Inténtalo de nuevo.",
      fr: "Envoi impossible. Veuillez réessayer.",
      zh: "发送失败，请重试。",
    }),
    thanksTitle: t({
      en: "Thanks for the feedback",
      es: "Gracias por tus comentarios",
      fr: "Merci pour votre avis",
      zh: "感谢你的反馈",
    }),
    thanksBody: t({
      en: "It’s in. It helps decide what gets built next.",
      es: "Recibido. Nos ayuda a decidir qué construir después.",
      fr: "C’est reçu. Cela aide à décider de la suite.",
      zh: "已收到。它会帮助我们决定接下来做什么。",
    }),
    done: t({ en: "Done", es: "Listo", fr: "Terminé", zh: "完成" }),
  },
} satisfies Dictionary;
