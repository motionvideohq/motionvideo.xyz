// The Moves library's families, apart from the moves themselves so the site
// header can list them without shipping src/data/moves.json on every page.

export const MOVE_FAMILIES = [
  "timing",
  "type",
  "transitions",
  "ui",
  "vector",
  "generative",
  "camera",
  "texture",
  "data",
  "sound",
] as const;
export type MoveFamily = (typeof MOVE_FAMILIES)[number];

export const findMoveFamily = (value: string | undefined) =>
  MOVE_FAMILIES.find((family) => family === value);
