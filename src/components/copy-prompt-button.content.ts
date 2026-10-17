import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "copy-prompt-button",
  content: {
    copy: t({
      en: "Copy prompt",
      es: "Copiar instrucción",
      fr: "Copier l’instruction",
      zh: "复制提示词",
      ko: "프롬프트 복사",
      ja: "プロンプトをコピー",
      de: "Prompt kopieren",
      pt: "Copiar prompt",
      ru: "Скопировать промпт",
    }),
    copied: t({
      en: "Copied",
      es: "Copiada",
      fr: "Copiée",
      zh: "已复制",
      ko: "복사됨",
      ja: "コピーしました",
      de: "Kopiert",
      pt: "Copiado",
      ru: "Скопировано",
    }),
    copyError: t({
      en: "Couldn’t copy. Select the text and copy it manually.",
      es: "No se pudo copiar. Selecciona el texto y cópialo manualmente.",
      fr: "Copie impossible. Sélectionnez le texte et copiez-le manuellement.",
      zh: "无法复制。请选中文本后手动复制。",
      ko: "복사하지 못했습니다. 텍스트를 선택해 직접 복사하세요.",
      ja: "コピーできませんでした。テキストを選択して手動でコピーしてください。",
      de: "Kopieren fehlgeschlagen. Markiere den Text und kopiere ihn manuell.",
      pt: "Não foi possível copiar. Seleciona o texto e copia-o manualmente.",
      ru: "Не удалось скопировать. Выделите текст и скопируйте его вручную.",
    }),
  },
} satisfies Dictionary;
