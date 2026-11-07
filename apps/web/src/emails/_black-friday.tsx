import { PLAN_PRICE_CENTS } from "../constants/plans";
import { formatUsd } from "../constants/pricing";
import { ROUTES } from "../constants/routes";
import { SITE } from "../constants/site";
import { SITE_ORIGIN } from "../constants/url";
import { upcomingOffers } from "../lib/offers";
import { InlineLink, Item, List, Paragraph } from "./_layout";

// Shared by the Black Friday email drafts (black-friday-*.tsx), one per send:
//   teaser     Wednesday before the sale: it's coming, when, not how much
//   launch     the sale's first day (Monday)
//   reminder   Black Friday itself
//   last-call  Cyber Monday, the last day
// Drafts only: the app never sends them. Preview with `pnpm email:dev`, then
// send each as a Resend Broadcast to the "MotionVideo users" segment.
// `{{{FIRST_NAME|there}}}` and `{{{RESEND_UNSUBSCRIBE_URL}}}` are filled in
// by Resend per Contact. Dates and prices come from src/lib/offers.ts: this
// year's run, or next year's once this year's is over.

const offer = upcomingOffers(Date.now()).find(
  (candidate) => candidate.rule === "black-friday"
);
if (!offer) {
  throw new Error("No Black Friday offer in src/lib/offers.ts");
}
export const BLACK_FRIDAY = offer;

const pacific = { timeZone: "America/Los_Angeles" } as const;

/** "Monday, November 23": the day the sale starts, Pacific time. */
export const START_DAY = new Intl.DateTimeFormat("en-US", {
  ...pacific,
  day: "numeric",
  month: "long",
  weekday: "long",
}).format(offer.startsAt);
/** "November 30": Cyber Monday, the sale's last day (it ends at midnight after). */
export const LAST_DAY = new Intl.DateTimeFormat("en-US", {
  ...pacific,
  day: "numeric",
  month: "long",
}).format(offer.endsAt - 1);

/** The plans page on annual, tagged with the email it came from. */
export const plansUrl = (email: string) =>
  `${SITE_ORIGIN}${ROUTES.PRO}?billing=annual&utm_source=email&utm_medium=email&utm_campaign=black-friday-${email}`;

const salePrice = (cents: number) =>
  formatUsd(Math.round((cents * (100 - offer.percentOff)) / 100));

/** "$55.30": Pro annual at the sale price, for the button. */
export const PRO_ANNUAL_SALE_PRICE = salePrice(
  PLAN_PRICE_CENTS.pro.annual ?? 0
);

// "$55.30 instead of $79": reads right in the plain-text version too, where
// the strikethrough is lost.
const Price = ({ cents }: { cents: number }) => (
  <>
    <strong>{salePrice(cents)}</strong> instead of <s>{formatUsd(cents)}</s>
  </>
);

/** Each plan the sale covers, the sale price beside the struck list price. */
export const SalePrices = () => (
  <List>
    <Item>
      Pro, annual: <Price cents={PLAN_PRICE_CENTS.pro.annual ?? 0} /> for the
      first year
    </Item>
    <Item>
      Pro, lifetime: <Price cents={PLAN_PRICE_CENTS.pro.lifetime ?? 0} />, paid
      once
    </Item>
    <Item>
      Business, annual (3 seats):{" "}
      <Price cents={PLAN_PRICE_CENTS.business.annual ?? 0} /> for the first year
    </Item>
  </List>
);

/** What Pro unlocks, in short. */
export const ProIncludes = () => (
  <List>
    <Item>
      Every move in the{" "}
      <InlineLink href={`${SITE_ORIGIN}${ROUTES.MOVES}`}>
        Moves library
      </InlineLink>
      , with its copy-ready prompt
    </Item>
    <Item>
      Every{" "}
      <InlineLink href={`${SITE_ORIGIN}${ROUTES.TEMPLATES}`}>
        prompt template
      </InlineLink>
      , with its full prompt and the customizer
    </Item>
    <Item>
      The Pro agent skill and Pro MCP tools for Claude Code, Cursor and other
      agents
    </Item>
    <Item>Every future update, free</Item>
  </List>
);

/** How the discount applies, and who it skips. */
export const FinePrint = () => (
  <Paragraph>
    The discount is applied for you at checkout, for new customers. Annual plans
    renew at the regular price after the first year. In countries where we
    already lower prices for purchasing power, that price applies instead, and
    it’s usually lower still. Already on {SITE.NAME} Pro? Thank you; this one is
    for newcomers.
  </Paragraph>
);

export const SignOff = () => (
  <>
    <Paragraph>Questions? Just reply, it comes straight to me.</Paragraph>
    <Paragraph>— Aniket</Paragraph>
  </>
);
