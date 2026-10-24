import { Dialog } from "@base-ui/react/dialog";
import { Link, useMatch, useRouterState } from "@tanstack/react-router";
import type { VariantProps } from "class-variance-authority";
import { useState } from "react";
import type { ComponentProps } from "react";
import { useIntlayer } from "react-intlayer";
import { ArrowRightUp } from "reicon-react/icons/ArrowRightUp";
import { Briefcase } from "reicon-react/icons/Briefcase";
import { ChevronDown } from "reicon-react/icons/ChevronDown";
import { Designtools } from "reicon-react/icons/Designtools";
import { Menu } from "reicon-react/icons/Menu";
import { Plus } from "reicon-react/icons/Plus";
import { Sparkles } from "reicon-react/icons/Sparkles";
import { User2 } from "reicon-react/icons/User2";
import { VideoLib } from "reicon-react/icons/VideoLib";
import { Xmark } from "reicon-react/icons/Xmark";

import { AccountMenu } from "@/components/account-avatar";
import { Brand } from "@/components/brand";
import { CommandMenu } from "@/components/command-menu";
import { OnlineCount } from "@/components/live-presence";
import { NavPreviewMenu, loadNavPreviews } from "@/components/nav-previews";
import type {
  NavPreviewItem,
  NavPreviewsPromise,
} from "@/components/nav-previews";
import { buttonVariants } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

// Explore's sections, each with the icon the command menu uses for it.
const EXPLORE_ROUTES = [
  ["discover", ROUTES.HOME, <VideoLib key="icon" aria-hidden="true" />],
  ["tools", ROUTES.TOOLS, <Designtools key="icon" aria-hidden="true" />],
  ["creatives", ROUTES.CREATIVES, <User2 key="icon" aria-hidden="true" />],
  ["skills", ROUTES.SKILLS, <Sparkles key="icon" aria-hidden="true" />],
  ["extras", ROUTES.EXTRAS, <Plus key="icon" aria-hidden="true" />],
  ["jobs", ROUTES.JOBS, <Briefcase key="icon" aria-hidden="true" />],
] as const;

// The docs pages, listed under Docs in the mobile menu (content/docs).
const DOCS_PAGES = [
  ["", "quickstart"],
  ["mcp", "mcpServer"],
  ["skill", "agentSkill"],
  ["moves", "usingMoves"],
  ["templates", "usingTemplates"],
  ["plans", "plansBilling"],
  ["api", "publicApi"],
] as const;
// The sections an Explore link leads to, gallery pages aside (`/_gallery`).
const EXPLORE_PATHS = EXPLORE_ROUTES.flatMap(([, to]) =>
  to === ROUTES.HOME ? [] : [to]
);

const MENUS = ["explore"] as const;
type MenuName = (typeof MENUS)[number];
// The item each menu previews when it opens.
const FIRST_ITEM: Record<MenuName, string> = {
  explore: "discover",
};

const TOP_LINKS = ["moves", "templates", "mcp", "skill", "docs"] as const;
type TopLinkName = (typeof TOP_LINKS)[number];

// Muted until hovered, open, or holding the current page; the list's pill
// supplies the hover fill.
const topLevelClass = cn(
  navigationMenuTriggerStyle(),
  "text-muted-foreground hover:text-foreground data-popup-open:text-foreground aria-[current=page]:text-foreground data-[current=true]:text-foreground relative z-1 transition-colors"
);
// Mobile: every top-level entry the same size; Explore's and Docs' pages are
// indented under them.
const mobileLinkClass =
  "text-muted-foreground hover:text-foreground [&[aria-current=page]]:text-foreground focus-visible:ring-ring flex items-center gap-3 rounded-md py-2 text-2xl font-semibold tracking-tight transition-colors outline-none focus-visible:ring-2";
const mobileSubLinkClass = cn(mobileLinkClass, "pl-5 [&>svg]:size-5");
const roundIconClass =
  "bg-secondary text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex size-9 items-center justify-center rounded-full transition-colors outline-none hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] focus-visible:ring-3";

/** The header's CTA: the Pro page, with plans and prices. */
const GetProLink = ({
  variant,
  size,
  onClick,
}: Pick<VariantProps<typeof buttonVariants>, "variant" | "size"> & {
  onClick?: () => void;
}) => {
  const content = useIntlayer("site-header");
  return (
    <Link
      to={ROUTES.PRO}
      onClick={onClick}
      data-track="get_pro"
      className={buttonVariants({ variant, size })}
    >
      {content.getPro}
      <ArrowRightUp aria-hidden="true" />
    </Link>
  );
};

type Section = MenuName | "moves" | "templates" | "docs" | null;

/** Which menu or docs link holds the current page, to mark it. */
const useCurrentSection = (): Section => {
  const inGallery = useMatch({ from: "/_gallery", shouldThrow: false });
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const under = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);
  if (inGallery || EXPLORE_PATHS.some(under)) {
    return "explore";
  }
  if (under(ROUTES.MOVES)) {
    return "moves";
  }
  if (under(ROUTES.TEMPLATES)) {
    return "templates";
  }
  return under(ROUTES.DOCS) ? "docs" : null;
};

/**
 * Moves, Templates, Skill, MCP or Docs. Skill and MCP are the product pages (their
 * reference lives in the docs); Docs stays marked on every docs page.
 */
const TopLink = ({
  name,
  section,
  ...props
}: { name: TopLinkName; section: Section } & Omit<
  ComponentProps<"a">,
  "href"
>) => {
  if (name === "moves") {
    return (
      <Link
        to={ROUTES.MOVES}
        aria-current={section === "moves" ? "page" : undefined}
        {...props}
      />
    );
  }
  if (name === "templates") {
    return (
      <Link
        to={ROUTES.TEMPLATES}
        aria-current={section === "templates" ? "page" : undefined}
        {...props}
      />
    );
  }
  if (name === "skill") {
    return <Link to={ROUTES.MOTIONVIDEO_SKILL} {...props} />;
  }
  if (name === "mcp") {
    return <Link to="/motionvideo-mcp" {...props} />;
  }
  return (
    <Link
      to={ROUTES.DOCS}
      aria-current={section === "docs" ? "page" : undefined}
      {...props}
    />
  );
};

/** Desktop: the Explore menu, then Moves, Templates, MCP and Docs. */
const DesktopNav = () => {
  const content = useIntlayer("site-header");
  const section = useCurrentSection();
  const [open, setOpen] = useState<MenuName | null>(null);
  const [active, setActive] = useState(FIRST_ITEM);
  // Fetched the first time a menu is about to open; shared after that.
  const [previews, setPreviews] = useState<NavPreviewsPromise | null>(null);
  const warm = () => {
    setPreviews(loadNavPreviews());
  };

  const exploreItems = EXPLORE_ROUTES.map(
    ([key, to, icon]): NavPreviewItem => ({
      key,
      link: <Link to={to} />,
      title: content[key],
      icon,
      count: (data) => data[key].count,
      detail: () => content.resourceNotes[key],
      media: (data) => {
        if (key === "discover") {
          return { kind: "video", video: data.discover.video };
        }
        if (key === "jobs") {
          return {
            kind: "jobs",
            listings: data.jobs.listings,
            empty: content.jobsEmpty,
          };
        }
        return { kind: "cover", src: data[key].cover };
      },
    })
  );

  return (
    <NavigationMenu
      className="-ml-2 hidden lg:flex"
      onValueChange={(value) => {
        const menu = MENUS.find((name) => name === value) ?? null;
        if (menu && menu !== open) {
          // Each opening starts on the menu's first item.
          setActive((current) => ({ ...current, [menu]: FIRST_ITEM[menu] }));
          warm();
        }
        setOpen(menu);
      }}
    >
      <NavigationMenuList>
        <NavigationMenuItem value="explore">
          <NavigationMenuTrigger
            className={topLevelClass}
            data-current={section === "explore"}
            onPointerEnter={warm}
            onFocus={warm}
          >
            {content.explore}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <NavPreviewMenu
              items={exploreItems}
              active={active.explore}
              onActive={(key) =>
                setActive((current) => ({ ...current, explore: key }))
              }
              previews={previews}
              open={open === "explore"}
            />
          </NavigationMenuContent>
        </NavigationMenuItem>
        {TOP_LINKS.map((name) => (
          <NavigationMenuItem key={name}>
            <NavigationMenuLink
              render={<TopLink name={name} section={section} />}
              className={cn(topLevelClass, "p-0 px-3")}
            >
              {content[name]}
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};

/**
 * Below lg: Explore and Docs open in place with their pages indented under
 * them; Moves, Templates, MCP and Skill are links, all the same size, with the Get Pro
 * CTA at the bottom. Account items and preferences stay in the avatar
 * popover, as on desktop.
 */
const MobileMenu = () => {
  const content = useIntlayer("site-header");
  const footer = useIntlayer("site-footer");
  const section = useCurrentSection();
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
            <Collapsible defaultOpen={section === "explore"}>
              <CollapsibleTrigger
                className={cn(mobileLinkClass, "group w-full justify-between")}
              >
                {content.explore}
                <ChevronDown
                  aria-hidden="true"
                  className="size-5 transition-transform group-data-panel-open:rotate-180"
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="flex flex-col">
                {EXPLORE_ROUTES.map(([key, to, icon]) => (
                  <Link
                    key={key}
                    to={to}
                    onClick={close}
                    className={mobileSubLinkClass}
                  >
                    {icon}
                    {content[key]}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
            {TOP_LINKS.filter((name) => name !== "docs").map((name) => (
              <TopLink
                key={name}
                name={name}
                section={section}
                onClick={close}
                className={mobileLinkClass}
              >
                {content[name]}
              </TopLink>
            ))}
            <Collapsible defaultOpen={section === "docs"}>
              <CollapsibleTrigger
                className={cn(mobileLinkClass, "group w-full justify-between")}
              >
                {content.docs}
                <ChevronDown
                  aria-hidden="true"
                  className="size-5 transition-transform group-data-panel-open:rotate-180"
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="flex flex-col">
                {DOCS_PAGES.map(([splat, label]) =>
                  splat ? (
                    <Link
                      key={splat}
                      to="/docs/$"
                      params={{ _splat: splat }}
                      onClick={close}
                      className={mobileSubLinkClass}
                    >
                      {footer[label]}
                    </Link>
                  ) : (
                    <Link
                      key="index"
                      to={ROUTES.DOCS}
                      activeOptions={{ exact: true }}
                      onClick={close}
                      className={mobileSubLinkClass}
                    >
                      {footer[label]}
                    </Link>
                  )
                )}
              </CollapsibleContent>
            </Collapsible>
          </nav>
          <div className="mt-auto flex flex-col pt-8">
            <GetProLink onClick={close} variant="gradient" size="xl" />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

// One header for every page. Left: brand + navigation menu. Right: search,
// Get Pro, and account. Mobile: brand left; search, avatar, menu right.
// The online count sits before search (number only on phones).
// `signedIn` (from the page loader) only covers the first render; the account
// menu follows the client session after that.
export const SiteHeader = ({ signedIn }: { signedIn?: boolean }) => (
  <header className="mx-auto grid w-full max-w-[1800px] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 px-4 py-3 sm:px-6 md:gap-x-3">
    <div className="flex min-w-0 items-center gap-x-3 lg:gap-x-4">
      <Brand />
      <DesktopNav />
    </div>
    <div className="flex items-center gap-2 justify-self-end">
      <OnlineCount className="sm:mr-1" />
      <CommandMenu />
      <div className="max-md:hidden">
        <GetProLink variant="gradient" />
      </div>
      <AccountMenu signedIn={signedIn} />
      {/* Below lg one menu holds sections, account, and preferences. */}
      <div className="lg:hidden">
        <MobileMenu />
      </div>
    </div>
  </header>
);
