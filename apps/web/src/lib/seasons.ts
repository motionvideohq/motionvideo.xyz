import { useSyncExternalStore } from "react";

// Festive seasons for the header logomark (see components/logo.tsx). Every
// window recurs on its own each year: Halloween, Christmas and the national
// days sit on fixed dates, and Diwali's and Holi's dates are worked out from
// the Moon and Sun, so nothing needs a yearly update.

export type Season =
  | "diwali"
  | "halloween"
  | "christmas"
  | "holi"
  | "republic-day-india"
  | "independence-day-india"
  | "independence-day-us"
  | "thanksgiving";

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
// India Standard Time, where the festival date is reckoned: UTC+5:30.
const IST_OFFSET_MS = 5.5 * HOUR_MS;
const JD_UNIX_EPOCH = 2_440_587.5;
const SYNODIC_MONTH = 29.530588861;

const sin = (deg: number) => Math.sin((deg * Math.PI) / 180);

// Periodic terms that differ between a new moon and a full moon (Meeus, table
// 49.A): M′, M, 2M′, 2F, M′ − M, M′ + M, 2M. The rest are shared.
const NEW_MOON_TERMS = [
  -0.4072, 0.17241, 0.01608, 0.01039, 0.00739, -0.00514, 0.00208,
];
const FULL_MOON_TERMS = [
  -0.40614, 0.17302, 0.01614, 0.01043, 0.00734, -0.00515, 0.00209,
];

/**
 * Julian Ephemeris Day of the `k`th new moon after 2000-01-06 (`k` whole), or
 * of the full moon after it (`k + 0.5`) (Meeus, ch. 49).
 */
const moonPhaseJde = (k: number) => {
  const terms = Number.isInteger(k) ? NEW_MOON_TERMS : FULL_MOON_TERMS;
  const t = k / 1236.85;
  const e = 1 - 0.002516 * t - 0.0000074 * t * t;
  const m = 2.5534 + 29.1053567 * k - 0.0000014 * t * t;
  const mp = 201.5643 + 385.81693528 * k + 0.0107582 * t * t;
  const f = 160.7108 + 390.67050284 * k - 0.0016118 * t * t;
  const omega = 124.7746 - 1.56375588 * k + 0.0020672 * t * t;
  return (
    2_451_550.09766 +
    SYNODIC_MONTH * k +
    0.00015437 * t * t +
    terms[0] * sin(mp) +
    terms[1] * e * sin(m) +
    terms[2] * sin(2 * mp) +
    terms[3] * sin(2 * f) +
    terms[4] * e * sin(mp - m) +
    terms[5] * e * sin(mp + m) +
    terms[6] * e * e * sin(2 * m) -
    0.00111 * sin(mp - 2 * f) -
    0.00057 * sin(mp + 2 * f) +
    0.00056 * e * sin(2 * mp + m) -
    0.00042 * sin(3 * mp) +
    0.00042 * e * sin(m + 2 * f) +
    0.00038 * e * sin(m - 2 * f) -
    0.00024 * e * sin(2 * mp - m) -
    0.00017 * sin(omega)
  );
};

/** The Sun's sidereal (Lahiri) longitude in degrees at Julian Day `jd` (Meeus, ch. 25). */
const sunSiderealLongitude = (jd: number) => {
  const t = (jd - 2_451_545) / 36_525;
  const l0 = 280.46646 + 36_000.76983 * t;
  const m = 357.52911 + 35_999.05029 * t;
  const center =
    (1.914602 - 0.004817 * t) * sin(m) +
    0.019993 * sin(2 * m) +
    0.000289 * sin(3 * m);
  const apparent = l0 + center - 0.00569 - 0.00478 * sin(125.04 - 1934.136 * t);
  // Lahiri ayanamsa: 23.853° at J2000, precessing 1.397° a century.
  const ayanamsa = 23.853 + 1.397 * t;
  return (((apparent - ayanamsa) % 360) + 360) % 360;
};

/**
 * Index (for `moonPhaseJde`) of the new moon of `year`, searched from
 * `fraction` of the way into it, with the Sun's sidereal longitude in
 * [`from`, `to`): the one that opens a given lunar month.
 */
const newMoonWithSunIn = (
  year: number,
  fraction: number,
  from: number,
  to: number
) => {
  const start = Math.floor((year + fraction - 2000) * 12.3685);
  for (let k = start; k < start + 3; k += 1) {
    const longitude = sunSiderealLongitude(moonPhaseJde(k));
    if (longitude >= from && longitude < to) {
      return k;
    }
  }
  return start;
};

/** The date in India (as a UTC-midnight timestamp) `hours` after Julian Day `jd`. */
const istDate = (jd: number, hours: number) =>
  Math.floor(
    ((jd - JD_UNIX_EPOCH) * DAY_MS + IST_OFFSET_MS + hours * HOUR_MS) / DAY_MS
  ) * DAY_MS;

/**
 * Diwali (Lakshmi Puja) of `year`, as a UTC-midnight timestamp of its date in
 * India. It falls on the new moon (Amavasya) that ends the month of Ashvin:
 * the new moon while the Sun is in sidereal Libra (Tula), before it enters
 * Scorpio. The puja is held on the evening the Amavasya tithi (roughly the
 * day before the exact new moon) covers, hence the step back.
 */
export const diwaliDate = (year: number) =>
  istDate(moonPhaseJde(newMoonWithSunIn(year, 0.78, 180, 210)), -19);

/**
 * Holi (Rangwali Holi) of `year`, as a UTC-midnight timestamp of its date in
 * India: the day after Holika Dahan, which is lit on the full moon (Purnima)
 * of Phalguna, the lunar month opened by the new moon while the Sun is in
 * sidereal Aquarius (Kumbha). Holika Dahan takes the evening the Purnima
 * tithi covers, so a full moon after about 16:45 IST moves Holi on a day;
 * that cut-off is fitted to the published dates for 2018–2030.
 */
export const holiDate = (year: number) =>
  istDate(moonPhaseJde(newMoonWithSunIn(year, 0.05, 300, 330) + 0.5), 7.25);

// National days, on the day itself (`month` from 0, as `Date` counts).
const NATIONAL_DAYS = [
  { month: 0, day: 26, season: "republic-day-india" },
  { month: 6, day: 4, season: "independence-day-us" },
  { month: 7, day: 15, season: "independence-day-india" },
] as const satisfies readonly { month: number; day: number; season: Season }[];

/** Local midnight on the calendar day of a UTC-midnight `timestamp`, shifted by `days`. */
const localDay = (timestamp: number, days: number) => {
  const date = new Date(timestamp);
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + days
  ).getTime();
};

/**
 * Thanksgiving (US) of `year`: its day of November, the fourth Thursday.
 * November 1 falls on weekday `first`, so its first Thursday is 1–7.
 */
export const thanksgivingDay = (year: number) => {
  const first = new Date(Date.UTC(year, 10, 1)).getUTCDay();
  return 1 + ((4 - first + 7) % 7) + 21;
};

/** The season at `now`, in the visitor's local time, or `null` outside them all. */
export const getSeason = (now: Date): Season | null => {
  const time = now.getTime();
  const year = now.getFullYear();
  const diwali = diwaliDate(year);
  // Dhanteras (two days before) through Bhai Dooj (two days after).
  if (time >= localDay(diwali, -2) && time < localDay(diwali, 3)) {
    return "diwali";
  }
  const holi = holiDate(year);
  // Holika Dahan (the evening before) through Holi.
  if (time >= localDay(holi, -1) && time < localDay(holi, 1)) {
    return "holi";
  }
  const month = now.getMonth();
  const day = now.getDate();
  // October 20 to November 1.
  if ((month === 9 && day >= 20) || (month === 10 && day === 1)) {
    return "halloween";
  }
  // Thanksgiving through the weekend, which can run into December.
  const thanksgiving = thanksgivingDay(year);
  if (
    time >= new Date(year, 10, thanksgiving).getTime() &&
    time < new Date(year, 10, thanksgiving + 4).getTime()
  ) {
    return "thanksgiving";
  }
  // December 15 to New Year's Day.
  if ((month === 11 && day >= 15) || (month === 0 && day === 1)) {
    return "christmas";
  }
  return (
    NATIONAL_DAYS.find((date) => date.month === month && date.day === day)
      ?.season ?? null
  );
};

const subscribe = () => () => {
  /* The season is read once per page load; nothing to unsubscribe from. */
};
const getClientSnapshot = () => getSeason(new Date());
const getServerSnapshot = () => null;

/**
 * The current season. `null` during the server render (it cannot know the
 * visitor's date), so the plain mark hydrates and the festive one swaps in.
 */
export const useSeason = () =>
  useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
