import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer } from "react-intlayer";

import {
  BrandColors,
  BrandHero,
  BrandLogos,
  BrandType,
  BrandUsage,
} from "@/components/brand-kit";
import { SupportEmail } from "@/components/page";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

const Brand = () => {
  const content = useIntlayer("brand");
  return (
    <>
      <BrandHero />
      <BrandLogos />
      <BrandColors />
      <BrandType />
      <BrandUsage
        questions={
          <>
            {content.questions}
            <SupportEmail />
          </>
        }
      />
    </>
  );
};

export const Route = createFileRoute("/{-$locale}/_pages/design/brand")({
  component: Brand,
  head: ({ params }) => ({
    ...createMetadata({
      description: getIntlayer(
        "directory-meta",
        isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
      ).brand.description,
      title: getIntlayer(
        "directory-meta",
        isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
      ).brand.title,
    }),
    scripts: [
      breadcrumbJsonLd(
        [
          { page: "design", path: ROUTES.DESIGN },
          { page: "brand", path: ROUTES.DESIGN_BRAND },
        ],
        params.locale
      ),
    ],
  }),
});
