import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { ChevronDown } from "reicon-react/icons/ChevronDown";

import { GitHubIcon, XIcon } from "@/components/brand-icons";
import { FooterWordmark } from "@/components/footer-wordmark";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReiconDuotone } from "@/components/ui/reicon-duotone";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LINK } from "@/constants/links";
import {
  MORE_PRODUCTS,
  OTHER_PRODUCTS,
  SHADCN_LABS_PROJECTS,
} from "@/constants/products";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { withUtm } from "@/lib/utm";

const FooterMenu = ({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger className={buttonVariants({ variant: "subtle" })}>
      {label}
      <ReiconDuotone
        icon={ChevronDown}
        aria-hidden="true"
        className="size-3.5 transition-transform in-data-popup-open:rotate-180"
      />
    </DropdownMenuTrigger>
    <DropdownMenuContent side="top" align="end" className="w-52">
      {children}
    </DropdownMenuContent>
  </DropdownMenu>
);

const IconLink = ({
  href,
  label,
  tooltip,
  children,
}: {
  href: string;
  label: string;
  tooltip: ReactNode;
  children: ReactNode;
}) => (
  <Tooltip>
    <TooltipTrigger
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
    <TooltipContent side="top">{tooltip}</TooltipContent>
  </Tooltip>
);

export const SiteFooter = () => {
  const content = useIntlayer("site-footer");
  return (
    <footer className="mx-auto mt-auto w-full max-w-[1800px] px-4 pt-6 text-sm sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
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
        <nav
          aria-label={content.footer.value}
          className="-mr-2 flex flex-wrap items-center gap-0.5"
        >
          <FooterMenu label={content.legal}>
            <DropdownMenuLinkItem render={<Link to={ROUTES.TERMS} />}>
              {content.terms}
            </DropdownMenuLinkItem>
            <DropdownMenuLinkItem render={<Link to={ROUTES.PRIVACY} />}>
              {content.privacy}
            </DropdownMenuLinkItem>
            <DropdownMenuLinkItem render={<Link to={ROUTES.REFUNDS} />}>
              {content.refunds}
            </DropdownMenuLinkItem>
            <DropdownMenuLinkItem render={<Link to={ROUTES.DPA} />}>
              {content.dpa}
            </DropdownMenuLinkItem>
          </FooterMenu>
          <FooterMenu label={content.company}>
            <DropdownMenuLinkItem render={<Link to={ROUTES.ABOUT} />}>
              {content.about}
            </DropdownMenuLinkItem>
            <DropdownMenuLinkItem render={<Link to={ROUTES.BRAND} />}>
              {content.brand}
            </DropdownMenuLinkItem>
            <DropdownMenuLinkItem render={<Link to={ROUTES.CONTACT} />}>
              {content.contact}
            </DropdownMenuLinkItem>
            <DropdownMenuLinkItem render={<Link to={ROUTES.SPONSOR} />}>
              {content.sponsor}
            </DropdownMenuLinkItem>
          </FooterMenu>
          <FooterMenu label={content.otherProducts}>
            {[...OTHER_PRODUCTS, ...MORE_PRODUCTS].map((product) => (
              <DropdownMenuLinkItem
                key={product.name}
                href={withUtm(product.url, "footer")}
              >
                {product.name}
              </DropdownMenuLinkItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                {content.labsProjects}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44">
                {SHADCN_LABS_PROJECTS.map((project) => (
                  <DropdownMenuLinkItem
                    key={project.name}
                    href={withUtm(project.url, "footer")}
                  >
                    {project.name}
                  </DropdownMenuLinkItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </FooterMenu>
          <span className="bg-border mx-1.5 h-4 w-px" aria-hidden="true" />
          <TooltipProvider>
            <IconLink
              href={LINK.GITHUB_REPO}
              label={content.githubRepository.value}
              tooltip={content.starGithub}
            >
              <GitHubIcon className="size-4" />
            </IconLink>
            <IconLink
              href={LINK.X}
              label={`${content.followX.value}: ${SITE.AUTHOR.TWITTER}`}
              tooltip={content.followX}
            >
              <XIcon className="size-4" />
            </IconLink>
          </TooltipProvider>
          <span className="bg-border mx-1.5 h-4 w-px" aria-hidden="true" />
          <LocaleSwitcher />
          <ThemeToggle hotkey />
        </nav>
      </div>
      <FooterWordmark />
    </footer>
  );
};
