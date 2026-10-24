// Whole-dollar prices drop the cents ($79, not $79.00); others keep them ($9.50).
export const formatUsd = (cents: number): string =>
  new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    style: "currency",
  }).format(cents / 100);

/** Percent saved by paying yearly instead of twelve monthly payments. */
export const annualSavingsPercent = (
  monthlyCents: number,
  annualCents: number
): number => Math.round((1 - annualCents / (monthlyCents * 12)) * 100);
