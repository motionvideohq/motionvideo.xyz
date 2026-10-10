import { Link, createFileRoute } from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";

import {
  LegalPageHeader,
  PageList,
  PageSection,
  SupportEmail,
} from "@/components/page";
import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

const linkClass = "text-foreground underline underline-offset-4";

const Terms = () => {
  const copy = useIntlayer("legal-terms");

  return (
    <>
      <LegalPageHeader title={copy.heading0.value} />
      <p className="text-muted-foreground leading-7">
        {copy.text1} {SITE.DOMAIN} {copy.text2} {SITE.NAME} {copy.text3}{" "}
        {SITE.LEGAL.OPERATOR} {copy.text4} {SITE.NAME} {copy.text5}
      </p>

      <PageSection title={copy.heading6.value}>
        <p>
          {SITE.NAME} {copy.text7}
        </p>
        <p>{copy.text8}</p>
      </PageSection>

      <PageSection title={copy.heading9.value}>
        <p>
          <a href={LINK.DODO_PAYMENTS} className={linkClass}>
            {copy.text10}
          </a>{" "}
          {copy.text11}{" "}
          <a
            href={`${LINK.DODO_PAYMENTS}/legal/terms-of-use`}
            className={linkClass}
          >
            {copy.merchantTerms}
          </a>
          {copy.text11b}
        </p>
      </PageSection>

      <PageSection title={copy.heading12.value}>
        <p>{copy.text13}</p>
        <p>
          {copy.text14}{" "}
          <Link to="/sign-in" className={linkClass}>
            {copy.text15}
          </Link>
          {copy.text16}
        </p>
        <p>{copy.text17}</p>
      </PageSection>

      <PageSection title={copy.heading18.value}>
        <p>
          {copy.text19} {SITE.NAME}
          {copy.text20}
        </p>
        <PageList>
          <li>{copy.text21}</li>
          <li>{copy.text22}</li>
          <li>{copy.text23}</li>
        </PageList>
        <p>{copy.text24}</p>
      </PageSection>

      <PageSection title={copy.heading25.value}>
        <p>
          {copy.text26}{" "}
          <Link to="/refunds" className={linkClass}>
            {copy.text27}
          </Link>
          {copy.text28}
        </p>
      </PageSection>

      <PageSection title={copy.sponsorHeading.value}>
        <p>{copy.sponsorText1}</p>
        <p>{copy.sponsorText2}</p>
        <p>{copy.sponsorText3}</p>
      </PageSection>

      <PageSection title={copy.worksHeading.value}>
        <p>{copy.worksText1} assets.motionvideo.xyz.</p>
        <p>
          {copy.worksText2}{" "}
          <Link to="/contact" className={linkClass}>
            {copy.worksContact}
          </Link>{" "}
          {copy.worksText3} <SupportEmail />.
        </p>
      </PageSection>

      <PageSection title={copy.heading29.value}>
        <p>{copy.text30}</p>
        <PageList>
          <li>{copy.text31}</li>
          <li>{copy.text32}</li>
          <li>
            {copy.text33} {SITE.DOMAIN}.
          </li>
          <li>{copy.text34}</li>
        </PageList>
        <p>{copy.text35}</p>
      </PageSection>

      <PageSection title={copy.heading36.value}>
        <p>{copy.text37}</p>
      </PageSection>

      <PageSection title={copy.heading38.value}>
        <p>
          {SITE.NAME} {copy.text39}
        </p>
        <p>
          {copy.text40} {SITE.NAME} {copy.text41}
        </p>
      </PageSection>

      <PageSection title={copy.heading42.value}>
        <p>
          {copy.text43} {SITE.LEGAL.JURISDICTION}
          {copy.text44}
        </p>
      </PageSection>

      <PageSection title={copy.heading45.value}>
        <p>{copy.text46}</p>
      </PageSection>

      <PageSection title={copy.heading47.value}>
        <p>
          <SupportEmail />
        </p>
      </PageSection>
    </>
  );
};

export const Route = createFileRoute("/_pages/terms")({
  component: Terms,
  head: () => ({
    ...createMetadata({
      canonical: ROUTES.TERMS,
      description: `The rules for purchasing and using ${SITE.NAME}.`,
      title: "Terms of service",
    }),
    scripts: [breadcrumbJsonLd({ name: "Terms", path: ROUTES.TERMS })],
  }),
});
