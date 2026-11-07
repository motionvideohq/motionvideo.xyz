import { useIntlayer } from "react-intlayer";
import { ChevronDown } from "reicon-react/icons/ChevronDown";

import { RssIcon } from "@/components/icons";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Feeds } from "@/lib/feeds";
import { buttonVariants } from "@/registry/ui/button";

/**
 * A section's feeds: RSS as the button, Atom and JSON Feed in its menu. Feed
 * files, not app routes, so plain links.
 */
export const FeedButtons = ({ feeds }: { feeds: Feeds }) => {
  const content = useIntlayer("feed-buttons");
  const { rss, atom, json } = feeds.formats;
  return (
    <ButtonGroup>
      <a
        href={rss.path}
        type={rss.type}
        data-slot="button"
        className={buttonVariants({ variant: "secondary" })}
      >
        <RssIcon data-icon="inline-start" />
        {rss.name}
      </a>
      <ButtonGroupSeparator />
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={content.moreFormats.value}
          className={buttonVariants({ variant: "secondary", size: "icon" })}
        >
          <ChevronDown aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {[atom, json].map((feed) => (
            <DropdownMenuLinkItem
              key={feed.path}
              href={feed.path}
              type={feed.type}
            >
              {feed.name}
            </DropdownMenuLinkItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
};
