import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "steps",
  content: {
    steps: [
      t({
        en: "Accept the GitHub invite and copy the skills folder into your project",
        es: "Acepta la invitación de GitHub y copia la carpeta de habilidades en tu proyecto",
        fr: "Acceptez l’invitation GitHub et copiez le dossier de compétences dans votre projet",
        zh: "接受 GitHub 邀请，并将 skills 文件夹复制到你的项目中",
      }),
      t({
        en: "Describe the piece, like “a 20s intro reel: name reveal, three project cards, calm exit”",
        es: "Describe la pieza, como «una intro de 20 s: aparición del nombre, tres tarjetas de proyectos y un cierre tranquilo»",
        fr: "Décrivez la création, par exemple «une intro de 20 s : apparition du nom, trois cartes de projets, une sortie calme»",
        zh: "描述你想要的作品，比如“一段 20 秒的片头：名字亮相、三张项目卡片、平静收尾”",
      }),
      t({
        en: "Your agent storyboards the beats and timing before writing any scene code",
        es: "Tu agente prepara el guion gráfico de los momentos y las duraciones antes de escribir el código de las escenas",
        fr: "Votre agent prépare le storyboard des temps forts et des durées avant d’écrire le code des scènes",
        zh: "智能体会先规划节拍和时间分镜，再编写场景代码",
      }),
      t({
        en: "It animates each scene with your fonts, colors, and components, then renders locally",
        es: "Anima cada escena con tus fuentes, colores y componentes, y después renderiza localmente",
        fr: "Il anime chaque scène avec vos polices, couleurs et composants, puis effectue le rendu localement",
        zh: "它用你的字体、颜色和组件为每个场景制作动画，然后在本地渲染",
      }),
      t({
        en: "Ask for tweaks in plain words, like “hold the logo longer”, and render again",
        es: "Pide ajustes con palabras sencillas, como «mantén el logo más tiempo», y vuelve a renderizar",
        fr: "Demandez des ajustements en mots simples, comme «gardez le logo plus longtemps», puis relancez le rendu",
        zh: "用平实的语言提出修改，比如“让 Logo 多停留一会儿”，然后重新渲染",
      }),
    ],
  },
} satisfies Dictionary;
