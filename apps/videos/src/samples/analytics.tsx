import { GEIST, MONO } from "./fonts";
import type { IconName } from "./kit";
import { areaPath, Avatar, Canvas, fit, Icon, series, smoothPath } from "./kit";

/** Vantrel: a dark subscription-revenue dashboard. */
const NAV: [IconName, string, boolean?][] = [
  ["home", "Overview", true],
  ["chart", "Revenue"],
  ["users", "Customers"],
  ["card", "Billing"],
  ["layers", "Plans"],
  ["inbox", "Reports"],
];

const KPIS = [
  { label: "Monthly recurring revenue", value: "$184,240", delta: "+12.4%", up: true, seed: 3 },
  { label: "Active subscribers", value: "6,912", delta: "+4.1%", up: true, seed: 7 },
  { label: "Net churn", value: "1.8%", delta: "−0.3 pt", up: true, seed: 11 },
  { label: "Avg. revenue per user", value: "$26.65", delta: "−0.6%", up: false, seed: 5 },
];

const ROWS = [
  ["Kitebird Labs", "Scale · annual", "$4,800.00", "Paid", 210],
  ["Orchard & Pine", "Growth · monthly", "$249.00", "Paid", 140],
  ["Halden Studio", "Growth · monthly", "$249.00", "Pending", 30],
  ["Marlowe Health", "Scale · monthly", "$899.00", "Paid", 280],
  ["Fenwick Supply", "Starter · monthly", "$49.00", "Refunded", 0],
] as const;

const CHANNELS = [
  ["Organic search", 42],
  ["Referrals", 27],
  ["Paid social", 18],
  ["Partners", 13],
] as const;

const W = 640;
const H = 230;
const revenue = series(31, { seed: 4, start: 52, end: 92, wave: 6, noise: 5 });
const expansion = series(31, { seed: 9, start: 22, end: 38, wave: 4, noise: 3 });
const revenuePts = fit(revenue, W, H, { min: 0, max: 110 });
const expansionPts = fit(expansion, W, H, { min: 0, max: 110 });
const focus = revenuePts[21];

const Sparkline = ({ seed, up }: { seed: number; up: boolean }) => {
  const pts = fit(
    series(16, { seed, start: up ? 30 : 60, end: up ? 70 : 45, wave: 6, noise: 8 }),
    96,
    34,
    { pad: 3 }
  );
  const color = up ? "#34d399" : "#fb7185";
  return (
    <svg width="96" height="34" className="overflow-visible">
      <path d={smoothPath(pts)} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
};

const Donut = () => {
  const parts = [
    { value: 0.46, color: "#8b5cf6" },
    { value: 0.34, color: "#22d3ee" },
    { value: 0.2, color: "#f472b6" },
  ];
  const r = 62;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width="160" height="160" viewBox="0 0 160 160">
      <circle cx="80" cy="80" r={r} stroke="#1f1f26" strokeWidth="18" fill="none" />
      {parts.map((part) => {
        const dash = part.value * c - 4;
        const element = (
          <circle
            key={part.color}
            cx="80"
            cy="80"
            r={r}
            fill="none"
            stroke={part.color}
            strokeWidth="18"
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={-offset}
            transform="rotate(-90 80 80)"
          />
        );
        offset += part.value * c;
        return element;
      })}
    </svg>
  );
};

export const Analytics = () => (
  <Canvas
    scale={1.25}
    className="bg-[#08080b] text-zinc-100"
    style={{ fontFamily: GEIST }}
  >
    <div className="flex h-full">
      <aside className="flex w-[228px] flex-col border-r border-white/[0.06] bg-[#0c0c11] px-4 py-5">
        <div className="flex items-center gap-2.5 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400">
            <div className="h-3.5 w-3.5 rotate-45 rounded-[3px] border-2 border-white" />
          </div>
          <span className="text-[17px] font-semibold tracking-tight">Vantrel</span>
        </div>
        <div className="mt-6 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[13px] text-zinc-500">
          <Icon name="search" size={15} />
          Search
          <span className="ml-auto rounded border border-white/10 px-1.5 text-[11px]">⌘K</span>
        </div>
        <nav className="mt-6 flex flex-col gap-0.5">
          {NAV.map(([icon, label, active]) => (
            <div
              key={label}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] ${active ? "bg-white/[0.07] text-white" : "text-zinc-400"}`}
            >
              <Icon name={icon} size={17} />
              {label}
            </div>
          ))}
        </nav>
        <div className="mt-8 px-3 text-[11px] font-medium tracking-wider text-zinc-600 uppercase">
          Workspaces
        </div>
        {[
          ["#8b5cf6", "Production"],
          ["#22d3ee", "Staging"],
          ["#f472b6", "EU region"],
        ].map(([color, label]) => (
          <div key={label} className="mt-2 flex items-center gap-3 px-3 text-[14px] text-zinc-400">
            <span className="h-2 w-2 rounded-full" style={{ background: color }} />
            {label}
          </div>
        ))}
        <div className="mt-auto rounded-xl border border-white/[0.06] bg-gradient-to-br from-violet-500/15 to-cyan-400/5 p-4">
          <div className="text-[13px] font-medium">Forecast ready</div>
          <div className="mt-1 text-[12px] leading-relaxed text-zinc-400">
            Q4 revenue is tracking 8% above plan.
          </div>
          <div className="mt-3 text-[12px] font-medium text-violet-300">View forecast →</div>
        </div>
        <div className="mt-4 flex items-center gap-3 px-1">
          <Avatar name="Maya Okafor" size={32} hue={265} />
          <div>
            <div className="text-[13px] font-medium">Maya Okafor</div>
            <div className="text-[12px] text-zinc-500">Finance lead</div>
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col px-7 pt-5">
        <header className="flex items-center">
          <div>
            <div className="text-[13px] text-zinc-500">Production / Overview</div>
            <h1 className="mt-0.5 text-[24px] font-semibold tracking-tight">Revenue overview</h1>
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5 text-[13px]">
              {["7D", "30D", "90D", "12M"].map((range) => (
                <span
                  key={range}
                  className={`rounded-md px-3 py-1.5 ${range === "30D" ? "bg-white/10 text-white" : "text-zinc-500"}`}
                >
                  {range}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[13px] text-zinc-300">
              <Icon name="calendar" size={15} />
              Oct 1 – Oct 31
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-[13px] font-medium text-black">
              <Icon name="download" size={15} />
              Export
            </div>
          </div>
        </header>

        <section className="mt-5 grid grid-cols-4 gap-4">
          {KPIS.map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-white/[0.06] bg-[#0f0f15] p-4">
              <div className="text-[13px] text-zinc-400">{kpi.label}</div>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <div className="text-[26px] font-semibold tracking-tight">{kpi.value}</div>
                  <div
                    className={`mt-1 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] font-medium ${kpi.up ? "bg-emerald-400/10 text-emerald-300" : "bg-rose-400/10 text-rose-300"}`}
                  >
                    <Icon name={kpi.up ? "arrowUp" : "arrowDown"} size={12} stroke={2.4} />
                    {kpi.delta}
                  </div>
                </div>
                <Sparkline seed={kpi.seed} up={kpi.up} />
              </div>
            </div>
          ))}
        </section>

        <section className="mt-4 flex gap-4">
          <div className="min-w-0 flex-1 rounded-2xl border border-white/[0.06] bg-[#0f0f15] p-5">
            <div className="flex items-start">
              <div>
                <div className="text-[14px] text-zinc-400">Net revenue</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-[30px] font-semibold tracking-tight">$612,908</span>
                  <span className="text-[13px] text-emerald-300">+18.2% vs Sep</span>
                </div>
              </div>
              <div className="ml-auto flex gap-4 text-[13px] text-zinc-400">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-violet-500" />
                  New business
                </span>
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  Expansion
                </span>
              </div>
            </div>
            <div className="relative mt-4 flex">
              <div
                className="flex h-[230px] w-[44px] flex-col justify-between pb-0 text-[11px] text-zinc-600"
                style={{ fontFamily: MONO }}
              >
                {["$100k", "$75k", "$50k", "$25k", "$0"].map((tick) => (
                  <span key={tick} className="-translate-y-1.5">{tick}</span>
                ))}
              </div>
              <svg width={W} height={H} className="overflow-visible">
                <defs>
                  <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#8b5cf6" stopOpacity="0.45" />
                    <stop offset="1" stopColor="#8b5cf6" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="exp" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0" stopColor="#22d3ee" stopOpacity="0.25" />
                    <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                  <line key={t} x1="0" x2={W} y1={t * H} y2={t * H} stroke="#ffffff" strokeOpacity="0.05" />
                ))}
                <path d={areaPath(revenuePts, H)} fill="url(#rev)" />
                <path d={smoothPath(revenuePts)} fill="none" stroke="#a78bfa" strokeWidth="2.5" />
                <path d={areaPath(expansionPts, H)} fill="url(#exp)" />
                <path d={smoothPath(expansionPts)} fill="none" stroke="#22d3ee" strokeWidth="2" />
                <line x1={focus.x} x2={focus.x} y1="0" y2={H} stroke="#ffffff" strokeOpacity="0.18" strokeDasharray="3 4" />
                <circle cx={focus.x} cy={focus.y} r="6" fill="#0f0f15" stroke="#a78bfa" strokeWidth="3" />
              </svg>
              <div
                className="absolute rounded-xl border border-white/10 bg-[#17171f]/95 px-3.5 py-3 text-[12px] shadow-2xl"
                style={{ left: 44 + focus.x + 16, top: focus.y - 70 }}
              >
                <div className="text-zinc-400">Oct 22</div>
                <div className="mt-1.5 flex items-center gap-6">
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                    New
                  </span>
                  <span className="ml-auto font-medium">$21,480</span>
                </div>
                <div className="mt-1 flex items-center gap-6">
                  <span className="flex items-center gap-1.5 text-zinc-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    Expansion
                  </span>
                  <span className="ml-auto font-medium">$8,215</span>
                </div>
              </div>
            </div>
            <div className="mt-2 ml-[44px] flex justify-between text-[11px] text-zinc-600" style={{ fontFamily: MONO }}>
              {["Oct 1", "Oct 8", "Oct 15", "Oct 22", "Oct 31"].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </div>
          <div className="w-[236px] rounded-2xl border border-white/[0.06] bg-[#0f0f15] p-5">
            <div className="text-[14px] text-zinc-400">Revenue by plan</div>
            <div className="relative mt-4 flex justify-center">
              <Donut />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[22px] font-semibold">3 plans</div>
                <div className="text-[12px] text-zinc-500">6,912 seats</div>
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-2.5 text-[13px]">
              {[
                ["#8b5cf6", "Scale", "46%"],
                ["#22d3ee", "Growth", "34%"],
                ["#f472b6", "Starter", "20%"],
              ].map(([color, label, share]) => (
                <div key={label} className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
                  <span className="text-zinc-300">{label}</span>
                  <span className="ml-auto font-medium">{share}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-4 mb-6 flex min-h-0 flex-1 gap-4">
          <div className="flex-1 rounded-2xl border border-white/[0.06] bg-[#0f0f15] p-5">
            <div className="flex items-center">
              <div className="text-[15px] font-medium">Recent payments</div>
              <div className="ml-auto text-[13px] text-zinc-500">View all</div>
            </div>
            <div className="mt-3 grid grid-cols-[1.4fr_1.2fr_1fr_0.8fr] border-b border-white/[0.06] pb-2 text-[12px] text-zinc-500">
              <span>Customer</span>
              <span>Plan</span>
              <span>Amount</span>
              <span>Status</span>
            </div>
            {ROWS.map(([name, plan, amount, status, hue]) => (
              <div
                key={name}
                className="grid grid-cols-[1.4fr_1.2fr_1fr_0.8fr] items-center border-b border-white/[0.04] py-[7px] text-[13px] last:border-0"
              >
                <span className="flex items-center gap-2.5">
                  <Avatar name={name} size={24} hue={hue} />
                  {name}
                </span>
                <span className="text-zinc-400">{plan}</span>
                <span style={{ fontFamily: MONO }} className="text-[12.5px]">{amount}</span>
                <span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11.5px] font-medium ${
                      status === "Paid"
                        ? "bg-emerald-400/10 text-emerald-300"
                        : status === "Pending"
                          ? "bg-amber-400/10 text-amber-300"
                          : "bg-zinc-400/10 text-zinc-400"
                    }`}
                  >
                    {status}
                  </span>
                </span>
              </div>
            ))}
          </div>
          <div className="w-[300px] rounded-2xl border border-white/[0.06] bg-[#0f0f15] p-5">
            <div className="text-[15px] font-medium">Top channels</div>
            <div className="mt-1 text-[12px] text-zinc-500">Share of new subscribers</div>
            <div className="mt-5 flex flex-col gap-4">
              {CHANNELS.map(([label, share], index) => (
                <div key={label}>
                  <div className="flex text-[13px]">
                    <span className="text-zinc-300">{label}</span>
                    <span className="ml-auto font-medium">{share}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/[0.06]">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(share / 42) * 100}%`,
                        background: ["#8b5cf6", "#22d3ee", "#f472b6", "#fbbf24"][index],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  </Canvas>
);
