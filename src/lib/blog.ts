// Blog posts, written for MotionVideo. Post text stays in English in every
// locale, like the prompts in the gallery; only the page chrome is translated.
//
// Bodies are a list of typed blocks instead of Markdown or HTML: the renderer
// owns every element it outputs, so a post can never inject markup. Paragraph
// and list text supports a small inline syntax, see `parseInline`.
//
// Every figure about the gallery was counted from `src/data/motion-catalog.json`
// when the post was written (247 videos, 243 with a prompt).

import type { MotionVideo } from "@/lib/motion-catalog";

export type BlogBlock =
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  /** A prompt excerpt the reader can copy. */
  | { type: "prompt"; caption: string; prompt: string }
  /** Gallery videos by slug, shown as poster cards; unknown slugs are skipped. */
  | { type: "videos"; caption?: string; slugs: string[] }
  /** A highlighted pointer to another page (a template, the customizer). */
  | { type: "callout"; text: string; href: string; label: string };

export interface BlogPost {
  slug: string;
  title: string;
  /** One or two sentences for the list, meta description and JSON-LD. */
  description: string;
  /** Publication date, YYYY-MM-DD. */
  date: string;
  /** Gallery video slug whose poster is the post's card image on /blog. */
  cover: string;
  body: BlogBlock[];
}

export type InlineNode =
  | { type: "text"; text: string }
  | { type: "bold"; text: string }
  | { type: "code"; text: string }
  | { type: "link"; text: string; href: string };

// `[text](href)`, `**bold**` and `` `code` ``. No nesting: posts don't need it,
// and a flat scan cannot be tricked into unbalanced output.
const INLINE =
  /\[(?<linkText>[^\]]+)\]\((?<href>[^)\s]+)\)|\*\*(?<bold>[^*]+)\*\*|`(?<code>[^`]+)`/gu;

export const parseInline = (source: string): InlineNode[] => {
  const nodes: InlineNode[] = [];
  let last = 0;
  for (const match of source.matchAll(INLINE)) {
    const [whole] = match;
    const { linkText, href, bold, code } = match.groups ?? {};
    // Site paths and https URLs only; anything else (javascript:, data:)
    // stays text.
    const safeHref =
      href !== undefined &&
      ((href.startsWith("/") && !href.startsWith("//")) ||
        href.startsWith("https://"));
    if (match.index > last) {
      nodes.push({ type: "text", text: source.slice(last, match.index) });
    }
    if (linkText !== undefined && href !== undefined) {
      nodes.push(
        safeHref
          ? { type: "link", text: linkText, href }
          : { type: "text", text: whole }
      );
    } else if (bold !== undefined) {
      nodes.push({ type: "bold", text: bold });
    } else if (code !== undefined) {
      nodes.push({ type: "code", text: code });
    }
    last = match.index + whole.length;
  }
  if (last < source.length) {
    nodes.push({ type: "text", text: source.slice(last) });
  }
  return nodes;
};

/** What a poster card needs; loaders pass only this to keep the payload small. */
export type BlogVideo = Pick<
  MotionVideo,
  "slug" | "title" | "handle" | "poster" | "width" | "height"
>;

// The poster-card fields of the catalog videos with these slugs.
const pickVideos = (slugs: ReadonlySet<string>, videos: MotionVideo[]) => {
  const found: Record<string, BlogVideo> = {};
  for (const { slug, title, handle, poster, width, height } of videos) {
    if (slugs.has(slug)) {
      found[slug] = { slug, title, handle, poster, width, height };
    }
  }
  return found;
};

/**
 * The gallery videos a post shows, by slug. Takes the catalog as an argument
 * so this module doesn't bundle it.
 */
export const blogPostVideos = (post: BlogPost, videos: MotionVideo[]) =>
  pickVideos(
    new Set(
      post.body.flatMap((block) => (block.type === "videos" ? block.slugs : []))
    ),
    videos
  );

/** A post's YYYY-MM-DD date, long form in the reader's locale. */
export const formatPostDate = (date: string, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));

const LAUNCH_FILM: BlogPost = {
  slug: "prompting-product-launch-videos",
  cover: "twoclipping-221cab",
  title: "Prompting product launch videos",
  description:
    "How to get a launch film out of a coding agent that looks like your product: rebuild the real UI, script the beats, drive it with a cursor, keep the copy short, and let the agent ask for what it doesn't know.",
  date: "2026-10-17",
  body: [
    {
      type: "paragraph",
      text: "Launch videos are the most common job people give coding agents in the MotionVideo gallery. 53 videos are tagged as product UI and mention a launch, a promo or an announcement in their title or prompt. They are also the hardest kind to get right, because a launch film is judged against something the viewer can check: your actual product. A beautiful showreel with the wrong logo, an invented dashboard or a feature you don't have is worse than no video.",
    },
    {
      type: "paragraph",
      text: "The prompts behind those videos split the same way as the rest of the gallery. 51 of the 53 come with a prompt; the median is 27 words, and 14 reuse the viral showreel prompt. A handful are long, sectioned briefs. In our reading the results follow the effort: the short prompts produce generic motion with a product name on top, the long ones produce something that could only be that product.",
    },
    {
      type: "heading",
      level: 2,
      text: "Rebuild the real UI, don't screenshot it",
    },
    {
      type: "paragraph",
      text: "The single most useful instruction is to point the agent at the real thing. A coding agent can read your frontend, your landing page and your design tokens. Ask it to rebuild the screens it needs as plain, animatable elements: the sidebar as a list of divs, the chart as SVG paths, the button as a real button with your radius and colours. A screenshot can only be moved, scaled and faded. A rebuilt screen can have its rows slide in one by one, its numbers count up and its chart draw itself.",
    },
    {
      type: "paragraph",
      text: "Five of the launch prompts tell the agent to read the codebase, the repository or the product's components first, and you can see it in the results: [the Taxtello film](/videos/daniel-haida-8691d4) starts by naming the repositories as the source of truth before any design work, and [this 30-second SaaS launch](/videos/aschapmann-131210) asks the agent to pull the story, copy, colours, font and logo from the landing page and code, and to trace the logo to SVG so it can be animated.",
    },
    {
      type: "list",
      items: [
        "Name the source of truth: a repository path, a URL, a Figma export. If there are several, say which one wins.",
        "Ask for **simplified** screens. A launch film needs the shape of the UI, not every setting. Three rows read better than thirty.",
        "Keep real data out of it. Ask for plausible sample data that matches your product, and say which numbers must be exact (prices, limits, dates).",
        "Ask for the logo as SVG. A raster logo can't be drawn on or morphed, and it blurs when the camera pushes in.",
      ],
    },
    { type: "heading", level: 2, text: "A structure that works" },
    {
      type: "paragraph",
      text: "Most good launch films follow the same arc, whatever their length. Write it into the prompt as beats with rough timings, so the agent spends its effort on the transitions between them rather than inventing a story:",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "**Hook** (0 to 2 s): one line or one image that names the problem or the promise. No logo yet.",
        "**Problem** (2 to 5 s): what is slow, ugly or broken today, shown rather than told.",
        "**Product** (5 to 15 s): two or three features, one per beat, each on a rebuilt screen.",
        "**Proof** (15 to 20 s): a number, a customer logo row or a before and after. Only if it's true.",
        "**Close** (last 3 s): logo, one-line tagline, URL. Hold it long enough to read.",
      ],
    },
    {
      type: "paragraph",
      text: "For a 15-second cut, drop the problem beat and keep one feature. For 30 seconds, give each feature its own scene. Ask for the timings to land on the music if there is any: a cut that falls on a beat feels intentional, a cut half a beat late feels like a mistake.",
    },
    { type: "heading", level: 2, text: "Let a cursor drive the interactions" },
    {
      type: "paragraph",
      text: "Product demos read best when something visibly causes each change. A cursor that moves to a button, presses it and triggers the next state gives the viewer a reason for every transition. Six launch prompts in the gallery ask for a cursor. [The photo print app film](/videos/twoclipping-221cab) goes furthest: every change is caused by a click, drag or long-press, and the camera zooms in on each interaction.",
    },
    {
      type: "list",
      items: [
        "Ask for eased cursor paths (a slight curve, a short settle) rather than straight lines at constant speed.",
        "Make clicks visible: a small press on the cursor and a pressed state on the target, a few frames apart.",
        "Let the camera follow the cursor: push in on the interaction, pull back for the result.",
        "Keep it to one cursor action per beat. Three clicks in one second is a blur.",
      ],
    },
    {
      type: "prompt",
      caption: "A beat written for a cursor-driven scene",
      prompt:
        'Beat 3 (7.0 to 10.5 s): the cursor glides from the bottom right to the "New report" button, settles, and clicks on 7.8 s. The button depresses for 4 frames, the empty state slides left and the report screen slides in from the right. The camera pushes in 15% on the chart as its bars grow from zero, staggered 3 frames apart. Hold the finished chart for 1 s before the next beat.',
    },
    { type: "heading", level: 2, text: "Keep the copy short" },
    {
      type: "paragraph",
      text: "On-screen text is read, not listened to, and it competes with the motion. Give the agent the exact words, or ask it to propose them and keep each line under six words. One idea per line, one line on screen at a time, and long enough to read twice: roughly a second plus a beat for every three words. Kinetic type can be striking, but only if the words survive it. If you want an exact tagline, put it in quotes and say it must not be rewritten.",
    },
    { type: "heading", level: 2, text: "Ask the agent to ask you" },
    {
      type: "paragraph",
      text: "A launch film needs facts the agent can't find: the launch date, the price, which feature is new, the one claim you are allowed to make. Without them it will invent plausible ones. Seven launch prompts in the gallery tell the agent to ask for something first, such as photos, a song or a brand name. Make it explicit:",
    },
    {
      type: "prompt",
      caption: "An opening that makes the agent collect facts before it builds",
      prompt:
        "Before you write any code, list what you still need from me to make this accurate: product name and tagline, the three features to show, any prices or numbers, the logo file, brand colours and fonts, the URL, and the music if any. Ask me in one message, wait for my answers, and do not invent any of them.",
    },
    {
      type: "paragraph",
      text: "Then end the prompt with a review step: render, look at the frames, fix overlaps, clipped text and anything that moves too fast to read, and only then show the result. The 30-second SaaS launch prompt ends exactly like that, and it costs nothing to add.",
    },
    {
      type: "videos",
      caption: "Launch films from the gallery",
      slugs: [
        "twoclipping-221cab",
        "aschapmann-131210",
        "daniel-haida-8691d4",
        "rossaxbt-3085b7",
        "xelandre-363f00",
        "fractadev-149adc",
      ],
    },
    {
      type: "callout",
      text: "The launch film template turns this structure into a prompt with fields for your product, features, facts and brand, and asks the agent to collect what's missing.",
      href: "/templates/launch-film",
      label: "Open the launch film template",
    },
  ],
};

const FRAME_BY_FRAME: BlogPost = {
  slug: "render-motion-graphics-frame-by-frame",
  cover: "xelandre-363f00",
  title: "Render motion graphics frame by frame",
  description:
    "Why an agent should compute every frame from a pure render(t) function and render offline instead of screen recording, and how Remotion, HyperFrames, plain HTML with Playwright and three.js fit that model.",
  date: "2026-10-15",
  body: [
    {
      type: "paragraph",
      text: "Ask a coding agent for a motion graphics video and it will often build a web page that animates in a browser. That is a fine way to preview, and a bad way to deliver. Played in real time, the animation depends on the machine: a slow frame drops, a timer drifts, the capture tool adds its own stutter. The fix is the same in every serious tool: make time an input, compute each frame from it, and render the frames offline.",
    },
    { type: "heading", level: 2, text: "Make every frame a function of time" },
    {
      type: "paragraph",
      text: "The core idea is a pure function: `render(t)` takes a time in seconds and draws exactly what the video shows at that moment, with no memory of earlier frames. Position, opacity, colour and the text on screen are all computed from `t`. Nothing advances on its own: no `setInterval`, no CSS transitions running on the wall clock, no physics stepped by however much time happened to pass.",
    },
    {
      type: "list",
      items: [
        "**Seekable.** You can jump to 7.4 seconds and see that exact frame, which is how both you and the agent review the video.",
        "**Deterministic.** Rendering twice gives the same file. Use a seeded random generator instead of `Math.random()`, so particles land in the same place every time.",
        "**Speed-independent.** A frame that takes a second to draw still lands at the right time in the output. Heavy effects stop being a problem.",
        "**Easy to retime.** A scene is a time window and every animation is an eased interpolation inside it, so moving a scene is changing two numbers.",
      ],
    },
    {
      type: "paragraph",
      text: "In practice the agent writes small helpers, a clamp, an interpolate and a few easing curves, and every element reads like this: progress for this element is the time since its start divided by its duration, eased, then mapped to a position. Springs work too, as long as they are computed in closed form or simulated from zero each frame, not carried over from the previous one.",
    },
    { type: "heading", level: 2, text: "Render offline, then encode" },
    {
      type: "paragraph",
      text: "Once each frame is a function of time, rendering is a loop: for frame 0 to N, set `t = frame / fps`, draw, save the image. A headless browser driven by Playwright works well for anything built on HTML, SVG, canvas or WebGL: load the page, call the render function, take a screenshot, repeat. Then ffmpeg turns the numbered images into a video. Only one prompt in the gallery mentions screen recording, while 14 mention Playwright and 11 mention ffmpeg.",
    },
    {
      type: "prompt",
      caption: "A render contract to paste into a prompt",
      prompt:
        "Build the video as a single page that exposes window.renderFrame(t), where t is seconds. renderFrame must draw the complete frame for that time and depend on nothing else: no timers, no CSS transitions, no Math.random (use a seeded generator). Render offline with Playwright at 1920x1080, 60 fps: for each frame call renderFrame(frame / 60), wait for fonts and images, and screenshot. Encode the frames with ffmpeg to H.264, yuv420p, CRF 18.",
    },
    { type: "heading", level: 3, text: "Motion blur from subframes" },
    {
      type: "paragraph",
      text: "Offline rendering makes real motion blur cheap to add. A camera shutter is open for part of each frame, so fast objects smear. You get the same effect by rendering several subframes spread across that shutter interval and averaging them: at 60 fps with eight samples, draw at `t`, `t + 1/480`, and so on, then blend. You can accumulate in a canvas, or render at the higher rate and let ffmpeg average groups of frames (`tmix` followed by `framestep`). 11 prompts in the gallery ask for motion blur. It is the single change that makes fast moves look filmed rather than computed.",
    },
    {
      type: "heading",
      level: 3,
      text: "Audio generated from the same timeline",
    },
    {
      type: "paragraph",
      text: "Sound effects drift out of sync when they are placed by hand afterwards. If the video already has a list of events (a card lands at 3.2 s, a click at 7.8 s), the agent can render audio from the same list: synthesize short sounds in code, for example with an `OfflineAudioContext`, write a WAV, and mux it in with ffmpeg. Change the timing and the sound follows. For music, do it the other way round: give the agent the track's tempo and let it place cuts on beats.",
    },
    { type: "heading", level: 2, text: "Choosing a stack" },
    {
      type: "paragraph",
      text: "56 videos in the gallery report the stack they were made with. 18 are plain HTML, JavaScript or canvas, 12 use Remotion, 10 HyperFrames, 6 describe an HTML page captured with Playwright, and 5 use Three.js. The rest are Python (3, including Manim), Blender and OpenEdit (1 each). All of the main options can follow the frame-by-frame model; they differ in how much of the loop they write for you.",
    },
    {
      type: "list",
      items: [
        "**Remotion** expresses the video as React components that read the current frame. It handles the seek, render and encode loop, previews in a browser and composes scenes as sequences. A good fit when you already think in React, and it rewards agents because the frame is always explicit. Check its license if you render for a company.",
        "**HyperFrames** describes a video as HTML with timing attributes and drives animation through seekable timelines, often GSAP, then renders by stepping through time. Close to how agents already write web pages, with the frame-by-frame discipline built in.",
        "**Plain HTML with Playwright** is the minimal version: one page, one `renderFrame(t)`, a short capture script and ffmpeg. No framework to learn and complete control, at the cost of writing the loop, font loading and encoding yourself. Several of the more ambitious launch films in the gallery are built this way.",
        "**three.js** is for real 3D: cameras, lights, models. It fits the model as long as the scene is updated from `t` rather than from a clock delta, and the renderer is drawn once per captured frame. Pair it with the Playwright loop to render.",
      ],
    },
    {
      type: "paragraph",
      text: "Whatever the stack, the prompt should say it outright, along with size, frame rate and length. The agent will otherwise pick whatever it reaches for first, and switching later means rewriting every scene.",
    },
    { type: "heading", level: 2, text: "Make the agent check its own frames" },
    {
      type: "paragraph",
      text: "The last advantage of a seekable video is review. Ask the agent to render a contact sheet, a still at every second or at every scene boundary, and look at it before rendering the full video. It will catch text running off the frame, elements overlapping and scenes that end before their content is readable, and it can jump to the exact moment to fix them. A screen recording offers none of this: the only way to check it is to watch it.",
    },
    {
      type: "videos",
      caption:
        "Rendered frame by frame: HTML with Playwright, Remotion and three.js",
      slugs: [
        "xelandre-363f00",
        "rossaxbt-3085b7",
        "daniel-haida-8691d4",
        "nft-chen-5f8bb0",
      ],
    },
    {
      type: "callout",
      text: "Add your stack, size and length to any gallery prompt, and set how polished the render should be, in the prompt customizer.",
      href: "/customize",
      label: "Customize a prompt",
    },
  ],
};

const ANATOMY: BlogPost = {
  slug: "anatomy-of-a-motion-prompt",
  cover: "twoclipping-5cba86",
  title: "The anatomy of a motion prompt",
  description:
    "A practical structure for prompts that produce motion graphics with coding agents: goal, style, scenes and timing, build, review and handoff, with example lines for each part.",
  date: "2026-10-13",
  body: [
    {
      type: "paragraph",
      text: "The median prompt in the MotionVideo gallery is 26 words. That is enough to get a video, but not enough to get the video you had in mind: everything you leave out, the model decides for you. The prompts behind the most controlled results are longer, and they tend to cover the same six things in the same order. Here is that structure, with short example lines you can adapt.",
    },
    {
      type: "paragraph",
      text: "None of the parts needs to be long. A complete prompt can fit in 150 words. What matters is that each question has an answer, so the agent spends its effort on craft instead of guessing.",
    },
    { type: "heading", level: 2, text: "1. Goal" },
    {
      type: "paragraph",
      text: "Say what the video is for, who will watch it and where. A homepage hero loop, a product launch post and a conference talk opener need different pacing, length and framing. Then give the hard numbers: length, size and frame rate. In the gallery, at least 131 of 243 prompts give a length in seconds, but only 29 give a size or aspect ratio and 9 a frame rate.",
    },
    {
      type: "prompt",
      caption: "Goal",
      prompt:
        "A 20-second video announcing our new offline mode, posted on X and LinkedIn. 1080x1350 (4:5), 30 fps, plays muted by default, so it has to work without sound.",
    },
    { type: "heading", level: 2, text: "2. Style" },
    {
      type: "paragraph",
      text: 'Describe the look with things the agent can implement, not adjectives. "Premium" and "dynamic" mean nothing to code; a palette, a typeface and a few motion rules do. Name what is banned as well: it is the fastest way to steer away from the effects every model reaches for first.',
    },
    {
      type: "list",
      items: [
        "**Palette:** two or three colours with hex values, and which one is the accent.",
        "**Type:** the typeface, weights and the largest and smallest sizes on screen.",
        "**Motion rules:** the easing family, how long a typical move takes, how much overlap between elements.",
        "**Banned:** for example lens flares, glitch transitions, rotating 3D text, stock particle bursts.",
      ],
    },
    {
      type: "prompt",
      caption: "Style",
      prompt:
        "Off-white background (#F6F4EF), near-black text (#141414), one accent (#2F6BFF) used only for the thing that changes. Inter Tight, 600 for headlines, 400 for UI. Moves take 400 to 700 ms with a strong ease-out; elements enter in 60 ms staggers. No glows, no particles, no camera shake.",
    },
    { type: "heading", level: 2, text: "3. Scenes and timing" },
    {
      type: "paragraph",
      text: "Write the video as beats with timings. This is the part people skip most, and the part that most changes the result: without it the agent invents a story and usually overfills it. Give each beat one job and a time window, and say how scenes connect. A transition that grows out of the previous scene reads as designed; a crossfade between unrelated scenes reads as a slideshow.",
    },
    {
      type: "prompt",
      caption: "Scenes and timing",
      prompt:
        '0 to 3 s: the words "No signal?" type in, centred. 3 to 8 s: a phone screen slides up; its status bar loses signal, and the app keeps working as a note saves with a small check. 8 to 15 s: three cards fan out, one per feature, each held 2 s. 15 to 20 s: the cards collapse into the logo, tagline below, hold 2 s.',
    },
    { type: "heading", level: 2, text: "4. Build" },
    {
      type: "paragraph",
      text: "Tell the agent how to make it: the stack, how to render, and where the material comes from. If the video shows your product, point at the code or the site and ask for the screens to be rebuilt as elements rather than screenshots. If you care that it renders cleanly, ask for every frame to be computed from the time and captured offline; [rendering frame by frame](/blog/render-motion-graphics-frame-by-frame) explains why.",
    },
    {
      type: "prompt",
      caption: "Build",
      prompt:
        "Use Remotion. Rebuild the note editor from src/components/editor as simplified, animatable components; use sample notes, not real data. Every animation is computed from the current frame. Render to MP4, H.264.",
    },
    { type: "heading", level: 2, text: "5. Review" },
    {
      type: "paragraph",
      text: "Agents are good at checking their own work when asked. Ask for a pass over rendered stills before the final render, with specific things to look for. Only 10 prompts in the gallery mention screenshots at all, so most leave the model to judge its work from the code alone.",
    },
    {
      type: "prompt",
      caption: "Review",
      prompt:
        "Before the final render, export a still every half second and look at them. Fix any text that is clipped, overlapping or on screen for less than 1.5 s, any element that touches the frame edge, and any scene where nothing moves for more than a second.",
    },
    { type: "heading", level: 2, text: "6. Handoff" },
    {
      type: "paragraph",
      text: "Say what you want back. A video file, yes, but also the source, so you can change a word next week without starting over, and a short note on what to edit where. If any facts are missing, this is also where you tell the agent to ask instead of inventing them.",
    },
    {
      type: "prompt",
      caption: "Handoff",
      prompt:
        "Deliver the MP4, the project, and a short README listing every on-screen string and the file it lives in. If anything above is unclear or missing, ask me before you start.",
    },
    { type: "heading", level: 2, text: "Putting it together" },
    {
      type: "paragraph",
      text: "Stack the six parts in order. Longer prompts in the gallery often wrap each part in an XML-style tag such as `<direction>` or `<structure>`, which helps the model find the constraints again later in a long session. Plain headings work just as well. Keep the order: what it is, how it looks, what happens when, how to build it, how to check it, what to hand back.",
    },
    {
      type: "list",
      items: [
        "Fill in the numbers first: length, size, frame rate. They constrain everything else.",
        "Write the beats before the style. A clear story survives a bland style; the reverse rarely holds.",
        "Cut adjectives that don't map to code. If you can't say how the agent would implement \"elegant\", replace it with the rule you mean.",
        "Reuse what works. A good structure with new facts beats a new prompt from scratch.",
      ],
    },
    {
      type: "paragraph",
      text: "If you would rather start from a working prompt, the [prompt customizer](/customize) takes any prompt from the gallery and adds your subject, size, length, colours and typeface as a brief at the end, so the original stays intact.",
    },
    {
      type: "callout",
      text: "The showreel template is this structure applied to the gallery's most popular prompt, with a field for every part.",
      href: "/templates/showreel",
      label: "Open the showreel template",
    },
  ],
};

const IN_COMMON: BlogPost = {
  slug: "what-243-motion-prompts-have-in-common",
  cover: "stephanlivera-df17a2",
  title: "What 243 motion prompts have in common",
  description:
    "We read every prompt in the MotionVideo gallery and counted: how long they are, how they're structured, how often one viral prompt is reused, what people forget to specify, and how the videos were made.",
  date: "2026-10-11",
  body: [
    {
      type: "paragraph",
      text: "MotionVideo collects motion videos made with AI coding agents, along with the prompt or skill behind each one. When this was written the gallery held 247 videos from 221 creators, posted between 23 September and 14 October 2026. 243 of them come with the full prompt. That makes a small but honest dataset: these are the words people actually typed, not cleaned-up examples. We read all of them and counted.",
    },
    { type: "heading", level: 2, text: "Most prompts are short" },
    {
      type: "paragraph",
      text: "The median prompt is 26 words, about two sentences. A quarter are 14 words or fewer, three quarters are 37 words or fewer, and 198 of the 243 are a single paragraph without a line break.",
    },
    {
      type: "list",
      items: [
        "102 prompts have 25 words or fewer.",
        "91 have 26 to 50 words.",
        "18 have 51 to 100.",
        "7 have 101 to 200.",
        "25 run past 200 words, 13 of them past 800. The longest is 2,443 words.",
      ],
    },
    {
      type: "paragraph",
      text: "So there are two groups and very little in between: a large pile of one- or two-sentence requests, and a small set of long, structured briefs. Only 25 prompts fall between 51 and 200 words.",
    },
    { type: "heading", level: 2, text: "One prompt shows up everywhere" },
    {
      type: "paragraph",
      text: '78 prompts, almost a third, contain the phrase "incredible motion designer". They all descend from one request that spread widely, and 24 videos use it word for word (ignoring capitalisation and spacing):',
    },
    {
      type: "prompt",
      caption: "The most reused prompt in the gallery, verbatim in 24 videos",
      prompt:
        "Make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are, like it's your showreel for a résumé. Go all out.",
    },
    {
      type: "paragraph",
      text: 'The variants mostly change the length. 56 of the 78 keep 15 seconds, 6 ask for 20, 4 for 40, 3 for 30, 2 for 10 and 1 for 25, and 6 give no length. The original is 26 words; 17 of the variants run past 30, so their creators added at least a sentence of their own. Its closing words travelled further than the prompt itself: "go all out" appears in 89 prompts.',
    },
    {
      type: "paragraph",
      text: "The prompt works because it asks for nothing in particular. The model picks the subject, the palette, the type and the story, and it shows: 52 of the 78 videos are tagged kinetic type and 34 shapes, the things a model reaches for when nobody tells it otherwise. That makes it a good test of what a model can do and a poor brief for a video you need. Below are three results from the identical prompt.",
    },
    {
      type: "videos",
      caption: "Three videos from the exact same prompt",
      slugs: ["stephanlivera-df17a2", "shneural-2abdfa", "ajith-io-b5626e"],
    },
    {
      type: "heading",
      level: 2,
      text: "Long prompts converge on one structure",
    },
    {
      type: "paragraph",
      text: "19 prompts are split into XML-style sections such as `<direction>…</direction>`. They are the long ones: the median sectioned prompt is 804 words, and 19 of the 25 prompts over 200 words use sections. More striking, 18 of the 19 use the same set of section names, from 8 different creators. The structure is being shared, not reinvented:",
    },
    {
      type: "list",
      items: [
        "**inputs**: what the agent must ask for before starting, such as photos, a logo, a song.",
        "**direction**: the look, the references and a list of banned effects.",
        "**structure**: the timeline, beat by beat, often tied to the tempo of the music.",
        "**build**: the stack and the render pipeline.",
        "**gotchas**: the failures to avoid, written from experience.",
        "**start**: the agent's first action.",
      ],
    },
    {
      type: "paragraph",
      text: "14 of those 18 are product UI videos and 11 are tagged music, so this is the shape people converge on when a video has to match a real product and land on a beat.",
    },
    {
      type: "heading",
      level: 2,
      text: "What people specify, and what they leave out",
    },
    { type: "paragraph", text: "Across all 243 prompts:" },
    {
      type: "list",
      items: [
        "at least 131 give a length in seconds;",
        "47 mention sound, music or audio;",
        "30 mention colour, a palette or a hex value;",
        "29 give a size or aspect ratio;",
        "19 mention fonts, typefaces or typography;",
        "9 give a frame rate.",
      ],
    },
    {
      type: "paragraph",
      text: "Length is the one detail most people remember. Size is not, and the defaults show: 212 videos in the gallery are landscape, 20 portrait and 15 square. If the video is for a phone-first feed, the prompt has to say so.",
    },
    { type: "heading", level: 2, text: "What gets made" },
    {
      type: "paragraph",
      text: "Each video carries one or more category tags. Product UI leads with 105 videos, followed closely by kinetic type with 102. Then come music (54), shapes (47), particles (44), charts (34), diagrams (33), characters (29), photos (23), phone (22) and code (21). People mostly use agents to show software and to animate words.",
    },
    { type: "heading", level: 2, text: "How the videos were made" },
    {
      type: "paragraph",
      text: "Creators can say how they made a video. It is optional and self-reported, so each figure below covers only the videos where someone filled it in.",
    },
    {
      type: "list",
      items: [
        "**Model:** 233 videos name one, and all 233 name Opus 5.5.",
        "**Stack:** 56 report one. 18 are plain HTML, JavaScript or canvas, 12 Remotion, 10 HyperFrames, 6 an HTML page captured with Playwright, 5 Three.js, 3 Python (including Manim), 1 Blender and 1 OpenEdit.",
        "**Effort:** 36 report it: 22 max, 7 high, 7 medium.",
        "**Iterations:** 97 report it: 90 one-shot, 6 a few rounds, 1 many rounds.",
      ],
    },
    {
      type: "paragraph",
      text: "Read the one-shot figure with care. People are more likely to post, and label, a video that worked the first time, and an open prompt like the showreel one can hardly fail, because any result counts. What the number does show is that a single prompt can carry a whole video.",
    },
    { type: "heading", level: 2, text: "Takeaways" },
    {
      type: "list",
      ordered: true,
      items: [
        "Decide what the video is for before writing. The one-line showreel prompt is fine when any good-looking result will do; it is the wrong tool for a launch or an explainer.",
        "Give three numbers: length, size and frame rate. Most prompts give only the first.",
        "Describe the look in terms the agent can implement: hex colours, a typeface, a few motion rules, and what is banned.",
        "Once a prompt passes a paragraph, split it into sections. The long prompts in the gallery agree on a structure; borrow it.",
        "Ask the agent to collect missing facts first and to review its own frames before it hands the video back.",
      ],
    },
    {
      type: "paragraph",
      text: "[The anatomy of a motion prompt](/blog/anatomy-of-a-motion-prompt) turns these into a structure with example lines, and the [prompt customizer](/customize) adds your details to any prompt in the gallery.",
    },
    {
      type: "callout",
      text: "The showreel template rewrites the viral prompt with a slot for every detail it leaves to chance.",
      href: "/templates/showreel",
      label: "Open the showreel template",
    },
  ],
};

/** Newest first. */
export const BLOG_POSTS: BlogPost[] = [
  LAUNCH_FILM,
  FRAME_BY_FRAME,
  ANATOMY,
  IN_COMMON,
];

export const findBlogPost = (slug: string | undefined) =>
  BLOG_POSTS.find((post) => post.slug === slug);

/** Every post's cover video, by slug, for the /blog cards. */
export const blogCovers = (videos: MotionVideo[]) =>
  pickVideos(new Set(BLOG_POSTS.map((post) => post.cover)), videos);
