export const BASE_PRICE_CENTS = 4900;
export const LAUNCH_PRICE_CENTS = 2900;
export const LAUNCH_LIMIT = 100;

export interface Offer {
  active: boolean;
  sold: number;
  limit: number;
}
export const PRODUCT_NAME = "MotionVideo Skill Bundle";

export const formatUsd = (cents: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);

export const PERKS = [
  "Skills for any coding agent and renderer",
  "Storyboard skills, scene starters, and motion tokens",
  "Unlimited personal and client projects",
  "Updates pushed to the same repository",
] as const;
