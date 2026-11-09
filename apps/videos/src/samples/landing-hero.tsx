import { INTER, SERIF } from "./fonts";
import { Avatar, Canvas, Icon } from "./kit";

/** Driftly: the hero of a roadmap tool's landing page, product shot below. */
const ROADMAP = [
  { name: "Onboarding revamp", team: "Growth", color: "#f97316", start: 0, span: 3.2, done: 0.9 },
  { name: "Usage-based billing", team: "Billing", color: "#8b5cf6", start: 1.4, span: 4, done: 0.55 },
  { name: "Mobile offline mode", team: "Mobile", color: "#06b6d4", start: 2.6, span: 3.6, done: 0.3 },
  { name: "SSO for enterprise", team: "Platform", color: "#10b981", start: 0.6, span: 2.4, done: 1 },
  { name: "Search v2", team: "Core", color: "#ec4899", start: 4, span: 3, done: 0.1 },
  { name: "Public API", team: "Platform", color: "#3b82f6", start: 3.2, span: 3.8, done: 0.2 },
];
const WEEKS = ["Nov 3", "Nov 10", "Nov 17", "Nov 24", "Dec 1", "Dec 8", "Dec 15", "Dec 22"];
const COL = 88;

export const LandingHero = () => (
  <Canvas scale={1.25} className="bg-[#fbf8f4] text-[#14110f]" style={{ fontFamily: INTER }}>
    <div className="relative h-full overflow-hidden">
      <div className="absolute -top-40 -left-32 h-[520px] w-[620px] rounded-full bg-[#ffd9b8] opacity-70 blur-[120px]" />
      <div className="absolute -top-24 right-[-120px] h-[520px] w-[560px] rounded-full bg-[#dcd3ff] opacity-80 blur-[120px]" />
      <div className="absolute top-[420px] left-[380px] h-[360px] w-[520px] rounded-full bg-[#c9f0e6] opacity-60 blur-[120px]" />

      <nav className="relative flex items-center px-14 pt-7">
        <div className="flex items-center gap-2.5">
          <div className="relative h-7 w-7">
            <div className="absolute inset-0 rounded-full bg-[#14110f]" />
            <div className="absolute top-[7px] left-[7px] h-[14px] w-[14px] rounded-full bg-[#ff8a3d]" />
          </div>
          <span className="text-[19px] font-semibold tracking-tight">Driftly</span>
        </div>
        <div className="ml-14 flex gap-8 text-[14.5px] text-[#4a443f]">
          {["Product", "Customers", "Pricing", "Docs", "Changelog"].map((link) => (
            <span key={link}>{link}</span>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-5 text-[14.5px]">
          <span className="text-[#4a443f]">Sign in</span>
          <span className="rounded-full bg-[#14110f] px-4.5 py-2.5 font-medium text-white">
            Start free
          </span>
        </div>
      </nav>

      <section className="relative mt-16 flex flex-col items-center text-center">
        <div className="flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/70 py-1 pr-3 pl-1 text-[13px] shadow-sm">
          <span className="rounded-full bg-[#14110f] px-2 py-0.5 text-[11.5px] font-medium text-white">New</span>
          Driftly 3.0: roadmaps that update themselves
          <Icon name="arrowRight" size={13} />
        </div>
        <h1
          className="mt-7 text-[88px] leading-[0.98] tracking-[-0.02em]"
          style={{ fontFamily: SERIF }}
        >
          Plan the work.
          <br />
          Ship the <em className="text-[#ff6a1f]">moment</em> it's ready.
        </h1>
        <p className="mt-6 max-w-[560px] text-[18px] leading-relaxed text-[#5b544e]">
          One living roadmap for product, design and engineering. Driftly links
          every plan to the work behind it, so dates never go stale.
        </p>
        <div className="mt-8 flex items-center gap-3">
          <span className="flex items-center gap-2 rounded-full bg-[#14110f] px-6 py-3.5 text-[15px] font-medium text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)]">
            Start planning free
            <Icon name="arrowRight" size={16} />
          </span>
          <span className="rounded-full border border-black/10 bg-white/80 px-6 py-3.5 text-[15px] font-medium">
            Book a demo
          </span>
        </div>
        <div className="mt-5 flex items-center gap-3 text-[13px] text-[#7a726b]">
          <div className="flex -space-x-2">
            {["Ana Ruiz", "Tom Becker", "Lin Zhao", "Sam Ito"].map((name) => (
              <Avatar key={name} name={name} size={26} ring="#fbf8f4" />
            ))}
          </div>
          Loved by 4,000+ product teams
        </div>
      </section>

      <section className="absolute top-[640px] left-1/2 w-[1080px] -translate-x-1/2 overflow-hidden rounded-t-2xl border border-black/[0.08] bg-white shadow-[0_30px_80px_-20px_rgba(60,40,20,0.35)]">
        <div className="flex items-center gap-2 border-b border-black/[0.06] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <div className="ml-4 text-[13px] font-medium">Q4 Roadmap</div>
          <div className="ml-3 flex gap-1 text-[12px] text-[#7a726b]">
            <span className="rounded-md bg-black/[0.05] px-2 py-1 text-[#14110f]">Timeline</span>
            <span className="px-2 py-1">Board</span>
            <span className="px-2 py-1">List</span>
          </div>
          <div className="ml-auto flex -space-x-1.5">
            {["Ana Ruiz", "Lin Zhao", "Kofi Mensah"].map((name) => (
              <Avatar key={name} name={name} size={22} ring="#fff" />
            ))}
          </div>
          <span className="ml-3 rounded-md bg-[#ff6a1f] px-2.5 py-1 text-[12px] font-medium text-white">Share</span>
        </div>
        <div className="flex">
          <div className="w-[260px] border-r border-black/[0.06]">
            <div className="h-9 border-b border-black/[0.06] px-4 pt-2.5 text-[11.5px] font-medium tracking-wide text-[#9a928a] uppercase">
              Initiative
            </div>
            {ROADMAP.map((row) => (
              <div key={row.name} className="flex h-[46px] items-center gap-2.5 border-b border-black/[0.04] px-4 text-[13px]">
                <span className="h-2 w-2 rounded-full" style={{ background: row.color }} />
                <span className="font-medium">{row.name}</span>
                <span className="ml-auto text-[11.5px] text-[#9a928a]">{row.team}</span>
              </div>
            ))}
          </div>
          <div className="relative flex-1">
            <div className="flex h-9 border-b border-black/[0.06]">
              {WEEKS.map((week) => (
                <div key={week} className="border-l border-black/[0.04] px-2 pt-2.5 text-[11.5px] text-[#9a928a]" style={{ width: COL }}>
                  {week}
                </div>
              ))}
            </div>
            <div className="absolute top-9 bottom-0 w-[2px] bg-[#ff6a1f]" style={{ left: COL * 2.4 }}>
              <div className="absolute -top-1 -left-[3px] h-2 w-2 rounded-full bg-[#ff6a1f]" />
            </div>
            {ROADMAP.map((row) => (
              <div key={row.name} className="relative h-[46px] border-b border-black/[0.04]">
                <div
                  className="absolute top-[9px] flex h-7 items-center overflow-hidden rounded-lg text-[12px] font-medium"
                  style={{
                    left: row.start * COL,
                    width: row.span * COL,
                    background: `${row.color}22`,
                    color: row.color,
                  }}
                >
                  <div className="absolute inset-y-0 left-0" style={{ width: `${row.done * 100}%`, background: `${row.color}33` }} />
                  <span className="relative px-2.5" style={{ filter: "brightness(0.75)" }}>
                    {Math.round(row.done * 100)}% · {row.team}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  </Canvas>
);
