import manifest from "@/data/create-showcase-previews.json";

// One rendered preview loop per Showcase template (16:9, hosted on R2), shown
// on the landing, template and hub pages and in the editor. Templates without
// an entry yet show a plain tile instead.

export interface TemplatePreview {
  poster: string;
  video: string;
  width: number;
  height: number;
}

// SAFETY: the manifest is written in this shape when the previews are
// rendered; it maps template ids to their preview.
const PREVIEWS = manifest as Record<string, TemplatePreview | undefined>;

export const previewFor = (templateId: string): TemplatePreview | undefined =>
  PREVIEWS[templateId];

/** Any published preview's poster, for small tiles such as the nav card. */
export const SHOWCASE_POSTER =
  Object.values(PREVIEWS).find((preview) => preview !== undefined)?.poster ??
  null;
