import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer } from "react-intlayer";
import { Download } from "reicon-react/icons/Download";

import { Logomark } from "@/components/logo";
import {
  PageHeader,
  PageList,
  PageSection,
  SupportEmail,
} from "@/components/page";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

const assets = [
  {
    files: [
      { href: "/brand/motionvideo-logomark-black.svg", label: "SVG" },
      { href: "/brand/motionvideo-logomark-black.png", label: "PNG" },
    ],
    preview: "bg-white text-black ring-1 ring-border",
  },
  {
    files: [
      { href: "/brand/motionvideo-logomark-white.svg", label: "SVG" },
      { href: "/brand/motionvideo-logomark-white.png", label: "PNG" },
    ],
    preview: "bg-black text-white",
  },
  {
    files: [
      { href: "/brand/motionvideo-app-icon.svg", label: "SVG" },
      { href: "/brand/motionvideo-app-icon-512.png", label: "PNG" },
    ],
    preview: "bg-cta-to text-black",
  },
] as const;

const colors = [
  { hex: "#FFBE25", swatch: "bg-cta-to" },
  { hex: "#FFDD73", swatch: "bg-cta-from" },
  { hex: "#000000", swatch: "bg-black" },
] as const;

const Brand = () => {
  const content = useIntlayer("brand");
  const sections = useIntlayer("site-footer");
  return (
    <>
      <PageHeader title={sections.brand.value} intro={content.intro.value} />
      <PageSection title={content.logomark.value}>
        <div className="grid gap-4 sm:grid-cols-3">
          {assets.map((asset, index) => (
            <div key={asset.files[0].href} className="flex flex-col gap-3">
              <div
                className={cn(
                  "flex aspect-video items-center justify-center rounded-xl",
                  asset.preview
                )}
              >
                <Logomark className="h-8 w-auto" />
              </div>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-foreground">
                  {content.assetNames[index]}
                </span>
                <span className="flex gap-3">
                  {asset.files.map((file) => (
                    <a
                      key={file.href}
                      href={file.href}
                      download
                      className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
                    >
                      <Download aria-hidden className="size-3.5" />
                      {file.label}
                    </a>
                  ))}
                </span>
              </div>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection title={content.colors.value}>
        <div className="grid gap-4 sm:grid-cols-3">
          {colors.map((color, index) => (
            <div key={color.hex} className="flex items-center gap-3">
              <span
                aria-hidden
                className={cn(
                  "size-10 rounded-lg ring-1 ring-black/10",
                  color.swatch
                )}
              />
              <span className="flex flex-col text-sm">
                <span className="text-foreground">
                  {content.colorNames[index]}
                </span>
                <span className="font-mono">{color.hex}</span>
              </span>
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection title={content.usage.value}>
        <PageList>
          <li>{content.nameRule}</li>
          <li>{content.spacing}</li>
          <li>{content.effects}</li>
          <li>{content.endorsement}</li>
        </PageList>
        <p>
          {content.questions}
          <SupportEmail />
        </p>
      </PageSection>
    </>
  );
};

export const Route = createFileRoute("/$locale/_pages/design/brand")({
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
