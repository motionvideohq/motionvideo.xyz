import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill } from "remotion";

/**
 * Lays a design out at a logical size and scales it up to the render size, so
 * a 1600×1200 still reads like a crisp 1280×960 screen at 1.25× and a phone
 * screen is drawn at 390 pt × 3, as the real devices do.
 */
export const Canvas = ({
  scale,
  className,
  style,
  children,
}: {
  scale: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) => (
  <AbsoluteFill className={className} style={style}>
    <div
      className="absolute top-0 left-0 origin-top-left"
      style={{
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
        transform: `scale(${scale})`,
      }}
    >
      {children}
    </div>
  </AbsoluteFill>
);

/** Stroke icons on a 24-unit grid, drawn for these samples. */
const ICONS = {
  home: "M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  chart: "M3 3v18h18 M7 15l4-4 3 3 5-6",
  bars: "M6 20V11 M12 20V4 M18 20v-6",
  users:
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  user: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  sliders:
    "M4 21v-7 M4 10V3 M12 21v-9 M12 8V3 M20 21v-5 M20 12V3 M1 14h6 M9 8h6 M17 16h6",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16 M21 21l-4.3-4.3",
  bell: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9 M10.3 21a1.94 1.94 0 0 0 3.4 0",
  inbox:
    "M22 12h-6l-2 3h-4l-2-3H2 M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11",
  calendar:
    "M8 2v4 M16 2v4 M3 10h18 M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2",
  folder:
    "M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2",
  plus: "M12 5v14 M5 12h14",
  check: "M20 6 9 17l-5-5",
  arrowRight: "M5 12h14 M12 5l7 7-7 7",
  arrowUpRight: "M7 17 17 7 M7 7h10v10",
  arrowUp: "M12 19V5 M5 12l7-7 7 7",
  arrowDown: "M12 5v14 M19 12l-7 7-7-7",
  chevronDown: "m6 9 6 6 6-6",
  chevronRight: "m9 18 6-6-6-6",
  chevronLeft: "m15 18-6-6 6-6",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z",
  heart:
    "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z",
  message:
    "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  card: "M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2 M2 10h20",
  zap: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  layers: "M12 2 2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
  lock: "M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2 M7 11V7a5 5 0 0 1 10 0v4",
  globe:
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54z",
  more: "M12 12.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1 M19 12.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1 M5 12.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1",
  hash: "M4 9h16 M4 15h16 M10 3 8 21 M16 3l-2 18",
  send: "m22 2-7 20-4-9-9-4z M22 2 11 13",
  paperclip:
    "m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48",
  smile:
    "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M8 14s1.5 2 4 2 4-2 4-2 M9 9h.01 M15 9h.01",
  video:
    "m16 13 5.2 3.1a.5.5 0 0 0 .8-.4V8.3a.5.5 0 0 0-.8-.4L16 11 M4 6h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2",
  flame:
    "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  moon: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20 M12 6v6l4 2",
  shuffle:
    "M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22 M18 2l4 4-4 4 M2 6h1.9c1.5 0 2.9.9 3.6 2.2 M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8 M18 14l4 4-4 4",
  repeat:
    "m17 2 4 4-4 4 M3 11v-1a4 4 0 0 1 4-4h14 M7 22l-4-4 4-4 M21 13v1a4 4 0 0 1-4 4H3",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  sparkles: "M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z",
  shield:
    "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
  mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2 M22 6l-10 7L2 6",
  grid: "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
  dollar: "M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  trending: "M22 7l-8.5 8.5-5-5L2 17 M16 7h6v6",
  pin: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0 M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
  link: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  code: "m16 18 6-6-6-6 M8 6l-6 6 6 6",
  menu: "M4 6h16 M4 12h16 M4 18h16",
  x: "M18 6 6 18 M6 6l12 12",
  eye: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7 M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6",
  bookmark: "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z",
  share:
    "M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M8.59 13.51l6.83 3.98 M15.41 6.51l-6.82 3.98",
  wallet:
    "M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1 M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4",
  coffee:
    "M17 8h1a4 4 0 1 1 0 8h-1 M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z M6 2v2 M10 2v2 M14 2v2",
  plane:
    "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z",
  bag: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0",
} as const;

export type IconName = keyof typeof ICONS;

export const Icon = ({
  name,
  size = 18,
  stroke = 1.8,
  className,
  style,
}: {
  name: IconName;
  size?: number;
  stroke?: number;
  className?: string;
  style?: CSSProperties;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ flexShrink: 0, ...style }}
  >
    <path d={ICONS[name]} />
  </svg>
);

/** Deterministic pseudo-random numbers, so every render draws the same data. */
export const seeded = (seed: number) => {
  let state = seed >>> 0 || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
};

/** A plausible metric curve: a trend plus two slow waves plus noise. */
export const series = (
  count: number,
  {
    seed = 1,
    start = 40,
    end = 80,
    wave = 8,
    noise = 4,
  }: {
    seed?: number;
    start?: number;
    end?: number;
    wave?: number;
    noise?: number;
  } = {}
) => {
  const random = seeded(seed);
  return Array.from({ length: count }, (_, index) => {
    const t = index / Math.max(1, count - 1);
    return (
      start +
      (end - start) * t +
      Math.sin(t * 9 + seed) * wave +
      Math.sin(t * 23 + seed * 2) * wave * 0.35 +
      (random() - 0.5) * noise
    );
  });
};

/** Points fitted into a box, top-left origin, values growing upwards. */
export const fit = (
  values: number[],
  width: number,
  height: number,
  { min, max, pad = 0 }: { min?: number; max?: number; pad?: number } = {}
) => {
  const low = min ?? Math.min(...values);
  const high = max ?? Math.max(...values);
  return values.map((value, index) => ({
    x: (index / Math.max(1, values.length - 1)) * width,
    y: pad + (1 - (value - low) / (high - low || 1)) * (height - pad * 2),
  }));
};

/** A smooth Catmull-Rom curve through the points, as an SVG path. */
export const smoothPath = (points: { x: number; y: number }[]) => {
  if (points.length === 0) {
    return "";
  }
  let d = `M${points[0].x},${points[0].y}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[index + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
};

/** The smooth curve closed down to the baseline, for area fills. */
export const areaPath = (points: { x: number; y: number }[], base: number) =>
  `${smoothPath(points)} L${points.at(-1)?.x ?? 0},${base} L${points[0]?.x ?? 0},${base} Z`;

/** Initials on a soft gradient: avatars without anyone's photo. */
export const Avatar = ({
  name,
  size = 32,
  hue,
  ring,
  className,
}: {
  name: string;
  size?: number;
  hue?: number;
  ring?: string;
  className?: string;
}) => {
  const h =
    hue ??
    [...name].reduce((sum, char) => sum + char.charCodeAt(0) * 37, 0) % 360;
  const initials = name
    .split(" ")
    .filter((part) => /^[a-z]/i.test(part))
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-white ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, hsl(${h} 75% 62%), hsl(${(h + 40) % 360} 70% 48%))`,
        boxShadow: ring ? `0 0 0 2px ${ring}` : undefined,
      }}
    >
      {/* Overlapping stacks would clip initials; a head and shoulders reads at any overlap. */}
      {ring ? (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="#fff" fillOpacity="0.85">
          <circle cx="16" cy="13" r="5.5" />
          <path d="M5 30c1.5-6 5.8-9 11-9s9.5 3 11 9z" />
        </svg>
      ) : (
        initials
      )}
    </div>
  );
};

/** iOS status bar at 390 pt: time, signal, wifi and battery. */
export const StatusBar = ({ color = "#fff" }: { color?: string }) => (
  <div
    className="flex h-[54px] items-center justify-between px-[34px] pt-[6px] text-[17px] font-semibold"
    style={{ color }}
  >
    <span style={{ letterSpacing: -0.2 }}>9:41</span>
    <div className="flex items-center gap-[6px]">
      <svg width="18" height="12" viewBox="0 0 18 12" fill={color}>
        <rect x="0" y="8" width="3" height="4" rx="1" />
        <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
        <rect x="10" y="3" width="3" height="9" rx="1" />
        <rect x="15" y="0" width="3" height="12" rx="1" />
      </svg>
      <svg width="16" height="12" viewBox="0 0 16 12" fill={color}>
        <path d="M8 2.4c2.3 0 4.4.9 6 2.4l1.2-1.3A10.4 10.4 0 0 0 8 .6C5.2.6 2.7 1.7.8 3.5L2 4.8a8.6 8.6 0 0 1 6-2.4Zm0 3.6c1.3 0 2.5.5 3.4 1.3l1.2-1.3A6.7 6.7 0 0 0 8 4.2c-1.8 0-3.4.7-4.6 1.8l1.2 1.3C5.5 6.5 6.7 6 8 6Zm0 3.6c-.5 0-1 .2-1.3.5L8 11.4l1.3-1.3c-.3-.3-.8-.5-1.3-.5Z" />
      </svg>
      <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
        <rect
          x="0.5"
          y="0.5"
          width="23"
          height="12"
          rx="3.5"
          stroke={color}
          opacity="0.4"
        />
        <rect x="2" y="2" width="20" height="9" rx="2" fill={color} />
        <path d="M25 4.5v4c.8-.3 1.5-1.1 1.5-2s-.7-1.7-1.5-2Z" fill={color} opacity="0.5" />
      </svg>
    </div>
  </div>
);

/** The home indicator at the bottom of a phone screen. */
export const HomeIndicator = ({ color = "#fff" }: { color?: string }) => (
  <div className="absolute bottom-[8px] left-1/2 h-[5px] w-[134px] -translate-x-1/2 rounded-full" style={{ background: color }} />
);
