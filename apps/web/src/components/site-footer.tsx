import { Link } from "@tanstack/react-router";
import { useMemo } from "react";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { ChevronDown } from "reicon-react/icons/ChevronDown";

import { Brand } from "@/components/brand";
import { GitHubIcon, XIcon } from "@/components/brand-icons";
import { FooterWordmark } from "@/components/footer-wordmark";
import { LocaleSwitcher } from "@/components/locale-switcher";
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
import {
  MOTION_CATEGORIES,
  MOTION_MODELS,
  MOTION_MODEL_NAMES,
  motionModelSlug,
} from "@/lib/motion-catalog";
import { MOVE_FAMILIES } from "@/lib/move-families";
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
const linkClass =
  "text-muted-foreground hover:text-foreground focus-visible:ring-ring w-fit rounded-sm transition-colors outline-none focus-visible:ring-2";

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

const Column = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-8">{children}</div>
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
 * Every page as plain, server-rendered links (nothing behind a menu but the
 * Shadcn Labs projects), so visitors and crawlers reach them all: the brand
 * column, then four columns of link groups. On phones the brand sits on top
 * and the groups pair up.
 */
export const SiteFooter = () => {
  const content = useIntlayer("site-footer");
  const header = useIntlayer("site-header");
  const gallery = useIntlayer("motion-gallery");
  const moves = useIntlayer("moves");
  const product = [
    [ROUTES.MOVES, header.moves],
    [ROUTES.MOTIONVIDEO_SKILL, header.skill],
    [ROUTES.MOTIONVIDEO_MCP, header.mcp],
    [ROUTES.PRO, header.pricing],
  ] as const;
  const docs = [
    [ROUTES.DOCS, content.quickstart],
    [ROUTES.DOCS_MCP, content.mcpServer],
    [ROUTES.DOCS_SKILL, content.agentSkill],
    [ROUTES.DOCS_MOVES, content.usingMoves],
    [ROUTES.DOCS_PLANS, content.plansBilling],
    [ROUTES.DOCS_API, content.publicApi],
  ] as const;
  const resources = [
    [ROUTES.HOME, header.discover],
    [ROUTES.TOOLS, header.tools],
    [ROUTES.CREATIVES, header.creatives],
    [ROUTES.SKILLS, header.skills],
    [ROUTES.EXTRAS, header.extras],
    [ROUTES.JOBS, header.jobs],
  ] as const;
  const company = [
    [ROUTES.ABOUT, content.about],
    [ROUTES.BRAND, content.brand],
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
      <Link key={to} to={to as never} className={linkClass}>
        {label}
      </Link>
    ));

  return (
    <footer className="mx-auto mt-auto w-full max-w-[1800px] px-4 pt-16 text-sm sm:px-6">
      <div className="grid gap-x-8 gap-y-12 lg:grid-cols-[minmax(0,1.4fr)_repeat(5,minmax(0,1fr))]">
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
          className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:col-span-5 lg:grid-cols-5"
        >
          <Column>
            <LinkGroup heading={content.product}>{links(product)}</LinkGroup>
            <LinkGroup heading={header.docs}>
              {links(docs)}
              {/* A server route serving markdown, not an app page. */}
              <a href={ROUTES.SKILL_MD} className={linkClass}>
                skill.md
              </a>
            </LinkGroup>
          </Column>
          <Column>
            <LinkGroup heading={content.explore}>{links(resources)}</LinkGroup>
            <LinkGroup heading={content.byModel}>
              {MOTION_MODELS.map((model) => (
                <Link
                  key={model}
                  to="/model/$model"
                  params={{ model: motionModelSlug(model) }}
                  className={linkClass}
                >
                  {MOTION_MODEL_NAMES[model]}
                </Link>
              ))}
            </LinkGroup>
          </Column>
          <Column>
            <LinkGroup heading={content.categories}>
              {MOTION_CATEGORIES.map((category) => (
                <Link
                  key={category}
                  to="/category/$category"
                  params={{ category }}
                  className={linkClass}
                >
                  {gallery.categories[category]}
                </Link>
              ))}
            </LinkGroup>
            <LinkGroup heading={content.byType}>
              <Link
                to="/type/$type"
                params={{ type: "prompt" }}
                className={linkClass}
              >
                {content.prompts}
              </Link>
              <Link
                to="/type/$type"
                params={{ type: "skill" }}
                className={linkClass}
              >
                {content.skillVideos}
              </Link>
            </LinkGroup>
          </Column>
          <Column>
            <LinkGroup heading={content.company}>{links(company)}</LinkGroup>
            <LinkGroup heading={content.legal}>{links(legal)}</LinkGroup>
          </Column>
          <Column>
            <LinkGroup heading={header.moves}>
              {MOVE_FAMILIES.map((family) => (
                <Link
                  key={family}
                  to="/moves/$family"
                  params={{ family }}
                  className={linkClass}
                >
                  {moves.familyLabels[family]}
                </Link>
              ))}
            </LinkGroup>
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
                    <DropdownMenuLabel>
                      {content.labsProjects}
                    </DropdownMenuLabel>
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
          </Column>
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
