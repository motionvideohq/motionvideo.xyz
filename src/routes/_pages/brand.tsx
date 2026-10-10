import { createFileRoute } from "@tanstack/react-router";
import { cn } from "cn";
import { useIntlayer } from "react-intlayer";
import { Download } from "reicon-react/icons/Download";

import { Logomark } from "@/components/logomark";
import {
  PageHeader,
  PageList,
  PageSection,
  SupportEmail,
} from "@/components/page";
import { ReiconDuotone } from "@/components/ui/reicon-duotone";
import { ROUTES } from "@/constants/routes";
import { SITE } from "@/constants/site";
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
  return (
    <>
      <PageHeader title={content.title.value} intro={content.intro.value} />
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
                      <ReiconDuotone
                        icon={Download}
                        aria-hidden
                        className="size-3.5"
                      />
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

export const Route = createFileRoute("/_pages/brand")({
  component: Brand,
  head: () => ({
    ...createMetadata({
      canonical: ROUTES.BRAND,
      description: `${SITE.NAME} logomark, app icon, and colors.`,
      title: "Brand",
    }),
    scripts: [breadcrumbJsonLd({ name: "Brand", path: ROUTES.BRAND })],
  }),
});
