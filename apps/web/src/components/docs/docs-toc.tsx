import { TOCItem } from "fumadocs-core/toc";
import type { TOCItemType } from "fumadocs-core/toc";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { ChevronDown } from "reicon-react/icons/ChevronDown";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// Headings of the page, active one (scroll-spy from fumadocs-core's
// AnchorProvider, set up by the article) marked by `data-active`.
const TocList = ({ toc }: { toc: TOCItemType[] }) => (
  <ol className="border-border flex flex-col border-l text-sm">
    {toc.map((item) => (
      <li key={item.url}>
        <TOCItem
          href={item.url}
          className={cn(
            "text-muted-foreground hover:text-foreground data-[active=true]:text-foreground data-[active=true]:border-foreground -ml-px block border-l border-transparent py-1 leading-5 transition-colors",
            item.depth > 2 ? "pl-6" : "pl-3"
          )}
        >
          {item.title}
        </TOCItem>
      </li>
    ))}
  </ol>
);

/** "On this page" in the right-hand column (xl and up). */
export const DocsToc = ({ toc }: { toc: TOCItemType[] }) => {
  const content = useIntlayer("docs-layout");
  return (
    <nav
      aria-label={content.onThisPage.value}
      className="flex min-h-0 flex-col gap-3"
    >
      <p className="shrink-0 text-sm font-medium">{content.onThisPage}</p>
      {/* Only the headings scroll, without a scrollbar; the title above and
          the page actions below stay put. */}
      <div className="no-scrollbar min-h-0 overflow-y-auto">
        <TocList toc={toc} />
      </div>
    </nav>
  );
};

/**
 * "On this page" folded above the content below xl: the headings (if any)
 * and the page actions, whose submenus open inline in the card.
 */
export const DocsTocCollapsible = ({
  toc,
  actions,
}: {
  toc: TOCItemType[];
  actions: ReactNode;
}) => {
  const content = useIntlayer("docs-layout");
  return (
    <Collapsible className="bg-card shadow-outline rounded-xl print:hidden">
      <CollapsibleTrigger className="focus-visible:ring-ring flex w-full items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus-visible:ring-2">
        {content.onThisPage}
        <ChevronDown
          aria-hidden="true"
          className="text-muted-foreground size-4 transition-transform in-aria-expanded:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-3 px-4 pb-3">
          {toc.length > 0 ? (
            <nav aria-label={content.onThisPage.value}>
              <TocList toc={toc} />
            </nav>
          ) : null}
          <div className={cn(toc.length > 0 && "border-t pt-2")}>{actions}</div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
