import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "image-dropzone",
  content: {
    browse: t({
      en: "Browse",
      es: "Examinar",
      fr: "Parcourir",
      zh: "浏览",
      ko: "찾아보기",
    }),
    replace: t({
      en: "Replace",
      es: "Reemplazar",
      fr: "Remplacer",
      zh: "替换",
      ko: "교체",
    }),
    remove: t({
      en: "Remove",
      es: "Quitar",
      fr: "Retirer",
      zh: "移除",
      ko: "삭제",
    }),
    uploading: t({
      en: "Uploading…",
      es: "Subiendo…",
      fr: "Envoi…",
      zh: "上传中…",
      ko: "업로드 중…",
    }),
    types: t({
      en: "JPG, PNG or WebP",
      es: "JPG, PNG o WebP",
      fr: "JPG, PNG ou WebP",
      zh: "JPG、PNG 或 WebP",
      ko: "JPG, PNG 또는 WebP",
    }),
    max: t({ en: "max", es: "máx.", fr: "max.", zh: "最大", ko: "최대" }),
    errorType: t({
      en: "Use a JPG, PNG or WebP image.",
      es: "Usa una imagen JPG, PNG o WebP.",
      fr: "Utilisez une image JPG, PNG ou WebP.",
      zh: "请使用 JPG、PNG 或 WebP 图片。",
      ko: "JPG, PNG 또는 WebP 이미지를 사용하세요.",
    }),
    errorSize: t({
      en: "That file is too large.",
      es: "El archivo es demasiado grande.",
      fr: "Ce fichier est trop volumineux.",
      zh: "文件过大。",
      ko: "파일이 너무 큽니다.",
    }),
    errorUpload: t({
      en: "Upload failed. Try again.",
      es: "No se pudo subir. Inténtalo de nuevo.",
      fr: "L’envoi a échoué. Réessayez.",
      zh: "上传失败，请重试。",
      ko: "업로드에 실패했습니다. 다시 시도하세요.",
    }),
  },
} satisfies Dictionary;
