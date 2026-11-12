import translations from "@/data/prompt-translations.json";

import type { MotionVideo } from "./motion-catalog";

// English translations of gallery prompts written in another language
// (src/data/prompt-translations.json, by slug). English visitors get the
// translation; every other locale keeps the creator's original, since
// prompts aren't translated into those languages.

/** Languages a translated prompt was originally written in, in their own script. */
export const LANGUAGE_NAMES = {
  ar: "العربية",
  cs: "Čeština",
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  ja: "日本語",
  ko: "한국어",
  pt: "Português",
  tr: "Türkçe",
  zh: "中文",
} as const;
export type PromptLanguage = keyof typeof LANGUAGE_NAMES;

interface PromptTranslation {
  from: PromptLanguage;
  en: string;
}

// SAFETY: the JSON maps slugs to `{ from, en }`; `from` is always a
// PromptLanguage, which JSON imports widen to `string`.
const TRANSLATIONS = translations as Record<string, PromptTranslation>;

export interface ShownPrompt {
  text: string;
  /** Set when `text` is a translation: the original's language. */
  translatedFrom?: PromptLanguage;
}

/** The prompt to show `locale` for a video, if it has one. */
export const promptFor = (
  video: Pick<MotionVideo, "slug" | "prompt">,
  locale: string
): ShownPrompt | undefined => {
  if (!video.prompt) {
    return undefined;
  }
  const translation = TRANSLATIONS[video.slug];
  if (locale === "en" && translation) {
    return { text: translation.en, translatedFrom: translation.from };
  }
  return { text: video.prompt };
};
