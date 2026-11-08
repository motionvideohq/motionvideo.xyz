import { Dialog } from "@base-ui/react/dialog";
import { useMatch, useRouterState } from "@tanstack/react-router";
import type { VariantProps } from "class-variance-authority";
import { getPathWithoutLocale } from "intlayer";
import { useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { ChevronDown } from "reicon-react/icons/ChevronDown";
import { Menu } from "reicon-react/icons/Menu";
import { Xmark } from "reicon-react/icons/Xmark";

import { AccountMenu } from "@/components/account-avatar";
import { Brand } from "@/components/brand";
import { CommandMenu } from "@/components/command-menu";
import { OnlineCount } from "@/components/live-presence";
import { LocalizedLink as Link } from "@/components/localized-link";
import {
  NavCardMenu,
  NavPreviewMenu,
  loadNavPreviews,
} from "@/components/nav-previews";
import type {
  NavCardItem,
  NavPreviewItem,
  NavPreviewsPromise,
} from "@/components/nav-previews";
import { SectionIcon } from "@/components/section-icon";
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
import { buttonVariants } from "@/registry/ui/button";

// Explore's sections: key (nav preview data), path and section (its name and
// icon, shared with the command menu).
const EXPLORE_ROUTES = [
  ["discover", ROUTES.HOME, "videos"],
  ["tools", ROUTES.TOOLS, "tools"],
  ["creatives", ROUTES.CREATIVES, "creatives"],
  ["skills", ROUTES.SKILLS, "skills"],
  ["extras", ROUTES.EXTRAS, "extras"],
  ["jobs", ROUTES.JOBS, "jobs"],
] as const;

// The pages under each menu: the product itself, what agents use, and the
// site's own pages.
const PRODUCT_LINKS = ["moves", "templates"] as const;
const AI_LINKS = ["mcp", "skill"] as const;
const RESOURCE_LINKS = [
  "about",
  "design",
  "blog",
  "changelog",
  "contact",
  "sponsor",
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

const MENUS = ["explore", "product", "ai", "resources"] as const;
type MenuName = (typeof MENUS)[number];
// The menus that preview their items, and the item each shows when it opens.
const FIRST_ITEM = { explore: "discover", resources: "about" } as const;
type PreviewMenuName = keyof typeof FIRST_ITEM;

// Every panel is as tall as the longest list (32px rows, 1px apart, inside
// the panel's 4px padding) and as wide as the nav row (the menu is
// `anchored`: the popup sits under the whole row), so it keeps one size and one
// place whichever menu is open.
const PANEL_ROWS = Math.max(EXPLORE_ROUTES.length, RESOURCE_LINKS.length);
const panelStyle = {
  height: `calc(${PANEL_ROWS} * 2rem + ${PANEL_ROWS - 1}px + 0.5rem)`,
};

// Every page a top-level link (or a menu item) points at.
const NAV_LINKS = {
  moves: ROUTES.MOVES,
  templates: ROUTES.TEMPLATES,
  mcp: ROUTES.MOTIONVIDEO_MCP,
  skill: ROUTES.MOTIONVIDEO_SKILL,
  docs: ROUTES.DOCS,
  about: ROUTES.ABOUT,
  design: ROUTES.DESIGN,
  blog: ROUTES.BLOG,
  changelog: ROUTES.CHANGELOG,
  contact: ROUTES.CONTACT,
  sponsor: ROUTES.SPONSOR,
} as const;
type TopLinkName = keyof typeof NAV_LINKS;

// Muted until hovered, open, or holding the current page; the list's pill
// supplies the hover fill.
const topLevelClass = cn(
  navigationMenuTriggerStyle(),
  "text-muted-foreground hover:text-foreground data-popup-open:text-foreground aria-[current=page]:text-foreground data-[current=true]:text-foreground relative z-1 transition-colors"
);
// Mobile: every top-level entry the same size; each menu's pages are indented
// under it.
const mobileLinkClass =
  "text-muted-foreground hover:text-foreground [&[aria-current=page]]:text-foreground focus-visible:ring-ring flex items-center gap-3 rounded-md py-2 text-2xl font-semibold tracking-tight transition-colors outline-none focus-visible:ring-2";
const mobileSubLinkClass = cn(mobileLinkClass, "pl-5 [&>svg]:size-5");
const roundIconClass =
  "bg-secondary text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex size-8 items-center justify-center rounded-full transition-colors outline-none hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] focus-visible:ring-3";

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
    </Link>
  );
};

type Section = MenuName | "docs" | null;

/** Which menu or docs link holds the current page, to mark it. */
const useCurrentSection = (): Section => {
  const inGallery = useMatch({
    from: "/{-$locale}/_gallery",
    shouldThrow: false,
  });
  // App paths: section routes are compared without the locale prefix.
  const pathname = useRouterState({
    select: (state) => getPathWithoutLocale(state.location.pathname),
  });
  const under = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);
  if (inGallery || EXPLORE_PATHS.some(under)) {
    return "explore";
  }
  if (under(ROUTES.MOVES) || under(ROUTES.TEMPLATES)) {
    return "product";
  }
  if (under(ROUTES.MOTIONVIDEO_MCP) || under(ROUTES.MOTIONVIDEO_SKILL)) {
    return "ai";
  }
  if (under(ROUTES.DOCS)) {
    return "docs";
  }
  if (
    under(ROUTES.ABOUT) ||
    under(ROUTES.DESIGN) ||
    under(ROUTES.BLOG) ||
    under(ROUTES.CHANGELOG) ||
    under(ROUTES.CONTACT) ||
    under(ROUTES.SPONSOR)
  ) {
    return "resources";
  }
  return null;
};

/**
 * One page link, marked when the current page is it or sits under it. Product
 * pages share a menu, so the mark follows the link, not its menu.
 */
const TopLink = ({
  name,
  ...props
}: { name: TopLinkName } & Omit<ComponentProps<"a">, "href">) => {
  const pathname = useRouterState({
    select: (state) => getPathWithoutLocale(state.location.pathname),
  });
  const to = NAV_LINKS[name];
  const current = pathname === to || pathname.startsWith(`${to}/`);
  return (
    <Link to={to} aria-current={current ? "page" : undefined} {...props} />
  );
};

/** A top-level menu and its panel, which fetches the previews when near. */
const NavMenu = ({
  name,
  current,
  onWarm,
  children,
}: {
  name: MenuName;
  current: boolean;
  onWarm: () => void;
  children: ReactNode;
}) => {
  const content = useIntlayer("site-header");
  return (
    <NavigationMenuItem value={name}>
      <NavigationMenuTrigger
        className={topLevelClass}
        data-current={current}
        onPointerEnter={onWarm}
        onFocus={onWarm}
      >
        {content[name]}
      </NavigationMenuTrigger>
      <NavigationMenuContent
        className="w-(--navigation-menu-width)"
        style={panelStyle}
      >
        {children}
      </NavigationMenuContent>
    </NavigationMenuItem>
  );
};

/**
 * Desktop: Explore, Product, AI, Resources and Docs. Explore and Resources
 * list their pages beside a preview; Product and AI show theirs as cards.
 */
const DesktopNav = () => {
  const content = useIntlayer("site-header");
  const section = useCurrentSection();
  const [open, setOpen] = useState<MenuName | null>(null);
  const [active, setActive] =
    useState<Record<PreviewMenuName, string>>(FIRST_ITEM);
  // Fetched the first time a menu is about to open; shared after that.
  const [previews, setPreviews] = useState<NavPreviewsPromise | null>(null);
  const warm = () => {
    setPreviews(loadNavPreviews());
  };

  const jobsIcon = <SectionIcon section="jobs" />;
  const exploreItems = EXPLORE_ROUTES.map(
    ([key, to, name]): NavPreviewItem => ({
      key,
      link: <Link to={to} />,
      title: content[name],
      icon: <SectionIcon section={name} />,
      count: (data) => data[key].count,
      detail: () => content.menuNotes[key],
      media: (data) => {
        if (key === "discover") {
          return { kind: "video", video: data.discover.video };
        }
        if (key === "jobs") {
          // No open roles: the icon tile, like the other pages without
          // imagery; the caption still says what the page is.
          return data.jobs.listings.length > 0
            ? { kind: "jobs", listings: data.jobs.listings }
            : { kind: "icon", icon: jobsIcon };
        }
        return { kind: "cover", src: data[key].cover };
      },
    })
  );

  // The blog and changelog show their newest entry; About the site's share
  // image; the other pages their icon.
  const resourceItems = RESOURCE_LINKS.map((name): NavPreviewItem => {
    const icon = <SectionIcon section={name} />;
    const item = {
      key: name,
      link: <TopLink name={name} />,
      title: content[name],
      icon,
    };
    if (name === "blog" || name === "changelog") {
      return {
        ...item,
        count: (data) => data[name].count,
        detail: (data) => data[name].title,
        media: (data) => ({ kind: "video", video: data[name].video }),
      };
    }
    return {
      ...item,
      detail: () => content.menuNotes[name],
      media: () =>
        name === "about"
          ? { kind: "cover", src: "/og.jpg" }
          : { kind: "icon", icon },
    };
  });

  // Moves and templates show a gallery example; MCP and Skill their icon.
  const cards = (
    names: readonly (typeof PRODUCT_LINKS | typeof AI_LINKS)[number][]
  ) =>
    names.map((name): NavCardItem => {
      const icon = <SectionIcon section={name} />;
      return {
        key: name,
        link: <TopLink name={name} />,
        title: content[name],
        icon,
        detail: content.menuNotes[name],
        media: (data) =>
          name === "moves" || name === "templates"
            ? { kind: "video", video: data[name].video }
            : { kind: "icon", icon },
      };
    });

  return (
    <NavigationMenu
      anchored
      className="-ml-2 hidden lg:flex"
      onValueChange={(value) => {
        const menu = MENUS.find((name) => name === value) ?? null;
        if (menu && menu !== open) {
          // Each opening starts on the menu's first item.
          if (menu === "explore" || menu === "resources") {
            setActive((current) => ({ ...current, [menu]: FIRST_ITEM[menu] }));
          }
          warm();
        }
        setOpen(menu);
      }}
    >
      <NavigationMenuList>
        <NavMenu name="explore" current={section === "explore"} onWarm={warm}>
          <NavPreviewMenu
            items={exploreItems}
            active={active.explore}
            onActive={(key) =>
              setActive((current) => ({ ...current, explore: key }))
            }
            previews={previews}
            open={open === "explore"}
          />
        </NavMenu>
        <NavMenu name="product" current={section === "product"} onWarm={warm}>
          <NavCardMenu
            items={cards(PRODUCT_LINKS)}
            previews={previews}
            open={open === "product"}
          />
        </NavMenu>
        <NavMenu name="ai" current={section === "ai"} onWarm={warm}>
          <NavCardMenu
            items={cards(AI_LINKS)}
            previews={previews}
            open={open === "ai"}
          />
        </NavMenu>
        <NavMenu
          name="resources"
          current={section === "resources"}
          onWarm={warm}
        >
          <NavPreviewMenu
            items={resourceItems}
            active={active.resources}
            onActive={(key) =>
              setActive((current) => ({ ...current, resources: key }))
            }
            previews={previews}
            open={open === "resources"}
          />
        </NavMenu>
        <NavigationMenuItem>
          <NavigationMenuLink
            render={<TopLink name="docs" />}
            className={cn(topLevelClass, "p-0 px-3")}
          >
            {content.docs}
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
};

/**
 * A collapsible group in the mobile sheet: its pages indent under it like
 * Explore's.
 */
const MobileNavGroup = ({
  name,
  items,
  section,
  onNavigate,
}: {
  name: Exclude<MenuName, "explore">;
  items: readonly TopLinkName[];
  section: Section;
  onNavigate: () => void;
}) => {
  const content = useIntlayer("site-header");
  return (
    <Collapsible defaultOpen={section === name}>
      <CollapsibleTrigger
        className={cn(mobileLinkClass, "group w-full justify-between")}
      >
        {content[name]}
        <ChevronDown
          aria-hidden="true"
          className="me-2 size-4 transition-transform group-data-panel-open:rotate-180"
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col">
        {items.map((item) => (
          <TopLink
            key={item}
            name={item}
            onClick={onNavigate}
            className={mobileSubLinkClass}
          >
            <SectionIcon section={item} />
            {content[item]}
          </TopLink>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

/**
 * Below lg: Explore, Product, AI, Resources and Docs open in place with their
 * pages indented under them, all the same size, with the Get Pro CTA at the
 * bottom. Account items and preferences stay in the avatar popover, as on
 * desktop.
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
          {/* 32px, same as the header's controls, so the close button lands on
              the menu button it replaces. shrink-0 keeps the dialog's flex
              column from squeezing this bar when the list overflows, and the
              nav's mt-9 holds the list at the same 80px as the 36px bar did. */}
          <div className="flex h-8 shrink-0 items-center justify-between">
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
            className="mt-9 flex flex-col"
          >
            <Collapsible defaultOpen={section === "explore"}>
              <CollapsibleTrigger
                className={cn(mobileLinkClass, "group w-full justify-between")}
              >
                {content.explore}
                {/* Centred on the close button's icon: the trigger ends at the
                    popup's padding, and the 32px round button centres its icon
                    16px in, so the 16px chevron gets an 8px inset. */}
                <ChevronDown
                  aria-hidden="true"
                  className="me-2 size-4 transition-transform group-data-panel-open:rotate-180"
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="flex flex-col">
                {EXPLORE_ROUTES.map(([key, to, name]) => (
                  <Link
                    key={key}
                    to={to}
                    // Videos points home, which fuzzy-matches every route; it
                    // is the current page only on the home page itself.
                    activeOptions={
                      to === ROUTES.HOME ? { exact: true } : undefined
                    }
                    onClick={close}
                    className={mobileSubLinkClass}
                  >
                    <SectionIcon section={name} />
                    {content[name]}
                  </Link>
                ))}
              </CollapsibleContent>
            </Collapsible>
            <MobileNavGroup
              name="product"
              items={PRODUCT_LINKS}
              section={section}
              onNavigate={close}
            />
            <MobileNavGroup
              name="ai"
              items={AI_LINKS}
              section={section}
              onNavigate={close}
            />
            <MobileNavGroup
              name="resources"
              items={RESOURCE_LINKS}
              section={section}
              onNavigate={close}
            />
            <Collapsible defaultOpen={section === "docs"}>
              <CollapsibleTrigger
                className={cn(mobileLinkClass, "group w-full justify-between")}
              >
                {content.docs}
                <ChevronDown
                  aria-hidden="true"
                  className="me-2 size-4 transition-transform group-data-panel-open:rotate-180"
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="flex flex-col">
                {DOCS_PAGES.map(([splat, label]) =>
                  splat ? (
                    <Link
                      key={splat}
                      to={ROUTES.DOCS_PAGE}
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

// The header's frame, shared with BrandHeader so the logo lands on the same
// spot on every page.
const headerFrameClass = "mx-auto w-full max-w-[1800px] px-4 py-3 sm:px-6";
// The header's row height: every control is 32px, so the row is too at every
// width. A fixed grid row (not left to the tallest control), so BrandHeader
// can match it exactly.
const headerRowClass = "grid grid-rows-[2rem] items-center";

// One header for every page. Left: brand + navigation menu. Right: search,
// Get Pro, and account. Mobile: brand left; search, avatar, menu right.
// The online count sits before search (number only on phones).
// The account chip reads the session on the client, so nothing here waits on
// a page loader.
export const SiteHeader = () => (
  <header
    className={cn(
      headerFrameClass,
      headerRowClass,
      "grid-cols-[minmax(0,1fr)_auto] gap-x-2 md:gap-x-3"
    )}
  >
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
      <AccountMenu />
      {/* Below lg one menu holds sections, account, and preferences. */}
      <div className="lg:hidden">
        <MobileMenu />
      </div>
    </div>
  </header>
);

/**
 * Just the brand, for pages without navigation (/sign-in). Same frame and
 * row height as SiteHeader, so the logo sits exactly where it does on every
 * other page, at every width.
 */
export const BrandHeader = ({ className }: { className?: string }) => (
  <header
    className={cn(
      headerFrameClass,
      headerRowClass,
      "justify-items-start",
      className
    )}
  >
    <Brand />
  </header>
);
