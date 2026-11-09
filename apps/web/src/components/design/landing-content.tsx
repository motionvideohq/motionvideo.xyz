import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import {
  BrandColors,
  BrandHero,
  BrandLogos,
  BrandMisuse,
  BrandMisuses,
  BrandType,
  BrandTypeface,
} from "@/components/brand-kit";
import { LocalizedLink as Link } from "@/components/localized-link";
import { Logomark } from "@/components/logo";
import { SupportEmail } from "@/components/page";
import { ROUTES } from "@/constants/routes";
import { DESIGN_COMPONENT_PAGES, DESIGN_FOUNDATIONS } from "@/lib/design";
import type { DesignFoundationSlug } from "@/lib/design";
import { buttonVariants } from "@/registry/ui/button";

const FoundationPreview = ({ slug }: { slug: DesignFoundationSlug }) => {
  if (slug === "colors") {
    return (
      <div className="flex items-center gap-3">
        {[
          "bg-foreground",
          "bg-muted-foreground",
          "bg-border",
          "bg-primary",
          "bg-destructive",
          "bg-badge-blue-fg",
        ].map((color) => (
          <span
            key={color}
            className="shadow-outline bg-background flex h-20 w-7 items-center justify-center rounded-full p-2 sm:w-8"
          >
            <span className={`h-full w-full rounded-full ${color}`} />
          </span>
        ))}
      </div>
    );
  }
  if (slug === "typography") {
    return (
      <div className="grid w-full grid-cols-2 items-baseline gap-x-6 gap-y-2 px-3">
        <span className="text-4xl font-medium tracking-tight">Aa</span>
        <span className="font-mono text-4xl tracking-tight">Aa</span>
        <span className="text-muted-foreground text-xs">Timeless Sans</span>
        <span className="text-muted-foreground font-mono text-xs">
          Paper Mono
        </span>
      </div>
    );
  }
  if (slug === "materials") {
    return (
      <div className="relative h-28 w-52">
        <div className="bg-muted/40 absolute inset-x-0 top-0 h-20 rounded-lg border" />
        <div className="bg-card shadow-outline absolute inset-x-4 top-4 h-20 rounded-lg" />
        <div className="bg-popover shadow-popover absolute inset-x-8 top-8 flex h-20 items-center justify-center rounded-lg">
          <span className="bg-muted size-7 rounded-md border" />
        </div>
      </div>
    );
  }
  return (
    <div className="relative flex w-60 items-center justify-between px-3">
      <span className="absolute inset-x-3 top-1/2 border-t border-dashed" />
      {[0, 1, 2].map((step) => (
        <span
          key={step}
          className={`bg-background relative flex size-12 items-center justify-center rounded-xl border transition-transform duration-500 ease-out motion-reduce:transition-none ${step === 1 ? "group-hover:-translate-y-4" : "group-hover:translate-y-2"}`}
        >
          <span
            className={`size-5 rounded-md ${step === 1 ? "bg-primary" : "bg-foreground"}`}
          />
        </span>
      ))}
    </div>
  );
};

const OverviewCard = ({
  title,
  description,
  to,
  children,
}: {
  title: string;
  description: string;
  to: string;
  children: ReactNode;
}) => (
  <Link
    to={to}
    className="group focus-visible:ring-ring flex min-w-0 flex-col border-b outline-none focus-visible:z-10 focus-visible:ring-2"
  >
    <div
      aria-hidden="true"
      className="bg-muted/70 flex h-48 items-center justify-center overflow-hidden border-b p-5 sm:p-6"
    >
      {children}
    </div>
    <div className="bg-background group-hover:bg-muted/25 p-5 transition-colors sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium">{title}</h2>
        <ArrowRight
          aria-hidden="true"
          className="text-muted-foreground size-3.5 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
        />
      </div>
      <p className="text-muted-foreground mt-1.5 text-sm leading-6">
        {description}
      </p>
    </div>
  </Link>
);

const DesignOverview = () => {
  const content = useIntlayer("design");
  const system = useIntlayer("design-system");
  return (
    <div className="not-prose text-foreground overflow-hidden rounded-lg border-x border-t sm:grid sm:grid-cols-2 sm:[&>*:nth-child(odd)]:border-r">
      <OverviewCard
        title={system.brandAssets.value}
        description={content.brandDescription.value}
        to={ROUTES.DESIGN_BRAND}
      >
        <Logomark className="h-14 w-auto" />
      </OverviewCard>
      <OverviewCard
        title={content.components.value}
        description={content.componentsDescription.value}
        to={ROUTES.DESIGN_COMPONENTS}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium">
              Create something
            </span>
            <span className="shadow-outline bg-background rounded-md px-4 py-2 text-sm">
              Explore
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-foreground flex h-5 w-9 items-center justify-end rounded-full p-0.5">
              <span className="bg-background size-4 rounded-full" />
            </span>
            <span className="bg-muted rounded-md px-2 py-1 font-mono text-xs">
              ⌘ K
            </span>
            <span className="bg-badge-blue-bg text-badge-blue-fg rounded-full px-2 py-1 text-xs">
              In motion
            </span>
          </div>
        </div>
      </OverviewCard>
      {DESIGN_FOUNDATIONS.map((foundation) => (
        <OverviewCard
          key={foundation.slug}
          title={system[foundation.slug].value}
          description={foundation.description}
          to={foundation.url}
        >
          <FoundationPreview slug={foundation.slug} />
        </OverviewCard>
      ))}
    </div>
  );
};

const MASONRY_SPECIMEN_LANES = [
  ["aspect-square", "aspect-[4/3]"],
  ["aspect-[4/5]", "aspect-[16/9]"],
  ["aspect-[3/2]", "aspect-square"],
];

// Non-interactive specimens leave navigation to the caption below each preview.
const ComponentSpecimen = ({ name }: { name: string }) => {
  if (name === "button") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className={buttonVariants({ size: "lg" })}>Default</span>
        <span className={buttonVariants({ variant: "outline", size: "lg" })}>
          Outline
        </span>
        <span className={buttonVariants({ variant: "secondary", size: "lg" })}>
          Secondary
        </span>
      </div>
    );
  }
  if (name === "virtual-masonry") {
    return (
      <div className="grid w-full max-w-64 grid-cols-3 items-start gap-2">
        {MASONRY_SPECIMEN_LANES.map((ratios, lane) => (
          <div key={lane} className="flex flex-col gap-2">
            {ratios.map((ratio, index) => (
              <div
                key={ratio}
                className={`bg-background text-muted-foreground shadow-outline flex items-center justify-center rounded-md font-mono text-xs ${ratio}`}
              >
                {lane + index * 3 + 1}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const DesignComponentCatalog = () => (
  <ul className="not-prose text-foreground grid gap-5 sm:grid-cols-2">
    {DESIGN_COMPONENT_PAGES.map((page, index) => (
      <li
        key={page.url}
        className="border-border bg-background flex min-w-0 flex-col overflow-hidden rounded-xl border"
      >
        <div
          aria-hidden="true"
          className="border-border bg-muted/20 relative flex min-h-56 items-center justify-center border-b p-6"
        >
          <span className="text-muted-foreground absolute top-4 left-4 font-mono text-[10px] tabular-nums">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="pointer-events-none flex w-full items-center justify-center select-none">
            <ComponentSpecimen name={page.slugs[1] ?? ""} />
          </div>
        </div>
        <Link
          to={page.url}
          className="group hover:bg-muted/40 focus-visible:ring-ring flex flex-1 flex-col gap-2 p-5 transition-colors duration-150 ease-out outline-none focus-visible:ring-2 focus-visible:ring-inset motion-reduce:transition-none"
        >
          <span className="text-foreground flex items-center justify-between gap-3 font-medium">
            {page.data.title}
            <ArrowRight
              aria-hidden="true"
              className="text-muted-foreground size-4 shrink-0 transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </span>
          <span className="text-muted-foreground text-sm leading-6 text-pretty">
            {page.data.description}
          </span>
        </Link>
      </li>
    ))}
  </ul>
);

export const landingMdxComponents = {
  DesignOverview,
  DesignComponentCatalog,
  BrandHero,
  BrandLogos,
  BrandColors,
  BrandType,
  BrandTypeface,
  BrandMisuses,
  BrandMisuse,
  SupportEmail,
};
