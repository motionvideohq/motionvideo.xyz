import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { Lock } from "reicon-react/icons/Lock";

import { buttonVariants } from "@/components/ui/button";
import { PLAN_PRICE_CENTS } from "@/constants/plans";
import { formatUsd } from "@/constants/pricing";
import { ROUTES } from "@/constants/routes";

/**
 * In place of a Pro prompt (a move's, a template's): what Pro unlocks and
 * how much, without any of the prompt in the page. Signed-out visitors may
 * already be on Pro, so they can sign in and come back to `redirect`.
 */
export const LockedPrompt = ({
  title,
  body,
  signInReason,
  signedIn,
  redirect,
  track,
}: {
  title: ReactNode;
  body: ReactNode;
  signInReason: ReactNode;
  signedIn: boolean;
  /** The page to return to after signing in. */
  redirect: string;
  /** The unlock link's analytics: `data-track` plus its properties. */
  track: Record<`data-track${string}`, string>;
}) => {
  const content = useIntlayer("locked-prompt");
  return (
    <div className="bg-muted flex flex-col items-start gap-3 rounded-xl p-4">
      <span className="flex items-center gap-2 text-sm font-medium text-pretty">
        <Lock aria-hidden="true" className="size-4 shrink-0" />
        {title}
      </span>
      <p className="text-muted-foreground text-sm text-pretty">{body}</p>
      <div className="flex flex-wrap items-center gap-3">
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
          search={{ redirect }}
          className="text-muted-foreground hover:text-foreground text-xs underline underline-offset-4 transition-colors"
        >
          {signInReason}
        </Link>
      )}
    </div>
  );
};
