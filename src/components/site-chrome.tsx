import { Link } from "@tanstack/react-router";
import { cn } from "cn";
import { ChevronDownIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";

import { GitHubIcon, XIcon } from "@/components/brand-icons";
import { Logomark } from "@/components/logomark";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { SITE } from "@/constants/site";
import { withUtm } from "@/lib/utm";

export const Brand = () => (
  <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
    <Logomark className="h-4 w-auto" />
    {SITE.NAME}
  </Link>
);

export const SiteHeader = ({ signedIn }: { signedIn: boolean }) => {
  const content = useIntlayer("chrome");
  return (
  <header>
    <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
      <Brand />
      <div className="flex items-center gap-3">
        <LocaleSwitcher />
        <Link
        to={signedIn ? "/dashboard" : "/sign-in"}
        className={buttonVariants({ size: "sm", variant: "ghost" })}
      >
        {signedIn ? content.dashboard : content.access}
      </Link>
      </div>
    </div>
  </header>
  );
};

const linkClass =
  "text-muted-foreground hover:text-foreground transition-colors";

const FooterColumn = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-3">
    <h2 className="text-foreground text-sm font-medium">{title}</h2>
    <ul className="flex flex-col gap-2 text-sm">{children}</ul>
  </div>
);

export const SiteFooter = () => {
  const content = useIntlayer("chrome");
  return (
  <footer className="mx-auto w-full max-w-5xl px-6 pt-24 pb-10">
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <div className="flex flex-col gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <Logomark className="h-5 w-auto" />
          {SITE.NAME}
        </Link>
        <p className="text-muted-foreground max-w-xs text-sm">
          {content.tagline}
        </p>
        {/* -ml-2 lines the icons up with the text above the ghost padding. */}
        <TooltipProvider>
          <div className="-ml-2 flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    href={LINK.GITHUB_REPO}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={content.githubRepository.value}
                    className={buttonVariants({
                      size: "icon",
                      variant: "ghost",
                    })}
                  />
                }
              >
                <GitHubIcon className="size-4" />
              </TooltipTrigger>
              <TooltipContent side="top">{content.starGithub}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    href={LINK.X}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${content.followX.value}: ${SITE.AUTHOR.TWITTER}`}
                    className={buttonVariants({
                      size: "icon",
                      variant: "ghost",
                    })}
                  />
                }
              >
                <XIcon className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent side="top">{content.followX}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>

      <nav
        aria-label={content.footer.value}
        className="grid grid-cols-2 gap-8 sm:grid-cols-4"
      >
        <FooterColumn title={content.product.value}>
          <li>
            <a href="/#features" className={linkClass}>
              {content.features}
            </a>
          </li>
          <li>
            <a href="/#how-it-works" className={linkClass}>
              {content.howItWorks}
            </a>
          </li>
          <li>
            <a href="/#pricing" className={linkClass}>
              {content.pricing}
            </a>
          </li>
          <li>
            <a href="/#faq" className={linkClass}>
              {content.faq}
            </a>
          </li>
        </FooterColumn>
        <FooterColumn title={content.company.value}>
          <li>
            <Link to="/about" className={linkClass}>
              {content.about}
            </Link>
          </li>
          <li>
            <Link to="/brand" className={linkClass}>
              {content.brand}
            </Link>
          </li>
          <li>
            <Link to="/contact" className={linkClass}>
              {content.contact}
            </Link>
          </li>
        </FooterColumn>
        <FooterColumn title={content.legal.value}>
          <li>
            <Link to="/terms" className={linkClass}>
              {content.terms}
            </Link>
          </li>
          <li>
            <Link to="/privacy" className={linkClass}>
              {content.privacy}
            </Link>
          </li>
          <li>
            <Link to="/refunds" className={linkClass}>
              {content.refunds}
            </Link>
          </li>
          <li>
            <Link to="/dpa" className={linkClass}>
              {content.dpa}
            </Link>
          </li>
        </FooterColumn>
        <FooterColumn title={content.otherProducts.value}>
          {OTHER_PRODUCTS.map((product) => (
            <li key={product.name}>
              <a href={withUtm(product.url, "footer")} className={linkClass}>
                {product.name}
              </a>
            </li>
          ))}
          <li>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <span
                  className={cn(linkClass, "inline-flex items-center gap-1")}
                >
                  {content.andMore}
                  <ChevronDownIcon
                    aria-hidden
                    className="size-3.5 transition-transform in-data-popup-open:rotate-180"
                  />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-48">
                <DropdownMenuGroup>
                  {MORE_PRODUCTS.map((product) => (
                    <DropdownMenuLinkItem
                      key={product.name}
                      href={withUtm(product.url, "footer")}
                    >
                      {product.name}
                    </DropdownMenuLinkItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
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
          </li>
        </FooterColumn>
      </nav>
    </div>

    <div className="text-muted-foreground mt-16 flex items-center justify-between gap-4 text-sm">
      <p>
        © {new Date().getFullYear()} {SITE.NAME} · {content.builtBy}{" "}
        <a
          href={withUtm(LINK.AUTHOR_WEBSITE, "footer")}
          className="hover:text-foreground transition-colors"
        >
          {SITE.AUTHOR.FIRST_NAME}
        </a>
      </p>
      <ThemeToggle hotkey />
    </div>
  </footer>
  );
};
