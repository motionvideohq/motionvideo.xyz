import { z } from "zod";

import type { DirectoryKind, DirectorySlug } from "@/lib/directories";
import { MOTION_CATEGORIES } from "@/lib/motion-catalog";
import type { MotionCategory } from "@/lib/motion-catalog";

// One kind per section: Discover, Tools, Creatives, Skills, Extras.
export const SUBMISSION_KINDS = [
  "video",
  "tool",
  "studio",
  "skill",
  "extra",
] as const;

export type SubmissionCategory = MotionCategory | DirectorySlug;

// The categories a submission of each kind can be filed under: the gallery
// categories for videos, the directory chips for the other sections.
export const SUBMISSION_CATEGORIES = {
  video: MOTION_CATEGORIES,
  tool: ["ai", "editors", "mockups", "motion"],
  studio: ["studios", "designers"],
  skill: ["motion", "product-films", "ai-video"],
  extra: ["articles", "resources"],
} as const satisfies { video: readonly MotionCategory[] } & {
  [K in DirectoryKind]: readonly DirectorySlug<K>[];
};

/** `value` when it is one of `kind`'s categories; otherwise `undefined`. */
export const findSubmissionCategory = (
  kind: SubmissionKind,
  value: string | undefined
) => {
  const categories: readonly SubmissionCategory[] = SUBMISSION_CATEGORIES[kind];
  return categories.find((category) => category === value);
};

const honeypotSchema = z.string().max(0).optional();

// Only public HTTPS website addresses, without embedded credentials. Submitted
// URLs are stored for moderation, never fetched by the server.
const publicUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .pipe(z.url())
  .refine((value) => {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/\.$/u, "");
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z](?:[a-z0-9-]*[a-z0-9])$/iu.test(
        hostname
      ) &&
      !/(?:^|\.)(?:localhost|local|internal|test|invalid|example|onion)$/u.test(
        hostname
      )
    );
  }, "Use a public HTTPS website URL without a username or password.");

export const communitySubmissionSchema = z
  .object({
    kind: z.enum(SUBMISSION_KINDS),
    category: z.string().max(40).optional(),
    name: z.string().trim().min(1).max(100),
    title: z.string().trim().min(1).max(150),
    url: publicUrlSchema,
    description: z.string().trim().min(10).max(5000),
    prompt: z.string().trim().max(10_000).optional(),
    consent: z.literal(true),
    website: honeypotSchema,
  })
  .refine(
    (data) =>
      data.category === undefined ||
      findSubmissionCategory(data.kind, data.category) !== undefined,
    { path: ["category"], message: "Pick a category for this kind." }
  );

export type SubmissionKind = (typeof SUBMISSION_KINDS)[number];
export type CommunityResult =
  | { ok: true }
  | { ok: false; error: "rate-limit" | "storage" };
/** Submissions also need a signed-in account; its email is stored with them. */
export type SubmissionResult =
  | CommunityResult
  | { ok: false; error: "unauthorized" };
