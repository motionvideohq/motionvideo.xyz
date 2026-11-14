import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "offer-banner",
  content: {
    // Each offer in src/lib/offers.ts, keyed by its rule id. `{date}` is the
    // day the sale starts; `{percent}` its discount. The teaser names the
    // day, not the discount. `deal` is the full offer (wide screens),
    // `dealShort` the gist (phones). "Black Friday" stays in English where
    // that's usual.
    "black-friday": {
      name: t({
        en: "Black Friday",
        es: "Black Friday",
        fr: "Black Friday",
        zh: "黑色星期五",
        ko: "블랙 프라이데이",
        ja: "ブラックフライデー",
        de: "Black Friday",
        pt: "Black Friday",
        ru: "Чёрная пятница",
      }),
      teaser: t({
        en: "Black Friday week starts {date}: our one sale of the year on Pro and Business",
        es: "La semana del Black Friday empieza el {date}: nuestra única oferta del año en Pro y Business",
        fr: "La semaine du Black Friday commence le {date} : notre seule promo de l’année sur Pro et Business",
        zh: "黑色星期五周将于{date}开始：Pro 和 Business 一年仅此一次的优惠",
        ko: "블랙 프라이데이 주간이 {date}에 시작됩니다: 1년에 한 번뿐인 Pro·Business 할인",
        ja: "ブラックフライデー週間は{date}スタート：Pro と Business の年に一度のセール",
        de: "Die Black-Friday-Woche beginnt am {date}: unser einziger Sale des Jahres für Pro und Business",
        pt: "A semana da Black Friday começa a {date}: a nossa única promoção do ano no Pro e no Business",
        ru: "Неделя Чёрной пятницы начнётся {date}: наша единственная распродажа Pro и Business в году",
      }),
      deal: t({
        en: "{percent}% off Pro annual and lifetime, plus Business annual",
        es: "{percent}% de descuento en Pro anual y De por vida, y en Business anual",
        fr: "-{percent} % sur Pro annuel et À vie, et sur Business annuel",
        zh: "Pro 年付和终身版、Business 年付享 {percent}% 折扣",
        ko: "Pro 연간·평생, Business 연간 {percent}% 할인",
        ja: "Pro 年額・買い切りと Business 年額が {percent}% オフ",
        de: "{percent} % Rabatt auf Pro jährlich und Lifetime sowie Business jährlich",
        pt: "{percent}% de desconto no Pro anual e Vitalício, e no Business anual",
        ru: "Скидка {percent}% на Pro на год и навсегда, а также на Business на год",
      }),
      dealShort: t({
        en: "{percent}% off Pro",
        es: "-{percent}% en Pro",
        fr: "-{percent} % sur Pro",
        zh: "Pro {percent}% 折扣",
        ko: "Pro {percent}% 할인",
        ja: "Pro {percent}% オフ",
        de: "{percent} % auf Pro",
        pt: "-{percent}% no Pro",
        ru: "−{percent}% на Pro",
      }),
    },
    /** In place of the offer's name in its last days. */
    lastChance: t({
      en: "Last chance",
      es: "Última oportunidad",
      fr: "Dernière chance",
      zh: "最后机会",
      ko: "마지막 기회",
      ja: "まもなく終了",
      de: "Letzte Chance",
      pt: "Última oportunidade",
      ru: "Последний шанс",
    }),
    endsIn: t({
      en: "Ends in",
      es: "Termina en",
      fr: "Se termine dans",
      zh: "距结束",
      ko: "종료까지",
      ja: "終了まで",
      de: "Endet in",
      pt: "Termina em",
      ru: "До конца",
    }),
    /** `{time}`: "3d 10h". */
    left: t({
      en: "{time} left",
      es: "Quedan {time}",
      fr: "Encore {time}",
      zh: "剩余 {time}",
      ko: "{time} 남음",
      ja: "残り {time}",
      de: "Noch {time}",
      pt: "Faltam {time}",
      ru: "Осталось {time}",
    }),
    cta: t({
      en: "Claim {percent}%",
      es: "Obtener el {percent}%",
      fr: "Profiter des -{percent} %",
      zh: "立享 {percent}% 折扣",
      ko: "{percent}% 할인 받기",
      ja: "{percent}% オフで購入",
      de: "{percent} % sichern",
      pt: "Garantir {percent}%",
      ru: "Получить −{percent}%",
    }),
  },
} satisfies Dictionary;
