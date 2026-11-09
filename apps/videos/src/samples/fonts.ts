import { loadFont as loadBricolage } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";

/**
 * The samples are fictional products, so they wear open-licence Google faces
 * rather than MotionVideo's own (Timeless Sans is licensed for the website
 * only). Latin subset and the weights the designs use keep renders quick.
 */
const latin: { subsets: "latin"[] } = { subsets: ["latin"] };

export const INTER = loadInter("normal", {
  ...latin,
  weights: ["400", "500", "600", "700"],
}).fontFamily;
export const GEIST = loadGeist("normal", {
  ...latin,
  weights: ["400", "500", "600", "700"],
}).fontFamily;
export const SERIF = loadInstrumentSerif("normal", {
  ...latin,
  weights: ["400"],
}).fontFamily;
loadInstrumentSerif("italic", { ...latin, weights: ["400"] });
export const BRICOLAGE = loadBricolage("normal", {
  ...latin,
  weights: ["400", "600", "800"],
}).fontFamily;
export const FRAUNCES = loadFraunces("normal", {
  ...latin,
  weights: ["400", "600", "800"],
}).fontFamily;
loadFraunces("italic", { ...latin, weights: ["400"] });
export const MANROPE = loadManrope("normal", {
  ...latin,
  weights: ["500", "600", "700", "800"],
}).fontFamily;
export const MONO = loadMono("normal", {
  ...latin,
  weights: ["400", "500"],
}).fontFamily;
export const GROTESK = loadSpaceGrotesk("normal", {
  ...latin,
  weights: ["500", "700"],
}).fontFamily;
