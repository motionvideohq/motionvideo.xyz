import { MANROPE } from "./fonts";
import { Canvas, HomeIndicator, Icon, StatusBar } from "./kit";

/** Lowtide: a music player's Now Playing screen with generated cover art. */
const Cover = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 300 300">
    <defs>
      <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#2a0f5c" />
        <stop offset="0.45" stopColor="#c2367a" />
        <stop offset="0.7" stopColor="#ff8a4c" />
      </linearGradient>
      <linearGradient id="sea" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#1d2a6b" />
        <stop offset="1" stopColor="#0b0b2a" />
      </linearGradient>
    </defs>
    <rect width="300" height="300" fill="url(#sky)" />
    <circle cx="150" cy="186" r="70" fill="#ffd27a" />
    <rect y="186" width="300" height="114" fill="url(#sea)" />
    {Array.from({ length: 9 }, (_, index) => (
      <rect
        key={index}
        x={150 - (60 - index * 6)}
        y={196 + index * 10}
        width={(60 - index * 6) * 2}
        height="3"
        rx="1.5"
        fill="#ffd27a"
        opacity={0.8 - index * 0.08}
      />
    ))}
    <path d="M0 186 L60 150 L110 186 Z" fill="#160a33" opacity="0.8" />
    <path d="M190 186 L250 136 L300 166 L300 186 Z" fill="#160a33" opacity="0.8" />
    <text x="20" y="40" fill="#fff" fontSize="22" fontWeight="800" letterSpacing="3" fontFamily={MANROPE}>
      GLASSHOUSE
    </text>
    <text x="20" y="62" fill="#ffffffb0" fontSize="13" fontWeight="600" letterSpacing="4" fontFamily={MANROPE}>
      SUMMER
    </text>
  </svg>
);

const UP_NEXT = [
  ["Paper Moons", "Marin Vale", "3:41", "#ff8a4c"],
  ["Low Tide, High Noon", "The Saltmarsh", "4:12", "#4cc9f0"],
] as const;

export const MobileMusic = () => (
  <Canvas scale={3} className="text-white" style={{ background: "#14082b", fontFamily: MANROPE }}>
    <div className="relative h-full overflow-hidden">
      <div className="absolute -top-20 -left-20 h-[420px] w-[420px] rounded-full bg-[#c2367a] opacity-60 blur-[100px]" />
      <div className="absolute top-[300px] -right-24 h-[360px] w-[360px] rounded-full bg-[#ff8a4c] opacity-40 blur-[100px]" />
      <div className="absolute bottom-[-80px] left-0 h-[360px] w-[420px] rounded-full bg-[#2b3bb5] opacity-50 blur-[110px]" />
      <div className="relative">
        <StatusBar />
        <div className="mt-1 flex items-center px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <Icon name="chevronDown" size={22} />
          </div>
          <div className="mx-auto text-center">
            <div className="text-[11px] font-bold tracking-[0.18em] text-white/60 uppercase">Playing from album</div>
            <div className="text-[14px] font-bold">Glasshouse Summer</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <Icon name="more" size={22} stroke={3} />
          </div>
        </div>

        <div className="mt-5 flex justify-center">
          <div className="overflow-hidden rounded-[28px] shadow-[0_30px_60px_-10px_rgba(0,0,0,0.6)]">
            <Cover size={290} />
          </div>
        </div>

        <div className="mt-6 flex items-center px-7">
          <div>
            <div className="text-[25px] leading-tight font-extrabold tracking-tight">Neon on the Water</div>
            <div className="mt-0.5 text-[16px] font-semibold text-white/65">Marin Vale</div>
          </div>
          <Icon name="heart" size={26} className="ml-auto fill-[#ff5c8a] text-[#ff5c8a]" />
        </div>

        <div className="mt-5 px-7">
          <div className="relative h-[5px] rounded-full bg-white/20">
            <div className="absolute inset-y-0 left-0 w-[42%] rounded-full bg-white" />
            <div className="absolute top-1/2 left-[42%] h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" />
          </div>
          <div className="mt-2 flex text-[12px] font-semibold text-white/55">
            <span>1:34</span>
            <span className="ml-auto">-2:09</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between px-8">
          <Icon name="shuffle" size={22} className="text-[#ffb37a]" />
          <svg width="34" height="34" viewBox="0 0 24 24" fill="white">
            <path d="M19 20 9 12l10-8z" />
            <rect x="5" y="4" width="2.6" height="16" rx="1.2" />
          </svg>
          <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="#14082b">
              <rect x="5" y="4" width="4.5" height="16" rx="1.5" />
              <rect x="14.5" y="4" width="4.5" height="16" rx="1.5" />
            </svg>
          </div>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="white">
            <path d="M5 4l10 8-10 8z" />
            <rect x="16.4" y="4" width="2.6" height="16" rx="1.2" />
          </svg>
          <Icon name="repeat" size={22} className="text-white/55" />
        </div>

        <div className="mx-5 mt-6 rounded-[24px] border border-white/10 bg-white/[0.08] p-4 backdrop-blur-xl">
          <div className="flex items-center">
            <span className="text-[14px] font-extrabold">Up next</span>
            <span className="ml-auto text-[12px] font-bold text-white/55">Queue</span>
          </div>
          {UP_NEXT.map(([title, artist, length, color]) => (
            <div key={title} className="mt-3 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl" style={{ background: `linear-gradient(135deg, ${color}, #2a0f5c)` }} />
              <div>
                <div className="text-[14px] font-bold">{title}</div>
                <div className="text-[12px] font-semibold text-white/55">{artist}</div>
              </div>
              <span className="ml-auto text-[12px] font-semibold text-white/55">{length}</span>
            </div>
          ))}
        </div>
      </div>
      <HomeIndicator />
    </div>
  </Canvas>
);
