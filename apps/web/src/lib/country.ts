// Regional indicator "A" is U+1F1E6, "B" the next code point, through "Z";
// two of them render as that country's flag.
const REGIONAL_INDICATOR_A = 0x1_f1_e6;
const LETTER_A = 0x41;

/** A flag emoji from an ISO 3166-1 alpha-2 code. */
export const flagOf = (code: string): string =>
  String.fromCodePoint(
    ...[...code.toUpperCase()].map(
      (letter) =>
        REGIONAL_INDICATOR_A + (letter.codePointAt(0) ?? LETTER_A) - LETTER_A
    )
  );
