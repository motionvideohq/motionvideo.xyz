// Dodo's minor units (docs.dodopayments.com/integrations/datafast): these
// currencies carry none or three decimals, every other one two. Dodo's own
// table rather than Intl's, which disagrees on some (IQD, ISK).
const MINOR_UNIT_DIGITS = {
  BHD: 3,
  BIF: 0,
  CLP: 0,
  DJF: 0,
  GNF: 0,
  IQD: 3,
  JOD: 3,
  JPY: 0,
  KMF: 0,
  KRW: 0,
  KWD: 3,
  LYD: 3,
  MGA: 0,
  OMR: 3,
  PYG: 0,
  RWF: 0,
  TND: 3,
  UGX: 0,
  VND: 0,
  VUV: 0,
  XAF: 0,
  XOF: 0,
  XPF: 0,
} as const satisfies Record<string, 0 | 3>;

/** Decimals in a Dodo amount: 2 for USD and EUR, 0 for JPY, 3 for KWD. */
const minorUnitDigits = (currency: string): number => {
  if (!Object.hasOwn(MINOR_UNIT_DIGITS, currency)) {
    return 2;
  }
  // SAFETY: `hasOwn` just confirmed `currency` is one of the table's keys.
  return MINOR_UNIT_DIGITS[currency as keyof typeof MINOR_UNIT_DIGITS];
};

/**
 * A price in a currency's minor units: `$9`, `₹749`, `9,99 €`. Whole amounts
 * drop the decimals (`$79`, not `$79.00`); others keep as many as the
 * currency uses. US dollars always read as `$9`, as they did before prices
 * were localized; other currencies follow the page's language with their
 * local symbol (`749 ₹`, never `749 INR`), since the visitor is in the
 * country that uses it.
 */
export const formatPrice = (
  cents: number,
  currency: string,
  locale: string
): string => {
  const digits = minorUnitDigits(currency);
  const step = 10 ** digits;
  const fractionDigits = cents % step === 0 ? 0 : digits;
  const usd = currency === "USD";
  return new Intl.NumberFormat(usd ? "en-US" : locale, {
    currency,
    currencyDisplay: usd ? "symbol" : "narrowSymbol",
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
    style: "currency",
  }).format(cents / step);
};

/** US dollars: the list prices and the pages that can't be localized. */
export const formatUsd = (cents: number): string =>
  formatPrice(cents, "USD", "en-US");

/**
 * A price in a currency's minor units as a plain decimal, for anything that
 * can't take a formatted string (structured data): `(7900, "USD")` → `"79.00"`,
 * `(7874, "JPY")` → `"7874"`.
 */
export const decimalPrice = (cents: number, currency: string): string => {
  const digits = minorUnitDigits(currency);
  return (cents / 10 ** digits).toFixed(digits);
};

/** Percent saved by paying yearly instead of twelve monthly payments. */
export const annualSavingsPercent = (
  monthlyCents: number,
  annualCents: number
): number => Math.round((1 - annualCents / (monthlyCents * 12)) * 100);
