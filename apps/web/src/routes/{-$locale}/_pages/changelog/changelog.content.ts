import { t } from "intlayer";
import type { Dictionary } from "intlayer";

import { SITE } from "@/constants/site";

export default {
  key: "changelog",
  content: {
    intro: t({
      en: `New features, pages and videos on ${SITE.NAME}, newest first.`,
      es: `Nuevas funciones, páginas y videos en ${SITE.NAME}, de lo más reciente a lo más antiguo.`,
      fr: `Nouvelles fonctionnalités, pages et vidéos sur ${SITE.NAME}, des plus récentes aux plus anciennes.`,
      zh: `${SITE.NAME} 的新功能、新页面和新视频，按时间倒序排列。`,
      ko: `${SITE.NAME}의 새 기능, 페이지, 영상을 최신순으로 정리했습니다.`,
      ja: `${SITE.NAME}の新機能、新しいページや動画を新しい順に掲載しています。`,
      de: `Neue Funktionen, Seiten und Videos auf ${SITE.NAME}, das Neueste zuerst.`,
      pt: `Novas funcionalidades, páginas e vídeos no ${SITE.NAME}, do mais recente para o mais antigo.`,
      ru: `Новые функции, страницы и видео на ${SITE.NAME}: сначала самые свежие.`,
    }),
    // Entries are written in English only; said once on translated pages so
    // the switch of language isn't a surprise.
    englishOnly: t({
      en: "Updates are written in English.",
      es: "Las novedades están escritas en inglés.",
      fr: "Les mises à jour sont rédigées en anglais.",
      zh: "更新内容以英文撰写。",
      ko: "업데이트 내용은 영어로 작성됩니다.",
      ja: "更新内容は英語で書かれています。",
      de: "Die Updates sind auf Englisch verfasst.",
      pt: "As atualizações estão escritas em inglês.",
      ru: "Обновления публикуются на английском языке.",
    }),
    allUpdates: t({
      en: "All updates",
      es: "Todas las novedades",
      fr: "Toutes les mises à jour",
      zh: "全部更新",
      ko: "모든 업데이트",
      ja: "すべての更新",
      de: "Alle Updates",
      pt: "Todas as atualizações",
      ru: "Все обновления",
    }),
  },
} satisfies Dictionary;
