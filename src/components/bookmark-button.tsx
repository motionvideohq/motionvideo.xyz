import { Tooltip } from "@base-ui/react/tooltip";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import type { CSSProperties, MouseEvent, ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { Bookmark } from "reicon-react/icons/Bookmark";

import { useSignInDialog } from "@/components/sign-in-dialog";
import { buttonVariants } from "@/components/ui/button";
import { ReiconDuotone } from "@/components/ui/reicon-duotone";
import { useSession } from "@/lib/auth-client";
import { toggleBookmark, useBookmarks } from "@/lib/bookmarks";

type ButtonVariants = VariantProps<typeof buttonVariants>;

/**
 * Saves a video to the signed-in user's bookmarks (optimistically). Signed
 * out, it opens the sign-in dialog instead. Pass `tooltip` to act as a
 * detached trigger of a shared `MotionTooltip`.
 */
export const BookmarkButton = ({
  slug,
  variant = "outline",
  size = "icon",
  tooltip,
  className,
  style,
}: {
  slug: string;
  variant?: ButtonVariants["variant"];
  size?: ButtonVariants["size"];
  tooltip?: Tooltip.Handle<ReactNode>;
  className?: string;
  style?: CSSProperties;
}) => {
  const content = useIntlayer("bookmark-button");
  const session = useSession();
  const signInDialog = useSignInDialog();
  const { slugs } = useBookmarks();
  const signedIn = Boolean(session.data);
  const saved = signedIn && slugs.has(slug);
  const label = saved ? content.remove.value : content.add.value;

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    // Cards wrap their actions in links and hover triggers.
    event.preventDefault();
    event.stopPropagation();
    if (session.isPending) {
      return;
    }
    if (signedIn) {
      void toggleBookmark(slug);
    } else {
      signInDialog.open(content.signInReason.value);
    }
  };

  const buttonProps = {
    "aria-label": label,
    "aria-pressed": saved,
    onClick,
    className: cn(buttonVariants({ variant, size }), className),
    style,
    children: (
      <ReiconDuotone
        icon={Bookmark}
        filled={saved}
        secondaryColor={saved ? "var(--primary)" : undefined}
        aria-hidden="true"
      />
    ),
  } as const;

  return tooltip ? (
    <Tooltip.Trigger
      type="button"
      handle={tooltip}
      payload={label}
      delay={200}
      {...buttonProps}
    />
  ) : (
    <button type="button" {...buttonProps} />
  );
};
