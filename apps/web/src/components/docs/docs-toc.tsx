import { TOCItem } from "fumadocs-core/toc";
import type { TOCItemType } from "fumadocs-core/toc";
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

/** Right-hand "On this page" column (xl and up). */
export const DocsToc = ({ toc }: { toc: TOCItemType[] }) => {
  const content = useIntlayer("docs-layout");
  return (
    <nav aria-label={content.onThisPage.value} className="flex flex-col gap-3">
      <p className="text-sm font-medium">{content.onThisPage}</p>
      <TocList toc={toc} />
    </nav>
  );
};

/** "On this page" folded above the content below xl. */
export const DocsTocCollapsible = ({ toc }: { toc: TOCItemType[] }) => {
  const content = useIntlayer("docs-layout");
  return (
    <Collapsible className="bg-card shadow-outline rounded-xl">
      <CollapsibleTrigger className="focus-visible:ring-ring flex w-full items-center justify-between gap-2 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus-visible:ring-2">
        {content.onThisPage}
        <ChevronDown
          aria-hidden="true"
          className="text-muted-foreground size-4 transition-transform in-aria-expanded:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <nav aria-label={content.onThisPage.value} className="px-4 pb-3">
          <TocList toc={toc} />
        </nav>
      </CollapsibleContent>
    </Collapsible>
  );
};
