import { useId } from "react";
import type { CSSProperties, ReactNode, SVGProps } from "react";

import { SITE } from "@/constants/site";
import { useSeason } from "@/lib/seasons";
import type { Season } from "@/lib/seasons";
import { cn } from "@/lib/utils";

// Every form of the MotionVideo logo, in one place:
//   Logomark          the symbol alone, static (menus, dialogs, brand page)
//   AnimatedLogomark  the symbol with its hover move, or the festive take on
//                     it during a season (Diwali, Holi, Halloween, Christmas,
//                     Republic and Independence Day in India, July 4 in the US)
//   Logotype          the name "MotionVideo" set in type, with its hover moves
//   Logo              the lockup: AnimatedLogomark beside Logotype (header,
//                     footer, sign-in)
// Hover moves, each its own `group/part` (or `group/mark` for festive marks):
//   logomark → the yellow app-icon tile springs up behind it
//   "Motion" → the two o's bounce like balls, with squash and stretch
//   "Video"  → the letters advance one film frame while sprockets run past
// Festive marks are drawn in the logomark's own viewBox, so decorations sit on
// its exact outline at any size, and spill out of it (`overflow-visible`) for
// flames, hats, bats, kites and fireworks. Each idles with a small loop and
// does more on hover; the keyframes live in globals.css. Reduced motion keeps
// the art and drops the motion.

/** The logomark outline, in the `12 12 1242 587` viewBox. */
export const LOGOMARK_PATH =
  "m12 512.7.3 5.6.6 4.8 1.1 4.7 1.6 5.1 2.2 4.9 2.3 4.2 2.6 4 3.4 4.1 3.5 3.7 3.6 3.1 4.4 3.1 4.4 2.6 4.3 2 5 1.9 5.2 1.3 4.7.8 4.8.4 5.4-.1 5.3-.6 4.7-.9L86 566l5-1.9 4.5-2.3 4.5-2.8 333.7-230.1 3-1.8 3.2-1.6 3.2-1.4 3.4-1.1 4.5-1.1 3.5-.5 3.5-.3h3.5l3.5.2 4.7.7 3.4.9 3.3 1 3.3 1.4 3.1 1.5 3.1 1.8 2.9 2 2.7 2.2 2.6 2.4 3.1 3.5 2.1 2.8 1.9 3 2.2 4.1 1.4 3.2 1.2 3.4.6 2.2.7 3.5.5 3.5.2 3.5v174.8l.2 5.4.7 5 1.2 4.9 1.5 4.6 2.1 4.9 2.5 4.7 2.7 4 3 3.7 3.7 3.9 4.1 3.4 3.9 2.8 4.1 2.5 4.9 2.2 5 1.8 4.6 1.3 4.8.8 5.3.4 5.1-.1 5.3-.6 4.7-.9 4.6-1.4 5-1.9 4.5-2.3 4.5-2.8 333.7-230.1 3-1.8 2.1-1.1 3.2-1.5 3.3-1.2 3.4-.9 2.3-.5 2.3-.4 3.5-.3 4.7-.1 3.5.2 3.5.5 3.4.8 4.5 1.3 3.3 1.4 4.2 2.1 2.9 1.9 3.8 2.8 2.6 2.3 2.5 2.5 2.9 3.7 2 2.9 1.8 3 1.5 3.2 1.7 4.4 1 3.3.7 3.5.5 3.5.2 3.5v101.5l.2 5.5.8 5.4 1.2 4.8 1.5 4.6 2.2 5 2.6 4.6 2.9 4.3 3.4 3.9 3.6 3.7 3.8 3.1 4.8 3.3 4.3 2.3 4.8 2.1 4.9 1.6 5.1 1.2 5.1.7 4.9.2 5.8-.4 4.9-.7 5-1.2 4.9-1.7 4.7-2.2 4.6-2.5 4.2-3L1232 437.6l2.1-1.6 2.9-2.7 1.7-1.7 2.7-3 1.4-1.9 2.3-3.3 2.1-3.5 1.2-2.3 2.3-5.7 1.8-5.9.5-2.5.6-3.8.4-4.7V181.1l-.1-2.5-.5-2.4-.6-1.9-.8-1.7-1.2-1.9-1.2-1.5-1.5-1.6-1.6-1.2-1.6-1-2.1-1.1-1.8-.7-1.9-.6-1.9-.3-2.3-.2-2 .1-2.2.3-1.9.4-1.9.7-1.8.8-1.7 1-145.3 94-4.1 2.4-4.3 1.9-4.5 1.5-4.6 1.1-2.4.4-3.5.3-3.6.1-2.3-.1-4.7-.6-4.6-1-4.5-1.5-2.2-.9-3.2-1.5-2.1-1.1-3-2-1.9-1.4-2.7-2.2-2.6-2.5-1.5-1.8-2.3-2.7-1.3-2-1.9-3-1.1-2.1-1.5-3.2-1.3-3.3-.9-3.4-.6-2.3-.7-4.7-.2-4.7-.1-108.5-.2-2.8-.6-4.5-1.2-5.2-1.6-5.1-1-2.4-2-4-1.5-2.7-2.7-4-3-3.7-2.1-2.3-3.5-3.3-3.8-2.9-2.5-1.8-4.4-2.5L949.4 51l-2.6-1.1-4.1-1.6-4.8-1.3-4.1-.8-2.6-.3-4.9-.3-4.2.1-2.4.1-5.1.8-4.1 1-2.5.7-4.6 1.7-3.8 1.8-2.1 1.1-319.6 184.3-4.3 2-3.3 1.2-3.5.9-4.6.8-3.6.4h-4.7l-3.5-.3-3.5-.5-3.5-.8-3.4-1.1-3.3-1.3-3.2-1.5-3-1.8-3-2-2.7-2.2-1.8-1.6-2.5-2.5-2.3-2.7-2.1-2.9-1.2-2-1.7-3.1-1.5-3.2-1.3-3.4-1-3.4-.7-3.4-.3-2.4-.3-3.5-.1-2.4-.1-113.8-.4-4.5-.4-2.8-.6-2.7-1.2-4.4-2-5.3-2-4-1.4-2.5-3-4.4-1.5-2-3-3.4-3.9-3.7-4.2-3.3-3.8-2.4-2.7-1.5-29.1-15.3-3.9-1.8-4.3-1.7-4.3-1.3-4.6-1-4.4-.5-5.5-.2-4.7.3-4.4.6-4.6 1L51.1 124.5l-4.9 1.9-3 1.3-2.9 1.6-4.5 2.8-2.6 2-2.5 2.1-3.8 3.7-2.4 2.7-3.1 4.3-1.7 2.7-1.6 2.9-2.3 5.1L14 163l-.7 3.1-.9 5.6-.3 3.6Z";

/** The logomark, static. Inherits `currentColor`; size it with `className`. */
export const Logomark = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="12 12 1242 587"
    fill="none"
    aria-hidden
    {...props}
  >
    <path fill="currentColor" d={LOGOMARK_PATH} />
  </svg>
);

interface LogoProps {
  className?: string;
}

const Frame = ({
  className,
  children,
}: LogoProps & { children: ReactNode }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="12 12 1242 587"
    fill="none"
    aria-hidden
    className={cn("group/mark overflow-visible", className)}
  >
    {children}
  </svg>
);

// Transforms on SVG elements pivot on the element's own box, not the canvas.
const OWN_BOX = "[transform-box:fill-box]";
const SPRING = "ease-[cubic-bezier(0.34,1.56,0.64,1)]";

// ─── Diwali: a diya flame on each of the three peaks ───────────────────────

const FLAME =
  "M0 0C-52 0-68-48-52-92C-40-126-12-150 0-230C12-150 40-126 52-92C68-48 52 0 0 0Z";
const FLAME_CORE =
  "M0-8C-24-8-32-32-24-58C-18-76-6-90 0-132C6-90 18-76 24-58C32-32 24-8 0-8Z";
// The base of each flame (x, y) just inside a peak's apex, and its scale.
const WICKS = [
  [424, 34, 1],
  [928, 66, 0.88],
  [1232, 178, 0.72],
] as const;
// Sparkler rays off each flame tip on hover.
const SPARK_ANGLES = [-72, -48, -24, 0, 24, 48, 72];

const DiwaliLogomark = ({ className }: LogoProps) => {
  const id = useId();
  return (
    <Frame className={className}>
      <defs>
        <linearGradient
          id={`${id}-gold`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="12"
          x2="0"
          y2="599"
        >
          <stop offset="0" stopColor="#FFDD73" />
          <stop offset="0.5" stopColor="#FFBE25" />
          <stop offset="1" stopColor="#F28A1E" />
        </linearGradient>
        <linearGradient id={`${id}-flame`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#F25C05" />
          <stop offset="0.5" stopColor="#FF9F1C" />
          <stop offset="1" stopColor="#FFD86B" />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#FFC94D" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFC94D" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={LOGOMARK_PATH} fill={`url(#${id}-gold)`} />
      {WICKS.map(([x, y, scale], wick) => (
        <g key={x} transform={`translate(${x} ${y}) scale(${scale})`}>
          <circle
            cy={-90}
            r={190}
            fill={`url(#${id}-glow)`}
            className={cn(
              OWN_BOX,
              "origin-center transition-[scale] duration-300 group-hover/mark:scale-125 motion-safe:[animation:logo-diwali-glow_2.4s_ease-in-out_var(--d)_infinite] motion-reduce:transition-none"
            )}
            // SAFETY: `--d` is a CSS custom property read by the animation.
            style={{ "--d": `${wick * -0.8}s` } as CSSProperties}
          />
          {/* Grows on hover; the inner group keeps flickering. */}
          <g
            className={cn(
              OWN_BOX,
              SPRING,
              "origin-bottom transition-[scale] duration-500 group-hover/mark:scale-[1.3] motion-reduce:transition-none"
            )}
          >
            <g
              className={cn(
                OWN_BOX,
                "origin-bottom motion-safe:[animation:logo-diwali-flame_1.6s_ease-in-out_var(--d)_infinite]"
              )}
              // SAFETY: `--d` is a CSS custom property read by the animation.
              style={{ "--d": `${wick * -0.55}s` } as CSSProperties}
            >
              <path d={FLAME} fill={`url(#${id}-flame)`} />
              <path d={FLAME_CORE} fill="#FFF8E1" />
            </g>
          </g>
          {SPARK_ANGLES.map((angle, ray) => (
            // From the tip of the flame as grown on hover (230 × 1.3).
            <g key={angle} transform={`translate(0 -290) rotate(${angle})`}>
              <line
                y2={-46}
                stroke="#FFD36B"
                strokeWidth={14}
                strokeLinecap="round"
                className="opacity-0 motion-safe:group-hover/mark:[animation:logo-spark_640ms_ease-out_var(--d)_infinite]"
                // SAFETY: `--d` is a CSS custom property read by the animation.
                style={
                  {
                    "--d": `${((ray * 3 + wick) % 7) * 90}ms`,
                  } as CSSProperties
                }
              />
            </g>
          ))}
        </g>
      ))}
    </Frame>
  );
};

// ─── Halloween: a carved pumpkin, bats, and a spider on a thread ───────────

// Carved into the big left block: two eyes and a jagged grin, following its
// slant. Lit from inside.
const FACE = [
  "M120 270L220 270L172 190Z",
  "M300 222L400 222L352 140Z",
  "M110 335L170 352L195 325L235 335L255 305L300 312L330 282L370 285L425 245L400 290L330 345L240 390L160 400Z",
];
// Pumpkin ribs, clipped to the outline.
const RIBS = [
  "M95 150Q66 340 105 545",
  "M700 150Q660 360 700 570",
  "M880 70Q840 300 880 450",
  "M1160 220Q1136 330 1166 480",
];
const BAT =
  "M5.8 19.2C20 17 33 11 40.8 3.2C45 13 56 26 73 34.7L77.3 20.3L82 25.2C84.5 24.3 87 24.3 89.5 26L94.7 21L97.2 33.2C110 29 125 15 130.5 1.5C142 9 156 12 166.2 11.3C150 17 143 25 141.8 33C130 30 118 40 115.5 53C98 55 87 62 82.8 75C78 64 65 48 50.2 53.7C50 43 40 33 24.7 36.2C24 25 13 20 5.8 19.2Z";
// Each bat starts behind the pumpkin (x, y) and flies out by (bx, by).
const BATS = [
  { x: 330, y: 260, bx: -380, by: -420, scale: 1.3, delay: 0 },
  { x: 560, y: 300, bx: -120, by: -560, scale: 1.1, delay: 140 },
  { x: 760, y: 260, bx: 160, by: -520, scale: 1.2, delay: 60 },
  { x: 960, y: 240, bx: 420, by: -420, scale: 1, delay: 220 },
  { x: 1140, y: 300, bx: 560, by: -200, scale: 0.9, delay: 300 },
];
const SPIDER_LEGS =
  "M-14-6L-60-50L-82-28M-16 2L-70-14L-98 8M-16 10L-66 26L-86 56M-12 18L-46 52L-50 88M14-6L60-50L82-28M16 2L70-14L98 8M16 10L66 26L86 56M12 18L46 52L50 88";

const HalloweenLogomark = ({ className }: LogoProps) => {
  const id = useId();
  return (
    <Frame className={className}>
      <defs>
        <radialGradient
          id={`${id}-flesh`}
          gradientUnits="userSpaceOnUse"
          cx="480"
          cy="300"
          r="820"
        >
          <stop offset="0" stopColor="#FFA14A" />
          <stop offset="0.55" stopColor="#FF6A14" />
          <stop offset="1" stopColor="#D94A00" />
        </radialGradient>
        <radialGradient
          id={`${id}-light`}
          gradientUnits="userSpaceOnUse"
          cx="270"
          cy="290"
          r="200"
        >
          <stop offset="0" stopColor="#FFF8D6" />
          <stop offset="1" stopColor="#FFD25E" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          <path d={LOGOMARK_PATH} />
        </clipPath>
      </defs>

      {/* Behind the pumpkin, so they come out from it. */}
      {BATS.map((bat) => (
        <g
          key={bat.x}
          transform={`translate(${bat.x} ${bat.y}) scale(${bat.scale})`}
        >
          <g
            className="opacity-0 motion-safe:group-hover/mark:[animation:logo-halloween-bat_1.5s_ease-out_var(--d)_infinite]"
            // SAFETY: CSS custom properties read by the flight keyframes.
            style={
              {
                "--d": `${bat.delay}ms`,
                "--bx": `${bat.bx}px`,
                "--by": `${bat.by}px`,
              } as CSSProperties
            }
          >
            <g
              className={cn(
                OWN_BOX,
                "origin-center motion-safe:group-hover/mark:[animation:logo-halloween-flap_180ms_ease-in-out_infinite]"
              )}
            >
              <path
                d={BAT}
                transform="translate(-85 -38)"
                fill="currentColor"
              />
            </g>
          </g>
        </g>
      ))}

      {/* A spider hangs off the right end; the top of its thread is hidden
          behind the pumpkin, so on hover it drops further down. */}
      <g transform="translate(1160 0)">
        <g
          className={cn(
            SPRING,
            "transition-[translate] duration-500 group-hover/mark:translate-y-[150px] motion-reduce:transition-none"
          )}
        >
          <g
            className={cn(
              OWN_BOX,
              "origin-top motion-safe:[animation:logo-halloween-dangle_3.2s_ease-in-out_infinite]"
            )}
          >
            <line
              y1={300}
              y2={590}
              stroke="currentColor"
              strokeWidth={6}
              strokeOpacity={0.6}
            />
            <g transform="translate(0 620)" fill="currentColor">
              <path
                d={SPIDER_LEGS}
                fill="none"
                stroke="currentColor"
                strokeWidth={10}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <ellipse cy={14} rx={26} ry={32} />
              <circle cy={-24} r={18} />
            </g>
          </g>
        </g>
      </g>

      {/* The pumpkin wobbles on hover. */}
      <g
        className={cn(
          OWN_BOX,
          "origin-bottom motion-safe:group-hover/mark:[animation:logo-halloween-wobble_600ms_ease-in-out]"
        )}
      >
        <path d={LOGOMARK_PATH} fill={`url(#${id}-flesh)`} />
        <g
          clipPath={`url(#${id}-clip)`}
          stroke="#B83C00"
          strokeOpacity={0.45}
          strokeWidth={14}
          strokeLinecap="round"
        >
          {RIBS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        {/* Candlelight: flickers idle, burns steady on hover. */}
        <g
          fill={`url(#${id}-light)`}
          className="motion-safe:[animation:logo-halloween-flicker_2.6s_linear_infinite] motion-safe:group-hover/mark:[animation:none]"
        >
          {FACE.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <path
          d="M226 78C220 40 228 6 252-22L278-6C258 18 252 46 256 74Z"
          fill="#5E7D26"
        />
        <path
          d="M264-12C292-40 332-36 328-8C325 12 302 10 306-6"
          stroke="#5E7D26"
          strokeWidth={12}
          strokeLinecap="round"
        />
      </g>
    </Frame>
  );
};

// ─── Christmas: snow on the peaks, a Santa hat, and a string of lights ─────

// The three top edges of the outline (x1, y1 → x2, y2), where snow settles.
const SNOW_EDGES = [
  [51, 124, 408, 14],
  [578, 237, 897, 53],
  [1078, 260, 1223, 166],
] as const;
// Depth of the snow cap, straight down from each top edge.
const SNOW_DEPTH = 62;
// Puffs of snow along each edge, half above it, so the cap looks heaped.
const SNOW_PUFFS = SNOW_EDGES.flatMap(([x1, y1, x2, y2]) => {
  const count = Math.round(Math.hypot(x2 - x1, y2 - y1) / 56);
  return Array.from({ length: count + 1 }, (_, index) => ({
    x: x1 + ((x2 - x1) * index) / count,
    y: y1 + ((y2 - y1) * index) / count,
    r: 20 + (index % 3) * 4,
  }));
});
// Drips hanging under the cap (x on an edge, so y follows it).
const SNOW_DRIPS = [
  [300, 0],
  [380, 0],
  [640, 1],
  [800, 1],
  [1150, 2],
].map(([x, edge]) => {
  const [x1, y1, x2, y2] = SNOW_EDGES[edge];
  return { x, y: y1 + ((y2 - y1) * (x - x1)) / (x2 - x1) + SNOW_DEPTH };
});

// The wire swags across the three blocks, staying inside the outline.
const SWAGS = [
  [30, 330, 240, 400, 470, 240],
  [470, 240, 720, 420, 980, 290],
  [980, 290, 1120, 410, 1250, 280],
] as const;
// Each swag after the start point is `Q cx cy x y`.
const WIRE = `M${SWAGS[0][0]} ${SWAGS[0][1]}${SWAGS.map(
  (swag) => `Q${swag.slice(2).join(" ")}`
).join("")}`;
const BULB_COLORS = ["#FF4D4D", "#FFD23F", "#4DA3FF"];
// Three bulbs per swag, on the quadratic curve.
const BULBS = SWAGS.flatMap(([x0, y0, cx, cy, x1, y1]) =>
  [0.2, 0.5, 0.8].map((t) => ({
    x: (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x1,
    y: (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y1,
  }))
);
// Snowflakes that fall past the mark on hover.
const FLAKES = [
  { x: 120, drift: -40, duration: 1.9, delay: 0, r: 16 },
  { x: 330, drift: 30, duration: 2.3, delay: 0.5, r: 12 },
  { x: 520, drift: -20, duration: 1.7, delay: 0.25, r: 18 },
  { x: 720, drift: 40, duration: 2.1, delay: 0.8, r: 13 },
  { x: 900, drift: -30, duration: 1.8, delay: 0.1, r: 16 },
  { x: 1080, drift: 25, duration: 2.2, delay: 0.6, r: 12 },
  { x: 1220, drift: -35, duration: 2, delay: 0.35, r: 15 },
];

const ChristmasLogomark = ({ className }: LogoProps) => {
  const id = useId();
  return (
    <Frame className={className}>
      <defs>
        <linearGradient
          id={`${id}-pine`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="12"
          x2="0"
          y2="599"
        >
          <stop offset="0" stopColor="#3DA35D" />
          <stop offset="1" stopColor="#1E6B3C" />
        </linearGradient>
        <linearGradient id={`${id}-red`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F04A3E" />
          <stop offset="1" stopColor="#B3121C" />
        </linearGradient>
        {/* The cap: the outline minus itself shifted down, plus drips. */}
        <mask
          id={`${id}-snow`}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="1270"
          height="620"
        >
          <path d={LOGOMARK_PATH} fill="#fff" />
          <path
            d={LOGOMARK_PATH}
            fill="#000"
            transform={`translate(0 ${SNOW_DEPTH})`}
          />
          {SNOW_DRIPS.map((drip) => (
            <ellipse
              key={drip.x}
              cx={drip.x}
              cy={drip.y}
              rx={18}
              ry={26}
              fill="#fff"
            />
          ))}
        </mask>
      </defs>

      <path d={LOGOMARK_PATH} fill={`url(#${id}-pine)`} />
      <rect width="1270" height="620" fill="#fff" mask={`url(#${id}-snow)`} />
      <g fill="#fff">
        {SNOW_PUFFS.map((puff) => (
          <circle
            key={`${puff.x}-${puff.y}`}
            cx={puff.x}
            cy={puff.y}
            r={puff.r}
          />
        ))}
      </g>

      {/* Lights: same-colour bulbs share a phase, so the colours chase;
          faster on hover. */}
      <path d={WIRE} stroke="#0F3D22" strokeWidth={8} strokeLinecap="round" />
      {BULBS.map((bulb, index) => (
        <g key={bulb.x} transform={`translate(${bulb.x} ${bulb.y})`}>
          <rect x={-9} width={18} height={14} rx={3} fill="#0F3D22" />
          <circle
            cy={32}
            r={20}
            fill={BULB_COLORS[index % 3]}
            className="motion-safe:[animation:logo-twinkle_1.8s_ease-in-out_var(--d)_infinite] motion-safe:group-hover/mark:[animation-duration:600ms]"
            // SAFETY: `--d` is a CSS custom property read by the animation.
            style={{ "--d": `${(index % 3) * -600}ms` } as CSSProperties}
          />
        </g>
      ))}

      {/* Santa hat on the left block's top edge, hopping on hover. */}
      <g transform="translate(150 94) rotate(-17)">
        <g
          className={cn(
            OWN_BOX,
            "origin-bottom motion-safe:group-hover/mark:[animation:logo-christmas-hop_700ms_ease-out]"
          )}
        >
          <path
            d="M-96-18C-80-120-10-196 84-206C134-210 176-190 196-160C160-170 122-156 106-120C96-96 98-56 100-18Z"
            fill={`url(#${id}-red)`}
          />
          <rect x={-110} y={-26} width={220} height={52} rx={26} fill="#fff" />
          <circle cx={196} cy={-160} r={34} fill="#fff" />
        </g>
      </g>

      {FLAKES.map((flake) => (
        <circle
          key={flake.x}
          cx={flake.x}
          cy={-150}
          r={flake.r}
          fill="currentColor"
          className="opacity-0 motion-safe:group-hover/mark:[animation:logo-christmas-snow_var(--t)_linear_var(--d)_infinite]"
          // SAFETY: CSS custom properties read by the fall keyframes.
          style={
            {
              "--t": `${flake.duration}s`,
              "--d": `${flake.delay}s`,
              "--sx": `${flake.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </Frame>
  );
};

// Marks with white in them (the Indian and US flags) on a white page: a faint
// outline keeps the shape.
const OUTLINE = (
  <path
    d={LOGOMARK_PATH}
    stroke="currentColor"
    strokeOpacity={0.2}
    strokeWidth={10}
  />
);

// ─── Holi: the mark doused in coloured powder (gulal) ─────────────────────

const HOLI_COLORS = [
  "#FF3E9A",
  "#FFD60A",
  "#38B000",
  "#3A86FF",
  "#FF7B00",
  "#8338EC",
];
// Splashes of powder over the mark: centre, radius, colour (index).
const BLOTCHES = [
  [120, 200, 150, 0],
  [330, 110, 130, 1],
  [300, 420, 160, 3],
  [470, 250, 100, 4],
  [560, 340, 140, 2],
  [640, 520, 110, 1],
  [760, 200, 150, 4],
  [820, 470, 140, 5],
  [1000, 330, 140, 0],
  [1180, 250, 120, 1],
  [1120, 480, 120, 2],
] as const;
// Specks drifting up off the peaks, always.
const SPECKS = [
  { x: 400, y: 50, drift: -30, color: 0, delay: 0 },
  { x: 450, y: 60, drift: 20, color: 1, delay: 1.1 },
  { x: 900, y: 80, drift: -20, color: 3, delay: 0.5 },
  { x: 950, y: 90, drift: 30, color: 4, delay: 1.7 },
  { x: 1220, y: 190, drift: 25, color: 5, delay: 0.9 },
  { x: 1240, y: 200, drift: -15, color: 2, delay: 2.2 },
];
// Clouds of powder thrown off the mark on hover: start, then travel.
const PUFFS = [
  { x: 424, y: 60, px: -60, py: -220, color: 0, delay: 0 },
  { x: 928, y: 90, px: 40, py: -240, color: 1, delay: 120 },
  { x: 1230, y: 200, px: 200, py: -160, color: 3, delay: 240 },
  { x: 60, y: 300, px: -220, py: -40, color: 5, delay: 60 },
  { x: 560, y: 560, px: -40, py: 200, color: 2, delay: 180 },
  { x: 1060, y: 520, px: 160, py: 180, color: 4, delay: 300 },
];

const HoliLogomark = ({ className }: LogoProps) => {
  const id = useId();
  return (
    <Frame className={className}>
      <defs>
        {/* Soft-edged powder: solid at the centre, fading out. */}
        {HOLI_COLORS.map((color, index) => (
          <radialGradient key={color} id={`${id}-${index}`}>
            <stop offset="0" stopColor={color} />
            <stop offset="0.55" stopColor={color} stopOpacity="0.95" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </radialGradient>
        ))}
        <clipPath id={`${id}-clip`}>
          <path d={LOGOMARK_PATH} />
        </clipPath>
      </defs>
      <path d={LOGOMARK_PATH} fill="#FFF6E5" />
      <g clipPath={`url(#${id}-clip)`}>
        {BLOTCHES.map(([cx, cy, r, color]) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={r}
            fill={`url(#${id}-${color})`}
          />
        ))}
      </g>
      {OUTLINE}
      {SPECKS.map((speck) => (
        <circle
          key={speck.x}
          cx={speck.x}
          cy={speck.y}
          r={14}
          fill={HOLI_COLORS[speck.color]}
          className="opacity-0 motion-safe:[animation:logo-holi-drift_3s_ease-out_var(--d)_infinite]"
          // SAFETY: CSS custom properties read by the drift keyframes.
          style={
            {
              "--d": `${speck.delay}s`,
              "--sx": `${speck.drift}px`,
            } as CSSProperties
          }
        />
      ))}
      {PUFFS.map((puff) => (
        <circle
          key={puff.x}
          cx={puff.x}
          cy={puff.y}
          r={100}
          fill={`url(#${id}-${puff.color})`}
          className={cn(
            OWN_BOX,
            "origin-center opacity-0 motion-safe:group-hover/mark:[animation:logo-holi-puff_1.4s_ease-out_var(--d)_infinite]"
          )}
          // SAFETY: CSS custom properties read by the puff keyframes.
          style={
            {
              "--d": `${puff.delay}ms`,
              "--px": `${puff.px}px`,
              "--py": `${puff.py}px`,
            } as CSSProperties
          }
        />
      ))}
    </Frame>
  );
};

// ─── India: the tricolour, for Republic Day and Independence Day ──────────

const INDIA = {
  saffron: "#FF9933",
  white: "#FFFFFF",
  green: "#138808",
  navy: "#000080",
};
// The flag's three bands, each a third of the viewBox's height.
const BAND = 587 / 3;
// The Ashoka Chakra, on the white band in the middle block: its 24 spokes.
const CHAKRA = { x: 740, y: 12 + BAND * 1.5, r: 88 };
const SPOKES = Array.from({ length: 24 }, (_, index) => index * 15);

/**
 * The mark in the tricolour, with the Ashoka Chakra. `spin`: the chakra turns
 * slowly, and fast on hover (idle turn inside, hover spin outside, so hover
 * starts from wherever the idle turn is).
 */
const Tricolour = ({ spin = false }: { spin?: boolean }) => {
  const id = useId();
  return (
    <>
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={LOGOMARK_PATH} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        {[INDIA.saffron, INDIA.white, INDIA.green].map((fill, band) => (
          <rect
            key={fill}
            x={12}
            y={12 + band * BAND}
            width={1242}
            height={BAND}
            fill={fill}
          />
        ))}
      </g>
      {OUTLINE}
      <g transform={`translate(${CHAKRA.x} ${CHAKRA.y})`}>
        <g
          className={cn(
            OWN_BOX,
            "origin-center",
            spin &&
              "motion-safe:group-hover/mark:[animation:logo-india-chakra_1.6s_linear_infinite]"
          )}
        >
          <g
            stroke={INDIA.navy}
            className={cn(
              OWN_BOX,
              "origin-center",
              spin &&
                "motion-safe:[animation:logo-india-chakra_14s_linear_infinite]"
            )}
          >
            <circle r={CHAKRA.r} strokeWidth={12} />
            <circle r={14} fill={INDIA.navy} />
            {SPOKES.map((angle) => (
              <line
                key={angle}
                y1={-14}
                y2={-CHAKRA.r}
                strokeWidth={5}
                transform={`rotate(${angle})`}
              />
            ))}
          </g>
        </g>
      </g>
    </>
  );
};

// Jets of the flypast, in formation, each trailing its band's smoke.
const FLYPAST = [
  { y: -36, color: INDIA.saffron },
  { y: 0, color: INDIA.white },
  { y: 36, color: INDIA.green },
];

/** Republic Day: the chakra turns; on hover it spins and jets fly past. */
const RepublicDayLogomark = ({ className }: LogoProps) => {
  const id = useId();
  return (
    <Frame className={className}>
      <defs>
        {FLYPAST.map((jet, index) => (
          <linearGradient key={jet.color} id={`${id}-${index}`}>
            <stop offset="0" stopColor={jet.color} stopOpacity="0" />
            <stop offset="1" stopColor={jet.color} stopOpacity="0.9" />
          </linearGradient>
        ))}
      </defs>
      <Tricolour spin />
      <g transform="translate(0 -120)">
        <g className="opacity-0 motion-safe:group-hover/mark:[animation:logo-india-flypast_1.8s_linear_infinite]">
          {FLYPAST.map((jet, index) => (
            <g key={jet.color} transform={`translate(0 ${jet.y})`}>
              <rect
                x={-640}
                y={-10}
                width={620}
                height={20}
                rx={10}
                fill={`url(#${id}-${index})`}
              />
              <path d="M40 0L-30-22L-16 0L-30 22Z" fill="#6B7280" />
            </g>
          ))}
        </g>
      </g>
    </Frame>
  );
};

// A diamond kite, its right half a second colour, with a tail.
const KITE = "M0-70L48 0L0 70L-48 0Z";
const KITE_HALF = "M0-70L48 0L0 70Z";
// Each kite flies off a peak (its hand, x, y); the left one mirrored.
const KITES = [
  {
    x: 928,
    y: 66,
    flip: false,
    scale: 1,
    colors: [INDIA.saffron, INDIA.white],
    delay: 0,
  },
  {
    x: 424,
    y: 34,
    flip: true,
    scale: 0.8,
    colors: [INDIA.green, INDIA.white],
    delay: -1.4,
  },
];

/** Independence Day (India): kites fly off the peaks and climb on hover. */
const IndependenceDayIndiaLogomark = ({ className }: LogoProps) => (
  <Frame className={className}>
    <Tricolour />
    {KITES.map((kite) => (
      <g
        key={kite.x}
        transform={`translate(${kite.x} ${kite.y}) scale(${kite.flip ? -kite.scale : kite.scale} ${kite.scale})`}
      >
        {/* Drawn up and right of the hand (0, 0), the box's bottom-left
            corner, so both groups pivot there: hover lets out string. */}
        <g
          className={cn(
            OWN_BOX,
            SPRING,
            "origin-bottom-left transition-[scale] duration-500 group-hover/mark:scale-125 motion-reduce:transition-none"
          )}
        >
          <g
            className={cn(
              OWN_BOX,
              "origin-bottom-left motion-safe:[animation:logo-india-kite_3s_ease-in-out_var(--d)_infinite]"
            )}
            // SAFETY: `--d` is a CSS custom property read by the animation.
            style={{ "--d": `${kite.delay}s` } as CSSProperties}
          >
            <path
              d="M0 0Q150-40 186-184"
              stroke="currentColor"
              strokeOpacity={0.5}
              strokeWidth={4}
            />
            <g transform="translate(210 -250) rotate(20)">
              <path
                d={KITE}
                fill={kite.colors[0]}
                stroke="currentColor"
                strokeOpacity={0.25}
                strokeWidth={4}
              />
              <path d={KITE_HALF} fill={kite.colors[1]} />
              <path
                d="M0-70V70M-48 0H48"
                stroke="#5A3A1A"
                strokeOpacity={0.5}
                strokeWidth={4}
              />
              <path
                d="M0 70Q14 90 0 110T0 150"
                stroke={kite.colors[0]}
                strokeWidth={8}
                strokeLinecap="round"
              />
            </g>
          </g>
        </g>
      </g>
    ))}
  </Frame>
);

// ─── Independence Day (US): stars and stripes, fireworks on hover ─────────

const US = { red: "#B22234", white: "#FFFFFF", blue: "#3C3B6E" };
// Thirteen stripes over the viewBox's height; the canton covers the top seven.
const STRIPE = 587 / 13;
const CANTON = { width: 508, height: STRIPE * 7 };
// A five-pointed star, outer radius 22, inner 9.
const STAR = `M${Array.from({ length: 10 }, (_, index) => {
  const radius = index % 2 ? 9 : 22;
  const angle = (index * Math.PI) / 5;
  return `${(radius * Math.sin(angle)).toFixed(1)} ${(-radius * Math.cos(angle)).toFixed(1)}`;
}).join("L")}Z`;
// Six rows of six stars across the canton, alternate rows offset.
const STARS = Array.from({ length: 36 }, (_, index) => {
  const row = Math.floor(index / 6);
  return { x: 52 + (index % 6) * 76 + (row % 2) * 38, y: 44 + row * 48 };
});
const BURSTS = [
  { x: 250, y: -160, color: "#FF4D5E", delay: 0 },
  { x: 700, y: -230, color: "#FFD23F", delay: 350 },
  { x: 1120, y: -140, color: "#5B8CFF", delay: 700 },
];
const BURST_ANGLES = Array.from({ length: 12 }, (_, index) => index * 30);

const IndependenceDayUsLogomark = ({ className }: LogoProps) => {
  const id = useId();
  return (
    <Frame className={className}>
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={LOGOMARK_PATH} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        {Array.from({ length: 13 }, (_, stripe) => (
          <rect
            key={stripe}
            x={12}
            y={12 + stripe * STRIPE}
            width={1242}
            height={STRIPE}
            fill={stripe % 2 ? US.white : US.red}
          />
        ))}
        <rect
          x={12}
          y={12}
          width={CANTON.width}
          height={CANTON.height}
          fill={US.blue}
        />
        {STARS.map((star, index) => (
          <path
            key={`${star.x}-${star.y}`}
            d={STAR}
            transform={`translate(${star.x} ${star.y})`}
            fill={US.white}
            className="motion-safe:[animation:logo-twinkle_2.4s_ease-in-out_var(--d)_infinite]"
            // SAFETY: `--d` is a CSS custom property read by the animation.
            style={{ "--d": `${(index * -0.37) % 2.4}s` } as CSSProperties}
          />
        ))}
      </g>
      {OUTLINE}
      {BURSTS.map((burst) =>
        BURST_ANGLES.map((angle) => (
          <g
            key={`${burst.x}-${angle}`}
            transform={`translate(${burst.x} ${burst.y}) rotate(${angle})`}
          >
            <line
              y2={-36}
              stroke={burst.color}
              strokeWidth={12}
              strokeLinecap="round"
              className="opacity-0 motion-safe:group-hover/mark:[animation:logo-spark_1.1s_ease-out_var(--d)_infinite]"
              // SAFETY: `--d` is a CSS custom property read by the animation.
              style={{ "--d": `${burst.delay}ms` } as CSSProperties}
            />
          </g>
        ))
      )}
    </Frame>
  );
};

// ─── Thanksgiving: autumn leaves, and a turkey's tail fanning out ─────────

// A tail feather, base at 0,0 and pointing up, with a pale band by its tip.
const FEATHER = "M0 0C-50-120-70-300 0-420C70-300 50-120 0 0Z";
const FEATHER_TIP = "M0-300C-30-340-34-390 0-420C34-390 30-340 0-300Z";
// The tail rises from behind the middle of the mark (scaled to 560 long, so
// most of it clears the top edge; folded to 15% it stays hidden): each
// feather's angle when fanned, and its colour.
const FEATHERS = [
  { angle: -60, color: "#7A3B12" },
  { angle: -40, color: "#C2410C" },
  { angle: -20, color: "#E07B24" },
  { angle: 0, color: "#F2B33D" },
  { angle: 20, color: "#E07B24" },
  { angle: 40, color: "#C2410C" },
  { angle: 60, color: "#7A3B12" },
];
const LEAF =
  "M0-40C22-30 30-8 22 14C14 30 4 38 0 44C-4 38-14 30-22 14C-30-8-22-30 0-40Z";
// Leaves resting on the mark: position, tilt, colour.
const RESTING_LEAVES = [
  { x: 300, y: 70, angle: -35, color: "#B5541B" },
  { x: 840, y: 110, angle: 25, color: "#8C3B1E" },
  { x: 1180, y: 210, angle: -15, color: "#D97706" },
];
// Leaves falling off the peaks, always.
const FALLING_LEAVES = [
  { x: 424, y: 40, color: "#C2410C", delay: 0 },
  { x: 928, y: 70, color: "#D97706", delay: 2.2 },
  { x: 1232, y: 180, color: "#8C3B1E", delay: 4.1 },
];

const ThanksgivingLogomark = ({ className }: LogoProps) => {
  const id = useId();
  return (
    <Frame className={className}>
      <defs>
        <linearGradient
          id={`${id}-autumn`}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="12"
          x2="0"
          y2="599"
        >
          <stop offset="0" stopColor="#F2A541" />
          <stop offset="0.5" stopColor="#D9622B" />
          <stop offset="1" stopColor="#8C3B1E" />
        </linearGradient>
      </defs>
      {/* Behind the mark: folded small out of sight, fanned on hover. */}
      <g transform="translate(640 330) scale(1.33)">
        {FEATHERS.map((feather, index) => (
          <g
            key={feather.angle}
            className={cn(
              OWN_BOX,
              SPRING,
              "origin-bottom [transform:scale(0.15)] transition-transform delay-(--d) duration-500 group-hover/mark:[transform:rotate(var(--a))_scale(1)] motion-reduce:transition-none"
            )}
            // SAFETY: CSS custom properties read by the fanned transform.
            style={
              {
                "--a": `${feather.angle}deg`,
                "--d": `${Math.abs(feather.angle) * 2}ms`,
              } as CSSProperties
            }
          >
            <path d={FEATHER} fill={feather.color} />
            <path
              d={FEATHER_TIP}
              fill="#FFF1D6"
              fillOpacity={index % 2 ? 0.55 : 0.75}
            />
          </g>
        ))}
      </g>
      <path d={LOGOMARK_PATH} fill={`url(#${id}-autumn)`} />
      {RESTING_LEAVES.map((leaf) => (
        <g
          key={leaf.x}
          transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.angle}) scale(1.4)`}
        >
          <path d={LEAF} fill={leaf.color} />
          <path
            d="M0-30V52"
            stroke="#5A2A10"
            strokeOpacity={0.6}
            strokeWidth={4}
          />
        </g>
      ))}
      {FALLING_LEAVES.map((leaf) => (
        <g key={leaf.x} transform={`translate(${leaf.x} ${leaf.y})`}>
          <path
            d={LEAF}
            fill={leaf.color}
            className={cn(
              OWN_BOX,
              "origin-center opacity-0 motion-safe:[animation:logo-thanksgiving-fall_6s_ease-in-out_var(--d)_infinite] motion-safe:group-hover/mark:[animation-duration:2.5s]"
            )}
            // SAFETY: `--d` is a CSS custom property read by the animation.
            style={{ "--d": `${leaf.delay}s` } as CSSProperties}
          />
        </g>
      ))}
    </Frame>
  );
};

interface SeasonProps {
  /** Force a season (`null`: none); by default, the visitor's current one. */
  season?: Season | null;
}

/** The logomark with its hover move, or the season's festive mark. */
export const AnimatedLogomark = ({ season }: SeasonProps) => {
  const current = useSeason();
  // Explicit width (the viewBox is 1242 × 587): `w-auto` collapses in a grid.
  const size = "h-4 w-[2.12rem]";
  switch (season === undefined ? current : season) {
    case "diwali": {
      return <DiwaliLogomark className={size} />;
    }
    case "halloween": {
      return <HalloweenLogomark className={size} />;
    }
    case "thanksgiving": {
      return <ThanksgivingLogomark className={size} />;
    }
    case "christmas": {
      return <ChristmasLogomark className={size} />;
    }
    case "holi": {
      return <HoliLogomark className={size} />;
    }
    case "republic-day-india": {
      return <RepublicDayLogomark className={size} />;
    }
    case "independence-day-india": {
      return <IndependenceDayIndiaLogomark className={size} />;
    }
    case "independence-day-us": {
      return <IndependenceDayUsLogomark className={size} />;
    }
    default: {
      // The app-icon tile (site radius) springs up behind the mark, which
      // settles inside it in black.
      return (
        <span
          aria-hidden="true"
          className="group/part relative inline-grid place-items-center"
        >
          <span className="bg-cta-to absolute top-1/2 left-1/2 size-[2.4rem] -translate-1/2 scale-0 rounded-lg transition-transform duration-300 ease-out group-hover/part:scale-100 group-hover/part:duration-500 group-hover/part:ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none" />
          <Logomark
            className={cn(
              "relative transition-[scale,color] duration-300 group-hover/part:scale-[0.78] group-hover/part:text-black motion-reduce:transition-none",
              size
            )}
          />
        </span>
      );
    }
  }
};

// "MotionVideo" → ["Motion", "Video"].
const [MOTION, VIDEO] = SITE.NAME.split(/(?=[A-Z])/u);

const sprocketClass =
  "absolute inset-x-0 h-[0.1em] bg-[repeating-linear-gradient(90deg,currentColor_0_0.14em,transparent_0.14em_0.3em)] bg-size-[0.3em_100%] opacity-0 transition-opacity group-hover/part:opacity-40 motion-safe:group-hover/part:animate-brand-sprockets";

/**
 * The name in type. The animated letters are decorative; `sr-only` text
 * carries the name.
 */
export const Logotype = () => (
  <span className="inline-flex items-center leading-[1.2em]">
    {/* "Motion": each o anticipates, stretches up, squashes on landing and
          settles; the second a beat behind (staggered by its index). */}
    <span aria-hidden="true" className="group/part inline-flex">
      {[...MOTION].map((letter, index) => (
        <span
          // Letters repeat ("o" twice), so the index is the identity.
          // oxlint-disable-next-line no-array-index-key
          key={index}
          className={cn(
            "inline-block",
            letter === "o" &&
              "origin-bottom motion-safe:group-hover/part:[animation:brand-bounce_640ms_calc(var(--i)*40ms)_both]"
          )}
          // SAFETY: `--i` is a CSS custom property read by the stagger delay.
          style={{ "--i": index } as CSSProperties}
        >
          {letter}
        </span>
      ))}
    </span>
    {/* "Video": each letter is a two-frame strip that slides up one frame,
          staggered, with sprocket holes running above and below. */}
    <span aria-hidden="true" className="group/part relative inline-flex">
      <span className={cn(sprocketClass, "-top-[0.3em]")} />
      <span className={cn(sprocketClass, "-bottom-[0.3em]")} />
      {[...VIDEO].map((letter, index) => (
        <span
          // oxlint-disable-next-line no-array-index-key
          key={index}
          className="inline-flex h-[1.2em] flex-col overflow-hidden leading-[1.2em]"
        >
          <span
            className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover/part:-translate-y-1/2 group-hover/part:delay-[calc(var(--i)*45ms)] motion-reduce:transition-none"
            // SAFETY: `--i` is a CSS custom property read by the stagger delay.
            style={{ "--i": index } as CSSProperties}
          >
            <span>{letter}</span>
            <span>{letter}</span>
          </span>
        </span>
      ))}
    </span>
    <span className="sr-only">{SITE.NAME}</span>
  </span>
);

/** The lockup: the (festive, when in season) logomark beside the name. */
export const Logo = ({ season }: SeasonProps) => (
  <span className="inline-flex items-center gap-2">
    <AnimatedLogomark season={season} />
    <Logotype />
  </span>
);
