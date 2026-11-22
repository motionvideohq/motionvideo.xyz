import type { ReactNode } from "react";
import { useIntlayer, useLocale } from "react-intlayer";
import { TickCircle } from "reicon-react/icons/TickCircle";
import { TextMorph } from "torph/react";

import { LocalizedLink as Link } from "@/components/localized-link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { localizedPath } from "@/constants/locales";
import {
  PLAN_BILLINGS,
  PLAN_PRICE_CENTS,
  PLANS,
  planPrice,
} from "@/constants/plans";
import type {
  LocalPrices,
  Plan,
  PlanAccess,
  PlanBilling,
} from "@/constants/plans";
import { formatPrice } from "@/constants/pricing";
import { ROUTES } from "@/constants/routes";
import { flagOf } from "@/lib/country";
import { fillTemplate } from "@/lib/motion-video-route";
import { offerCovers } from "@/lib/offers";
import type { SaleOffer } from "@/lib/offers";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/registry/ui/button";

/**
 * Monthly | Annual | Lifetime as tabs that render links setting `?billing=`,
 * so the URL stays the source of truth: each tab is a shareable URL and works
 * before hydration. Monthly is the bare /pro.
 */
export const BillingToggle = ({ billing }: { billing: PlanBilling }) => {
  const content = useIntlayer("pricing");
  let note: ReactNode = null;
  if (billing === "annual") {
    note = content.annualNote;
  } else if (billing === "lifetime") {
    note = content.lifetimeNote;
  }
  return (
    <div className="flex flex-col items-center gap-3 sm:relative sm:block">
      <Tabs value={billing}>
        <TabsList
          size="lg"
          aria-label={content.billingPeriod.value}
          className="w-80"
        >
          {PLAN_BILLINGS.map((option) => (
            <TabsTrigger
              key={option}
              value={option}
              nativeButton={false}
              render={
                <Link
                  to={ROUTES.PRO}
                  search={{
                    billing: option === "monthly" ? undefined : option,
                  }}
                  replace
                  resetScroll={false}
                  // Monthly's `billing: undefined` would otherwise match
                  // every billing.
                  activeOptions={{ explicitUndefined: true }}
                />
              }
            >
              {content.billing[option]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {/* From sm up the note hangs off the toggle's right edge, so the toggle
          itself stays centred; on mobile it sits below it. */}
      {note && (
        <span className="text-primary text-sm font-medium whitespace-nowrap sm:absolute sm:top-1/2 sm:left-full sm:ml-3 sm:-translate-y-1/2">
          {note}
        </span>
      )}
    </div>
  );
};

// Prices and units morph between billing options instead of swapping:
// numbers roll by place value, words cross-fade letter by letter.
const MORPH = {
  duration: 400,
  ease: "cubic-bezier(0.19, 1, 0.22, 1)",
} as const;

/** A card's ticked list of what the plan includes. */
const PerkList = ({ perks }: { perks: Record<string, ReactNode> }) => (
  <ul className="flex flex-col gap-3 text-sm">
    {Object.entries(perks).map(([key, perk]) => (
      <li key={key} className="flex gap-2">
        <TickCircle
          aria-hidden="true"
          className="text-primary mt-0.5 size-4 shrink-0"
        />
        <span>{perk}</span>
      </li>
    ))}
  </ul>
);

const PlanCard = ({
  plan,
  billing,
  access,
  sale,
  prices,
}: {
  plan: Plan;
  billing: PlanBilling;
  access: PlanAccess | null;
  sale: SaleOffer | null;
  prices: LocalPrices | null;
}) => {
  const content = useIntlayer("pricing");
  const { locale } = useLocale();
  const copy = content.plans[plan];
  // Business has no lifetime option: its card stays visible but dimmed, at
  // its monthly price, so the two plans can still be compared.
  const offered = PLAN_PRICE_CENTS[plan][billing] !== undefined;
  const shown = offered ? billing : "monthly";
  const current = access?.plan === plan;
  const featured = plan === "pro";
  // What the visitor's country pays, from Dodo's checkout previews, or the
  // USD list price when Dodo priced nothing. Those amounts already carry
  // Dodo's purchasing power parity, so only a sale comes off them.
  const { cents: listCents, currency } = planPrice(prices, plan, shown);
  // The price it brings at checkout, with the list price struck through
  // beside it: the sale's on the plans it covers (a sale skips countries that
  // already get a regional price, src/server/visitor-pricing.ts).
  const onSale = offered && sale !== null && offerCovers(sale, plan, billing);
  const percentOff = onSale && sale ? sale.percentOff : 0;
  const priceCents = Math.round((listCents * (100 - percentOff)) / 100);
  let cta = (
    <Button size="xl" variant="secondary" disabled className="w-full">
      {copy.cta}
    </Button>
  );
  if (current) {
    cta = (
      <Link
        to={ROUTES.DASHBOARD_BILLING}
        className={buttonVariants({
          className: "w-full",
          size: "xl",
          variant: "outline",
        })}
      >
        {content.currentPlan}
      </Link>
    );
  } else if (offered) {
    cta = (
      <a
        href={`${localizedPath(ROUTES.CHECKOUT, locale)}?plan=${plan}&billing=${billing}`}
        data-track="checkout_start"
        data-track-plan={plan}
        data-track-billing={billing}
        className={buttonVariants({
          className: "w-full",
          size: "xl",
          variant: featured ? "gradient" : "secondary",
        })}
      >
        {copy.cta}
      </a>
    );
  }

  return (
    <Card
      size="lg"
      aria-disabled={offered ? undefined : true}
      className={cn(
        "w-full",
        featured && "ring-primary ring-2",
        !offered && "opacity-60"
      )}
    >
      <CardHeader>
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">{copy.name}</h2>
          <div className="flex flex-col gap-1">
            <p className="flex items-baseline gap-1.5">
              {percentOff > 0 && (
                <s className="text-muted-foreground text-xl font-medium tabular-nums">
                  {formatPrice(listCents, currency, locale)}
                </s>
              )}
              <TextMorph
                as="span"
                numbers
                {...MORPH}
                className="text-4xl font-semibold tracking-tight tabular-nums"
              >
                {formatPrice(priceCents, currency, locale)}
              </TextMorph>
              <TextMorph
                as="span"
                {...MORPH}
                className="text-muted-foreground text-sm"
              >
                {content.unit[shown].value}
              </TextMorph>
            </p>
            <p className="text-muted-foreground text-sm">
              {offered ? content.billed[billing] : content.monthlyOrAnnualOnly}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <PerkList perks={content.perks[plan]} />
      </CardContent>
      <CardFooter className="border-t-0 bg-transparent pt-0">{cta}</CardFooter>
    </Card>
  );
};

/** The free tier: what anyone gets without a plan, at zero. */
const FreeCard = ({
  billing,
  currency,
  signedIn,
}: {
  billing: PlanBilling;
  currency: string;
  signedIn: boolean;
}) => {
  const content = useIntlayer("pricing");
  const { locale } = useLocale();
  return (
    <Card size="lg" className="w-full">
      <CardHeader>
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">{content.free.name}</h2>
          <div className="flex flex-col gap-1">
            <p className="flex items-baseline gap-1.5">
              <span className="text-4xl font-semibold tracking-tight tabular-nums">
                {formatPrice(0, currency, locale)}
              </span>
              {/* "$0 once" would read oddly, so lifetime's unit morphs away. */}
              <TextMorph
                as="span"
                {...MORPH}
                className="text-muted-foreground text-sm"
              >
                {billing === "lifetime" ? "" : content.unit[billing].value}
              </TextMorph>
            </p>
            <p className="text-muted-foreground text-sm">{content.free.note}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <PerkList perks={content.perks.free} />
      </CardContent>
      <CardFooter className="border-t-0 bg-transparent pt-0">
        <Link
          to={signedIn ? ROUTES.HOME : ROUTES.SIGN_IN}
          data-track={signedIn ? undefined : "free_join"}
          className={buttonVariants({
            className: "w-full",
            size: "xl",
            variant: "secondary",
          })}
        >
          {signedIn ? content.free.browse : content.free.join}
        </Link>
      </CardFooter>
    </Card>
  );
};

/** Free, Pro and Business side by side (stacked on mobile). */
export const PlanCards = ({
  billing,
  access,
  signedIn,
  sale,
  prices,
}: {
  billing: PlanBilling;
  access: PlanAccess | null;
  signedIn: boolean;
  sale: SaleOffer | null;
  prices: LocalPrices | null;
}) => (
  <ul className="grid w-full gap-4 md:grid-cols-3">
    <li className="flex">
      <FreeCard
        billing={billing}
        currency={prices?.currency ?? "USD"}
        signedIn={signedIn}
      />
    </li>
    {PLANS.map((plan) => (
      <li key={plan} className="flex">
        <PlanCard
          plan={plan}
          billing={billing}
          access={access}
          sale={sale}
          prices={prices}
        />
      </li>
    ))}
  </ul>
);

/** "Black Friday: 30% off for new customers, applied at checkout. …" */
export const SaleNote = ({ sale }: { sale: SaleOffer }) => {
  const content = useIntlayer("pricing");
  return (
    <p className="bg-muted text-muted-foreground rounded-full px-4 py-1.5 text-center text-sm text-pretty">
      {fillTemplate(content.sale.value, {
        name: sale.name,
        percent: String(sale.percentOff),
      })}
    </p>
  );
};

/**
 * Under the cards when they price the visitor's country: "🇮🇳 Regional pricing
 * for India · Taxes are added at checkout where they apply."
 */
export const LocalPriceNote = ({ prices }: { prices: LocalPrices }) => {
  const content = useIntlayer("pricing");
  const { locale } = useLocale();
  const country =
    new Intl.DisplayNames([locale], { type: "region" }).of(prices.country) ??
    prices.country;
  return (
    <p className="bg-muted text-muted-foreground flex flex-wrap items-center justify-center gap-x-1.5 rounded-full px-4 py-1.5 text-center text-sm text-pretty">
      <span className="text-foreground inline-flex items-center gap-1.5 font-medium">
        <span aria-hidden="true">{flagOf(prices.country)}</span>
        {fillTemplate(content.regionalPricing.value, { country })}
      </span>
      <span aria-hidden="true">·</span>
      {content.taxesAtCheckout}
    </p>
  );
};
