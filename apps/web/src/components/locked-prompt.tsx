import type { ReactNode } from "react";
import { useIntlayer, useLocale } from "react-intlayer";
import { Lock } from "reicon-react/icons/Lock";

import { LocalizedLink as Link } from "@/components/localized-link";
import { buttonVariants } from "@/components/ui/button";
import { localizedPath } from "@/constants/locales";
import { PLAN_PRICE_CENTS } from "@/constants/plans";
import { formatUsd } from "@/constants/pricing";
import { ROUTES } from "@/constants/routes";

// Widths of the placeholder lines that stand in for the hidden prompt.
const PLACEHOLDER_LINES = ["100%", "94%", "98%", "72%", "90%", "64%"];

/**
 * In place of a Pro prompt (a move's, a template's): blurred placeholder
 * lines where the prompt would be, a lock, one line on what's locked and the
 * way to unlock it. None of the prompt is in the page. Signed-out visitors
 * may already be on Pro, so they can sign in and come back to `redirect`.
 */
export const LockedPrompt = ({
  title,
  signInReason,
  signedIn,
  redirect,
  track,
}: {
  title: ReactNode;
  signInReason: ReactNode;
  signedIn: boolean;
  /** The page to return to after signing in. */
  redirect: string;
  /** The unlock link's analytics: `data-track` plus its properties. */
  track: Record<`data-track${string}`, string>;
}) => {
  const content = useIntlayer("locked-prompt");
  const { locale } = useLocale();
  return (
    // One grid cell for both layers: the placeholder fills whatever height
    // the content needs.
    <div className="bg-muted grid overflow-hidden rounded-xl *:col-start-1 *:row-start-1">
      <div
        aria-hidden="true"
        className="flex flex-col gap-2.5 p-4 opacity-50 blur-[2px]"
      >
        {PLACEHOLDER_LINES.map((width) => (
          <span
            key={width}
            className="bg-foreground/20 h-2.5 rounded-full"
            style={{ width }}
          />
        ))}
      </div>
      <div className="from-muted via-muted/90 to-muted/60 flex flex-col items-center gap-3 bg-linear-to-t px-4 py-6 text-center">
        <span className="bg-background shadow-outline flex size-9 items-center justify-center rounded-full">
          <Lock aria-hidden="true" className="size-4" />
        </span>
        <p className="max-w-xs text-sm font-medium text-balance">{title}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          <Link
            to={ROUTES.PRO}
            {...track}
            className={buttonVariants({ variant: "gradient" })}
          >
            {content.unlock}
          </Link>
          <span className="text-muted-foreground text-sm">
            {content.priceBefore}
            {formatUsd(PLAN_PRICE_CENTS.pro.monthly ?? 0)}
            {content.priceAfter}
          </span>
        </div>
        {!signedIn && (
          <Link
            to={ROUTES.SIGN_IN}
            search={{ redirect: localizedPath(redirect, locale) }}
            className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-4 transition-colors"
          >
            {signInReason}
          </Link>
        )}
      </div>
    </div>
  );
};
