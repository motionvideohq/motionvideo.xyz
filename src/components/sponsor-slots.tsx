import { Tooltip } from "@base-ui/react/tooltip";
import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";

import { MotionTooltip } from "@/components/ui/motion-tooltip";
import { ROUTES } from "@/constants/routes";
import { HEADER_SPONSOR_SLOTS, SPONSORS } from "@/constants/sponsors";
import { withUtm } from "@/lib/utm";

const TOOLTIP_DELAY = 200;
const slotClass =
  "focus-visible:ring-ring/50 flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[10px] outline-none focus-visible:ring-3";

/**
 * The header's Diamond placements: each sponsor's square mark, then dashed
 * "+" slots for the free places, which lead to /sponsor. All slots share one
 * MotionTooltip, so moving between them glides a single bubble.
 */
export const SponsorSlots = () => {
  const content = useIntlayer("site-header");
  const tooltip = useMemo(() => Tooltip.createHandle<ReactNode>(), []);
  const diamond = SPONSORS.filter(
    (sponsor) => sponsor.tier === "diamond"
  ).slice(0, HEADER_SPONSOR_SLOTS);
  const open = HEADER_SPONSOR_SLOTS - diamond.length;
  return (
    <div className="flex items-center gap-2">
      {diamond.map((sponsor) => (
        <Tooltip.Trigger
          key={sponsor.name}
          handle={tooltip}
          payload={`${sponsor.name} · ${content.sponsored.value}`}
          delay={TOOLTIP_DELAY}
          render={
            <a
              href={withUtm(sponsor.url, "header")}
              target="_blank"
              rel="sponsored noopener"
              aria-label={`${sponsor.name} (${content.sponsored.value})`}
            />
          }
          className={slotClass}
        >
          <img
            src={sponsor.logo}
            alt=""
            width={32}
            height={32}
            className="size-full object-cover"
          />
        </Tooltip.Trigger>
      ))}
      {Array.from({ length: open }, (_, index) => (
        <Tooltip.Trigger
          key={`open-${index}`}
          handle={tooltip}
          payload={content.sponsorSlot.value}
          delay={TOOLTIP_DELAY}
          render={
            <Link to={ROUTES.SPONSOR} aria-label={content.sponsorSlot.value} />
          }
          className={`${slotClass} text-muted-foreground hover:text-foreground border border-dashed border-current/40 transition-colors hover:border-current/70`}
        >
          {/* A thin drawn "+", like an empty app-icon slot. */}
          <span aria-hidden="true" className="relative size-3.5">
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
            <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current" />
          </span>
        </Tooltip.Trigger>
      ))}
      <MotionTooltip handle={tooltip} side="bottom" />
    </div>
  );
};
