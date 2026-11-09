import type { FontFamily } from "../schema/common.ts";
import { SINGLE_WEIGHT_FONTS } from "./font-weights.ts";

// Google fonts offered by the editor. Each family's module carries its full
// metadata, so they are imported on demand: the user picks one font at
// runtime and the other ten never download. A loader injects the font faces
// for the weights the overlays use and resolves once they are ready, so a
// render never draws with a fallback font.

interface LoadOptions {
  weights: string[];
  subsets: string[];
  ignoreTooManyRequestsWarning: boolean;
}

interface FontModule {
  loadFont: (
    style: "normal",
    options: LoadOptions
  ) => { fontFamily: string; waitUntilDone: () => Promise<undefined> };
}

const STANDARD = ["400", "500", "600", "700"];

const MODULES: Record<FontFamily, () => Promise<{ loadFont: unknown }>> = {
  Inter: () => import("@remotion/google-fonts/Inter"),
  Geist: () => import("@remotion/google-fonts/Geist"),
  Manrope: () => import("@remotion/google-fonts/Manrope"),
  "DM Sans": () => import("@remotion/google-fonts/DMSans"),
  "Space Grotesk": () => import("@remotion/google-fonts/SpaceGrotesk"),
  "Bricolage Grotesque": () =>
    import("@remotion/google-fonts/BricolageGrotesque"),
  Syne: () => import("@remotion/google-fonts/Syne"),
  Unbounded: () => import("@remotion/google-fonts/Unbounded"),
  "Instrument Serif": () => import("@remotion/google-fonts/InstrumentSerif"),
  "Playfair Display": () => import("@remotion/google-fonts/PlayfairDisplay"),
  "JetBrains Mono": () => import("@remotion/google-fonts/JetBrainsMono"),
};

const load = async (family: FontFamily) => {
  // SAFETY: every @remotion/google-fonts module exports `loadFont(style,
  // options)` returning { fontFamily, waitUntilDone }; option types are
  // narrowed per font, which this shared signature widens.
  const { loadFont } = (await MODULES[family]()) as FontModule;
  const font = loadFont("normal", {
    // Asking for a weight a family doesn't ship throws.
    weights: SINGLE_WEIGHT_FONTS[family] ? ["400"] : STANDARD,
    subsets: ["latin"],
    ignoreTooManyRequestsWarning: true,
  });
  await font.waitUntilDone();
  return font.fontFamily;
};

const cache = new Map<FontFamily, Promise<string>>();

/** Loads a font once per page and resolves to its CSS family name. */
export const loadFontFamily = (family: FontFamily): Promise<string> => {
  let pending = cache.get(family);
  if (!pending) {
    pending = load(family);
    cache.set(family, pending);
  }
  return pending;
};
