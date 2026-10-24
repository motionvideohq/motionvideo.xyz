// Prompt templates: tested prompt structures with fill-in fields. This file
// is the public part of each one (name, summary, fields, outline, gallery
// examples); the prompt text is Pro content and lives server-side in
// src/server/data/template-prompts.json, keyed by `id`, behind
// getTemplatePrompt. Never put prompt text here: this module ships to the
// browser.
//
// Every `{{key}}` in a template's prompt is one of its fields. Names,
// summaries and outlines are English data, like the moves; the prompts stay
// in English in every locale, as they are read by the model.
import type { TemplateField } from "@/lib/prompt-customizer";

/** One section of a template's prompt and what it covers. */
export interface TemplateSection {
  /** The section's tag in the prompt, e.g. `acts` for `<acts>`. */
  name: string;
  covers: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  /** One or two sentences for cards and the page intro. */
  summary: string;
  /** What the template adds over the prompts people usually write. */
  improvements: readonly string[];
  fields: readonly TemplateField[];
  /** The prompt's sections in order: the structure shown to everyone. */
  outline: readonly TemplateSection[];
  /** The section the creativity, pace and polish lines go into. */
  dialSection: string;
  /**
   * Gallery videos shown on the template's page, by slug. For a template
   * inspired by a gallery prompt: the videos made with that prompt, which
   * link back to the template from their detail view.
   */
  examples: readonly string[];
  /** The gallery video whose prompt inspired the template, credited on its page. */
  inspiredBy?: string;
}

// Gallery examples, in gallery order.
const SHOWREEL_EXAMPLES = [
  "stephanlivera-df17a2",
  "shneural-2abdfa",
  "ajith-io-b5626e",
  "himanshutwtxs-5f4b43",
  "gabrielbuzziv-4ff0c6",
  "thismacapital-dfba20",
  "ajith-io-c52e09",
  "samuel-yostt-891f87",
  "steventey-0d20e4",
  "thayto-dev-44b911",
  "jacksonfall-54b2ac",
  "jasonzhou1993-8595e0",
  "ho-ba-f3f0e9",
  "itisrazak-3ad902",
  "ismailfahmi-557268",
  "melvynx-6cde6c",
  "tequilafunks-97f6c9",
  "lukasersil-0ed38e",
  "gizakdag-cf4ae6",
  "ajith-io-4c248f",
  "polydao-7a572b",
  "ajith-io-ea7f2d",
  "ayushunleashed-ece3e3",
  "chatgptastra-0d95c7",
  "monokern-ade5b6",
  "math-files-39c9d0",
  "eyishazyer-af035b",
  "blue-clarity-ef56d0",
  "roundtablespace-d3a1be",
  "raphaelaubryy-4b137e",
  "codestackr-c071bf",
  "prasad-pilla-2c0cba",
  "samuel-spitz-974923",
  "aistocksavvy-3fb9f5",
  "zheke-38deff",
  "sudeepsd-1a3485",
  "influencer-seo-ce8c33",
  "agonaliu-466a8f",
  "ndhabarde11-f155b4",
  "topi-003-9ca6b5",
  "rendesr-86be44",
  "en-ra-81c6dd",
  "jesscaroline7-1ff7cb",
  "theviableedge-9065be",
  "misbahsy-80eaec",
  "reyzostyle-b55864",
  "gouthamjay8-6ee290",
  "motiondsgnr-9dcfa6",
  "manuelogomigo-f33ca9",
  "mrtanviir-132457",
  "ann_nnng-c42313",
  "jayscambler-3f8889",
  "utopyaszx-1b2f94",
  "mustaphafenzar-b909ae",
  "web3wesley-7bb108",
  "kentcdodds-874446",
  "devius-maximus-beab45",
  "elliot-garreffa-f334bc",
  "adamdesgns-478d6d",
  "chrisjdimarco-8c3641",
  "bizibeast-10f264",
  "leonabboud-c87135",
  "sudiyasa-f48ac9",
  "m1n9-k7-ff9ab9",
  "quickdesignio-dd93d0",
  "prasenx-3c11d1",
  "levabashidze-2d713a",
  "kingokings-0a90cc",
  "miskinho-443898",
  "onewaysidewalks-c00e48",
  "zaqailo-212ad3",
  "crazyalphaaa-bc7e75",
  "fionntobin-97b7af",
  "itsuki-dev-10942d",
  "kangaroohere-b10f8d",
  "kyonax-on-tech-aabc1d",
  "loicrambo-ad6830",
  "tolgayhickiran-e90799",
  "danilowm-d3720d",
  "vanshwtfff-db0466",
  "3xtihor-0f6911",
  "amol909s-27533e",
  "johnsavage-ai-b091c0",
  "leonkohli-6dc01b",
  "marouanegazouzi-6071d5",
  "safarkhanshuvo-ffd52d",
  "sahildesigner23-ee3155",
  "grace-sunnyy-29bc61",
  "thilina-a-891c09",
  "blushpetal795-0c85c2",
  "ibrahimwasim240-809370",
  "teslachartz-c58b32",
  "leadnotifi-e83f94",
  "samaote-5e2fc2",
  "shinskinakamoto-20190b",
  "umangratani-57f86a",
];

const REALTIME_3D_EXAMPLES = [
  "fanxing321-a52ec8",
  "btcup99-b318a9",
  "okazaky-ec5fed",
  "twoclipping-56402e",
  "aicreataro-e97930",
  "nft_chen-ba901b",
  "gorden-sun-041f56",
  "gdgtify-efbc09",
  "everestchris6-4dc88c",
  "obydulme-672238",
  "notdwd-2805b9",
  "buildfastwithai-ed9447",
  "ryzoft-4f85bd",
  "phase89-09eeb1",
  "nischalsharma_-24a27c",
  "zeezomb-9246e2",
  "notdwd-7eece3",
  "anilraok-eff262",
];

const LAUNCH_FILM_EXAMPLES = [
  "twoclipping-221cab",
  "notdwd-c2037d",
  "screeendev-3e043d",
  "steventey-0d20e4",
  "0xnicc0-eccd15",
  "beamnxw-375dbf",
  "ligayabeebe-f53e3f",
  "notdwd-7de38a",
  "viktoroddy-98c1d8",
  "rossaxbt-3085b7",
  "archiveexplorer-3d5cdc",
  "ultimaxbt-2ddf1e",
  "twoclipping-809e2a",
  "elkrispis-df3303",
  "notdwd-2c76f5",
  "hqmank-7c61f1",
  "ratheejaisal-1f4538",
  "sportyblocks-6ae043",
  "gabzofar-4d31e6",
  "charlessieg-f72c25",
  "techyoutbe-945b56",
  "deeprajo1-3f900a",
  "deifosv-04e4d3",
  "ryan_morr-51268f",
  "jhylee95-e1152f",
  "sachaarbonel-8f14f4",
  "daniel-haida-8691d4",
  "howdevelop-3fb4b1",
  "gouthamjay8-6ee290",
  "macrohou-33959d",
  "punit_io-97672c",
  "mustaphafenzar-b909ae",
  "aschapmann-131210",
  "wozu-co-242285",
  "annacher___-6f2fc1",
  "xelandre-363f00",
  "fractadev-149adc",
  "leanzubrezki-8846f7",
  "francoxavier33-d2dfd2",
  "hugon001-8fb4e0",
  "raphaelaubryy-b20885",
  "dimoff2000-6751a3",
  "hsanat-51b0ff",
  "drrickio-dee911",
  "mehul4795-4a7007",
  "techtactician-f612b6",
  "listudio-820c7b",
  "julianpscheid-8c7502",
  "pbteja1998-82c12e",
  "moritzkremb-b0b5e5",
  "iammxfschr-d68f90",
  "d4m1n-607f5a",
];

const SIZE_FIELD: TemplateField = {
  hint: "Width × height in pixels.",
  key: "size",
  kind: "size",
  label: "Size",
  placeholder: "1920x1080",
};

const showreel: PromptTemplate = {
  dialSection: "acts",
  examples: SHOWREEL_EXAMPLES,
  fields: [
    {
      hint: "The idea every act grows from. Leave it empty and the model picks one.",
      key: "concept",
      kind: "text",
      label: "Concept",
      placeholder:
        "your choice, e.g. “a single line that learns to draw itself”",
    },
    {
      hint: "A Google Font, or a short list to choose from.",
      key: "typeface",
      kind: "text",
      label: "Typeface",
      placeholder: "one free variable font from Google Fonts",
    },
    {
      hint: "Names or hex codes, e.g. #FF4F1F, cobalt blue, cream.",
      key: "palette",
      kind: "text",
      label: "Palette",
      placeholder: "two colors plus an off-white and a near-black",
    },
    {
      hint: "15 to 30 seconds suits a showreel.",
      key: "length",
      kind: "number",
      label: "Length (seconds)",
      placeholder: "20",
    },
    {
      hint: "Every move lands on this beat.",
      key: "bpm",
      kind: "number",
      label: "Tempo (BPM)",
      placeholder: "124",
    },
    SIZE_FIELD,
  ],
  id: "showreel",
  improvements: [
    "One concept and one recurring element carry the whole piece, so it reads as a reel rather than a list of effects",
    "Names five acts and gives each a technique, instead of leaving the structure to chance",
    "Locks every change to a tempo, with a soundtrack generated in code",
    "Lists the effects that make AI motion look generic, so they stay out",
    "Renders frame by frame from a pure function of time, so nothing drifts or stutters",
    "Reviews a contact sheet of stills before the final render",
  ],
  inspiredBy: "shneural-2abdfa",
  name: "The showreel template",
  outline: [
    {
      covers: "Length, size, tempo, type, colors and the concept, up front",
      name: "spec",
    },
    {
      covers: "One recurring element that links every act",
      name: "thread",
    },
    {
      covers: "Five acts on the beat, ending on a loop",
      name: "acts",
    },
    {
      covers: "A flat visual language and the effects to keep out",
      name: "rules",
    },
    {
      covers: "A frame-by-frame render, with the soundtrack made in code",
      name: "pipeline",
    },
    { covers: "A contact sheet before the final render", name: "check" },
    { covers: "A storyboard first, then the MP4", name: "reply" },
  ],
  summary:
    "Built on the most copied prompt in the gallery, the one-line “show what an incredible motion designer you are”. It keeps the freedom and adds the structure, timing and rendering the one-liner leaves out.",
};

const realtime3d: PromptTemplate = {
  dialSection: "arc",
  examples: REALTIME_3D_EXAMPLES,
  fields: [
    {
      hint: "One object or material the whole piece is about.",
      key: "subject",
      kind: "text",
      label: "Subject",
      placeholder:
        "your choice of one physical object, e.g. “a stack of glass tiles”",
    },
    {
      hint: "Lighting and environment in a few words.",
      key: "lighting",
      kind: "text",
      label: "Lighting",
      placeholder: "a soft studio with one warm key light and a cool rim light",
    },
    {
      hint: "Names or hex codes.",
      key: "palette",
      kind: "text",
      label: "Palette",
      placeholder: "a neutral background and one saturated accent",
    },
    {
      hint: "8 to 15 seconds keeps a 3D loop tight.",
      key: "length",
      kind: "number",
      label: "Length (seconds)",
      placeholder: "12",
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
  name: "The real-time 3D template",
  outline: [
    { covers: "One subject, the length and the size", name: "intent" },
    {
      covers: "Lighting, materials, lens, camera moves and what to leave out",
      name: "camera-and-light",
    },
    { covers: "Three movements that end on a loop", name: "arc" },
    {
      covers: "A deterministic scene, rendered offline from the canvas",
      name: "engineering",
    },
    { covers: "Five full-size stills before the video", name: "proof" },
    { covers: "A short plan, then the MP4", name: "answer" },
  ],
  summary:
    "For real-time three.js pieces: one object, studio lighting, a camera that moves like a real rig, rendered offline frame by frame. Swap in your subject.",
};

const launchFilm: PromptTemplate = {
  dialSection: "beats",
  examples: LAUNCH_FILM_EXAMPLES,
  fields: [
    {
      hint: "The product's name.",
      key: "product",
      kind: "text",
      label: "Product",
      placeholder: "my product (ask me for its name)",
    },
    {
      hint: "What it does, in one sentence.",
      key: "pitch",
      kind: "text",
      label: "What it does",
      placeholder: "ask me for a one-line description",
    },
    {
      hint: "Up to three, in the order you want them shown.",
      key: "features",
      kind: "text",
      label: "Features to show",
      placeholder: "three features you choose from the product's website",
    },
    {
      hint: "Brand colors, as names or hex codes.",
      key: "colors",
      kind: "text",
      label: "Brand colors",
      placeholder: "colors taken from the product's own interface",
    },
    {
      hint: "A Google Font works best.",
      key: "typeface",
      kind: "text",
      label: "Typeface",
      placeholder: "the product's own interface font, or Inter",
    },
    {
      hint: "What the end card says: a URL or a call to action.",
      key: "ending",
      kind: "text",
      label: "End card",
      placeholder: "the product's URL",
    },
    {
      hint: "20 to 40 seconds suits a launch post.",
      key: "length",
      kind: "number",
      label: "Length (seconds)",
      placeholder: "30",
    },
    SIZE_FIELD,
  ],
  id: "launch-film",
  improvements: [
    "Rebuilds the real interface as animatable elements instead of describing it vaguely",
    "Follows a launch structure: problem, product, features, end card",
    "Uses a cursor and real interactions to make each feature tangible",
    "Keeps the copy short enough to read at a glance",
    "Asks for the missing facts up front instead of inventing them",
  ],
  name: "The launch film template",
  outline: [
    {
      covers: "The product, what it does and the features to show",
      name: "facts",
    },
    { covers: "Length, size, colors and typeface", name: "format" },
    {
      covers: "The real interface rebuilt in HTML, short copy, what to skip",
      name: "interface",
    },
    {
      covers: "Problem, reveal, one feature at a time, end card",
      name: "beats",
    },
    {
      covers: "A frame-by-frame render with a soundtrack made in code",
      name: "engineering",
    },
    { covers: "One still per section before the film", name: "proof" },
    {
      covers: "The facts and a shot list to confirm, then the MP4",
      name: "answer",
    },
  ],
  summary:
    "A launch film built from your product's real interface: a hook, the reveal, each feature shown as a real interaction, and an end card. Fill in your product and go.",
};

export const PROMPT_TEMPLATES: readonly PromptTemplate[] = [
  showreel,
  launchFilm,
  realtime3d,
];

export const findPromptTemplate = (id: string | undefined) =>
  PROMPT_TEMPLATES.find((template) => template.id === id);

export const templatePath = (template: PromptTemplate) =>
  `/templates/${template.id}`;

/**
 * The template inspired by the prompt this gallery video was made with, if
 * any, for the "Template" link in its detail view.
 */
export const templateForVideo = (slug: string) =>
  PROMPT_TEMPLATES.find(
    (template) => template.inspiredBy && template.examples.includes(slug)
  );
