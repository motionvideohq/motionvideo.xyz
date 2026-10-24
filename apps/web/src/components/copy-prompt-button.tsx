import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";

import { CopyIcon } from "@/components/copy-icon";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TooltipHandle } from "@/components/ui/tooltip";
import { useTransientStatus } from "@/hooks/use-transient-status";
import { track } from "@/lib/analytics";
import type { AnalyticsProps } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/**
 * Icon button that copies a prompt, labelled by its tooltip (Copy prompt,
 * then Copied). Tracked as `prompt_copy` with `analytics` (`from`: card,
 * customize…).
 */
export const CopyPromptButton = ({
  prompt,
  analytics,
  size = "icon",
  className,
  tooltip,
}: {
  prompt: string;
  analytics: AnalyticsProps & { from: string };
  size?: "icon" | "icon-sm";
  className?: string;
  /** A tooltip shared with neighbouring buttons; else it gets its own. */
  tooltip?: TooltipHandle<ReactNode>;
}) => {
  const content = useIntlayer("motion-gallery");
  const [copyStatus, flashCopyStatus] = useTransientStatus<"idle" | "copied">(
    "idle"
  );
  const copied = copyStatus === "copied";
  const label = copied ? content.copied.value : content.copy.value;
  const trigger = (
    <TooltipTrigger
      delay={200}
      handle={tooltip}
      // Its label changes on click (Copied, Remove bookmark…): stay open.
      closeOnClick={false}
      payload={label}
      render={<button type="button" aria-label={label} />}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(prompt);
          track("prompt_copy", analytics);
          flashCopyStatus("copied");
        } catch {
          // Clipboard failures are rare (permissions); keep this control quiet.
        }
      }}
      className={cn(buttonVariants({ size, variant: "outline" }), className)}
    >
      <CopyIcon copied={copied} />
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
