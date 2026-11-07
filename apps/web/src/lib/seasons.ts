import { useSyncExternalStore } from "react";

// Festive seasons for the header logomark (see components/logo.tsx). Every
// window recurs on its own each year: Halloween and Christmas sit on fixed
// dates, and Diwali's date is worked out from the Moon and Sun, so nothing
// needs a yearly update.

export type Season = "diwali" | "halloween" | "christmas";

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;
// India Standard Time, where the festival date is reckoned: UTC+5:30.
const IST_OFFSET_MS = 5.5 * HOUR_MS;
const JD_UNIX_EPOCH = 2_440_587.5;
const SYNODIC_MONTH = 29.530588861;

const sin = (deg: number) => Math.sin((deg * Math.PI) / 180);

/** Julian Ephemeris Day of the `k`th new moon after 2000-01-06 (Meeus, ch. 49). */
const newMoonJde = (k: number) => {
  const t = k / 1236.85;
  const e = 1 - 0.002516 * t - 0.0000074 * t * t;
  const m = 2.5534 + 29.1053567 * k - 0.0000014 * t * t;
  const mp = 201.5643 + 385.81693528 * k + 0.0107582 * t * t;
  const f = 160.7108 + 390.67050284 * k - 0.0016118 * t * t;
  const omega = 124.7746 - 1.56375588 * k + 0.0020672 * t * t;
  return (
    2_451_550.09766 +
    SYNODIC_MONTH * k +
    0.00015437 * t * t -
    0.4072 * sin(mp) +
    0.17241 * e * sin(m) +
    0.01608 * sin(2 * mp) +
    0.01039 * sin(2 * f) +
    0.00739 * e * sin(mp - m) -
    0.00514 * e * sin(mp + m) +
    0.00208 * e * e * sin(2 * m) -
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
 * Diwali (Lakshmi Puja) of `year`, as a UTC-midnight timestamp of its date in
 * India. It falls on the new moon (Amavasya) that ends the month of Ashvin:
 * the last new moon while the Sun is still in sidereal Libra (Tula), before
 * it enters Scorpio. The puja is held on the evening the Amavasya tithi
 * (roughly the day before the exact new moon) covers, hence the step back.
 */
export const diwaliDate = (year: number) => {
  // A lunation index a little before the earliest possible date (Oct 15).
  const start = Math.floor((year + 0.78 - 2000) * 12.3685);
  let date = 0;
  for (let k = start; k < start + 3; k += 1) {
    const jd = newMoonJde(k);
    const longitude = sunSiderealLongitude(jd);
    if (longitude >= 180 && longitude < 210) {
      const ist = (jd - JD_UNIX_EPOCH) * DAY_MS + IST_OFFSET_MS - 19 * HOUR_MS;
      date = Math.floor(ist / DAY_MS) * DAY_MS;
    }
  }
  return date;
};

/** Local midnight on the calendar day of a UTC-midnight `timestamp`, shifted by `days`. */
const localDay = (timestamp: number, days: number) => {
  const date = new Date(timestamp);
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + days
  ).getTime();
};

/** The season at `now`, in the visitor's local time, or `null` outside them all. */
export const getSeason = (now: Date): Season | null => {
  const diwali = diwaliDate(now.getFullYear());
  // Dhanteras (two days before) through Bhai Dooj (two days after).
  if (
    now.getTime() >= localDay(diwali, -2) &&
    now.getTime() < localDay(diwali, 3)
  ) {
    return "diwali";
  }
  const month = now.getMonth();
  const day = now.getDate();
  // October 20 to November 1.
  if ((month === 9 && day >= 20) || (month === 10 && day === 1)) {
    return "halloween";
  }
  // December 15 to New Year's Day.
  if ((month === 11 && day >= 15) || (month === 0 && day === 1)) {
    return "christmas";
  }
  return null;
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
