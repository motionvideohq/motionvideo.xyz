import { MANROPE } from "./fonts";
import type { IconName } from "./kit";
import { Avatar, Canvas, fit, HomeIndicator, Icon, series, smoothPath, StatusBar } from "./kit";

/** Pacely: a dark fitness app's Today screen. */
const RINGS = [
  { color: "#ff3d6e", track: "#3a1220", value: 0.82, r: 74, label: "Move", stat: "512", goal: "/620 kcal" },
  { color: "#a3f43a", track: "#24360f", value: 0.64, r: 56, label: "Exercise", stat: "29", goal: "/45 min" },
  { color: "#32d6ff", track: "#0d2f3a", value: 0.92, r: 38, label: "Stand", stat: "11", goal: "/12 hr" },
];
const WEEK = [
  ["M", 1, 0.9, 1],
  ["T", 0.7, 0.5, 0.9],
  ["W", 1, 1, 1],
  ["T", 0.4, 0.3, 0.6],
  ["F", 0.9, 0.8, 1],
  ["S", 0.6, 0.9, 0.7],
  ["S", 0.82, 0.64, 0.92],
] as const;
const STEPS = [32, 48, 20, 62, 80, 54, 70, 90, 66, 40, 58, 74];
const heart = fit(series(24, { seed: 6, start: 64, end: 60, wave: 6, noise: 6 }), 128, 30, { pad: 4 });
const TABS: [IconName, string][] = [
  ["activity", "Today"],
  ["flame", "Workouts"],
  ["calendar", "Plans"],
  ["user", "Profile"],
];

const Ring = ({ r, value, color, track, width }: { r: number; value: number; color: string; track: string; width: number }) => {
  const c = 2 * Math.PI * r;
  return (
    <>
      <circle cx="90" cy="90" r={r} fill="none" stroke={track} strokeWidth={width} />
      <circle
        cx="90"
        cy="90"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={`${value * c} ${c}`}
        transform="rotate(-90 90 90)"
      />
    </>
  );
};

export const MobileFitness = () => (
  <Canvas scale={3} className="bg-black text-white" style={{ fontFamily: MANROPE }}>
    <div className="relative h-full overflow-hidden">
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-[#ff3d6e] opacity-25 blur-[90px]" />
      <StatusBar />
      <div className="relative px-5">
        <div className="mt-2 flex items-center">
          <div>
            <div className="text-[13px] font-semibold tracking-wide text-white/50 uppercase">Monday, Nov 10</div>
            <div className="mt-0.5 text-[30px] font-extrabold tracking-tight">Today</div>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Icon name="bell" size={19} />
            </div>
            <Avatar name="Jules Moreau" size={40} hue={330} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 rounded-[28px] bg-[#141416] p-3.5">
          <svg width="160" height="160" viewBox="0 0 180 180">
            {RINGS.map((ring) => (
              <Ring key={ring.label} r={ring.r} value={ring.value} color={ring.color} track={ring.track} width={16} />
            ))}
          </svg>
          <div className="flex flex-col gap-3.5">
            {RINGS.map((ring) => (
              <div key={ring.label}>
                <div className="text-[13px] font-semibold text-white/60">{ring.label}</div>
                <div className="text-[22px] leading-tight font-extrabold" style={{ color: ring.color }}>
                  {ring.stat}
                  <span className="text-[13px] font-semibold text-white/40">{ring.goal}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex justify-between rounded-[22px] bg-[#141416] px-4 py-3">
          {WEEK.map(([day, move, exercise, stand], index) => (
            <div key={`${day}${index}`} className="flex flex-col items-center gap-1.5">
              <span className={`text-[11px] font-bold ${index === 6 ? "text-white" : "text-white/40"}`}>{day}</span>
              <svg width="30" height="30" viewBox="0 0 180 180">
                <Ring r={74} value={move} color="#ff3d6e" track="#3a1220" width={26} />
                <Ring r={44} value={exercise} color="#a3f43a" track="#24360f" width={26} />
                <Ring r={14} value={stand} color="#32d6ff" track="#0d2f3a" width={22} />
              </svg>
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-[22px] bg-[#141416] p-4">
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-white/60">
              <Icon name="activity" size={15} className="text-[#a3f43a]" />
              Steps
            </div>
            <div className="mt-1.5 text-[24px] font-extrabold">8,412</div>
            <div className="mt-2 flex h-[30px] items-end gap-[3px]">
              {STEPS.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-[3px]"
                  style={{ height: `${value}%`, background: index === 7 ? "#a3f43a" : "#a3f43a40" }}
                />
              ))}
            </div>
          </div>
          <div className="rounded-[22px] bg-[#141416] p-4">
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-white/60">
              <Icon name="heart" size={15} className="text-[#ff3d6e]" />
              Heart rate
            </div>
            <div className="mt-1.5 text-[24px] font-extrabold">
              62 <span className="text-[13px] font-semibold text-white/40">bpm</span>
            </div>
            <svg width="128" height="30" className="mt-2 overflow-visible">
              <path d={smoothPath(heart)} fill="none" stroke="#ff3d6e" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx={heart.at(-1)?.x} cy={heart.at(-1)?.y} r="4" fill="#ff3d6e" stroke="#141416" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-[22px] bg-[#141416]">
          <div className="relative h-[72px] bg-[#1b1d22]">
            <svg width="350" height="72" viewBox="0 0 350 72" className="absolute inset-0">
              {Array.from({ length: 8 }, (_, index) => (
                <path key={index} d={`M${index * 50 - 10} 0 L${index * 50 + 26} 72`} stroke="#ffffff0d" strokeWidth="10" />
              ))}
              <path d="M0 48 C60 42 80 18 140 24 S230 60 350 36" stroke="#ffffff10" strokeWidth="12" fill="none" />
              <path
                d="M120 56 C150 52 166 31 200 30 S240 44 262 37 S290 13 324 18"
                stroke="#a3f43a"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <circle cx="120" cy="56" r="6" fill="#141416" stroke="#a3f43a" strokeWidth="3" />
              <circle cx="324" cy="18" r="7" fill="#a3f43a" />
            </svg>
            <span className="absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold">Riverside loop</span>
          </div>
          <div className="flex items-center px-4 py-3.5">
            <div>
              <div className="text-[15px] font-extrabold">Tempo run</div>
              <div className="text-[12px] font-semibold text-white/50">This morning · 7:12 AM</div>
            </div>
            <div className="ml-auto flex gap-4 text-right">
              {[
                ["5.2", "km"],
                ["26:41", "time"],
                ["5'08\"", "/km"],
              ].map(([value, unit]) => (
                <div key={unit}>
                  <div className="text-[16px] font-extrabold">{value}</div>
                  <div className="text-[11px] font-semibold text-white/40">{unit}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-black/85 pt-2.5 pb-[34px] backdrop-blur">
        <div className="flex justify-around">
          {TABS.map(([icon, label], index) => (
            <div key={label} className={`flex flex-col items-center gap-1 text-[10.5px] font-bold ${index === 0 ? "text-[#ff3d6e]" : "text-white/45"}`}>
              <Icon name={icon} size={23} stroke={2} />
              {label}
            </div>
          ))}
        </div>
        <HomeIndicator />
      </div>
    </div>
  </Canvas>
);
