import type { VariantProps } from "class-variance-authority";
import { animate } from "motion";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { Bookmark } from "reicon-react/icons/Bookmark";

import { useSignInDialog } from "@/components/sign-in-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TooltipHandle } from "@/components/ui/tooltip";
import { track } from "@/lib/analytics";
import { useSession } from "@/lib/auth-client";
import { flyBookmarkToMenu } from "@/lib/bookmark-fly";
import { bookmarkKey } from "@/lib/bookmark-items";
import type { BookmarkKind } from "@/lib/bookmark-items";
import { toggleBookmark, useBookmarks } from "@/lib/bookmarks";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/registry/ui/button";

type ButtonVariants = VariantProps<typeof buttonVariants>;

/**
 * Saving squashes and stretches the icon as it fills, like a ribbon tugged
 * down (anchored at its bottom edge). Skipped under reduced motion.
 */
const popIcon = (icon: SVGSVGElement | null) => {
  if (!icon || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  icon.style.transformOrigin = "50% 100%";
  try {
    animate(
      icon,
      {
        scaleY: [1, 1.3, 0.9, 1.05, 1],
        scaleX: [1, 0.9, 1.1, 0.95, 1],
      },
      { duration: 0.6, ease: "easeOut" }
    );
  } catch {
    // WAAPI unavailable: the bookmark still toggled.
  }
};

/**
 * Saves a video or directory entry to the signed-in user's bookmarks (optimistically). Signed
 * out, it opens the sign-in dialog instead.
 */
export const BookmarkButton = ({
  kind,
  id,
  variant = "outline",
  size = "icon",
  className,
  style,
  tooltip,
  inDialog = false,
}: {
  kind: BookmarkKind;
  /** Video slug or directory entry id. */
  id: string;
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  className?: string;
  style?: CSSProperties;
  /** A tooltip shared with neighbouring buttons; else it gets its own. */
  tooltip?: TooltipHandle<ReactNode>;
  /**
   * Inside a full-screen dialog (the video detail view): no tooltip, and
   * saving doesn't fly to the account menu, which the dialog covers.
   */
  inDialog?: boolean;
}) => {
  const content = useIntlayer("bookmark-button");
  const session = useSession();
  const signInDialog = useSignInDialog();
  const { keys } = useBookmarks();
  const signedIn = Boolean(session.data);
  const saved = signedIn && keys.has(bookmarkKey(kind, id));
  const label = saved ? content.remove.value : content.add.value;

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    // Cards wrap their actions in links and hover triggers.
    event.preventDefault();
    event.stopPropagation();
    if (session.isPending) {
      return;
    }
    if (signedIn) {
      // Only saving flies somewhere: removing has no destination.
      if (!saved) {
        if (!inDialog) {
          flyBookmarkToMenu(event.currentTarget);
        }
        popIcon(event.currentTarget.querySelector("svg"));
      }
      track("bookmark_toggle", { kind, id, saved: !saved });
      void toggleBookmark(kind, id);
    } else {
      signInDialog.open(content.signInReason.value);
    }
  };

  if (inDialog) {
    return (
      <button
        type="button"
        aria-label={label}
        aria-pressed={saved}
        onClick={onClick}
        className={cn(buttonVariants({ variant, size }), className)}
        style={style}
      >
        <Bookmark aria-hidden="true" weight={saved ? "Filled" : "Outline"} />
      </button>
    );
  }
  const trigger = (
    <TooltipTrigger
      delay={200}
      handle={tooltip}
      // Its label changes on click (Copied, Remove bookmark…): stay open.
      closeOnClick={false}
      payload={label}
      render={<button type="button" aria-label={label} aria-pressed={saved} />}
      onClick={onClick}
      className={cn(buttonVariants({ variant, size }), className)}
      style={style}
    >
      <Bookmark aria-hidden="true" weight={saved ? "Filled" : "Outline"} />
    </TooltipTrigger>
  );
  if (tooltip) {
    return trigger;
  }
  return (
    <Tooltip>
      {trigger}
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
};
