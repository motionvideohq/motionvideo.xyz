import { Dialog } from "@base-ui/react/dialog";
import { Link, useMatch, useMatches } from "@tanstack/react-router";
import type { RegisteredRouter, RouteIds } from "@tanstack/react-router";
import type { VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { useState } from "react";
import { useIntlayer } from "react-intlayer";
import { ArrowRightUp } from "reicon-react/icons/ArrowRightUp";
import { ChevronDown } from "reicon-react/icons/ChevronDown";
import { Menu } from "reicon-react/icons/Menu";
import { Xmark } from "reicon-react/icons/Xmark";

import { AccountMenu } from "@/components/account-avatar";
import { Brand } from "@/components/brand";
import { CommandMenu } from "@/components/command-menu";
import { SponsorSlots } from "@/components/sponsor-slots";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReiconDuotone } from "@/components/ui/reicon-duotone";
import { ROUTES } from "@/constants/routes";

const linkClass =
  "text-muted-foreground hover:text-foreground [&[aria-current=page]]:text-foreground focus-visible:ring-ring rounded-md px-2 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2";
const mobileLinkClass =
  "text-muted-foreground hover:text-foreground [&[aria-current=page]]:text-foreground focus-visible:ring-ring rounded-md py-2 text-3xl font-semibold tracking-tight transition-colors outline-none focus-visible:ring-2";
const roundIconClass =
  "bg-secondary text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex size-9 items-center justify-center rounded-full transition-colors outline-none hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] focus-visible:ring-3";

const SkillLink = ({
  variant,
  size,
  onClick,
}: Pick<VariantProps<typeof buttonVariants>, "variant" | "size"> & {
  onClick?: () => void;
}) => {
  const content = useIntlayer("site-header");
  return (
    <Link
      to={ROUTES.MOTIONVIDEO_SKILL}
      aria-label={content.skillLabel.value}
      onClick={onClick}
      className={buttonVariants({ variant, size })}
    >
      {/* Serif type sets the skill apart from the regular nav. */}
      <span className="font-serif">
        <span className="opacity-55" aria-hidden="true">
          ~/
        </span>
        {content.skill}
      </span>
      <ReiconDuotone icon={ArrowRightUp} aria-hidden="true" />
    </Link>
  );
};

// Discover spans everything under the `_gallery` layout: `/`, the category
// pages, and the video overlays.
const DiscoverLink = ({
  className,
  onClick,
}: {
  className: string;
  onClick?: () => void;
}) => {
  const content = useIntlayer("site-header");
  const inGallery = useMatch({ from: "/_gallery", shouldThrow: false });
  return (
    <Link
      to={ROUTES.HOME}
      activeOptions={{ exact: true, includeSearch: false }}
      aria-current={inGallery ? "page" : undefined}
      onClick={onClick}
      className={className}
    >
      {content.discover}
    </Link>
  );
};

type RouteId = RouteIds<RegisteredRouter["routeTree"]>;

// Sections behind the desktop "More" menu.
const MORE_ROUTES = new Set<RouteId>(["/creatives", "/skills", "/extras"]);

// Desktop: Creatives, Skills, and Extras share one menu; the trigger reads as
// current on any of their pages.
const MoreMenu = () => {
  const content = useIntlayer("site-header");
  const current = useMatches({
    select: (matches) =>
      matches.some(({ routeId }) => MORE_ROUTES.has(routeId)),
  });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-current={current || undefined}
        className={cn(
          linkClass,
          "data-current:text-foreground data-popup-open:text-foreground flex cursor-pointer items-center gap-1"
        )}
      >
        {content.more}
        <ReiconDuotone
          icon={ChevronDown}
          aria-hidden="true"
          className="size-3.5 transition-transform in-data-popup-open:rotate-180"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        <DropdownMenuLinkItem render={<Link to={ROUTES.CREATIVES} />}>
          {content.creatives}
        </DropdownMenuLinkItem>
        <DropdownMenuLinkItem render={<Link to={ROUTES.SKILLS} />}>
          {content.skills}
        </DropdownMenuLinkItem>
        <DropdownMenuLinkItem render={<Link to={ROUTES.EXTRAS} />}>
          {content.extras}
        </DropdownMenuLinkItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const MobileMenu = () => {
  const content = useIntlayer("site-header");
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label={content.openMenu.value}
        className={roundIconClass}
      >
        <ReiconDuotone icon={Menu} aria-hidden="true" className="size-4" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Popup
          aria-label={content.navigation.value}
          className="bg-background text-foreground fixed inset-0 z-50 flex flex-col px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] transition-opacity duration-200 outline-none data-ending-style:opacity-0 data-starting-style:opacity-0"
        >
          <div className="flex items-center justify-between">
            <Brand />
            <Dialog.Close
              aria-label={content.closeMenu.value}
              className={roundIconClass}
            >
              <ReiconDuotone
                icon={Xmark}
                aria-hidden="true"
                className="size-4"
              />
            </Dialog.Close>
          </div>
          <nav
            aria-label={content.navigation.value}
            className="mt-10 flex flex-col"
          >
            <DiscoverLink onClick={close} className={mobileLinkClass} />
            <Link to={ROUTES.TOOLS} onClick={close} className={mobileLinkClass}>
              {content.tools}
            </Link>
            <Link
              to={ROUTES.CREATIVES}
              onClick={close}
              className={mobileLinkClass}
            >
              {content.creatives}
            </Link>
            <Link
              to={ROUTES.SKILLS}
              onClick={close}
              className={mobileLinkClass}
            >
              {content.skills}
            </Link>
            <Link
              to={ROUTES.EXTRAS}
              onClick={close}
              className={mobileLinkClass}
            >
              {content.extras}
            </Link>
          </nav>
          <div className="mt-auto flex flex-col gap-3">
            <SkillLink onClick={close} variant="gradient" size="cta" />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// One header for every page. Desktop: brand + sections, ⌘K search centred,
// actions right. Mobile: brand left; search, menu, and avatar right.
// `signedIn` (from the page loader) only covers the first render; the account
// menu follows the client session after that.
export const SiteHeader = ({ signedIn }: { signedIn?: boolean }) => {
  const content = useIntlayer("site-header");
  return (
    <header className="mx-auto grid w-full max-w-[1800px] grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-2 px-4 py-3 sm:px-6 md:gap-x-3 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,28rem)_minmax(0,1fr)] lg:gap-x-6">
      <div className="flex min-w-0 items-center gap-x-4">
        <Brand />
        <nav
          aria-label={content.navigation.value}
          className="-ml-2 hidden items-center gap-0.5 md:flex"
        >
          <DiscoverLink className={linkClass} />
          <Link to={ROUTES.TOOLS} className={linkClass}>
            {content.tools}
          </Link>
          <MoreMenu />
        </nav>
      </div>
      <CommandMenu />
      <div className="flex items-center gap-2 justify-self-end">
        {/* Diamond sponsor marks, then the skill as the header's one CTA. */}
        <div className="hidden lg:block">
          <SponsorSlots />
        </div>
        <div className="max-md:hidden">
          <SkillLink variant="gradient" />
        </div>
        <div className="md:hidden">
          <MobileMenu />
        </div>
        <AccountMenu signedIn={signedIn} />
      </div>
    </header>
  );
};
