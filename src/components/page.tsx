import { useMemo } from "react";
import type { ReactNode } from "react";
import { useIntlayer, useLocale } from "react-intlayer";

import { LINK } from "@/constants/links";
import { SITE } from "@/constants/site";

// Building blocks for the text pages rendered inside the `_pages` layout.

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
  const content = useIntlayer("chrome");
  const { locale } = useLocale();
  const updatedAt = useMemo(
    () => new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(new Date(`${SITE.LEGAL.UPDATED_AT}T00:00:00Z`)),
    [locale]
  );
  return <PageHeader title={title} intro={`${content.updated.value} ${updatedAt}`} />;
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
