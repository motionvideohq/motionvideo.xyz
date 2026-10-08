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

const Dpa = () => {
  const copy = useIntlayer("legal-dpa");

  return (
  <>
    <LegalPageHeader title={copy.heading0.value} />
    <p className="text-muted-foreground leading-7">{copy.text1}{" "}
      {SITE.NAME}{copy.text2}{" "}{SITE.LEGAL.OPERATOR}{" "}{copy.text3}{" "}
      <Link to="/terms" className={linkClass}>{copy.text4}</Link>{" "}{copy.text5}{" "}
      <Link to="/privacy" className={linkClass}>{copy.text6}</Link>{copy.text7}</p>

    <PageSection title={copy.heading8.value}>
      <p>
        {SITE.NAME}{" "}{copy.text9}</p>
    </PageSection>

    <PageSection title={copy.heading10.value}>
      <PageList>
        <li>{copy.text11}{" "}{SITE.DOMAIN}{" "}{copy.text12}</li>
        <li>{copy.text13}</li>
        <li>{copy.text14}</li>
      </PageList>
    </PageSection>

    <PageSection title={copy.heading15.value}>
      <p>{copy.text16}</p>
      <PageList>
        <li>
          <strong className="text-foreground">{copy.text17}</strong>{copy.text18}</li>
        <li>
          <strong className="text-foreground">{copy.text19}</strong>{copy.text20}</li>
        <li>
          <strong className="text-foreground">{copy.text21}</strong>{copy.text22}</li>
        <li>
          <strong className="text-foreground">{copy.text23}</strong>{copy.text24}</li>
      </PageList>
      <p>{copy.text25}</p>
    </PageSection>

    <PageSection title={copy.heading26.value}>
      <PageList>
        <li>{copy.text27}</li>
        <li>{copy.text28}</li>
        <li>{copy.text29}{" "}{SITE.LEGAL.OPERATOR}.
        </li>
        <li>{copy.text30}</li>
      </PageList>
    </PageSection>

    <PageSection title={copy.heading31.value}>
      <p>{copy.text32}{" "}{SITE.LEGAL.JURISDICTION}{copy.text33}</p>
    </PageSection>

    <PageSection title={copy.heading34.value}>
      <p>{copy.text35}</p>
    </PageSection>

    <PageSection title={copy.heading36.value}>
      <p>{copy.text37}{" "}<SupportEmail />{copy.text38}</p>
    </PageSection>

    <PageSection title={copy.heading39.value}>
      <p>{copy.text40}</p>
    </PageSection>

    <PageSection title={copy.heading41.value}>
      <p>{copy.text42}{" "}<SupportEmail />{" "}{copy.text43}</p>
    </PageSection>
  </>
);
};

export const Route = createFileRoute("/_pages/dpa")({
  component: Dpa,
  head: () => ({
    ...createMetadata({
      canonical: ROUTES.DPA,
      description: `How ${SITE.NAME} processes personal data for business customers.`,
      title: "Data processing addendum",
    }),
    scripts: [breadcrumbJsonLd({ name: "DPA", path: ROUTES.DPA })],
  }),
});
