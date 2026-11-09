import { BRICOLAGE, INTER } from "./fonts";
import { Canvas } from "./kit";

/** Form & Signal: a geometric poster for a fictional design festival. */
const COBALT = "#2443ff";
const TOMATO = "#ff4b2b";
const SUN = "#ffc22e";
const MINT = "#16c79a";
const CREAM = "#f2ece0";
const INK = "#121212";

const SPEAKERS = [
  "Amara Osei",
  "Henrik Vaag",
  "Lucía Ferrer",
  "Kenji Mori",
  "Odile Martin",
  "Rafael Duarte",
  "Mina Sato",
  "Theo Brandt",
];

const Shapes = () => (
  <svg width="760" height="1040" viewBox="0 0 760 1040">
    <rect width="760" height="1040" fill={INK} />
    <rect x="0" y="0" width="380" height="380" fill={COBALT} />
    <circle cx="380" cy="380" r="300" fill={SUN} />
    <path d="M380 80 A300 300 0 0 1 680 380 L380 380 Z" fill={TOMATO} />
    <rect x="380" y="380" width="380" height="380" fill={CREAM} />
    <circle cx="570" cy="570" r="150" fill={INK} />
    <circle cx="570" cy="570" r="70" fill={MINT} />
    {Array.from({ length: 9 }, (_, index) => (
      <rect key={index} x={0} y={400 + index * 40} width={380} height={20} fill={index % 2 ? MINT : CREAM} />
    ))}
    <rect x="0" y="760" width="760" height="280" fill={TOMATO} />
    {Array.from({ length: 6 }, (_, index) => (
      <circle key={index} cx={63 + index * 127} cy={900} r={52} fill={index % 2 ? INK : CREAM} />
    ))}
    <path d="M0 760 L190 760 L0 950 Z" fill={SUN} />
    <path d="M760 1040 L560 1040 L760 840 Z" fill={COBALT} />
  </svg>
);

export const Poster = () => (
  <Canvas scale={1} className="text-[#121212]" style={{ background: CREAM, fontFamily: INTER }}>
    <div className="flex h-full gap-[80px] p-[80px]">
      <div className="flex w-[600px] flex-col">
        <div className="flex items-center justify-between text-[19px] font-semibold tracking-[0.06em] uppercase">
          <span>No. 07</span>
          <span>2027</span>
        </div>
        <div className="mt-6 h-[6px]" style={{ background: INK }} />
        <h1
          className="mt-10 text-[176px] leading-[0.82] font-extrabold tracking-[-0.055em]"
          style={{ fontFamily: BRICOLAGE }}
        >
          Form
          <br />
          <span style={{ color: TOMATO }}>&amp;</span>
          <br />
          Signal
        </h1>
        <p className="mt-10 max-w-[480px] text-[28px] leading-[1.2] font-medium tracking-[-0.01em]">
          Four days on type, systems and the shapes that carry meaning.
        </p>
        <div className="mt-auto grid grid-cols-2 gap-x-10 border-t-[3px] pt-6" style={{ borderColor: INK }}>
          <div>
            <div className="text-[15px] font-semibold tracking-[0.08em] uppercase opacity-60">When</div>
            <div className="mt-2 text-[34px] leading-none font-extrabold tracking-tight" style={{ fontFamily: BRICOLAGE }}>
              12–15 Mar
            </div>
          </div>
          <div>
            <div className="text-[15px] font-semibold tracking-[0.08em] uppercase opacity-60">Where</div>
            <div className="mt-2 text-[34px] leading-none font-extrabold tracking-tight" style={{ fontFamily: BRICOLAGE }}>
              Halle Vier
            </div>
          </div>
          <div className="col-span-2 mt-6 text-[16px] leading-[1.6] font-medium">
            {SPEAKERS.join("  ·  ")}
          </div>
        </div>
      </div>
      <div className="relative flex-1">
        <div className="absolute inset-0 overflow-hidden">
          <Shapes />
        </div>
        <div
          className="absolute right-[-20px] bottom-[300px] flex h-[150px] w-[150px] rotate-[-12deg] items-center justify-center rounded-full text-center text-[19px] leading-[1.05] font-extrabold uppercase"
          style={{ background: MINT, color: INK, fontFamily: BRICOLAGE }}
        >
          Tickets
          <br />
          on sale
          <br />
          now
        </div>
      </div>
    </div>
  </Canvas>
);
