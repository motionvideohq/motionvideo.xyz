// Turns a prompt from the gallery into one made for the reader: their
// details, plus three dials (creativity, pace, polish) that add one line each,
// appended as a short brief. Everything runs in the browser.
//
// The text added to prompts stays in English whatever the UI language: it is
// read by the model, next to an English prompt. Labels live in the
// `prompt-customizer` dictionary.

export const VIDEO_SIZES = [
  "1920x1080",
  "1080x1920",
  "1080x1080",
  "1080x1350",
] as const;
export type VideoSize = (typeof VIDEO_SIZES)[number];

const SIZE_NAMES: Record<VideoSize, string> = {
  "1080x1080": "square",
  "1080x1350": "portrait 4:5",
  "1080x1920": "vertical 9:16",
  "1920x1080": "landscape 16:9",
};

/** Details anyone can add to any prompt. Empty fields leave the prompt as is. */
export const DETAIL_KEYS = [
  "subject",
  "size",
  "length",
  "colors",
  "typeface",
  "notes",
] as const;
export type DetailKey = (typeof DETAIL_KEYS)[number];
export type Details = Partial<Record<DetailKey, string>>;

const DETAIL_LINES: Record<DetailKey, (value: string) => string> = {
  colors: (value) => `Colors: ${value}`,
  length: (value) =>
    /^\d+(?:\.\d+)?$/u.test(value)
      ? `Length: ${value} seconds`
      : `Length: ${value}`,
  notes: (value) => `Also: ${value}`,
  size: (value) => {
    const size = VIDEO_SIZES.find((entry) => entry === value);
    return `Frame size: ${value}${size ? ` (${SIZE_NAMES[size]})` : ""}`;
  },
  subject: (value) => `The video is about: ${value}`,
  typeface: (value) => `Typeface: ${value}`,
};

export const DIAL_KEYS = ["creativity", "pace", "polish"] as const;
export type DialKey = (typeof DIAL_KEYS)[number];
export type Dials = Record<DialKey, number>;

/** Five stops per dial; the middle one adds nothing. */
export const DIAL_STOPS = 5;
export const DEFAULT_DIALS: Dials = { creativity: 2, pace: 2, polish: 2 };

// The line each stop adds. Index 2 (the middle) is the prompt as written.
const DIAL_LINES: Record<DialKey, readonly string[]> = {
  creativity: [
    "Stay conventional: pick the most familiar, legible treatment for every idea and avoid anything experimental.",
    "Stay close to the brief: one clear idea, executed cleanly, with a single standout moment.",
    "",
    "Take creative risks: pick an angle I would not have predicted and include at least two techniques that rarely appear in AI-made motion.",
    "Treat the brief as a loose starting point: surprise me with the concept, the structure and the transitions, as long as every frame stays readable.",
  ],
  pace: [
    "Slow everything down: long eased moves, generous holds, and scene changes only at the end of a musical phrase.",
    "Let it breathe: give each idea room to land before the next one starts.",
    "",
    "Keep it quick: a new move every half beat and no hold longer than one beat.",
    "Make it relentless: overlapping moves, cuts faster than every half beat, and no resting frames, without losing legibility.",
  ],
  polish: [
    "Prioritize speed: a short plan, one build, one render, no review pass.",
    "Do a light check: look at a few key frames before rendering and fix only clear mistakes.",
    "",
    "Review the first render end to end, list every timing, spacing or legibility issue, fix them all and render again.",
    "Review exhaustively: export a still for every beat, watch the full render at half speed, fix every flaw and repeat until a fresh pass finds nothing.",
  ],
};

/** The lines a set of dials adds, in dial order. */
const dialLines = (dials: Dials) =>
  DIAL_KEYS.flatMap((dial) => {
    const line = DIAL_LINES[dial][dials[dial]];
    return line ? [line] : [];
  });

/**
 * The reader's details and dials as one `<my-brief>` block, to append after
 * a prompt from the gallery; empty when they change nothing. Where they
 * disagree with the prompt, the block says it wins.
 */
export const promptBrief = (details: Details, dials: Dials) => {
  const lines = [
    ...DETAIL_KEYS.flatMap((key) => {
      const value = details[key]?.trim();
      return value ? [DETAIL_LINES[key](value)] : [];
    }),
    ...dialLines(dials),
  ];
  if (lines.length === 0) {
    return "";
  }
  return `<my-brief>\nUse the prompt above with these changes. Where they conflict with it, follow these:\n${lines.map((line) => `- ${line}`).join("\n")}\n</my-brief>`;
};

/** A slot in a template prompt, written `{{key}}` in its text. */
export interface TemplateField {
  key: string;
  label: string;
  /** What the prompt says when the field is left empty. */
  placeholder: string;
  hint: string;
  kind: "text" | "number" | "size";
}

/**
 * A run of filled-in template text. `mark`: a field's value (`filled`), its
 * placeholder (`placeholder`), or the dial lines (`dials`); plain text has
 * none.
 */
export interface PromptSegment {
  /** Unique within one fill: where the run starts in the template. */
  key: string;
  text: string;
  mark?: "filled" | "placeholder" | "dials";
}

// Plain text and slots of one stretch of a template, `offset` characters in.
const fillSlots = (
  text: string,
  offset: number,
  fields: ReadonlyMap<string, TemplateField>,
  values: Readonly<Record<string, string>>
): PromptSegment[] => {
  const segments: PromptSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(/\{\{(?<key>\w+)\}\}/gu)) {
    const field = fields.get(match.groups?.key ?? "");
    if (!field) {
      // Not a field: the braces stay in the text as written.
      continue;
    }
    if (match.index > last) {
      segments.push({
        key: String(offset + last),
        text: text.slice(last, match.index),
      });
    }
    const value = values[field.key]?.trim();
    segments.push({
      key: String(offset + match.index),
      mark: value ? "filled" : "placeholder",
      text: value || field.placeholder,
    });
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    segments.push({ key: String(offset + last), text: text.slice(last) });
  }
  return segments;
};

/**
 * Fills a template's slots with the reader's values (or each field's
 * placeholder), split into runs so the page can highlight what the fields
 * and dials changed. The dial lines go at the end of the `dialSection`
 * section, or after the prompt when it has no such section.
 */
export const fillTemplate = (
  template: string,
  fields: readonly TemplateField[],
  values: Readonly<Record<string, string>>,
  dials: Dials,
  dialSection: string
): PromptSegment[] => {
  const byKey = new Map(fields.map((field) => [field.key, field]));
  const lines = dialLines(dials);
  if (lines.length === 0) {
    return fillSlots(template, 0, byKey, values);
  }
  const dialText = lines.join("\n");
  const closing = template.indexOf(`</${dialSection}>`);
  if (closing === -1) {
    return [
      ...fillSlots(template.trimEnd(), 0, byKey, values),
      { key: "gap", text: "\n\n" },
      { key: "dials", mark: "dials", text: dialText },
    ];
  }
  return [
    ...fillSlots(template.slice(0, closing), 0, byKey, values),
    { key: "dials", mark: "dials", text: `${dialText}\n` },
    ...fillSlots(template.slice(closing), closing, byKey, values),
  ];
};
