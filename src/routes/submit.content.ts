import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "community-submit",
  content: {
    title: t({
      en: "Share something worth discovering.",
      es: "Comparte algo que merezca descubrirse.",
      fr: "Partagez une belle découverte.",
    }),
    intro: t({
      en: "Send a motion video, a tool, a creative, an agent skill, or any other resource for our collection. Every submission is reviewed before anything is published.",
      es: "Envía un vídeo de motion, una herramienta, un creativo, una habilidad de agente o cualquier otro recurso para nuestra colección. Revisamos cada propuesta antes de publicarla.",
      fr: "Proposez une vidéo motion, un outil, un créatif, une compétence d’agent ou toute autre ressource pour notre collection. Chaque proposition est examinée avant toute publication.",
    }),
    kind: t({
      en: "What are you sharing?",
      es: "¿Qué quieres compartir?",
      fr: "Que souhaitez-vous partager ?",
    }),
    kinds: {
      video: t({
        en: "Motion video",
        es: "Vídeo de motion",
        fr: "Vidéo motion",
      }),
      tool: t({ en: "Tool", es: "Herramienta", fr: "Outil" }),
      studio: t({ en: "Creative", es: "Creativo", fr: "Créatif" }),
      skill: t({
        en: "Agent skill",
        es: "Habilidad de agente",
        fr: "Compétence d’agent",
      }),
      extra: t({
        en: "Something else",
        es: "Otra cosa",
        fr: "Autre chose",
      }),
    },
    category: t({ en: "Category", es: "Categoría", fr: "Catégorie" }),
    noCategory: t({
      en: "Not sure",
      es: "No estoy seguro",
      fr: "Je ne sais pas",
    }),
    categoryHelp: t({
      en: "Optional. Where it fits best on MotionVideo.",
      es: "Opcional. Dónde encaja mejor en MotionVideo.",
      fr: "Facultatif. Là où elle a le plus sa place sur MotionVideo.",
    }),
    name: t({
      en: "Your name / attribution",
      es: "Tu nombre / atribución",
      fr: "Votre nom / attribution",
    }),
    signedInAs: t({
      en: "Submitting as",
      es: "Envías como",
      fr: "Vous proposez en tant que",
    }),
    accountEmailHelp: t({
      en: "Your account email stays private and is only used for questions about your submission.",
      es: "El correo de tu cuenta es privado y solo se usa para preguntas sobre tu propuesta.",
      fr: "L’e-mail de votre compte reste privé et ne sert qu’aux questions sur votre proposition.",
    }),
    entryTitle: t({
      en: "Title / project name",
      es: "Título / nombre del proyecto",
      fr: "Titre / nom du projet",
    }),
    url: t({
      en: "Public HTTPS URL",
      es: "URL pública HTTPS",
      fr: "URL HTTPS publique",
    }),
    urlHelp: t({
      en: "Link to the original video, the tool’s website, or the creative’s portfolio. No private or sign-in-only links.",
      es: "Enlace al vídeo original, al sitio de la herramienta o al portafolio del creativo. Sin enlaces privados ni que requieran iniciar sesión.",
      fr: "Lien vers la vidéo originale, le site de l’outil ou le portfolio du créatif. Pas de liens privés ou nécessitant une connexion.",
    }),
    description: t({ en: "Description", es: "Descripción", fr: "Description" }),
    descriptionHelp: t({
      en: "Tell us what it is and why it belongs here (10–5,000 characters).",
      es: "Cuéntanos qué es y por qué merece estar aquí (10–5.000 caracteres).",
      fr: "Expliquez ce que c’est et pourquoi le présenter ici (10 à 5 000 caractères).",
    }),
    prompt: t({
      en: "Prompt (optional)",
      es: "Prompt (opcional)",
      fr: "Prompt (facultatif)",
    }),
    promptHelp: t({
      en: "If this video was made with AI, share the prompt you have permission to publish.",
      es: "Si este vídeo se creó con IA, comparte el prompt que tienes permiso para publicar.",
      fr: "Si cette vidéo a été créée avec l’IA, partagez le prompt que vous avez l’autorisation de publier.",
    }),
    consent: t({
      en: "I have permission to share this work. I agree that my name and submitted content, including any prompt, may be published with attribution if accepted. My email stays private.",
      es: "Tengo permiso para compartir este trabajo. Acepto que mi nombre y el contenido enviado, incluido cualquier prompt, puedan publicarse con atribución si se acepta. Mi correo permanece privado.",
      fr: "J’ai l’autorisation de partager ce travail. J’accepte que mon nom et le contenu proposé, y compris tout prompt, soient publiés avec attribution en cas d’acceptation. Mon e-mail reste privé.",
    }),
    privacy: t({
      en: "Read our privacy policy",
      es: "Lee nuestra política de privacidad",
      fr: "Lire notre politique de confidentialité",
    }),
    submit: t({
      en: "Submit for review",
      es: "Enviar para revisión",
      fr: "Proposer pour examen",
    }),
    pending: t({
      en: "Saving submission…",
      es: "Guardando propuesta…",
      fr: "Enregistrement…",
    }),
    saved: t({
      en: "Submission received.",
      es: "Propuesta recibida.",
      fr: "Proposition reçue.",
    }),
    thanks: t({
      en: "Your submission is saved and pending review. It is not public yet. Thanks for helping the collection grow.",
      es: "Tu propuesta está guardada y pendiente de revisión. Aún no es pública. Gracias por ayudar a ampliar la colección.",
      fr: "Votre proposition est enregistrée et en attente d’examen. Elle n’est pas encore publique. Merci d’enrichir la collection.",
    }),
    back: t({
      en: "Back to Discover",
      es: "Volver a Descubrir",
      fr: "Retour aux découvertes",
    }),
    errors: {
      validation: t({
        en: "Check all required fields: your name, a title, a public HTTPS website URL, a description of at least 10 characters, and your sharing consent are required.",
        es: "Revisa los campos obligatorios: tu nombre, un título, una URL web pública HTTPS, una descripción de al menos 10 caracteres y tu consentimiento para compartir.",
        fr: "Vérifiez les champs obligatoires : votre nom, un titre, une URL de site public en HTTPS, une description d’au moins 10 caractères et votre consentement au partage.",
      }),
      "rate-limit": t({
        en: "Too many requests. Please wait a minute before submitting again.",
        es: "Demasiadas solicitudes. Espera un minuto antes de volver a enviar.",
        fr: "Trop de demandes. Attendez une minute avant de réessayer.",
      }),
      storage: t({
        en: "Your submission couldn’t be saved. Your form is still here; please try again.",
        es: "No se ha podido guardar tu propuesta. El formulario sigue aquí; inténtalo de nuevo.",
        fr: "Votre proposition n’a pas pu être enregistrée. Le formulaire est conservé ; réessayez.",
      }),
      unauthorized: t({
        en: "Your session has ended. Sign in again to submit; your form is still here.",
        es: "Tu sesión ha terminado. Vuelve a iniciar sesión para enviar; el formulario sigue aquí.",
        fr: "Votre session a expiré. Reconnectez-vous pour envoyer ; le formulaire est conservé.",
      }),
    },
  },
} satisfies Dictionary;
