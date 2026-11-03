import { useMemo } from "react";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { ChevronDown } from "reicon-react/icons/ChevronDown";

import { Brand } from "@/components/brand";
import { FooterWordmark } from "@/components/footer-wordmark";
import { GitHubIcon, XIcon } from "@/components/icons";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { LocalizedLink as Link } from "@/components/localized-link";
import { SoundSwitch } from "@/components/sound-switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SharedTooltip,
  TooltipProvider,
  TooltipTrigger,
  createTooltipHandle,
} from "@/components/ui/tooltip";
import type { TooltipHandle } from "@/components/ui/tooltip";
import { LINK } from "@/constants/links";
import { OTHER_PRODUCTS, SHADCN_LABS_PROJECTS } from "@/constants/products";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { cn } from "@/lib/utils";
import { withUtm } from "@/lib/utm";

const IconLink = ({
  href,
  label,
  hint,
  tooltip,
  children,
}: {
  href: string;
  label: string;
  hint: ReactNode;
  tooltip: TooltipHandle<ReactNode>;
  children: ReactNode;
}) => (
  <TooltipTrigger
    handle={tooltip}
    payload={hint}
    render={
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className={buttonVariants({ size: "icon", variant: "subtle" })}
      />
    }
  >
    {children}
  </TooltipTrigger>
);

// The footer's icon button groups each share one tooltip that slides and
// morphs between their buttons.

const Socials = () => {
  const content = useIntlayer("site-footer");
  const tooltip = useMemo(() => createTooltipHandle<ReactNode>(), []);
  return (
    <TooltipProvider>
      <IconLink
        href={LINK.GITHUB_REPO}
        label={content.githubRepository.value}
        hint={content.starGithub}
        tooltip={tooltip}
      >
        <GitHubIcon className="size-4" />
      </IconLink>
      <IconLink
        href={LINK.X_FOLLOW}
        label={`${content.followX.value}: ${SITE.AUTHOR.TWITTER}`}
        hint={content.followX}
        tooltip={tooltip}
      >
        <XIcon className="size-4" />
      </IconLink>
      <SharedTooltip handle={tooltip} />
    </TooltipProvider>
  );
};

const ThemeAndSound = () => {
  const tooltip = useMemo(() => createTooltipHandle<ReactNode>(), []);
  return (
    <TooltipProvider>
      <ThemeToggle tooltip={tooltip} />
      <SoundSwitch
        tooltip={tooltip}
        className={buttonVariants({ size: "icon", variant: "subtle" })}
        iconClassName="size-[18px]"
      />
      <SharedTooltip handle={tooltip} />
    </TooltipProvider>
  );
};

const headingClass = "text-foreground font-medium";
// `hyphens-auto`: long single words (German "Rückerstattungsrichtlinie")
// break inside the narrow two-column grid on phones instead of overflowing.
const linkClass =
  "text-muted-foreground hover:text-foreground focus-visible:ring-ring w-fit max-w-full rounded-sm hyphens-auto transition-colors outline-none focus-visible:ring-2";

/** One titled list of links; columns stack several. */
const LinkGroup = ({
  heading,
  children,
}: {
  heading: ReactNode;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-2.5">
    <p className={headingClass}>{heading}</p>
    {children}
  </div>
);

const ExternalLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => (
  <a href={withUtm(href, "footer")} className={linkClass}>
    {children}
  </a>
);

/**
 * The brand column, then four link groups: product, company, legal and the
 * other products. Crawlers find every other page through the sitemap. On
 * phones the brand sits on top and the groups pair up.
 */
export const SiteFooter = () => {
  const content = useIntlayer("site-footer");
  const header = useIntlayer("site-header");
  // The main pages only; collections and the rest are in the header, the
  // command menu and the sitemap.
  const product = [
    [ROUTES.HOME, header.discover],
    [ROUTES.MOVES, header.moves],
    [ROUTES.TEMPLATES, header.templates],
    [ROUTES.MOTIONVIDEO_MCP, header.mcp],
    [ROUTES.MOTIONVIDEO_SKILL, header.skill],
    [ROUTES.DOCS, header.docs],
    [ROUTES.PRO, header.pricing],
  ] as const;
  const company = [
    [ROUTES.ABOUT, content.about],
    [ROUTES.BRAND, content.brand],
    [ROUTES.BLOG, content.blog],
    [ROUTES.CHANGELOG, content.changelog],
    [ROUTES.CONTACT, content.contact],
    [ROUTES.SPONSOR, content.sponsor],
  ] as const;
  const legal = [
    [ROUTES.TERMS, content.terms],
    [ROUTES.PRIVACY, content.privacy],
    [ROUTES.REFUNDS, content.refunds],
  ] as const;
  const links = (
    group: readonly (readonly [string, ReactNode])[]
  ): ReactNode[] =>
    group.map(([to, label]) => (
      // SAFETY: every `to` above is a ROUTES constant of a real page.
      <Link
        key={to}
        to={to as never}
        // Videos points home; without `exact` it reads as current on every route.
        activeOptions={to === ROUTES.HOME ? { exact: true } : undefined}
        className={linkClass}
      >
        {label}
      </Link>
    ));

  return (
    <footer className="mx-auto mt-auto w-full max-w-[1800px] px-4 pt-16 text-sm sm:px-6">
      <div className="grid gap-x-8 gap-y-12 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))]">
        <div className="flex max-w-xs flex-col items-start gap-4">
          {/* text-base: the logo at the header's size (the footer is text-sm). */}
          <div className="text-base">
            <Brand />
          </div>
          <p className="text-muted-foreground text-pretty">
            {content.description}
          </p>
          <div className="-ml-2 flex items-center">
            <Socials />
          </div>
        </div>
        <nav
          aria-label={content.footer.value}
          className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:col-span-4"
        >
          <LinkGroup heading={content.product}>{links(product)}</LinkGroup>
          <LinkGroup heading={content.company}>{links(company)}</LinkGroup>
          <LinkGroup heading={content.legal}>{links(legal)}</LinkGroup>
          <LinkGroup heading={content.otherProducts}>
            {OTHER_PRODUCTS.map((item) => (
              <ExternalLink key={item.name} href={item.url}>
                {item.name}
              </ExternalLink>
            ))}
            {/* Reads as one more product link; the chevron marks the menu. */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(linkClass, "flex items-center gap-1 text-left")}
              >
                {content.andMore}
                <ChevronDown
                  aria-hidden="true"
                  className="size-3.5 shrink-0 transition-transform in-data-popup-open:rotate-180"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{content.labsProjects}</DropdownMenuLabel>
                  {SHADCN_LABS_PROJECTS.map((project) => (
                    <DropdownMenuLinkItem
                      key={project.name}
                      href={withUtm(project.url, "footer")}
                    >
                      {project.name}
                    </DropdownMenuLinkItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </LinkGroup>
        </nav>
      </div>
      {/* Credit left; language, theme and sound right. No rule above. */}
      <div className="mt-16 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <p className="text-muted-foreground">
          © {new Date().getFullYear()} {SITE.NAME}
          <span className="mx-2" aria-hidden="true">
            ·
          </span>
          {content.builtBy}{" "}
          <a
            href={withUtm(LINK.AUTHOR_WEBSITE, "footer")}
            className="hover:text-foreground transition-colors"
          >
            {SITE.AUTHOR.FIRST_NAME}
          </a>
        </p>
        <div className="-mr-2 flex items-center">
          <LocaleSwitcher />
          <ThemeAndSound />
        </div>
      </div>
      {/* Mobile: lifted slightly so the (half-height) progressive blur
          dissolves only the wordmark's lower edge. */}
      <div className="max-md:mt-8">
        <FooterWordmark />
      </div>
    </footer>
  );
};
