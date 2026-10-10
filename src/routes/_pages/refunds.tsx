import { Link, createFileRoute } from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";

import {
  LegalPageHeader,
  PageList,
  PageSection,
  SupportEmail,
} from "@/components/page";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

const linkClass = "text-foreground underline underline-offset-4";

const Refunds = () => {
  const copy = useIntlayer("legal-refunds");

  return (
    <>
      <LegalPageHeader title={copy.heading0.value} />
      <p className="text-muted-foreground leading-7">
        {copy.text1} {SITE.NAME}
        {copy.text2} {SITE.LEGAL.OPERATOR}
        {copy.text3}{" "}
        <Link to="/terms" className={linkClass}>
          {copy.text4}
        </Link>
        .
      </p>

      <PageSection title={copy.heading5.value}>
        <p>
          {SITE.NAME} {copy.text6}
        </p>
      </PageSection>

      <PageSection title={copy.heading7.value}>
        <p>
          {copy.text8} <SupportEmail />
          {copy.text9}
        </p>
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
    </>
  );
};

export const Route = createFileRoute("/_pages/refunds")({
  component: Refunds,
  head: () => ({
    ...createMetadata({
      canonical: ROUTES.REFUNDS,
      description: `When ${SITE.NAME} purchases can be refunded and how to ask.`,
      title: "Refund policy",
    }),
    scripts: [breadcrumbJsonLd({ name: "Refunds", path: ROUTES.REFUNDS })],
  }),
});
