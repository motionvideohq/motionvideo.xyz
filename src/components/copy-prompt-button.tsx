import { useIntlayer } from "react-intlayer";

import { CopyIcon } from "@/components/copy-icon";
import { Button } from "@/components/ui/button";
import { useTransientStatus } from "@/hooks/use-transient-status";
import { track } from "@/lib/analytics";
import type { AnalyticsProps } from "@/lib/analytics";

/**
 * Copies a prompt, with a Copied / failed label. Tracked as `prompt_copy`;
 * `analytics.from` says where (customize, template, blog…).
 */
export const CopyPromptButton = ({
  text,
  analytics,
}: {
  text: string;
  analytics: AnalyticsProps & { from: string };
}) => {
  const content = useIntlayer("copy-prompt-button");
  const [status, flash] = useTransientStatus<"idle" | "copied" | "failed">(
    "idle"
  );
  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            track("prompt_copy", analytics);
            flash("copied");
          } catch {
            flash("failed");
          }
        }}
      >
        <CopyIcon copied={status === "copied"} />
        {status === "copied" ? content.copied : content.copy}
      </Button>
      <output className="text-muted-foreground text-xs empty:hidden">
        {status === "failed" && content.copyError}
      </output>
    </div>
  );
};
