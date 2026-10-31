import { useMemo } from "react";
import type { ReactNode } from "react";
import { useIntlayer, useLocale } from "react-intlayer";

import { LINK } from "@/constants/links";
import { SITE } from "@/constants/site";
import { cn } from "@/lib/utils";

// Shared page shell. Every page outside the gallery and directory grids uses
// the same side and top padding; only the width differs: `full` matches the
// header (collections such as bookmarks), `narrow` centres a reading or form
// column (settings, sponsorships, legal and company pages).
const PAGE_WIDTH = {
  full: "max-w-[1800px]",
  narrow: "max-w-3xl",
} as const;

export const pageContainerClass = (width: keyof typeof PAGE_WIDTH) =>
  cn("mx-auto w-full px-4 sm:px-6", PAGE_WIDTH[width]);

export const PageMain = ({
  width,
  className,
  children,
}: {
  width: keyof typeof PAGE_WIDTH;
  className?: string;
  children: ReactNode;
}) => (
  <main
    id="main-content"
    className={cn(
      pageContainerClass(width),
      "flex flex-1 flex-col gap-6 pt-6 pb-16",
      className
    )}
  >
    {children}
  </main>
);

/**
 * Heading for the signed-in pages (bookmarks, featured, submit, settings,
 * sponsorships, dashboard): title, one muted line, optional actions on the
 * right.
 */
export const AccountPageHeader = ({
  title,
  intro,
  actions,
  className,
}: {
  title: ReactNode;
  intro: ReactNode;
  actions?: ReactNode;
  className?: string;
}) => (
  <header className={cn("flex items-center justify-between gap-4", className)}>
    <div className="flex min-w-0 flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground text-sm">{intro}</p>
    </div>
    {actions}
  </header>
);

/**
 * Centred hero for the marketing pages (Jobs, Post a job, Sponsor): a large
 * title, one muted line, then optional actions and a small note.
 */
export const HeroHeader = ({
  title,
  intro,
  actions,
  note,
}: {
  title: ReactNode;
  intro: ReactNode;
  actions?: ReactNode;
  note?: ReactNode;
}) => (
  <header className="mx-auto flex max-w-2xl flex-col items-center gap-4 pt-6 text-center sm:pt-10">
    <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
      {title}
    </h1>
    <p className="text-muted-foreground max-w-md text-pretty">{intro}</p>
    {actions && (
      <div className="mt-2 flex flex-wrap justify-center gap-2">{actions}</div>
    )}
    {note && <p className="text-muted-foreground text-xs">{note}</p>}
  </header>
);

/**
 * One block of a two-column form (post a job, sponsorship placement): what the
 * block is about on the left, its fields on the right. Stacks on phones.
 */
export const FormSection = ({
  title,
  description,
  children,
}: {
  title: ReactNode;
  description: ReactNode;
  children: ReactNode;
}) => (
  <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] md:gap-10">
    <div className="flex flex-col gap-1">
      <h2 className="text-sm font-medium">{title}</h2>
      <p className="text-muted-foreground text-sm text-pretty">{description}</p>
    </div>
    <div className="flex min-w-0 flex-col gap-5">{children}</div>
  </section>
);

// Building blocks for the text pages (legal and company) rendered inside the
// `_pages` layout.

export const PageHeader = ({
  title,
  intro,
}: {
  title: string;
  intro: ReactNode;
}) => (
  <header className="flex flex-col gap-3">
    <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
    <p className="text-muted-foreground">{intro}</p>
  </header>
);

export const LegalPageHeader = ({ title }: { title: string }) => {
  const content = useIntlayer("page");
  const { locale } = useLocale();
  const updatedAt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "long",
        timeZone: "UTC",
      }).format(new Date(`${SITE.LEGAL.UPDATED_AT}T00:00:00Z`)),
    [locale]
  );
  return (
    <PageHeader title={title} intro={`${content.updated.value} ${updatedAt}`} />
  );
};

export const PageSection = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => (
  <section className="text-muted-foreground flex flex-col gap-4 leading-7">
    <h2 className="text-foreground text-xl font-semibold tracking-tight">
      {title}
    </h2>
    {children}
  </section>
);

/**
 * Heading of a section on the marketing pages (Pro, Skill, MCP, Sponsor):
 * one size everywhere, with an optional muted description below. Centred by
 * default; `align="start"` for story sections that read best left-aligned.
 * The hero keeps its own larger title; this is for every section after it.
 */
export const SectionHeader = ({
  id,
  title,
  description,
  align = "center",
  className,
}: {
  id?: string;
  title: ReactNode;
  /** A line of text, or several `<p>`s for more than one paragraph. */
  description?: ReactNode;
  align?: "center" | "start";
  className?: string;
}) => (
  <div
    className={cn(
      "flex flex-col gap-3",
      align === "center" && "items-center text-center",
      className
    )}
  >
    <h2 id={id} className="text-2xl font-semibold tracking-tight text-balance">
      {title}
    </h2>
    {description && (
      <div
        className={cn(
          "text-muted-foreground flex flex-col gap-3 text-pretty",
          align === "center" && "max-w-2xl"
        )}
      >
        {description}
      </div>
    )}
  </div>
);

export const PageList = ({ children }: { children: ReactNode }) => (
  <ul className="flex list-disc flex-col gap-2 pl-5">{children}</ul>
);

export const SupportEmail = () => (
  <a
    href={`mailto:${LINK.EMAIL}`}
    className="text-foreground underline underline-offset-4"
  >
    {LINK.EMAIL}
  </a>
);
