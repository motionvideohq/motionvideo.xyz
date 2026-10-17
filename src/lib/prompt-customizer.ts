// Fills prompt templates: every `{{key}}` slot takes the reader's value or
// the field's fallback, and three dials (creativity, pace, polish) can each
// add one line. The text added to prompts stays in English whatever the UI
// language: it is read by the model, next to an English prompt.

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
  DIAL_KEYS.map((dial) => DIAL_LINES[dial][dials[dial]] ?? "").filter(Boolean);

/** A slot in a template prompt, written `{{key}}` in its text. */
export interface TemplateField {
  key: string;
  label: string;
  hint: string;
  /** What the prompt says when the field is left empty. */
  fallback: string;
  kind: "text" | "number" | "size";
}

/** A run of template text: plain, or the value of one field. */
export interface PromptSegment {
  text: string;
  field?: string;
}

/**
 * Splits a template into plain text and filled slots, so the page can
 * highlight what each field changed. Dial lines go before `</${section}>`
 * when the template has that section, else at the end.
 */
export const fillTemplate = (
  template: string,
  fields: readonly TemplateField[],
  values: Record<string, string>,
  dials: Dials,
  dialSection: string
): PromptSegment[] => {
  const closing = `</${dialSection}>`;
  const lines = dialLines(dials).join("\n");
  let withDials = template;
  if (lines && template.includes(closing)) {
    withDials = template.replace(closing, `${lines}\n${closing}`);
  } else if (lines) {
    withDials = `${template.trimEnd()}\n\n${lines}`;
  }
  const byKey = new Map(fields.map((field) => [field.key, field]));
  const segments: PromptSegment[] = [];
  let last = 0;
  for (const match of withDials.matchAll(/\{\{(?<key>\w+)\}\}/gu)) {
    const field = byKey.get(match.groups?.key ?? "");
    if (!field) {
      // Not a known field: leave the braces in the text as written.
      continue;
    }
    if (match.index > last) {
      segments.push({ text: withDials.slice(last, match.index) });
    }
    segments.push({
      field: field.key,
      text: values[field.key]?.trim() || field.fallback,
    });
    last = match.index + match[0].length;
  }
  if (last < withDials.length) {
    segments.push({ text: withDials.slice(last) });
  }
  return segments;
};
