import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

import { GEIST, MONO } from "./fonts";
import { areaPath, Canvas, fit, Icon, series, smoothPath } from "./kit";

/**
 * A dark analytics card whose chart draws in, holds, then wipes out to the
 * left-to-right so the last frame matches the first and the clip loops.
 */
const W = 720;
const H = 300;
const points = fit(series(40, { seed: 12, start: 30, end: 92, wave: 7, noise: 6 }), W, H, { min: 0, max: 110 });
const LINE = smoothPath(points);
const AREA = areaPath(points, H);
const BARS = [42, 58, 51, 66, 74, 69, 88];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ease = Easing.bezier(0.65, 0, 0.35, 1);

export const ClipChart = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const end = durationInFrames;
  const drawIn = interpolate(frame, [12, 72], [0, 1], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wipe = interpolate(frame, [end - 34, end - 4], [0, 1], { easing: ease, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const shown = drawIn * (1 - wipe);
  // Counts back down during the wipe, so the loop point reads 0 on both sides.
  const users = Math.round(48210 * shown);
  const head = points[Math.min(points.length - 1, Math.floor(drawIn * (points.length - 1)))];

  return (
    <Canvas scale={1.25} className="bg-[#07070a] text-white" style={{ fontFamily: GEIST }}>
      <div className="absolute top-[-200px] left-[200px] h-[500px] w-[700px] rounded-full bg-[#6d5dfc] opacity-20 blur-[140px]" />
      <div className="relative flex h-full items-center justify-center">
        <div className="w-[1120px] rounded-[28px] border border-white/[0.08] bg-[#101016] p-9 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]">
          <div className="flex items-start">
            <div>
              <div className="flex items-center gap-2 text-[15px] text-zinc-400">
                <Icon name="users" size={17} />
                Weekly active users
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-[56px] leading-none font-semibold tracking-[-0.03em] tabular-nums">
                  {users.toLocaleString("en-US")}
                </span>
                <span
                  className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 text-[14px] font-medium text-emerald-300"
                  style={{ opacity: shown }}
                >
                  <Icon name="trending" size={14} stroke={2.2} />
                  +23.8%
                </span>
              </div>
            </div>
            <div className="ml-auto flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1 text-[14px]">
              {["Day", "Week", "Month"].map((range) => (
                <span key={range} className={`rounded-lg px-4 py-1.5 ${range === "Week" ? "bg-white/10 text-white" : "text-zinc-500"}`}>
                  {range}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-8 flex gap-8">
            <div className="relative">
              <svg width={W} height={H} className="overflow-visible">
                <defs>
                  <linearGradient id="clip-area" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#7c6cff" stopOpacity="0.45" />
                    <stop offset="1" stopColor="#7c6cff" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="clip-line" x1="0" x2="1">
                    <stop offset="0" stopColor="#4cc9f0" />
                    <stop offset="1" stopColor="#a78bfa" />
                  </linearGradient>
                  <clipPath id="clip-reveal">
                    <rect x={W * wipe} y="-20" width={W * (drawIn - wipe)} height={H + 40} />
                  </clipPath>
                </defs>
                {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                  <line key={t} x1="0" x2={W} y1={t * H} y2={t * H} stroke="#fff" strokeOpacity="0.06" />
                ))}
                <path d={AREA} fill="url(#clip-area)" clipPath="url(#clip-reveal)" />
                <path
                  d={LINE}
                  fill="none"
                  stroke="url(#clip-line)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  clipPath="url(#clip-reveal)"
                />
                {drawIn > 0.02 && wipe < 0.98 && drawIn < 1 ? (
                  <circle cx={head.x} cy={head.y} r="7" fill="#101016" stroke="#a78bfa" strokeWidth="3.5" />
                ) : null}
              </svg>
              <div className="mt-3 flex justify-between text-[12px] text-zinc-600" style={{ fontFamily: MONO }}>
                {["Sep 1", "Sep 15", "Oct 1", "Oct 15", "Nov 1"].map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-1 flex-col">
              <div className="text-[14px] text-zinc-400">Sessions this week</div>
              <div className="mt-auto flex h-[250px] items-end gap-2.5">
                {BARS.map((value, index) => {
                  const grow = interpolate(frame, [30 + index * 5, 62 + index * 5], [0, 1], {
                    easing: Easing.out(Easing.cubic),
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  });
                  const shrink = interpolate(frame, [end - 36 + index * 3, end - 22 + index * 3], [1, 0], {
                    easing: Easing.in(Easing.cubic),
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  });
                  return (
                    <div key={DAYS[index]} className="flex flex-1 flex-col items-center gap-2">
                      <div className="flex h-[220px] w-full items-end rounded-lg bg-white/[0.04]">
                        <div
                          className="w-full rounded-lg"
                          style={{
                            height: `${value * grow * shrink}%`,
                            background: index === 6 ? "linear-gradient(180deg,#a78bfa,#6d5dfc)" : "#2a2a3a",
                          }}
                        />
                      </div>
                      <span className="text-[12px] text-zinc-500">{DAYS[index]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Canvas>
  );
};
