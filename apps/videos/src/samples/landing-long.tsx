import { BRICOLAGE, GEIST } from "./fonts";
import type { IconName } from "./kit";
import { Avatar, Canvas, Icon } from "./kit";

/** Brightloom: a full landing page for a docs tool, tall enough to scroll. */
const ACCENT = "#5b47ff";
const LOGOS = [
  ["Kitebird", "font-bold tracking-tight"],
  ["ORCHARD&PINE", "font-semibold tracking-[0.18em] text-[15px]"],
  ["halden", "font-medium italic"],
  ["Marlowe", "font-bold"],
  ["fenwick.", "font-semibold tracking-tight"],
  ["NORTHVALE", "font-bold tracking-[0.1em] text-[16px]"],
];
const FEATURES: { icon: IconName; title: string; text: string; tint: string }[] = [
  { icon: "file", title: "Write together", text: "Live cursors, suggestions and comments in every doc. No more \"final-v3\".", tint: "#ede9fe" },
  { icon: "sparkles", title: "Answers, not search", text: "Ask a question and get the paragraph that answers it, with a link to the source.", tint: "#fef3c7" },
  { icon: "link", title: "Linked to the work", text: "Embed live tickets, designs and dashboards. They update when the work does.", tint: "#dcfce7" },
];
const QUOTES = [
  {
    quote: "We replaced three wikis and a shared drive. New engineers now find answers on day one instead of week three.",
    name: "Hana Kowalski",
    role: "VP Engineering, Kitebird",
  },
  {
    quote: "The ask box is the feature. Support uses it forty times a day and our docs finally pay for themselves.",
    name: "Diego Alvarez",
    role: "Head of Support, Marlowe",
  },
  {
    quote: "Specs stay in sync with the tickets. Our planning meetings got shorter, which nobody expected.",
    name: "Grace Mbeki",
    role: "Product Lead, Halden",
  },
];

const DocMock = () => (
  <div className="flex h-full">
    <div className="w-[220px] border-r border-black/[0.06] bg-[#fafafa] p-4 text-[13px] text-zinc-600">
      <div className="flex items-center gap-2 font-semibold text-zinc-900">
        <span className="h-5 w-5 rounded-md" style={{ background: ACCENT }} />
        Acme Handbook
      </div>
      <div className="mt-5 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Engineering</div>
      {["Onboarding", "Architecture", "On-call guide", "Release process"].map((item) => (
        <div key={item} className={`mt-1.5 rounded-md px-2 py-1 ${item === "Release process" ? "bg-[#ede9fe] font-medium text-[#3f2fd6]" : ""}`}>
          {item}
        </div>
      ))}
      <div className="mt-5 text-[11px] font-semibold tracking-wider text-zinc-400 uppercase">Product</div>
      {["Roadmap", "Specs", "Research"].map((item) => (
        <div key={item} className="mt-1.5 px-2 py-1">{item}</div>
      ))}
    </div>
    <div className="relative flex-1 px-14 py-10">
      <div className="text-[13px] text-zinc-400">Engineering / Release process</div>
      <div className="mt-2 text-[34px] font-semibold tracking-tight" style={{ fontFamily: BRICOLAGE }}>
        Release process
      </div>
      <div className="mt-4 flex items-center gap-2 text-[13px] text-zinc-500">
        <div className="flex -space-x-1.5">
          <Avatar name="Hana Kowalski" size={22} ring="#fff" />
          <Avatar name="Diego Alvarez" size={22} ring="#fff" />
        </div>
        Edited 2 hours ago · 6 min read
      </div>
      <div className="mt-6 max-w-[560px] text-[15px] leading-[1.75] text-zinc-700">
        We ship every Tuesday and Thursday. A release goes out when the
        <span className="relative mx-1 rounded bg-[#fef3c7] px-1">checklist is green
          <span className="absolute -top-6 left-0 rounded bg-[#f59e0b] px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap text-white">Diego</span>
        </span>
        and the on-call engineer has signed off.
      </div>
      <div className="mt-5 max-w-[560px] rounded-xl border border-black/[0.08] p-4">
        <div className="flex items-center gap-2 text-[13px] font-medium">
          <span className="rounded bg-[#dcfce7] px-1.5 py-0.5 text-[11px] text-[#15803d]">Live</span>
          REL-482 · Thursday release
          <span className="ml-auto text-zinc-400">7 of 8 checks</span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-zinc-100">
          <div className="h-1.5 w-[87%] rounded-full bg-[#22c55e]" />
        </div>
      </div>
      <div className="absolute top-10 right-8 w-[250px] rounded-xl border border-black/[0.08] bg-white p-4 shadow-xl">
        <div className="flex items-center gap-2">
          <Avatar name="Grace Mbeki" size={26} />
          <div className="text-[13px] font-semibold">Grace Mbeki</div>
          <span className="ml-auto text-[11px] text-zinc-400">now</span>
        </div>
        <div className="mt-2 text-[13px] leading-relaxed text-zinc-600">
          Can we add the rollback steps here? Linking the runbook.
        </div>
      </div>
    </div>
  </div>
);

const FOOTER: [string, string[]][] = [
  ["Product", ["Docs", "Ask", "Templates", "Integrations"]],
  ["Company", ["About", "Careers", "Blog", "Press"]],
  ["Resources", ["Help centre", "Security", "Status", "Contact"]],
];

export const LandingLong = () => (
  <Canvas scale={1.125} className="bg-white text-[#101014]" style={{ fontFamily: GEIST }}>
    <div className="flex h-full flex-col">
      <section className="relative overflow-hidden pb-24" style={{ background: "linear-gradient(180deg,#f3f1ff 0%,#ffffff 100%)" }}>
        <div className="absolute top-[-200px] left-1/2 h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-[#c4b5fd] opacity-40 blur-[140px]" />
        <nav className="relative flex items-center px-16 py-6">
          <div className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 28 28">
              <rect width="28" height="28" rx="8" fill={ACCENT} />
              <path d="M8 19c3-8 9-8 12 0" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" />
              <circle cx="14" cy="10" r="2.6" fill="#ffd166" />
            </svg>
            <span className="text-[19px] font-semibold tracking-tight">Brightloom</span>
          </div>
          <div className="ml-14 flex gap-8 text-[15px] text-zinc-600">
            {["Product", "Templates", "Customers", "Pricing", "Docs"].map((link) => (
              <span key={link}>{link}</span>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-5 text-[15px]">
            <span className="text-zinc-600">Log in</span>
            <span className="rounded-xl px-4 py-2.5 font-medium text-white" style={{ background: ACCENT }}>Try it free</span>
          </div>
        </nav>
        <div className="relative mt-16 flex flex-col items-center text-center">
          <span className="flex items-center gap-2 rounded-full border border-[#5b47ff]/20 bg-white px-3 py-1 text-[13px] font-medium text-[#3f2fd6]">
            <Icon name="sparkles" size={14} />
            Ask your docs anything, now in every workspace
          </span>
          <h1 className="mt-7 max-w-[980px] text-[86px] leading-[0.95] font-extrabold tracking-[-0.04em]" style={{ fontFamily: BRICOLAGE }}>
            Docs your whole team <span style={{ color: ACCENT }}>actually reads</span>
          </h1>
          <p className="mt-6 max-w-[620px] text-[19px] leading-relaxed text-zinc-600">
            Brightloom is the shared home for specs, handbooks and decisions,
            with answers one question away.
          </p>
          <div className="mt-8 flex gap-3">
            <span className="flex items-center gap-2 rounded-xl px-6 py-3.5 text-[16px] font-medium text-white shadow-[0_12px_30px_-10px_rgba(91,71,255,0.8)]" style={{ background: ACCENT }}>
              Start for free
              <Icon name="arrowRight" size={17} />
            </span>
            <span className="rounded-xl border border-black/10 bg-white px-6 py-3.5 text-[16px] font-medium">Watch the 2-min tour</span>
          </div>
        </div>
        <div className="relative mx-auto mt-16 h-[500px] w-[1100px] overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_40px_100px_-30px_rgba(60,40,160,0.45)]">
          <DocMock />
        </div>
      </section>

      <section className="px-16 py-14 text-center">
        <div className="text-[14px] text-zinc-500">Trusted by 9,000+ teams who write things down</div>
        <div className="mt-8 flex items-center justify-between px-10 text-[22px] text-zinc-400">
          {LOGOS.map(([name, style]) => (
            <span key={name} className={style}>{name}</span>
          ))}
        </div>
      </section>

      <section className="px-16 py-20">
        <div className="text-center">
          <div className="text-[14px] font-semibold tracking-[0.14em] uppercase" style={{ color: ACCENT }}>Why Brightloom</div>
          <h2 className="mt-3 text-[52px] leading-[1.02] font-extrabold tracking-[-0.03em]" style={{ fontFamily: BRICOLAGE }}>
            Everything your team knows,
            <br />
            in one place that stays current
          </h2>
        </div>
        <div className="mt-14 grid grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="rounded-3xl border border-black/[0.07] bg-[#fbfbfd] p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: feature.tint }}>
                <Icon name={feature.icon} size={22} />
              </div>
              <div className="mt-6 text-[22px] font-semibold tracking-tight">{feature.title}</div>
              <div className="mt-2 text-[16px] leading-relaxed text-zinc-600">{feature.text}</div>
              <div className="mt-6 flex h-[120px] flex-col justify-center gap-2.5 rounded-2xl bg-white p-5 ring-1 ring-black/[0.05]">
                <div className="h-2.5 w-3/4 rounded bg-zinc-200" />
                <div className="h-2.5 w-full rounded bg-zinc-100" />
                <div className="h-2.5 w-2/3 rounded" style={{ background: feature.tint }} />
                <div className="h-2.5 w-5/6 rounded bg-zinc-100" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-16 grid grid-cols-2 items-center gap-16 rounded-[40px] bg-[#101014] p-16 text-white">
        <div>
          <div className="text-[14px] font-semibold tracking-[0.14em] text-[#a99dff] uppercase">Ask Brightloom</div>
          <h2 className="mt-3 text-[48px] leading-[1.02] font-extrabold tracking-[-0.03em]" style={{ fontFamily: BRICOLAGE }}>
            Type a question.
            <br />
            Get the paragraph.
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-white/65">
            Answers come straight from your own pages and always cite the
            source, so people trust them and fix them when they're wrong.
          </p>
          <div className="mt-8 flex gap-10">
            {[
              ["62%", "fewer repeat questions"],
              ["4.8×", "more docs opened weekly"],
            ].map(([value, label]) => (
              <div key={label}>
                <div className="text-[40px] font-extrabold tracking-tight" style={{ fontFamily: BRICOLAGE }}>{value}</div>
                <div className="text-[14px] text-white/55">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-[15px] text-zinc-900">
            <Icon name="search" size={18} className="text-zinc-400" />
            How do we roll back a release?
            <span className="ml-auto rounded-lg px-2 py-1 text-[12px] font-medium text-white" style={{ background: ACCENT }}>Ask</span>
          </div>
          <div className="mt-4 rounded-2xl bg-white/[0.06] p-5 text-[15px] leading-relaxed text-white/85">
            <div className="flex items-center gap-2 text-[13px] font-medium text-[#a99dff]">
              <Icon name="sparkles" size={14} />
              Answer
            </div>
            <p className="mt-2">
              Run <span className="rounded bg-white/10 px-1.5 py-0.5 text-[13px]">deploy rollback --to previous</span> from the release channel, then post in #incidents. The on-call engineer confirms in the status page.
            </p>
            <div className="mt-4 flex gap-2 text-[12px]">
              {["Release process", "On-call guide"].map((source) => (
                <span key={source} className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1">
                  <Icon name="file" size={12} />
                  {source}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-16 py-24">
        <h2 className="text-center text-[48px] leading-[1.02] font-extrabold tracking-[-0.03em]" style={{ fontFamily: BRICOLAGE }}>
          Teams that switched don't go back
        </h2>
        <div className="mt-12 grid grid-cols-3 gap-6">
          {QUOTES.map((item) => (
            <figure key={item.name} className="flex flex-col rounded-3xl border border-black/[0.07] p-8">
              <div className="flex gap-1 text-[#f59e0b]">
                {[0, 1, 2, 3, 4].map((star) => (
                  <Icon key={star} name="star" size={16} className="fill-current" />
                ))}
              </div>
              <blockquote className="mt-5 text-[18px] leading-relaxed text-zinc-800">“{item.quote}”</blockquote>
              <figcaption className="mt-auto flex items-center gap-3 pt-8">
                <Avatar name={item.name} size={40} />
                <div>
                  <div className="text-[15px] font-semibold">{item.name}</div>
                  <div className="text-[13px] text-zinc-500">{item.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="relative mx-16 overflow-hidden rounded-[40px] px-16 py-20 text-center text-white" style={{ background: `linear-gradient(135deg, ${ACCENT}, #8b5cf6 55%, #ec4899)` }}>
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full border-[40px] border-white/10" />
        <div className="absolute -right-10 -bottom-28 h-80 w-80 rounded-full bg-white/10" />
        <h2 className="relative text-[60px] leading-[1] font-extrabold tracking-[-0.03em]" style={{ fontFamily: BRICOLAGE }}>
          Write it once. Find it forever.
        </h2>
        <p className="relative mx-auto mt-5 max-w-[560px] text-[18px] text-white/85">
          Free for teams up to 10. Import from your current wiki in minutes.
        </p>
        <div className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-[16px] font-semibold" style={{ color: ACCENT }}>
          Start for free
          <Icon name="arrowRight" size={17} />
        </div>
      </section>

      <footer className="mt-auto grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 border-t border-black/[0.06] px-16 pt-14 pb-12 text-[14px]">
        <div>
          <div className="flex items-center gap-2.5">
            <svg width="24" height="24" viewBox="0 0 28 28">
              <rect width="28" height="28" rx="8" fill={ACCENT} />
              <path d="M8 19c3-8 9-8 12 0" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" />
              <circle cx="14" cy="10" r="2.6" fill="#ffd166" />
            </svg>
            <span className="text-[17px] font-semibold">Brightloom</span>
          </div>
          <div className="mt-3 max-w-[260px] leading-relaxed text-zinc-500">The shared home for everything your team knows.</div>
        </div>
        {FOOTER.map(([title, links]) => (
          <div key={title}>
            <div className="font-semibold">{title}</div>
            {links.map((link) => (
              <div key={link} className="mt-2.5 text-zinc-500">{link}</div>
            ))}
          </div>
        ))}
      </footer>
    </div>
  </Canvas>
);
