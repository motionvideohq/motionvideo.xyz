import { AbsoluteFill } from "remotion";

import { GROTESK } from "./fonts";

/**
 * Fernwave: a light-ink logo on a transparent ground, for the logo-overlay
 * demo. No background, so the PNG keeps its alpha channel.
 */
export const Logo = () => (
  <AbsoluteFill className="flex-row items-center justify-center gap-7">
    <svg width="156" height="156" viewBox="0 0 120 120">
      <defs>
        <linearGradient id="fernwave" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#ffb547" />
          <stop offset="0.5" stopColor="#ff5f7e" />
          <stop offset="1" stopColor="#8a5cff" />
        </linearGradient>
        <clipPath id="fernwave-clip">
          <rect width="120" height="120" rx="34" />
        </clipPath>
      </defs>
      <rect width="120" height="120" rx="34" fill="url(#fernwave)" />
      <g clipPath="url(#fernwave-clip)" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round">
        <path d="M18 46c14-12 28-12 42 0s28 12 42 0" opacity="0.55" />
        <path d="M18 66c14-12 28-12 42 0s28 12 42 0" opacity="0.8" />
        <path d="M18 86c14-12 28-12 42 0s28 12 42 0" />
      </g>
    </svg>
    <div
      className="text-[118px] leading-none font-bold tracking-[-0.045em] text-white"
      style={{ fontFamily: GROTESK }}
    >
      fernwave
    </div>
  </AbsoluteFill>
);
