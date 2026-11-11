import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer } from "react-intlayer";

import { LocalizedLink as Link } from "@/components/localized-link";
import {
  LegalPageHeader,
  PageList,
  PageSection,
  SupportEmail,
} from "@/components/page";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

const linkClass = "text-foreground underline underline-offset-4";

const Refunds = () => {
  const copy = useIntlayer("legal-refunds");
  const sections = useIntlayer("site-footer");

  return (
    <>
      <LegalPageHeader title={sections.refunds.value} />
      <p className="text-muted-foreground leading-7">
        {copy.text1} {SITE.NAME}
        {copy.text2} {SITE.LEGAL.OPERATOR}
        {copy.text3}{" "}
        <Link to={ROUTES.TERMS} className={linkClass}>
          {copy.text4}
        </Link>
        .
      </p>

      <PageSection title={copy.heading5.value}>
        <p>
          {SITE.NAME} {copy.text6}
        </p>
      </PageSection>

      <PageSection title={copy.renewalHeading.value}>
        <p>{copy.renewalText1}</p>
        <p>{copy.renewalText2}</p>
      </PageSection>

      <PageSection title={copy.heading10.value}>
        <p>{copy.text11}</p>
        <p>{copy.text12}</p>
      </PageSection>

      <PageSection title={copy.heading13.value}>
        <PageList>
          <li>{copy.text14}</li>
          <li>{copy.text15}</li>
          <li>{copy.text16}</li>
        </PageList>
        <p>{copy.text17}</p>
      </PageSection>

      <PageSection title={copy.bundleHeading.value}>
        <p>{copy.bundleText}</p>
      </PageSection>

      <PageSection title={copy.heading18.value}>
        <p>
          {copy.text19} <SupportEmail /> {copy.text20}
        </p>
      </PageSection>

      <PageSection title={copy.heading21.value}>
        <p>{copy.text22}</p>
      </PageSection>

      <PageSection title={copy.sponsorHeading.value}>
        <p>{copy.sponsorText1}</p>
        <p>{copy.sponsorText2}</p>
      </PageSection>

      <PageSection title={copy.jobsHeading.value}>
        <p>{copy.jobsText}</p>
      </PageSection>
    </>
  );
};

export const Route = createFileRoute("/{-$locale}/_pages/refunds")({
  component: Refunds,
  head: ({ params }) => ({
    ...createMetadata({
      description: getIntlayer(
        "directory-meta",
        isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
      ).refunds.description,
      title: getIntlayer(
        "directory-meta",
        isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
      ).refunds.title,
    }),
    scripts: [
      breadcrumbJsonLd(
        { page: "refunds", path: ROUTES.REFUNDS },
        params.locale
      ),
    ],
  }),
});
