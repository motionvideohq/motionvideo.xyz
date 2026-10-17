// Prompt templates written for MotionVideo: full prompts where every part a
// reader would change is a field (`{{key}}` in the text). Each one names the
// gallery videos it relates to, which the template page shows as examples and
// whose detail view links to the template ("a stronger version").
//
// Template text stays in English in every locale: it is a prompt for the
// model, like the prompts in the gallery.
import catalog from "@/data/motion-catalog.json";
import type { MotionVideo } from "@/lib/motion-catalog";
import type { TemplateField } from "@/lib/prompt-customizer";

export interface PromptTemplate {
  id: string;
  title: string;
  /** One or two sentences for cards and the page intro. */
  summary: string;
  /** What the template adds over the prompts people usually write. */
  improvements: string[];
  /** The prompt, with `{{key}}` for every field. */
  prompt: string;
  fields: TemplateField[];
  /** The section the creativity/pace/polish lines go into. */
  dialSection: string;
  /**
   * The community prompt this template rewrites, when there is one. Videos
   * made from it are shown as "made with the original prompt".
   */
  original?: { prompt: string; label: string };
  /** Gallery videos this template relates to. */
  matches: (video: MotionVideo) => boolean;
}

const SIZE_FIELD: TemplateField = {
  fallback: "1920x1080",
  hint: "Width × height in pixels.",
  key: "size",
  kind: "size",
  label: "Size",
};

// Lowercase, straight apostrophes, single spaces: rewordings of the same
// viral prompt differ in exactly these ways.
const normalize = (text: string) =>
  text
    .toLowerCase()
    .replaceAll(/[’‘]/gu, "'")
    .replaceAll(/\s+/gu, " ");

// Translations and close paraphrases of the showreel prompt that share none
// of its exact phrases.
const SHOWREEL_REWORDINGS = new Set([
  "aistocksavvy-3fb9f5",
  "chatgptastra-0d95c7",
  "grace-sunnyy-29bc61",
  "lukasersil-0ed38e",
  "samuel-spitz-974923",
  "topi-003-9ca6b5",
]);

const SHOWREEL_PHRASES = [
  "incredible motion designer",
  "showreel for a résumé",
  "showreel for a resume",
];

const showreel: PromptTemplate = {
  dialSection: "scenes",
  fields: [
    {
      fallback: "your choice, e.g. “a single line that learns to draw itself”",
      hint: "The idea every scene grows from. Leave it empty and the model picks one.",
      key: "concept",
      kind: "text",
      label: "Concept",
    },
    {
      fallback: "one free variable font from Google Fonts",
      hint: "A Google Font, or a short list to choose from.",
      key: "typeface",
      kind: "text",
      label: "Typeface",
    },
    {
      fallback: "two colors plus an off-white and a near-black",
      hint: "Names or hex codes, e.g. #FF4F1F, cobalt blue, cream.",
      key: "palette",
      kind: "text",
      label: "Palette",
    },
    {
      fallback: "20",
      hint: "15 to 30 seconds suits a showreel.",
      key: "length",
      kind: "number",
      label: "Length (seconds)",
    },
    {
      fallback: "124",
      hint: "Every move lands on this beat.",
      key: "bpm",
      kind: "number",
      label: "Tempo (BPM)",
    },
    SIZE_FIELD,
  ],
  id: "showreel",
  improvements: [
    "One concept and one recurring motif carry the whole piece, so it reads as a reel rather than a list of effects",
    "Names the five scenes and gives each a technique, instead of leaving the structure to chance",
    "Locks every change to a tempo, with a soundtrack generated in code",
    "Lists the effects that make AI motion look generic, so they stay out",
    "Renders frame by frame from a pure function of time, so nothing drifts or stutters",
    "Reviews a contact sheet of stills before the final render",
  ],
  matches: (video) => {
    if (SHOWREEL_REWORDINGS.has(video.slug)) {
      return true;
    }
    const prompt = normalize(video.prompt ?? "");
    return SHOWREEL_PHRASES.some((phrase) => prompt.includes(phrase));
  },
  original: {
    label: "The viral showreel prompt",
    prompt:
      "make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are, like it's your showreel for a résumé. go all out.",
  },
  prompt: `<goal>
Make a {{length}}-second motion design showreel at {{size}}. It should convince a creative director to hire you on the spot.
Concept: {{concept}}. Settle on it first and write it down in one sentence. Pick one motif (a mark, a shape or a line) that appears in every scene and carries us from one scene to the next.
</goal>

<style>
Type: {{typeface}}, at most two weights. Colors: {{palette}}. Flat color fields and crisp edges; depth comes from scale, overlap and parallax, not from shadows or glow.
Keep out: lens flares, bloom, particle explosions, chromatic aberration, camera shake, gradient wallpaper, rubbery overshoot, and text parked in the corners.
</style>

<scenes>
Five scenes of roughly equal length, each one emerging from the last through the motif (no cuts, no crossfades):
1. Typography: the concept as words that assemble, split and reflow.
2. Form: the motif morphing through a few geometric states.
3. Space: the flat composition tilts into 3D and the camera travels through it.
4. Information: a chart or an interface that builds itself and resolves.
5. Signature: everything collapses back into the motif, then a title card.
Tempo: {{bpm}} BPM. Every visible change starts on a beat; the biggest moment lands on the downbeat of the last bar. The final frame matches the first so it loops.
</scenes>

<build>
1. Write it as a single HTML page with one function, render(t), that sets every property from the time t. No CSS animations, timers or state carried between frames, so any frame renders on its own.
2. Write easing in code: critically damped springs for settles, exponential curves for fast moves. Blur fast-moving elements along their direction of travel.
3. Generate the soundtrack in code with an OfflineAudioContext: a kick on every beat, a filtered noise sweep into the last bar, and a short hit on each scene change. Export it as WAV.
4. Capture frames with Playwright at 60 fps, blend three subframes per frame with ffmpeg's tmix filter for motion blur, then mux the audio in.
</build>

<review>
Before the full render, export a contact sheet with one still per beat. Fix anything that is crowded, off the beat, overlapping or hard to read, then render.
</review>

<handoff>
Reply first with the concept, the motif and a beat-by-beat storyboard. Then build it without asking me anything else and give me the final MP4.
</handoff>`,
  summary:
    "A rewrite of the most copied prompt in the gallery, the one-line “show what an incredible motion designer you are”. It keeps the freedom and adds the structure, timing and rendering it leaves out.",
  title: "The showreel template",
};

const realtime3d: PromptTemplate = {
  dialSection: "scene",
  fields: [
    {
      fallback:
        "your choice of one physical object, e.g. “a stack of glass tiles”",
      hint: "One object or material the whole piece is about.",
      key: "subject",
      kind: "text",
      label: "Subject",
    },
    {
      fallback: "a soft studio with one warm key light and a cool rim light",
      hint: "Lighting and environment in a few words.",
      key: "lighting",
      kind: "text",
      label: "Lighting",
    },
    {
      fallback: "a neutral background and one saturated accent",
      hint: "Names or hex codes.",
      key: "palette",
      kind: "text",
      label: "Palette",
    },
    {
      fallback: "12",
      hint: "8 to 15 seconds keeps a 3D loop tight.",
      key: "length",
      kind: "number",
      label: "Length (seconds)",
    },
    SIZE_FIELD,
  ],
  id: "realtime-3d",
  improvements: [
    "Builds the piece around one object and one material instead of a busy scene",
    "Specifies lighting, camera lens and movement, the things that make 3D look expensive",
    "Keeps the simulation deterministic, so the render matches the preview",
    "Renders offline from the canvas instead of screen recording",
    "Ends on a seamless loop",
  ],
  matches: (video) =>
    /three\.?js|webgl/iu.test(`${video.stack ?? ""} ${video.prompt ?? ""}`),
  prompt: `<goal>
A {{length}}-second real-time 3D piece at {{size}}, built with three.js, about one thing: {{subject}}. It should feel like a product shot from a high-end studio, not a tech demo.
</goal>

<look>
Lighting: {{lighting}}. Physically based materials with real roughness and reflection; an HDR environment for reflections only.
Palette: {{palette}}. One lens for the whole piece (around 50 mm), shallow depth of field on close-ups, subtle film grain.
Keep out: bloom on everything, neon wireframes, starfields, random particles, and spinning the camera around the object with no reason.
</look>

<scene>
Three beats. Reveal: the object resolves out of darkness or out of its parts. Transform: it changes state (assembles, unfolds, melts or rearranges) in one continuous move. Rest: a slow hero angle, then return to the opening framing so the end loops into the start.
The camera moves like a real rig: slow dolly and crane moves with eased starts and stops, never a free orbit.
</scene>

<build>
1. One HTML page with three.js. Every position, rotation and material value is computed from the time t inside render(t); simulations are seeded and stepped at a fixed rate, so frame N is identical on every run.
2. Use the post-processing stack sparingly: tone mapping, depth of field, a touch of grain. No bloom unless a material is actually emissive.
3. Render offline: drive render(t) from Playwright at 60 fps, read each frame from the canvas, and encode with ffmpeg (H.264, yuv420p).
</build>

<review>
Render five stills spread across the timeline first and look at them at full size. Fix aliasing, noisy shadows, blown highlights and anything that reads as a default material, then render the video.
</review>

<handoff>
Describe the object, the three beats and the camera path in a few lines, then build it without further questions and give me the MP4.
</handoff>`,
  summary:
    "For real-time three.js pieces: one object, studio lighting, a camera that moves like a real rig, rendered offline frame by frame. Swap in your subject.",
  title: "The real-time 3D template",
};

const launchFilm: PromptTemplate = {
  dialSection: "story",
  fields: [
    {
      fallback: "my product (ask me for its name)",
      hint: "The product's name.",
      key: "product",
      kind: "text",
      label: "Product",
    },
    {
      fallback: "ask me for a one-line description",
      hint: "What it does, in one sentence.",
      key: "pitch",
      kind: "text",
      label: "What it does",
    },
    {
      fallback: "three features you choose from the product's website",
      hint: "Up to three, in the order you want them shown.",
      key: "features",
      kind: "text",
      label: "Features to show",
    },
    {
      fallback: "colors taken from the product's own interface",
      hint: "Brand colors, as names or hex codes.",
      key: "colors",
      kind: "text",
      label: "Brand colors",
    },
    {
      fallback: "the product's own interface font, or Inter",
      hint: "A Google Font works best.",
      key: "typeface",
      kind: "text",
      label: "Typeface",
    },
    {
      fallback: "the product's URL",
      hint: "What the end card says: a URL or a call to action.",
      key: "ending",
      kind: "text",
      label: "End card",
    },
    {
      fallback: "30",
      hint: "20 to 40 seconds suits a launch post.",
      key: "length",
      kind: "number",
      label: "Length (seconds)",
    },
    SIZE_FIELD,
  ],
  id: "launch-film",
  improvements: [
    "Rebuilds the real interface as animatable elements instead of describing it vaguely",
    "Follows a launch structure: problem, product, three features, end card",
    "Uses a cursor and real interactions to make each feature tangible",
    "Keeps the copy short enough to read at a glance",
    "Asks for the missing facts up front instead of inventing them",
  ],
  matches: (video) =>
    video.contentTags.includes("product-ui") &&
    Boolean(video.prompt) &&
    /\blaunch/iu.test(`${video.title} ${video.prompt}`),
  prompt: `<inputs>
Product: {{product}}. What it does: {{pitch}}. Features to show: {{features}}.
If any of these is missing, ask me for it before you start; never invent product facts.
</inputs>

<look>
A {{length}}-second launch film at {{size}}. Colors: {{colors}}. Typeface: {{typeface}}.
Rebuild the product's real interface as layered HTML elements (not screenshots), so every panel, button and number can move. Keep the UI crisp at 1:1 pixel scale when it is still.
On-screen copy: at most seven words at a time, each line on screen long enough to read twice.
Keep out: stock gradients, floating 3D phones, generic dashboards with fake data, lens flares, and particle effects.
</look>

<story>
1. Hook (about 10%): the problem in one short line of kinetic type.
2. Reveal (about 15%): the product's interface assembles from the line of type.
3. Features (about 60%): one feature per section, each shown as a real interaction: a cursor clicks, drags or types, and the interface responds. The camera pushes into the part that matters, then pulls back.
4. End card (about 15%): the logo or name, then {{ending}}.
Scene changes are continuous moves (a panel becomes the next screen), not cuts.
</story>

<build>
1. One HTML page; every property is computed from the time t in render(t), with no CSS animations or timers, so any frame renders on its own.
2. Springs for interface motion, exponential easing for camera moves, motion blur on fast moves.
3. Add a simple soundtrack generated in code (a pulse at 110 to 120 BPM, soft clicks for cursor actions, a hit on the end card) and export it as WAV.
4. Render with Playwright at 60 fps and encode with ffmpeg, then mux the audio.
</build>

<review>
Render one still per section first. Check that every word is readable, the interface looks like the real product and nothing overlaps, then render the film.
</review>

<handoff>
Confirm the inputs and a short shot list first, then build without further questions and give me the MP4.
</handoff>`,
  summary:
    "A launch film built from your product's real interface: a hook, the reveal, three features shown as real interactions, and an end card. Fill in your product and go.",
  title: "The launch film template",
};

export const PROMPT_TEMPLATES: readonly PromptTemplate[] = [
  showreel,
  launchFilm,
  realtime3d,
];

export const findPromptTemplate = (id: string | undefined) =>
  PROMPT_TEMPLATES.find((template) => template.id === id);

const videos: MotionVideo[] = catalog.videos;

/** Gallery videos related to a template, in gallery (popular) order. */
export const templateVideos = (template: PromptTemplate) =>
  videos.filter((video) => template.matches(video));

/**
 * The template that rewrites this video's prompt, if any: only templates
 * with an original prompt count, so a video links to a "stronger version"
 * of the prompt it actually used.
 */
export const strongerTemplateFor = (video: MotionVideo) =>
  PROMPT_TEMPLATES.find(
    (template) => template.original && template.matches(video)
  );
