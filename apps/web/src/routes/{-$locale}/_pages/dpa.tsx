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

const Dpa = () => {
  const copy = useIntlayer("legal-dpa");

  return (
    <>
      <LegalPageHeader title={copy.title.value} />
      <p className="text-muted-foreground leading-7">
        {copy.intro1}{" "}
        <Link to={ROUTES.TERMS} className={linkClass}>
          {copy.introTerms}
        </Link>{" "}
        {copy.intro2} {SITE.LEGAL.OPERATOR}
        {copy.intro3}
      </p>

      <PageSection title={copy.rolesHeading.value}>
        <p>
          {copy.rolesText}{" "}
          <Link to={ROUTES.PRIVACY} className={linkClass}>
            {copy.rolesPrivacy}
          </Link>
          {copy.rolesText2}
        </p>
      </PageSection>

      <PageSection title={copy.processingHeading.value}>
        <p>{copy.processingText}</p>
      </PageSection>

      <PageSection title={copy.securityHeading.value}>
        <p>
          {copy.securityText}{" "}
          <Link to={ROUTES.SECURITY} className={linkClass}>
            {copy.securityLink}
          </Link>
          .
        </p>
      </PageSection>

      <PageSection title={copy.subprocessorsHeading.value}>
        <p>
          {copy.subprocessorsText}{" "}
          <Link to={ROUTES.SUBPROCESSORS} className={linkClass}>
            {copy.subprocessorsLink}
          </Link>
          {copy.subprocessorsText2} <SupportEmail />.
        </p>
      </PageSection>

      <PageSection title={copy.requestsHeading.value}>
        <p>{copy.requestsText}</p>
      </PageSection>

      <PageSection title={copy.breachesHeading.value}>
        <p>{copy.breachesText}</p>
      </PageSection>

      <PageSection title={copy.deletionHeading.value}>
        <p>{copy.deletionText}</p>
      </PageSection>

      <PageSection title={copy.transfersHeading.value}>
        <p>{copy.transfersText}</p>
      </PageSection>

      <PageSection title={copy.detailsHeading.value}>
        <PageList>
          <li>
            <strong className="text-foreground">
              {copy.detailsSubjectsLabel}
            </strong>
            {copy.detailsSubjects}
          </li>
          <li>
            <strong className="text-foreground">{copy.detailsDataLabel}</strong>
            {copy.detailsData}
          </li>
          <li>
            <strong className="text-foreground">
              {copy.detailsPurposeLabel}
            </strong>
            {copy.detailsPurpose}
          </li>
          <li>
            <strong className="text-foreground">
              {copy.detailsDurationLabel}
            </strong>
            {copy.detailsDuration}
          </li>
        </PageList>
      </PageSection>

      <PageSection title={copy.contactHeading.value}>
        <p>
          {copy.contactText} <SupportEmail />
        </p>
      </PageSection>
    </>
  );
};

export const Route = createFileRoute("/{-$locale}/_pages/dpa")({
  component: Dpa,
  head: ({ params }) => {
    const meta = getIntlayer(
      "directory-meta",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    ).dpa;
    return {
      ...createMetadata({ description: meta.description, title: meta.title }),
      scripts: [
        breadcrumbJsonLd({ page: "dpa", path: ROUTES.DPA }, params.locale),
      ],
    };
  },
});
