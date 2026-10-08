import { createFileRoute } from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";

import { PageHeader, PageSection } from "@/components/page";
import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
import { withUtm } from "@/lib/utm";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

const inlineLink = "text-foreground underline underline-offset-4";

const About = () => {
  const content = useIntlayer("about");
  return (
  <>
    <PageHeader
      title={content.title.value}
      intro={content.intro.value}
    />
    <PageSection title={content.why.value}>
      <p>
        {content.reason}
      </p>
      <p>
        {content.knowledge}
      </p>
    </PageSection>

    <PageSection title={content.what.value}>
      <p>
        {content.product}
      </p>
    </PageSection>

    <PageSection title={content.who.value}>
      <p>
        {content.built}
        <a href={withUtm(LINK.AUTHOR_WEBSITE, "about")} className={inlineLink}>
          {SITE.LEGAL.OPERATOR}
        </a>
        {content.author}
        <a href={withUtm(LINK.SHADCN_LABS, "about")} className={inlineLink}>
          Shadcn Labs
        </a>
        {content.website}
        <a href={LINK.GITHUB_REPO} className={inlineLink}>
          {content.openSource}
        </a>
        {content.separately}
      </p>
    </PageSection>
  </>
  );
};

export const Route = createFileRoute("/_pages/about")({
  component: About,
  head: () => ({
    ...createMetadata({
      canonical: ROUTES.ABOUT,
      description: `Why ${SITE.NAME} exists and who makes it.`,
      title: `About ${SITE.NAME}`,
    }),
    scripts: [breadcrumbJsonLd({ name: "About", path: ROUTES.ABOUT })],
  }),
});
