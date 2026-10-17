import { Dialog } from "@base-ui/react/dialog";
import { Link, useMatch } from "@tanstack/react-router";
import type { VariantProps } from "class-variance-authority";
import { useState } from "react";
import { useIntlayer } from "react-intlayer";
import { ArrowRightUp } from "reicon-react/icons/ArrowRightUp";
import { Menu } from "reicon-react/icons/Menu";
import { Xmark } from "reicon-react/icons/Xmark";

import { AccountMenu } from "@/components/account-avatar";
import { Brand } from "@/components/brand";
import { CommandMenu } from "@/components/command-menu";
import { OnlineCount } from "@/components/live-presence";
import { buttonVariants } from "@/components/ui/button";
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
      <ArrowRightUp aria-hidden="true" />
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

/**
 * Below lg: the section links, with the skill CTA at the bottom. Account
 * items and preferences stay in the avatar popover, as on desktop.
 */
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
        <Menu aria-hidden="true" className="size-4" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Popup
          aria-label={content.navigation.value}
          className="bg-background text-foreground fixed inset-0 z-50 flex flex-col overflow-y-auto px-4 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] transition-opacity duration-200 outline-none data-ending-style:opacity-0 data-starting-style:opacity-0"
        >
          <div className="flex items-center justify-between">
            <Brand />
            <Dialog.Close
              aria-label={content.closeMenu.value}
              className={roundIconClass}
            >
              <Xmark aria-hidden="true" className="size-4" />
            </Dialog.Close>
          </div>
          <nav
            aria-label={content.navigation.value}
            className="mt-8 flex flex-col"
          >
            <DiscoverLink onClick={close} className={mobileLinkClass} />
            {(
              [
                [ROUTES.TOOLS, content.tools],
                [ROUTES.CREATIVES, content.creatives],
                [ROUTES.SKILLS, content.skills],
                [ROUTES.EXTRAS, content.extras],
                [ROUTES.TEMPLATES, content.templates],
                [ROUTES.JOBS, content.jobs],
              ] as const
            ).map(([to, label]) => (
              <Link
                key={to}
                to={to}
                onClick={close}
                className={mobileLinkClass}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col pt-8">
            <SkillLink onClick={close} variant="gradient" size="xl" />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// One header for every page. Left: brand + section links. Right: search,
// skill CTA, and account. Mobile: brand left; search, avatar, menu right.
// The online count sits before search (number only on phones).
// `signedIn` (from the page loader) only covers the first render; the account
// menu follows the client session after that.
export const SiteHeader = ({ signedIn }: { signedIn?: boolean }) => {
  const content = useIntlayer("site-header");
  return (
    <header className="mx-auto grid w-full max-w-[1800px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 px-4 py-3 sm:px-6 md:gap-x-3">
      <div className="flex min-w-0 items-center gap-x-3 lg:gap-x-4">
        <Brand />
        <nav
          aria-label={content.navigation.value}
          className="-ml-2 hidden items-center gap-0.5 lg:flex"
        >
          <DiscoverLink className={linkClass} />
          <Link to={ROUTES.TOOLS} className={linkClass}>
            {content.tools}
          </Link>
          <Link to={ROUTES.CREATIVES} className={linkClass}>
            {content.creatives}
          </Link>
          <Link to={ROUTES.SKILLS} className={linkClass}>
            {content.skills}
          </Link>
          <Link to={ROUTES.EXTRAS} className={linkClass}>
            {content.extras}
          </Link>
          <Link to={ROUTES.TEMPLATES} className={linkClass}>
            {content.templates}
          </Link>
          <Link to={ROUTES.JOBS} className={linkClass}>
            {content.jobs}
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-2 justify-self-end">
        <OnlineCount className="sm:mr-1" />
        <CommandMenu />
        <div className="max-md:hidden">
          <SkillLink variant="gradient" />
        </div>
        <AccountMenu signedIn={signedIn} />
        {/* Below lg one menu holds sections, account, and preferences. */}
        <div className="lg:hidden">
          <MobileMenu />
        </div>
      </div>
    </header>
  );
};
