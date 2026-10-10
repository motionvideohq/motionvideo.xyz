import { useIntlayer } from "react-intlayer";
import { Check } from "reicon-react/icons/Check";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ReiconDuotone } from "@/components/ui/reicon-duotone";
import {
  BASE_PRICE_CENTS,
  formatUsd,
  LAUNCH_LIMIT,
  LAUNCH_PRICE_CENTS,
} from "@/constants/pricing";
import type { Offer } from "@/constants/pricing";

const launchTicks = Array.from({ length: LAUNCH_LIMIT }, (_, index) => index);
const tickViewBox = `0 0 ${LAUNCH_LIMIT * 4 - 1} 20`;

export const BuyButton = ({ offer }: { offer: Offer }) => {
  const content = useIntlayer("pricing");
  return (
    <div className="flex flex-wrap items-center gap-4">
      <a
        href="/checkout"
        className={buttonVariants({ size: "lg", variant: "gradient" })}
      >
        <span>
          {content.buyNow}{" "}
          {formatUsd(offer.active ? LAUNCH_PRICE_CENTS : BASE_PRICE_CENTS)}
        </span>
      </a>
      <span className="text-muted-foreground text-sm">
        {content.oneTimePurchase}
      </span>
    </div>
  );
};

export const PriceCard = ({ offer }: { offer: Offer }) => {
  const content = useIntlayer("pricing");
  const remaining = Math.max(0, offer.limit - offer.sold);
  return (
    <Card size="lg" className="mx-auto w-full max-w-sm">
      <CardHeader>
        <div className="flex flex-col gap-3">
          {offer.active && (
            <span className="text-xs font-semibold tracking-widest uppercase">
              {content.launchOffer}
            </span>
          )}
          <p className="flex flex-wrap items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight">
              {formatUsd(offer.active ? LAUNCH_PRICE_CENTS : BASE_PRICE_CENTS)}
            </span>
            {offer.active && (
              <del className="text-muted-foreground text-lg">
                {formatUsd(BASE_PRICE_CENTS)}
              </del>
            )}
            <span className="text-muted-foreground text-sm">
              {content.oneTime}
            </span>
          </p>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {offer.active && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="text-muted-foreground inline-flex items-center gap-1.5 font-semibold">
                <span aria-hidden className="relative flex size-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-green-600 opacity-75 motion-reduce:animate-none dark:bg-green-400" />
                  <span className="relative size-1.5 rounded-full bg-green-600 dark:bg-green-400" />
                </span>
                {content.live}
              </span>
              <span className="tabular-nums">
                <span className="text-foreground font-medium">{remaining}</span>{" "}
                <span className="text-muted-foreground">{content.left}</span>
              </span>
            </div>
            <progress
              className="sr-only"
              aria-label={content.spotsRemaining.value}
              value={remaining}
              max={offer.limit}
            />
            <svg
              aria-hidden
              className="h-5 w-full"
              viewBox={tickViewBox}
              preserveAspectRatio="none"
            >
              {launchTicks.map((tick) => (
                <rect
                  key={tick}
                  x={tick * 4}
                  y="0"
                  width="3"
                  height="20"
                  rx="0.5"
                  className={tick >= offer.sold ? "fill-primary" : "fill-muted"}
                />
              ))}
            </svg>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {content.offerEnds}
            </p>
          </div>
        )}
        <ul className="flex flex-col gap-3 text-sm">
          {content.perks.map((perk) => (
            <li key={perk.value} className="flex gap-2">
              <ReiconDuotone
                icon={Check}
                aria-hidden
                className="text-primary mt-0.5 size-4 shrink-0"
              />
              {perk}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="border-t-0 bg-transparent pt-0">
        <a
          href="/checkout"
          className={buttonVariants({
            className: "w-full",
            size: "cta",
            variant: "gradient",
          })}
        >
          <span>
            {content.buyNow}{" "}
            {formatUsd(offer.active ? LAUNCH_PRICE_CENTS : BASE_PRICE_CENTS)}
          </span>
        </a>
      </CardFooter>
    </Card>
  );
};
