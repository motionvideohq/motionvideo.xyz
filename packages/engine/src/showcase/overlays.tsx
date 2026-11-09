import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { AbsoluteFill, Img, interpolate, useDelayRender } from "remotion";

import { loadFontFamily } from "../kit/fonts.ts";
import type {
  Background,
  Corner,
  FontFamily,
  Overlays as OverlaysDoc,
} from "../schema/common.ts";

// Title, corner captions and logo, drawn as DOM over the 3D canvas. Only
// properties Remotion's browser renderer supports are used: transforms,
// opacity, text styles and images.

const useFont = (family: FontFamily, enabled: boolean) => {
  const { delayRender, continueRender } = useDelayRender();
  const [css, setCss] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled) {
      return;
    }
    let alive = true;
    const handle = delayRender(`Loading font ${family}`);
    const load = async () => {
      try {
        const name = await loadFontFamily(family);
        if (alive) {
          setCss(name);
        }
      } catch {
        // Fonts are an enhancement: the overlay falls back to sans-serif.
      }
      continueRender(handle);
    };
    load();
    return () => {
      alive = false;
      continueRender(handle);
    };
  }, [family, enabled, delayRender, continueRender]);
  return css ?? "sans-serif";
};

/** Relative luminance of a hex colour, 0–1. */
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((at) => {
    const s = Number.parseInt(hex.slice(at, at + 2), 16) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Black or white, whichever reads better on the background. */
const inkFor = (background: Background) => {
  if (background.type === "transparent" || background.type === "media") {
    return "#ffffff";
  }
  const colors =
    background.type === "solid" ? [background.color] : background.colors;
  const avg = colors.reduce((sum, c) => sum + luminance(c), 0) / colors.length;
  return avg > 0.4 ? "#0a0a0a" : "#ffffff";
};

const CORNER_POS: Record<Corner, CSSProperties> = {
  tl: { top: 0, left: 0, alignItems: "flex-start", textAlign: "left" },
  tr: { top: 0, right: 0, alignItems: "flex-end", textAlign: "right" },
  bl: { bottom: 0, left: 0, alignItems: "flex-start", textAlign: "left" },
  br: { bottom: 0, right: 0, alignItems: "flex-end", textAlign: "right" },
};

export const Overlays = ({
  overlays,
  background,
  logoSrc,
  frame,
  durationInFrames,
  fps,
  width,
  height,
}: {
  overlays: OverlaysDoc;
  background: Background;
  logoSrc: string | undefined;
  frame: number;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
}) => {
  const { title, labels, logo, anim } = overlays;
  const titleFont = useFont(title.font, title.on);
  const labelFont = useFont(labels.font, labels.on);

  // In over the first 0.6 s, out over the last 0.6 s: the loop point shows
  // the bare scene, so the clip stays seamless.
  const ramp = Math.min(
    Math.round(fps * 0.6),
    Math.floor(durationInFrames / 3)
  );
  const shown = anim.on
    ? Math.min(
        interpolate(frame, [0, ramp], [0, 1], { extrapolateRight: "clamp" }),
        interpolate(
          frame,
          [durationInFrames - 1 - ramp, durationInFrames - 1],
          [1, 0],
          {
            extrapolateLeft: "clamp",
          }
        )
      )
    : 1;
  const eased = 1 - (1 - shown) ** 3;
  const animStyle = (delay: number): CSSProperties => {
    if (!anim.on) {
      return {};
    }
    const v = Math.max(0, Math.min(1, eased * (1 + delay) - delay));
    if (anim.kind === "rise") {
      return {
        opacity: v,
        transform: `translateY(${(1 - v) * height * 0.03}px)`,
      };
    }
    if (anim.kind === "blur") {
      return { opacity: v, filter: `blur(${(1 - v) * height * 0.012}px)` };
    }
    return { opacity: v };
  };

  const pad = Math.round(Math.min(width, height) * 0.045);
  const labelColor =
    labels.color === "auto" ? inkFor(background) : labels.color;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {title.on && title.text.trim() ? (
        <div
          style={{
            position: "absolute",
            left: pad,
            right: pad,
            top: `${title.y * 100}%`,
            transform: "translateY(-50%)",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: titleFont,
              fontWeight: title.weight,
              fontSize: title.size * height,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: title.color,
              textAlign: "center",
              textShadow: `0 ${height * 0.004}px ${height * 0.03}px rgba(0,0,0,0.35)`,
              ...animStyle(0),
            }}
          >
            {title.text}
          </div>
        </div>
      ) : null}
      {labels.on
        ? (["tl", "tr", "bl", "br"] as const).map((corner, i) =>
            labels[corner].trim() ? (
              <div
                key={corner}
                style={{
                  position: "absolute",
                  display: "flex",
                  flexDirection: "column",
                  padding: pad,
                  ...CORNER_POS[corner],
                  fontFamily: labelFont,
                  fontWeight: 500,
                  fontSize: labels.size * height,
                  letterSpacing: "0.01em",
                  color: labelColor,
                  ...animStyle(0.1 + i * 0.06),
                }}
              >
                {labels[corner]}
              </div>
            ) : null
          )
        : null}
      {logo.on && logoSrc ? (
        <div
          style={{
            position: "absolute",
            display: "flex",
            padding: pad,
            ...CORNER_POS[logo.corner],
            ...animStyle(0.2),
          }}
        >
          <Img
            src={logoSrc}
            style={{
              width: logo.size * width,
              height: "auto",
              opacity: logo.opacity,
            }}
          />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
