import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer } from "react-intlayer";

import {
  LegalPageHeader,
  PageList,
  PageSection,
  SupportEmail,
} from "@/components/page";
import { LINK } from "@/constants/links";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

const linkClass = "text-foreground underline underline-offset-4";

const Security = () => {
  const copy = useIntlayer("legal-security");
  const sections = useIntlayer("site-footer");

  return (
    <>
      <LegalPageHeader title={sections.security.value} />
      <p className="text-muted-foreground leading-7">{copy.intro}</p>

      <PageSection title={copy.dataHeading.value}>
        <PageList>
          <li>{copy.dataHttps}</li>
          <li>{copy.dataCards}</li>
          <li>{copy.dataWebhooks}</li>
          <li>{copy.dataCodes}</li>
          <li>{copy.dataBackups}</li>
        </PageList>
      </PageSection>

      <PageSection title={copy.accountHeading.value}>
        <PageList>
          <li>{copy.accountPasswordless}</li>
          <li>{copy.accountCodes}</li>
          <li>{copy.accountCookie}</li>
          <li>{copy.accountSeats}</li>
          <li>{copy.accountMcp}</li>
        </PageList>
      </PageSection>

      <PageSection title={copy.siteHeading.value}>
        <PageList>
          <li>{copy.siteUploads}</li>
          <li>{copy.siteReview}</li>
          <li>{copy.siteLimits}</li>
          <li>{copy.siteAdmin}</li>
          <li>{copy.siteOpenSource}</li>
        </PageList>
      </PageSection>

      <PageSection title={copy.reportHeading.value}>
        <p>
          {copy.reportText}{" "}
          <a
            href={`${LINK.GITHUB_REPO}/security/advisories/new`}
            className={linkClass}
          >
            {copy.reportAdvisories}
          </a>{" "}
          {copy.reportOr} <SupportEmail />
          {copy.reportText2}
        </p>
      </PageSection>
    </>
  );
};

export const Route = createFileRoute("/{-$locale}/_pages/security")({
  component: Security,
  head: ({ params }) => {
    const meta = getIntlayer(
      "directory-meta",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    ).security;
    return {
      ...createMetadata({ description: meta.description, title: meta.title }),
      scripts: [
        breadcrumbJsonLd(
          { page: "security", path: ROUTES.SECURITY },
          params.locale
        ),
      ],
    };
  },
});
