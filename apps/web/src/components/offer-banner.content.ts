import { t } from "intlayer";
import type { Dictionary } from "intlayer";

export default {
  key: "offer-banner",
  content: {
    // Each offer in src/lib/offers.ts, keyed by its rule id, with a message
    // per phase. `{date}` is the day the sale starts; `{percent}` its
    // discount. The teaser names the day, not the discount. "Black Friday"
    // and "Cyber Monday" stay in English where that's usual.
    "black-friday": {
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
      sale: t({
        en: "Black Friday: {percent}% off annual plans and Pro Lifetime, through Cyber Monday",
        es: "Black Friday: {percent}% de descuento en los planes anuales y Pro De por vida, hasta el Cyber Monday",
        fr: "Black Friday : -{percent} % sur les formules annuelles et Pro À vie, jusqu’au Cyber Monday",
        zh: "黑色星期五：年付方案和 Pro 终身版享 {percent}% 折扣，持续到网络星期一",
        ko: "블랙 프라이데이: 연간 플랜과 Pro 평생 {percent}% 할인, 사이버 먼데이까지",
        ja: "ブラックフライデー：年額プランと Pro 買い切りが {percent}% オフ（サイバーマンデーまで）",
        de: "Black Friday: {percent} % Rabatt auf Jahrespläne und Pro Lifetime, bis Cyber Monday",
        pt: "Black Friday: {percent}% de desconto nos planos anuais e no Pro Vitalício, até à Cyber Monday",
        ru: "Чёрная пятница: скидка {percent}% на годовые планы и Pro Навсегда до Киберпонедельника",
      }),
      lastCall: t({
        en: "Last call: {percent}% off annual plans and Pro Lifetime, until the end of Cyber Monday (PT)",
        es: "Última oportunidad: {percent}% de descuento en los planes anuales y Pro De por vida, hasta el final del Cyber Monday (PT)",
        fr: "Dernière chance : -{percent} % sur les formules annuelles et Pro À vie, jusqu’à la fin du Cyber Monday (PT)",
        zh: "最后机会：年付方案和 Pro 终身版享 {percent}% 折扣，截至网络星期一结束（太平洋时间）",
        ko: "마지막 기회: 연간 플랜과 Pro 평생 {percent}% 할인, 사이버 먼데이가 끝날 때까지(태평양 시간)",
        ja: "まもなく終了：年額プランと Pro 買い切りが {percent}% オフ（太平洋時間のサイバーマンデー終了まで）",
        de: "Letzte Chance: {percent} % Rabatt auf Jahrespläne und Pro Lifetime, bis Ende Cyber Monday (PT)",
        pt: "Última oportunidade: {percent}% de desconto nos planos anuais e no Pro Vitalício, até ao fim da Cyber Monday (PT)",
        ru: "Последний шанс: скидка {percent}% на годовые планы и Pro Навсегда до конца Киберпонедельника (PT)",
      }),
    },
    cta: t({
      en: "See plans",
      es: "Ver planes",
      fr: "Voir les formules",
      zh: "查看方案",
      ko: "플랜 보기",
      ja: "プランを見る",
      de: "Pläne ansehen",
      pt: "Ver planos",
      ru: "Смотреть планы",
    }),
  },
} satisfies Dictionary;
