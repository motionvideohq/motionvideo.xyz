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

const Privacy = () => {
  const copy = useIntlayer("legal-privacy");

  return (
    <>
      <LegalPageHeader title={copy.heading0.value} />
      <p className="text-muted-foreground leading-7">
        {copy.text1} {SITE.LEGAL.OPERATOR} {copy.text2} {SITE.DOMAIN}
        {copy.text3} {SITE.NAME}
        {copy.text4}
      </p>

      <PageSection title={copy.heading5.value}>
        <PageList>
          <li>
            <strong className="text-foreground">{copy.text6}</strong>
            {copy.text7}
          </li>
          <li>
            <strong className="text-foreground">{copy.text8}</strong>
            {copy.text9}
          </li>
          <li>
            <strong className="text-foreground">{copy.text10}</strong>
            {copy.text11}
          </li>
          <li>
            <strong className="text-foreground">{copy.text12}</strong>
            {copy.text13}
          </li>
          <li>
            <strong className="text-foreground">{copy.text14}</strong>
            {copy.text15}
          </li>
          <li>
            <strong className="text-foreground">{copy.text16}</strong>
            {copy.text17}
          </li>
          <li>
            <strong className="text-foreground">{copy.text18}</strong>
            {copy.text19}
          </li>
          <li>
            <strong className="text-foreground">{copy.text20}</strong>
            {copy.text21}
          </li>
          <li>{copy.languagePreference}</li>
          <li>
            <strong className="text-foreground">
              {copy.newsletterHeading}
            </strong>
            {copy.newsletterData}
          </li>
          <li>
            <strong className="text-foreground">
              {copy.submissionHeading}
            </strong>
            {copy.submissionData}
          </li>
        </PageList>
        <p>{copy.text22}</p>
      </PageSection>

      <PageSection title={copy.heading23.value}>
        <PageList>
          <li>
            <strong className="text-foreground">{copy.text24}</strong>
            {copy.text25}{" "}
            <a href={LINK.DODO_PAYMENTS_PRIVACY} className={linkClass}>
              {copy.text26}
            </a>
            .
          </li>
          <li>
            <strong className="text-foreground">{copy.text27}</strong>
            {copy.text28}{" "}
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              className={linkClass}
            >
              {copy.text29}
            </a>
            .
          </li>
          <li>
            <strong className="text-foreground">{copy.text30}</strong>
            {copy.text31}
          </li>
          <li>
            <strong className="text-foreground">{copy.text32}</strong>
            {copy.text33}
          </li>
        </PageList>
        <p>
          {copy.text34}{" "}
          <Link to="/dpa" className={linkClass}>
            {copy.text35}
          </Link>{" "}
          {copy.text36}
        </p>
      </PageSection>

      <PageSection title={copy.heading37.value}>
        <PageList>
          <li>{copy.text38}</li>
          <li>{copy.text39}</li>
          <li>{copy.text40}</li>
          <li>{copy.text41}</li>
          <li>{copy.text42}</li>
          <li>{copy.text43}</li>
          <li>{copy.newsletterRetention}</li>
          <li>{copy.submissionRetention}</li>
        </PageList>
      </PageSection>

      <PageSection title={copy.heading44.value}>
        <p>
          {copy.text45} <SupportEmail /> {copy.text46}{" "}
          <code>{copy.text47}</code> {copy.text48}
        </p>
      </PageSection>

      <PageSection title={copy.heading49.value}>
        <p>{copy.text50}</p>
      </PageSection>

      <PageSection title={copy.heading51.value}>
        <p>{copy.text52}</p>
      </PageSection>

      <PageSection title={copy.heading53.value}>
        <p>
          <SupportEmail />
        </p>
      </PageSection>
    </>
  );
};

export const Route = createFileRoute("/_pages/privacy")({
  component: Privacy,
  head: () => ({
    ...createMetadata({
      canonical: ROUTES.PRIVACY,
      description: `The personal data ${SITE.NAME} collects, why, and for how long.`,
      title: "Privacy policy",
    }),
    scripts: [breadcrumbJsonLd({ name: "Privacy", path: ROUTES.PRIVACY })],
  }),
});
