import { GEIST, MONO } from "./fonts";
import type { IconName } from "./kit";
import { Avatar, Canvas, Icon } from "./kit";

const SHORTCUTS: [IconName, string][] = [
  ["message", "Threads"],
  ["bell", "Mentions"],
  ["bookmark", "Saved"],
];

/** Quillo: a dark team-chat app mid-conversation. */
const CHANNELS = [
  ["general", 0],
  ["design-crit", 3],
  ["launch-week", 12],
  ["eng-platform", 0],
  ["customer-voice", 1],
  ["random", 0],
] as const;
const DIRECT = [
  ["Aiko Tanaka", true],
  ["Marcus Bell", true],
  ["Sofia Lindqvist", false],
] as const;

type Message = {
  who: string;
  hue: number;
  time: string;
  text: string;
  reactions?: [string, number][];
  attachment?: "shot" | "code";
  thread?: number;
};

const MESSAGES: Message[] = [
  {
    who: "Aiko Tanaka",
    hue: 330,
    time: "10:02",
    text: "Pushed the new pricing hero to staging. The plan cards finally line up on mobile.",
    attachment: "shot",
    reactions: [
      ["🔥", 6],
      ["👀", 2],
    ],
  },
  {
    who: "Marcus Bell",
    hue: 200,
    time: "10:05",
    text: "Looks great. One thing: the yearly toggle jumps 2px when it switches. Fix is tiny:",
    attachment: "code",
  },
  {
    who: "Sofia Lindqvist",
    hue: 140,
    time: "10:09",
    text: "Can we ship this with Thursday's release? Support has had three tickets this week asking about seat pricing.",
    thread: 4,
  },
  {
    who: "Aiko Tanaka",
    hue: 330,
    time: "10:11",
    text: "Yes, merging after Marcus approves. I'll post the before/after in #launch-week.",
    reactions: [["✅", 3]],
  },
];

const Shot = () => (
  <div className="mt-2.5 w-[420px] overflow-hidden rounded-xl border border-white/10 bg-[#f7f5f0]">
    <div className="flex h-[150px] flex-col items-center justify-center gap-3 px-6">
      <div className="h-3 w-40 rounded bg-black/80" />
      <div className="h-2 w-56 rounded bg-black/20" />
      <div className="mt-2 flex gap-2.5">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={`flex h-[64px] w-[88px] flex-col gap-1.5 rounded-lg p-2 ${index === 1 ? "bg-[#1f3b2b]" : "border border-black/10 bg-white"}`}
          >
            <div className={`h-1.5 w-8 rounded ${index === 1 ? "bg-white/70" : "bg-black/30"}`} />
            <div className={`h-3 w-10 rounded ${index === 1 ? "bg-white" : "bg-black/70"}`} />
            <div className={`mt-auto h-2.5 w-full rounded ${index === 1 ? "bg-white" : "bg-black/10"}`} />
          </div>
        ))}
      </div>
    </div>
    <div className="flex items-center gap-2 border-t border-white/10 bg-[#1a1a20] px-3 py-2 text-[12px] text-zinc-400">
      <Icon name="file" size={14} />
      pricing-hero-mobile.png
      <span className="ml-auto">412 KB</span>
    </div>
  </div>
);

const Code = () => (
  <div
    className="mt-2.5 w-[520px] rounded-xl border border-white/10 bg-[#0d0d12] px-4 py-3 text-[12.5px] leading-[1.7]"
    style={{ fontFamily: MONO }}
  >
    <div>
      <span className="text-[#c792ea]">.billing-toggle</span> <span className="text-zinc-400">{"{"}</span>
    </div>
    <div className="pl-4">
      <span className="text-rose-300/70 line-through">padding: 6px 14px;</span>
    </div>
    <div className="pl-4">
      <span className="text-[#7fdbca]">padding</span>
      <span className="text-zinc-400">: </span>
      <span className="text-[#f78c6c]">5px 14px 7px</span>
      <span className="text-zinc-400">;</span>
    </div>
    <div className="pl-4">
      <span className="text-[#7fdbca]">min-height</span>
      <span className="text-zinc-400">: </span>
      <span className="text-[#f78c6c]">32px</span>
      <span className="text-zinc-400">;</span>
    </div>
    <div className="text-zinc-400">{"}"}</div>
  </div>
);

export const Chat = () => (
  <Canvas scale={1.25} className="bg-[#111116] text-zinc-100" style={{ fontFamily: GEIST }}>
    <div className="flex h-full">
      <div className="flex w-[68px] flex-col items-center gap-3 bg-[#0a0a0d] py-4">
        {[
          ["Q", "from-amber-400 to-orange-500"],
          ["N", "from-sky-400 to-indigo-500"],
          ["K", "from-emerald-400 to-teal-600"],
        ].map(([letter, gradient], index) => (
          <div key={letter} className="relative">
            {index === 0 ? <div className="absolute top-2 -left-[14px] h-8 w-1 rounded-r bg-white" /> : null}
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-[18px] font-bold text-white ${gradient}`}>
              {letter}
            </div>
          </div>
        ))}
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-dashed border-white/15 text-zinc-500">
          <Icon name="plus" size={18} />
        </div>
      </div>

      <aside className="flex w-[248px] flex-col bg-[#15151b] px-3 py-4">
        <div className="flex items-center px-2">
          <span className="text-[16px] font-semibold">Quillo HQ</span>
          <Icon name="chevronDown" size={16} className="ml-1 text-zinc-500" />
          <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06]">
            <Icon name="file" size={15} />
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-0.5 text-[14px] text-zinc-400">
          {SHORTCUTS.map(([icon, label]) => (
            <div key={label} className="flex items-center gap-2.5 px-2 py-1.5">
              <Icon name={icon} size={16} />
              {label}
            </div>
          ))}
        </div>
        <div className="mt-5 px-2 text-[12px] font-medium tracking-wide text-zinc-500 uppercase">Channels</div>
        <div className="mt-1.5 flex flex-col gap-0.5 text-[14px]">
          {CHANNELS.map(([name, unread]) => (
            <div
              key={name}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${name === "launch-week" ? "bg-[#f59e0b]/15 text-amber-200" : unread ? "font-medium text-white" : "text-zinc-400"}`}
            >
              <Icon name="hash" size={15} />
              {name}
              {unread ? (
                <span className="ml-auto rounded-full bg-[#f59e0b] px-1.5 text-[11px] font-semibold text-black">{unread}</span>
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-5 px-2 text-[12px] font-medium tracking-wide text-zinc-500 uppercase">Direct messages</div>
        <div className="mt-1.5 flex flex-col gap-1 text-[14px] text-zinc-300">
          {DIRECT.map(([name, online]) => (
            <div key={name} className="flex items-center gap-2.5 px-2 py-1">
              <div className="relative">
                <Avatar name={name} size={22} />
                <span
                  className={`absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#15151b] ${online ? "bg-emerald-400" : "bg-zinc-600"}`}
                />
              </div>
              {name}
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-2.5 rounded-xl bg-white/[0.04] p-2.5">
          <Avatar name="Dev Kapoor" size={32} hue={40} />
          <div>
            <div className="text-[13px] font-medium">Dev Kapoor</div>
            <div className="text-[12px] text-emerald-400">Active</div>
          </div>
          <Icon name="sliders" size={16} className="ml-auto text-zinc-500" />
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center border-b border-white/[0.06] px-6 py-3.5">
          <Icon name="hash" size={18} className="text-zinc-400" />
          <span className="ml-1.5 text-[16px] font-semibold">launch-week</span>
          <span className="ml-3 text-[13px] text-zinc-500">Everything shipping Nov 14</span>
          <div className="ml-auto flex items-center gap-4 text-zinc-400">
            <div className="flex -space-x-1.5">
              {["Aiko Tanaka", "Marcus Bell", "Sofia Lindqvist"].map((name) => (
                <Avatar key={name} name={name} size={24} ring="#111116" />
              ))}
            </div>
            <span className="text-[13px]">24</span>
            <Icon name="video" size={18} />
            <Icon name="search" size={18} />
          </div>
        </header>

        <div className="flex flex-1 flex-col justify-end gap-5 overflow-hidden px-6 pb-4">
          <div className="flex items-center gap-3 text-[12px] text-zinc-500">
            <div className="h-px flex-1 bg-white/[0.06]" />
            Today
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>
          {MESSAGES.map((message) => (
            <div key={message.time} className="flex gap-3.5">
              <Avatar name={message.who} size={38} hue={message.hue} />
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-[14.5px] font-semibold">{message.who}</span>
                  <span className="text-[12px] text-zinc-500">{message.time}</span>
                </div>
                <div className="mt-0.5 max-w-[640px] text-[14.5px] leading-relaxed text-zinc-300">{message.text}</div>
                {message.attachment === "shot" ? <Shot /> : null}
                {message.attachment === "code" ? <Code /> : null}
                {message.reactions ? (
                  <div className="mt-2 flex gap-1.5">
                    {message.reactions.map(([emoji, count]) => (
                      <span key={emoji} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[12.5px]">
                        {emoji}
                        <span className="text-zinc-300">{count}</span>
                      </span>
                    ))}
                  </div>
                ) : null}
                {message.thread ? (
                  <div className="mt-2 flex items-center gap-2 text-[13px] font-medium text-amber-300">
                    <div className="flex -space-x-1">
                      <Avatar name="Marcus Bell" size={18} hue={200} />
                      <Avatar name="Aiko Tanaka" size={18} hue={330} />
                    </div>
                    {message.thread} replies
                    <span className="font-normal text-zinc-500">Last reply 2 min ago</span>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 text-[12.5px] text-zinc-500">
            <span className="flex gap-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500/70" />
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500/40" />
            </span>
            Marcus is typing…
          </div>
        </div>

        <div className="mx-6 mb-5 rounded-2xl border border-white/10 bg-[#18181f]">
          <div className="px-4 pt-3.5 text-[14.5px] text-zinc-500">Message #launch-week</div>
          <div className="flex items-center gap-3 px-3 pt-3 pb-2.5 text-zinc-500">
            <Icon name="plus" size={18} />
            <Icon name="paperclip" size={17} />
            <Icon name="smile" size={17} />
            <span className="text-[13px]">@</span>
            <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-black">
              <Icon name="send" size={15} stroke={2.2} />
            </div>
          </div>
        </div>
      </main>
    </div>
  </Canvas>
);
