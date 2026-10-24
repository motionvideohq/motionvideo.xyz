import { t } from "intlayer";
import type { Dictionary } from "intlayer";

// The upgrade panel shown in place of a Pro prompt (moves, templates).
export default {
  key: "locked-prompt",
  content: {
    unlock: t({
      en: "Unlock with Pro",
      es: "Desbloquear con Pro",
      fr: "Débloquer avec Pro",
      zh: "用 Pro 解锁",
      ko: "Pro로 잠금 해제",
      ja: "Pro でロック解除",
      de: "Mit Pro freischalten",
      pt: "Desbloquear com o Pro",
      ru: "Открыть с Pro",
    }),
    // Wrapped around the monthly Pro price, e.g. "From $9/mo".
    priceBefore: t({
      en: "From ",
      es: "Desde ",
      fr: "À partir de ",
      zh: "每月 ",
      ko: "월 ",
      ja: "月額 ",
      de: "Ab ",
      pt: "Desde ",
      ru: "От ",
    }),
    priceAfter: t({
      en: "/mo",
      es: "/mes",
      fr: "/mois",
      zh: " 起",
      ko: "부터",
      ja: " から",
      de: "/Monat",
      pt: "/mês",
      ru: "/мес.",
    }),
  },
} satisfies Dictionary;
