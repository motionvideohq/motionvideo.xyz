import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ofKind, type CaptionCue, type Placed } from "./spec";
import { leave, outline, textWidth, type Theme } from "./theme";

const normalize = (word: string) => word.replace(/[^\p{L}\p{N}$%+#]/gu, "").toUpperCase();

/**
 * Kinetic punch captions: words land one after another on a springy scale-up,
 * emphasis words hit bigger, tilted and in `heat`; the line lifts away together
 * on exit. Sits above the platform caption block and clear of the action rail.
 */
export function Captions({ cues, theme }: { cues: Placed[]; theme: Theme }) {
  const frame = useCurrentFrame();
  const active = ofKind(cues, "caption").filter((cue) => frame >= cue.begin && frame < cue.end);
  return (
    <>
      {active.map((cue) => (
        <Caption key={`${cue.begin}-${cue.text}`} cue={cue} theme={theme} frame={frame} />
      ))}
    </>
  );
}

function Caption({ cue, theme, frame }: { cue: Placed<CaptionCue>; theme: Theme; frame: number }) {
  const { fps } = useVideoConfig();
  const { u, safe, width, height, palette, s } = theme;
  const spot = theme.layout.caption;
  const words = cue.text.split(/\s+/).filter(Boolean);
  const emphasis = new Set((cue.emphasis ?? []).map(normalize));
  const portrait = width / height < 1.2;
  // Stagger words across at most 40% of the window so short holds still read.
  const stagger = Math.min(s(0.07), (0.4 * (cue.end - cue.begin)) / Math.max(1, words.length));
  const gone = leave(frame, cue.exit, s(0.22));
  const base = (portrait ? 118 : 104) * u;

  // Centred on the layout's caption x (46% at 9:16, clear of the action rail);
  // the last line sits on the layout's baseline band.
  const half = Math.min(spot.x - safe.side, width - spot.x - safe.side, portrait ? width : width * 0.31);
  const box = theme.look.caption === "box";
  // Shrink to fit one line, down to 80 %, before the line wraps (gta-captions).
  const drawn = box ? 0.6 : 1;
  const lineWidth = words.reduce((total, word) => {
    const hit = emphasis.has(normalize(word));
    const glyphs = textWidth(word.toUpperCase(), theme.display, base * drawn, theme.look.weight) * (hit ? 1.16 : 1);
    return total + glyphs + (hit ? 0.18 * base : 0) + (box ? 0.32 * base * drawn : 0);
  }, 0.24 * base * (words.length - 1));
  const size = base * Math.max(0.8, Math.min(1, (2 * half * 0.97) / lineWidth));

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: spot.x - half,
          width: 2 * half,
          bottom: height - spot.bottom,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "baseline",
          columnGap: size * 0.24,
          rowGap: size * 0.02,
          fontFamily: theme.display,
          fontWeight: theme.look.weight,
          fontSize: box ? size * 0.6 : size,
          lineHeight: 1.04,
          textTransform: "uppercase",
          color: box ? palette.ink : palette.paper,
          filter: theme.look.caption === "sticker" ? `drop-shadow(0 ${8 * u}px 0 ${palette.ink})` : undefined,
          transform: `translateY(${-34 * u * gone}px)`,
          opacity: 1 - gone,
        }}
      >
        {words.map((word, index) => {
          const hit = emphasis.has(normalize(word));
          const land = spring({
            frame: frame - cue.begin - index * stagger,
            fps,
            config: hit ? { damping: 10, stiffness: 210, mass: 0.7 } : { damping: 13, stiffness: 240, mass: 0.55 },
          });
          return (
            <span
              key={`${index}-${word}`}
              style={{
                display: "inline-block",
                opacity: Math.min(1, land * 3),
                color: hit && !box ? palette.heat : undefined,
                // The 1.16× scale grows past the layout box; keep the word gap visible.
                marginInline: hit ? size * 0.09 : undefined,
                transform: [
                  `translateY(${(1 - land) * 60 * u}px)`,
                  `scale(${(hit ? 1.16 : 1) * (0.45 + 0.55 * land)})`,
                  `rotate(${hit ? -4 * land : 0}deg)`,
                ].join(" "),
                ...(theme.look.caption === "sticker"
                  ? outline(palette.ink, 16 * u)
                  : theme.look.caption === "glow"
                    ? {
                        // Neon tube: a white-hot core for the emphasis word, a thin ink edge for legibility.
                        color: hit ? "#FFFFFF" : undefined,
                        WebkitTextStroke: `${2 * u}px ${palette.ink}`,
                        paintOrder: "stroke fill" as const,
                        textShadow: [6, 18, 40]
                          .map((r) => `0 0 ${r * u}px ${hit ? palette.heat : palette.sun}`)
                          .join(", "),
                      }
                    : {
                        backgroundColor: hit ? palette.heat : palette.paper,
                        padding: `${0.06 * size}px ${0.16 * size}px ${0.02 * size}px`,
                        borderRadius: 10 * u,
                        boxShadow: `0 ${8 * u}px ${24 * u}px rgba(0,0,0,0.35)`,
                      }),
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
