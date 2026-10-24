import { useRef } from "react";
import type { ComponentProps } from "react";
import { useIntlayer } from "react-intlayer";

import { CopyIcon } from "@/components/copy-icon";
import { Button } from "@/components/ui/button";
import { useTransientStatus } from "@/hooks/use-transient-status";
import { cn } from "@/lib/utils";

type CopyStatus = "idle" | "copied" | "failed";

const CopyButton = ({
  getText,
  className,
}: {
  getText: () => string;
  className?: string;
}) => {
  const content = useIntlayer("docs-layout");
  const [status, flash] = useTransientStatus<CopyStatus>("idle");
  const labels: Record<CopyStatus, string> = {
    idle: content.copy.value,
    copied: content.copied.value,
    failed: content.copyFailed.value,
  };
  return (
    <Button
      aria-label={labels[status]}
      title={labels[status]}
      size="icon-sm"
      variant="ghost"
      className={cn("text-muted-foreground", className)}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(getText());
          flash("copied");
        } catch {
          flash("failed");
        }
      }}
    >
      <CopyIcon copied={status === "copied"} className="[&>svg]:size-3.5" />
    </Button>
  );
};

// Fenced code from MDX, highlighted at build time by Shiki (rehypeCode) with
// light and dark colours as CSS variables (`defaultColor: false`). The
// optional ```lang title="…" meta becomes `title`, shown as a caption.
export const CodeBlock = ({
  title,
  className,
  children,
  ...props
}: ComponentProps<"pre">) => {
  const pre = useRef<HTMLPreElement>(null);
  const getText = () => pre.current?.textContent ?? "";
  return (
    <figure className="bg-muted/50 shadow-outline relative overflow-hidden rounded-xl">
      {title ? (
        <figcaption className="text-muted-foreground flex items-center justify-between gap-2 border-b py-1 pr-1.5 pl-4 font-mono text-xs">
          <span className="truncate">{title}</span>
          <CopyButton getText={getText} />
        </figcaption>
      ) : (
        <CopyButton
          getText={getText}
          className="bg-muted/80 absolute top-2 right-2 backdrop-blur-sm"
        />
      )}
      <pre
        ref={pre}
        className={cn(
          className,
          "text-foreground overflow-x-auto py-3.5 pl-4 font-mono text-[0.8125rem] leading-6 outline-none",
          title ? "pr-4" : "pr-12",
          "[&_span]:text-(--shiki-light) dark:[&_span]:text-(--shiki-dark)",
          "[&>code]:rounded-none [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-[length:inherit]"
        )}
        {...props}
      >
        {children}
      </pre>
    </figure>
  );
};
