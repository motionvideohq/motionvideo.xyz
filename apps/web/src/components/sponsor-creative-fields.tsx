import { useState } from "react";
import { useIntlayer } from "react-intlayer";

import { ImageUpload } from "@/components/image-upload";
import { FormSection } from "@/components/page";
import { SponsorDetailRow } from "@/components/sponsor-detail-row";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { SponsorTier } from "@/constants/sponsors";
import { SPONSOR_NAME_MAX, SPONSOR_TAGLINE_MAX } from "@/lib/sponsorships";
import { imageRefSchema } from "@/lib/uploads";
import { cn } from "@/lib/utils";

// The placement a sponsor fills in, shared by the checkout form on
// /sponsorships/new and the edit form of a paid sponsorship on /sponsorships.

export interface CreativeFields {
  name: string;
  url: string;
  tagline: string;
  logo: string;
  cover: string;
  darkInvert: boolean;
}

export const EMPTY_CREATIVE: CreativeFields = {
  name: "",
  url: "",
  tagline: "",
  logo: "",
  cover: "",
  darkInvert: false,
};

const fieldClass = "flex flex-col gap-2";

/** The image when it is an upload or a public HTTPS URL, never junk. */
const previewUrl = (value: string) =>
  imageRefSchema.safeParse(value.trim()).success ? value.trim() : undefined;

type PreviewPlacement = "card" | "slot" | "sidebar";

/** The sponsored cover card as it shows in the feed. */
const CampaignCardPreview = ({
  cover,
  logo,
  name,
  tagline,
  className,
}: {
  cover: string | undefined;
  logo: string | undefined;
  name: string;
  tagline: string;
  className?: string;
}) => {
  const content = useIntlayer("sponsorships-page");
  return (
    <div
      className={cn(
        "bg-muted shadow-outline relative aspect-video w-full overflow-hidden rounded-xl",
        className
      )}
    >
      {cover && (
        <img
          src={cover}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="absolute inset-0 size-full object-cover"
        />
      )}
      <span className="absolute top-2.5 left-2.5 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
        {content.sponsored}
      </span>
      <span className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-linear-to-t from-black/70 to-transparent p-2.5 pt-6">
        <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 shadow-sm">
          {logo && (
            <img
              src={logo}
              alt=""
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className="size-full object-contain"
            />
          )}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium tracking-tight text-white">
            {name}
          </span>
          {tagline && (
            <span className="truncate text-xs text-white/75">{tagline}</span>
          )}
        </span>
      </span>
    </div>
  );
};

// Roughly how each placement renders: the cover in the feed (every tier), the
// logo in the slots (Diamond and Gold), and the "Sponsored by" row in a
// video's detail sidebar (Diamond only). A switch picks which one to show.
export const CreativePreview = ({
  fields,
  tier,
}: {
  fields: CreativeFields;
  tier: SponsorTier;
}) => {
  const content = useIntlayer("sponsorships-page");
  const gallery = useIntlayer("motion-gallery");
  const [picked, setPicked] = useState<PreviewPlacement>("card");
  let previewPlacements: PreviewPlacement[] = ["card"];
  if (tier === "diamond") {
    previewPlacements = ["card", "slot", "sidebar"];
  } else if (tier === "gold") {
    previewPlacements = ["card", "slot"];
  }
  // Switching to a cheaper tier while the sidebar is open falls back to the
  // card, which every tier has.
  const placement = previewPlacements.includes(picked) ? picked : "card";
  const logo = previewUrl(fields.logo);
  const cover = previewUrl(fields.cover);
  const name = fields.name.trim() || content.name.value;
  const tagline = fields.tagline.trim();

  return (
    // Fixed height, so switching placements never moves the page: the
    // preview centres in the space above the tabs, which stay at the bottom.
    <Tabs
      value={placement}
      onValueChange={(value) =>
        // SAFETY: the tab list only holds preview placements.
        setPicked(value as PreviewPlacement)
      }
      className="bg-card shadow-outline h-80 gap-4 rounded-xl p-6"
    >
      <TabsContent
        value="card"
        className="flex min-h-0 w-full items-center justify-center"
      >
        <CampaignCardPreview
          cover={cover}
          logo={logo}
          name={name}
          tagline={tagline}
          className="max-w-sm"
        />
      </TabsContent>
      <TabsContent
        value="slot"
        className="flex min-h-0 w-full items-center justify-center"
      >
        {/* A page intro in miniature: title and copy lines as skeletons, then
            the slots with this logo first and the open ones dashed. */}
        <div className="bg-background shadow-outline dark:bg-popover flex w-full max-w-sm flex-col gap-2 rounded-xl p-4">
          <Skeleton className="h-3 w-1/2 rounded-sm" />
          <Skeleton className="h-2 w-full rounded-sm" />
          <Skeleton className="h-2 w-3/4 rounded-sm" />
          <div className="mt-2 flex items-center gap-2">
            <span className="bg-background shadow-outline dark:bg-popover flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[10px] p-1">
              {logo && (
                <img
                  src={logo}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className={cn(
                    "size-full object-contain",
                    fields.darkInvert && "dark:invert"
                  )}
                />
              )}
            </span>
            {[0, 1].map((index) => (
              <span
                key={index}
                className="text-muted-foreground flex size-8 items-center justify-center rounded-[10px] border border-dashed border-current/40"
              >
                <span aria-hidden="true" className="relative size-3.5">
                  <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
                  <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current" />
                </span>
              </span>
            ))}
          </div>
        </div>
      </TabsContent>
      <TabsContent
        value="sidebar"
        className="flex min-h-0 w-full items-center justify-center"
      >
        {/* A video detail sidebar: header icons, title and source button,
            then the details list with the sponsor as its first row. */}
        <div className="bg-background shadow-outline dark:bg-popover flex w-full max-w-xs flex-col gap-3 rounded-xl p-4">
          <div className="flex items-center justify-between gap-1">
            <Skeleton className="size-6 rounded-full" />
            <span className="flex gap-1.5">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="size-6 rounded-full" />
            </span>
          </div>
          <Skeleton className="h-3 w-3/4 rounded-sm" />
          <Skeleton className="h-8 w-full rounded-lg" />
          <dl>
            <SponsorDetailRow
              label={gallery.sponsoredBy}
              logo={logo}
              name={name}
              tagline={tagline}
              darkInvert={fields.darkInvert}
              className="gap-3 py-2 text-xs"
            />
            {["w-16", "w-20", "w-12"].map((width) => (
              <div
                key={width}
                aria-hidden="true"
                className="flex items-center justify-between gap-3 border-t border-dashed py-2"
              >
                <Skeleton className="h-2 w-12 rounded-sm" />
                <Skeleton className={cn("h-2 rounded-sm", width)} />
              </div>
            ))}
          </dl>
        </div>
      </TabsContent>
      {previewPlacements.length > 1 && (
        <TabsList aria-label={content.preview.value} className="mx-auto">
          {previewPlacements.map((value) => (
            <TabsTrigger key={value} value={value}>
              {content.placements[value]}
            </TabsTrigger>
          ))}
        </TabsList>
      )}
    </Tabs>
  );
};

/**
 * Campaign copy, logo, and cover: one FormSection each, in that order.
 */
export const CreativeSections = ({
  idPrefix,
  fields,
  update,
}: {
  /** Keeps input ids unique when several forms share a page. */
  idPrefix: string;
  fields: CreativeFields;
  update: (patch: Partial<CreativeFields>) => void;
}) => {
  const content = useIntlayer("sponsorships-page");
  const id = (field: string) => `${idPrefix}-${field}`;

  return (
    <>
      <FormSection
        title={content.campaignSection}
        description={content.campaignSectionBody}
      >
        <div className={fieldClass}>
          <Label htmlFor={id("name")}>{content.name}</Label>
          <Input
            id={id("name")}
            value={fields.name}
            onChange={(event) => update({ name: event.target.value })}
            required
            maxLength={SPONSOR_NAME_MAX}
          />
        </div>
        <div className={fieldClass}>
          <Label htmlFor={id("tagline")}>{content.tagline}</Label>
          <Input
            id={id("tagline")}
            value={fields.tagline}
            onChange={(event) => update({ tagline: event.target.value })}
            required
            maxLength={SPONSOR_TAGLINE_MAX}
          />
        </div>
        <div className={fieldClass}>
          <Label htmlFor={id("url")}>{content.url}</Label>
          <Input
            id={id("url")}
            type="url"
            placeholder="https://"
            value={fields.url}
            onChange={(event) => update({ url: event.target.value })}
            required
            maxLength={2048}
          />
        </div>
      </FormSection>

      <FormSection
        title={content.brandSection}
        description={content.brandSectionBody}
      >
        <ImageUpload
          purpose="logo"
          value={fields.logo}
          onChange={(logo) => update({ logo })}
          hint={content.logoSize.value}
          required
        />
        <label className="text-muted-foreground flex items-start gap-3 text-sm leading-relaxed">
          <Checkbox
            checked={fields.darkInvert}
            onCheckedChange={(checked) => update({ darkInvert: checked })}
            className="mt-0.5"
          />
          {content.darkInvert}
        </label>
      </FormSection>

      <FormSection
        title={content.mediaSection}
        description={content.mediaSectionBody}
      >
        <ImageUpload
          purpose="cover"
          value={fields.cover}
          onChange={(cover) => update({ cover })}
          hint={content.coverSize.value}
          required
        />
      </FormSection>
    </>
  );
};
