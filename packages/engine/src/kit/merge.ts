export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[]
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

/** True for nested style sections (plain objects), false for arrays and values. */
const isSection = (v: unknown): v is object =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * Returns `base` with every key in `over` applied, recursing into nested
 * objects; arrays and primitives in `over` replace the base value.
 */
export const deepMerge = <T extends object>(
  base: T,
  over: DeepPartial<T> | undefined
): T => {
  if (!over) {
    return base;
  }
  const out = { ...base };
  // SAFETY: `over` is a DeepPartial<T>, so its own keys are keys of T.
  const keys = Object.keys(over) as (keyof T)[];
  for (const key of keys) {
    const value = over[key];
    if (value === undefined) {
      continue;
    }
    const current = base[key];
    // SAFETY: DeepPartial<T>[K] is T[K] for arrays and primitives, and a
    // DeepPartial of T[K] for objects, which deepMerge completes to T[K].
    out[key] = (
      isSection(current) && isSection(value) ? deepMerge(current, value) : value
    ) as T[keyof T];
  }
  return out;
};
