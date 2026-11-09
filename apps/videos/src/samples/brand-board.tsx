import type { CSSProperties, ReactNode } from "react";

import { FRAUNCES, INTER } from "./fonts";
import { Canvas } from "./kit";

/** Oakhollow Coffee: a brand identity board on a dark espresso ground. */
const ESPRESSO = "#1c130e";
const ROAST = "#3a2418";
const CLAY = "#c8643b";
const OAT = "#efe4d2";
const SAGE = "#8fa58a";
const HONEY = "#e3a948";

const Mark = ({ size, color, fill }: { size: number; color: string; fill: string }) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="47" fill={fill} stroke={color} strokeWidth="3" />
    <path d="M50 22c-14 0-22 9-22 20h44c0-11-8-20-22-20z" fill={color} />
    <path d="M30 46h40c0 18-9 32-20 32S30 64 30 46z" fill="none" stroke={color} strokeWidth="5" />
    <path d="M50 14v8" stroke={color} strokeWidth="5" strokeLinecap="round" />
  </svg>
);

const Wordmark = ({ color, size }: { color: string; size: number }) => (
  <div style={{ fontFamily: FRAUNCES, color, fontSize: size, lineHeight: 1, letterSpacing: "-0.02em" }} className="font-semibold">
    Oakhollow
  </div>
);

const Tile = ({ className, style, children }: { className?: string; style?: CSSProperties; children: ReactNode }) => (
  <div className={`relative overflow-hidden rounded-[28px] ${className ?? ""}`} style={style}>
    {children}
  </div>
);

export const BrandBoard = () => (
  <Canvas scale={1} style={{ background: "#0f0a07", fontFamily: INTER }}>
    <div className="grid h-full grid-cols-[1.35fr_1fr_1fr] grid-rows-[1.2fr_1fr] gap-5 p-10">
      <Tile className="flex flex-col p-12" style={{ background: ROAST }}>
        <div className="flex items-center justify-between text-[15px] tracking-[0.2em] uppercase" style={{ color: `${OAT}99` }}>
          <span>Brand identity</span>
          <span>v2.0 · 2026</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-6">
          <Mark size={150} color={OAT} fill={ROAST} />
          <Wordmark color={OAT} size={88} />
          <div className="text-[17px] tracking-[0.42em] uppercase" style={{ color: HONEY }}>
            Coffee roasters · Est. 2019
          </div>
        </div>
      </Tile>

      <Tile className="flex flex-col p-9" style={{ background: OAT, color: ESPRESSO }}>
        <div className="text-[14px] font-medium tracking-[0.2em] uppercase opacity-60">Colour</div>
        <div className="mt-6 grid flex-1 grid-cols-2 grid-rows-3 gap-3">
          {[
            ["Espresso", ESPRESSO, OAT, "row-span-2"],
            ["Clay", CLAY, OAT, ""],
            ["Honey", HONEY, ESPRESSO, ""],
            ["Sage", SAGE, ESPRESSO, ""],
            ["Roast", ROAST, OAT, ""],
          ].map(([name, color, ink, span]) => (
            <div key={name} className={`flex flex-col justify-end rounded-2xl p-4 ${span}`} style={{ background: color, color: ink }}>
              <div className="text-[18px] font-semibold">{name}</div>
              <div className="mt-0.5 text-[13px] uppercase opacity-70">{color}</div>
            </div>
          ))}
        </div>
      </Tile>

      <Tile className="flex flex-col p-9" style={{ background: CLAY, color: OAT }}>
        <div className="text-[14px] font-medium tracking-[0.2em] uppercase opacity-70">Typography</div>
        <div className="mt-4 text-[150px] leading-none font-semibold tracking-[-0.04em]" style={{ fontFamily: FRAUNCES }}>
          Aa
        </div>
        <div className="mt-2 text-[24px] font-semibold" style={{ fontFamily: FRAUNCES }}>Fraunces</div>
        <div className="text-[15px] opacity-80">Headlines · Semibold, Italic</div>
        <div className="mt-4 text-[34px] leading-[1.05] italic" style={{ fontFamily: FRAUNCES }}>
          Small batch,
          <br />
          big character.
        </div>
        <div className="mt-auto border-t border-white/25 pt-5">
          <div className="text-[24px] font-semibold">Inter</div>
          <div className="text-[15px] opacity-80">Body and labels · Regular, Medium</div>
          <div className="mt-3 text-[15px] leading-relaxed tracking-wide opacity-90">
            ABCDEFGHIJKLM
            <br />
            abcdefghijklm 0123456789
          </div>
        </div>
      </Tile>

      <Tile className="flex items-end justify-center" style={{ background: SAGE }}>
        <div className="absolute top-9 left-10 text-[14px] font-medium tracking-[0.2em] uppercase" style={{ color: ESPRESSO, opacity: 0.6 }}>
          Packaging
        </div>
        <div className="relative mb-[-30px] flex h-[400px] w-[270px] flex-col items-center rounded-t-[18px] shadow-[0_30px_60px_rgba(0,0,0,0.35)]" style={{ background: ESPRESSO }}>
          <div className="h-[34px] w-full rounded-t-[18px]" style={{ background: "repeating-linear-gradient(90deg, #2a1c14 0 6px, #1c130e 6px 12px)" }} />
          <div className="mt-8 flex w-[210px] flex-col items-center rounded-2xl px-4 py-6" style={{ background: OAT }}>
            <Mark size={58} color={ESPRESSO} fill={OAT} />
            <div className="mt-3">
              <Wordmark color={ESPRESSO} size={34} />
            </div>
            <div className="mt-4 h-px w-full" style={{ background: `${ESPRESSO}30` }} />
            <div className="mt-3 text-[20px] italic" style={{ fontFamily: FRAUNCES, color: CLAY }}>
              Ember Hill
            </div>
            <div className="mt-1 text-[11px] tracking-[0.2em] uppercase" style={{ color: ESPRESSO }}>
              Medium roast · 340 g
            </div>
          </div>
          <div className="mt-5 text-[11px] tracking-[0.3em] uppercase" style={{ color: HONEY }}>
            Whole bean
          </div>
        </div>
        <div className="absolute right-[26px] bottom-[26px] flex h-[96px] w-[96px] rotate-[10deg] items-center justify-center rounded-full text-center text-[13px] leading-tight font-semibold uppercase" style={{ background: HONEY, color: ESPRESSO }}>
          Single
          <br />
          origin
        </div>
      </Tile>

      <Tile
        className="flex flex-col justify-between p-9"
        style={{
          background: HONEY,
          color: ESPRESSO,
          backgroundImage: `radial-gradient(${ESPRESSO}22 2px, transparent 2.5px)`,
          backgroundSize: "22px 22px",
        }}
      >
        <div className="text-[14px] font-medium tracking-[0.2em] uppercase opacity-60">Voice</div>
        <div className="text-[54px] leading-[1.02] tracking-[-0.02em] italic" style={{ fontFamily: FRAUNCES }}>
          Roasted slow,
          <br />
          poured with
          <br />
          patience.
        </div>
      </Tile>

      <Tile className="flex flex-col items-center justify-center gap-6" style={{ background: OAT }}>
        <div className="absolute top-9 left-10 text-[14px] font-medium tracking-[0.2em] uppercase" style={{ color: ESPRESSO, opacity: 0.6 }}>
          Cup &amp; card
        </div>
        <div className="flex items-end gap-5">
          <div className="relative h-[190px] w-[140px]">
            <div className="absolute inset-x-0 top-0 h-[18px] rounded-md" style={{ background: ESPRESSO }} />
            <div
              className="absolute inset-x-[8px] top-[16px] bottom-0 flex flex-col items-center justify-center"
              style={{ background: "#fffaf2", clipPath: "polygon(0 0,100% 0,90% 100%,10% 100%)" }}
            >
              <div className="flex w-full flex-col items-center py-5" style={{ background: CLAY }}>
                <Mark size={48} color={OAT} fill={CLAY} />
              </div>
            </div>
          </div>
          <div className="flex h-[140px] w-[226px] flex-col justify-between rounded-xl p-4 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.35)]" style={{ background: ESPRESSO, color: OAT }}>
            <div className="flex items-center gap-2.5">
              <Mark size={30} color={OAT} fill={ESPRESSO} />
              <Wordmark color={OAT} size={22} />
            </div>
            <div>
              <div className="text-[15px] font-semibold">Ines Calloway</div>
              <div className="text-[12px] opacity-70">Head roaster · ines@oakhollow.coffee</div>
            </div>
          </div>
        </div>
      </Tile>
    </div>
  </Canvas>
);
