import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { hasPro } from "@/constants/plans";
import catalog from "@/data/motion-catalog.json";
import type { MotionVideo } from "@/lib/motion-catalog";
import { PROMPT_TEMPLATES, findPromptTemplate } from "@/lib/prompt-templates";

import { getCurrentSession } from "./auth";
import templatePrompts from "./data/template-prompts.json";
import { planAccessFor } from "./plans";

// Server-only, like move-functions.ts: the prompts are Pro content, and the
// catalog is ~1 MB the template pages should not ship to the browser just to
// show a few posters. Server function handlers (and their imports) stay out
// of the client bundle; import template-prompts.json from server code only.

const PROMPTS = new Map<string, string>(
  templatePrompts.prompts.map((entry): [string, string] => [
    entry.id,
    entry.prompt,
  ])
);

const VIDEOS = new Map<string, MotionVideo>(
  catalog.videos.map((video): [string, MotionVideo] => [video.slug, video])
);

const templateId = z.object({ id: z.string().min(1).max(100) });

export type TemplatePromptResult =
  | { locked: true }
  | { locked: false; prompt: string };

/**
 * A template's prompt for Pro and Business accounts (owners and seats);
 * locked for everyone else, so the text never reaches their page.
 */
export const getTemplatePrompt = createServerFn({ method: "GET" })
  .validator(templateId)
  .handler(async ({ data }): Promise<TemplatePromptResult> => {
    const session = await getCurrentSession();
    if (!session || !hasPro(await planAccessFor(session.user))) {
      return { locked: true };
    }
    const prompt = PROMPTS.get(data.id);
    if (!prompt) {
      // Every public template ships with a prompt; a gap is a data bug, and
      // showing a paying account the upgrade panel would hide it.
      throw new Error(`No prompt for template "${data.id}"`);
    }
    return { locked: false, prompt };
  });

const videosFor = (slugs: readonly string[]) =>
  slugs.flatMap((slug) => {
    const video = VIDEOS.get(slug);
    return video ? [video] : [];
  });

/**
 * A template's gallery examples, in its order, and the video whose prompt
 * inspired it (if any).
 */
export const getTemplateVideos = createServerFn({ method: "GET" })
  .validator(templateId)
  .handler(({ data }) => {
    const template = findPromptTemplate(data.id);
    const [source] = videosFor(
      template?.inspiredBy ? [template.inspiredBy] : []
    );
    return {
      examples: videosFor(template?.examples ?? []),
      source: source ?? null,
    };
  });

/** The poster a template's card shows: its first gallery example's. */
export type TemplateCover = Pick<MotionVideo, "poster" | "width" | "height">;

const COVERS: Record<string, TemplateCover> = Object.fromEntries(
  PROMPT_TEMPLATES.flatMap((template): [string, TemplateCover][] => {
    const [video] = videosFor(template.examples);
    if (!video) {
      return [];
    }
    const { poster, width, height } = video;
    return [[template.id, { poster, width, height }]];
  })
);

/** Card posters for every template with a gallery example, by template id. */
export const getTemplateCovers = createServerFn({ method: "GET" }).handler(
  () => COVERS
);
