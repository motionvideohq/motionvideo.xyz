import { t } from 'intlayer';
import type { Dictionary } from 'intlayer';
import { SITE } from "@/constants/site";

export default {
  key: "landing",
  content: {
    heroStart: t({ en: "Motion design,", es: "Diseño de movimiento,", fr: "Le motion design," }),
    heroEnd: t({ en: "written in code.", es: "escrito en código.", fr: "écrit en code." }),
    agents: t({ en: "Works with any agent", es: "Funciona con cualquier agente", fr: "Compatible avec tout agent" }),
    stack: t({ en: "Works with any stack", es: "Funciona con cualquier entorno", fr: "Compatible avec toute stack" }),
    intro: t({ en: "Agent skills that teach your coding agent real motion design: timing, easing, and choreography. Showreels, intros, and launch films, rendered from a prompt.", es: "Habilidades que enseñan a tu agente de programación verdadero diseño de movimiento: duración, aceleración y coreografía. Reels, intros y vídeos de lanzamiento renderizados a partir de una instrucción.", fr: "Des compétences qui enseignent à votre agent de programmation le vrai motion design : durée, accélération et chorégraphie. Bandes démo, intros et films de lancement, rendus à partir d’une instruction." }),
    pricing: t({ en: "See pricing", es: "Ver precios", fr: "Voir les tarifs" }),
    oneTime: t({ en: "One-time purchase", es: "Compra única", fr: "Achat unique" }),
    timeline: t({ en: "Motion design without a timeline.", es: "Diseño de movimiento sin línea de tiempo.", fr: "Le motion design sans timeline." }),
    judgment: t({ en: "Good motion is mostly judgment: how long to hold, when things overlap, which easing makes a move feel intentional. That judgment usually lives in keyframe tools and years of practice.", es: "El buen movimiento depende sobre todo del criterio: cuánto mantener una escena, cuándo se superponen los elementos y qué aceleración da intención al movimiento. Ese criterio suele vivir en herramientas de fotogramas clave y años de práctica.", fr: "Un bon mouvement repose surtout sur le jugement : la durée des pauses, les chevauchements et les courbes d’accélération qui rendent le geste intentionnel. Ce jugement se trouve généralement dans les outils d’images clés et des années de pratique." }),
    code: t({ en: `${SITE.NAME} writes it down for your agent. It storyboards the beats, then animates type, shapes, and your own components in code, so every frame is reviewable and every change is a re-render away.`, es: `${SITE.NAME} lo documenta para tu agente. Prepara el guion gráfico y anima tipografía, formas y tus propios componentes en código, para que puedas revisar cada fotograma y aplicar cada cambio con un nuevo renderizado.`, fr: `${SITE.NAME} le consigne pour votre agent. Il prépare le storyboard, puis anime la typographie, les formes et vos composants en code, pour que chaque image soit vérifiable et chaque modification accessible par un nouveau rendu.` }),
    showreel: t({ en: "Portfolio showreel", es: "Reel de portafolio", fr: "Bande démo de portfolio" }),
    showreelPrompt: t({ en: "A 15s intro reel for my portfolio", es: "Una intro de 15 s para mi portafolio", fr: "Une intro de 15 s pour mon portfolio" }),
    launchTitle: t({ en: "From showreels to launch films.", es: "De reels a vídeos de lanzamiento.", fr: "Des bandes démo aux films de lancement." }),
    launchBody: t({ en: "The same skills cover the videos that ship with a product: launch films, feature updates, and changelog clips, built from the interface you already have instead of a redraw.", es: "Las mismas habilidades cubren los vídeos que acompañan a un producto: lanzamientos, novedades de funciones y clips de cambios, creados con la interfaz que ya tienes en vez de redibujarla.", fr: "Les mêmes compétences couvrent les vidéos qui accompagnent un produit : films de lancement, nouveautés et clips de mises à jour, créés à partir de votre interface existante plutôt que redessinés." }),
    control: t({ en: "You stay in charge of the cut. Review the storyboard, ask for changes in plain words, and render again.", es: "Tú mantienes el control del montaje. Revisa el guion gráfico, pide cambios con palabras sencillas y vuelve a renderizar.", fr: "Vous gardez le contrôle du montage. Examinez le storyboard, demandez des modifications en mots simples et relancez le rendu." }),
    launchLabel: t({ en: "shadercn launch film", es: "Vídeo de lanzamiento de shadercn", fr: "Film de lancement de shadercn" }),
    launchPrompt: t({ en: "A 15s launch film for shadercn", es: "Un vídeo de lanzamiento de 15 s para shadercn", fr: "Un film de lancement de 15 s pour shadercn" }),
    how: t({ en: "How it works", es: "Cómo funciona", fr: "Comment ça marche" }),
    pack: t({ en: "What’s in the pack", es: "Qué incluye el paquete", fr: "Le contenu du pack" }),
    packIntro: t({ en: "Everything your agent needs to go from a sentence to a rendered file, without starting from a blank composition.", es: "Todo lo que tu agente necesita para pasar de una frase a un archivo renderizado, sin empezar con una composición vacía.", fr: "Tout ce dont votre agent a besoin pour passer d’une phrase à un fichier rendu, sans partir d’une composition vide." }),
    faq: t({ en: "FAQ", es: "Preguntas frecuentes", fr: "Questions fréquentes" }),
    priceTitle: t({ en: "One price. Every update.", es: "Un precio. Todas las actualizaciones.", fr: "Un prix. Toutes les mises à jour." }),
  },
} satisfies Dictionary;
