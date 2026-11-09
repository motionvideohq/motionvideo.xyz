import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

import { INTER } from "./fonts";
import type { IconName } from "./kit";
import { Avatar, Canvas, Icon } from "./kit";

/**
 * A product-community feed scrolling at a steady pace. The column holds the
 * post list twice and moves exactly one list height per loop, so the last
 * frame meets the first.
 */
type Post = {
  who: string;
  handle: string;
  when: string;
  text: string;
  height: number;
  art?: string;
  label?: string;
  stats: [number, number];
};

const POSTS: Post[] = [
  {
    who: "Nadia Petrova",
    handle: "Product designer",
    when: "2m",
    text: "Shipped our new onboarding today. Three screens instead of nine, and activation is already up.",
    height: 450,
    art: "linear-gradient(135deg,#c7d2fe,#a78bfa 50%,#f0abfc)",
    label: "Onboarding v4",
    stats: [128, 24],
  },
  {
    who: "Owen Hart",
    handle: "Founder, Tallow",
    when: "14m",
    text: "We hit $10k MRR this morning. Eleven months, two people, zero ads. Writing up everything that worked.",
    height: 180,
    stats: [342, 61],
  },
  {
    who: "Leila Farouk",
    handle: "Frontend engineer",
    when: "38m",
    text: "Before / after of the dashboard redesign. Same data, half the noise.",
    height: 450,
    art: "linear-gradient(135deg,#bbf7d0,#34d399 55%,#0ea5e9)",
    label: "Dashboard 2.0",
    stats: [96, 18],
  },
  {
    who: "Marco Bianchi",
    handle: "Indie maker",
    when: "1h",
    text: "Tiny thing that made a big difference: the empty state now shows a sample project you can poke at.",
    height: 180,
    stats: [57, 9],
  },
];
const GAP = 20;
const LOOP = POSTS.reduce((sum, post) => sum + post.height + GAP, 0);

const Art = ({ background, label }: { background: string; label: string }) => (
  <div className="relative mt-4 h-[220px] overflow-hidden rounded-2xl" style={{ background }}>
    <div className="absolute top-6 left-6 w-[300px] rounded-xl bg-white/90 p-4 shadow-lg">
      <div className="text-[13px] font-semibold text-zinc-900">{label}</div>
      <div className="mt-3 h-2 w-40 rounded bg-zinc-200" />
      <div className="mt-2 h-2 w-52 rounded bg-zinc-100" />
      <div className="mt-4 flex gap-2">
        <div className="h-7 w-20 rounded-lg bg-zinc-900" />
        <div className="h-7 w-16 rounded-lg bg-zinc-100" />
      </div>
    </div>
    <div className="absolute right-8 bottom-[-30px] h-[200px] w-[120px] rounded-[22px] border-4 border-white/80 bg-white/40 p-3">
      <div className="h-2 w-12 rounded bg-white" />
      <div className="mt-3 h-14 rounded-lg bg-white/80" />
      <div className="mt-2 h-14 rounded-lg bg-white/60" />
    </div>
  </div>
);

const Card = ({ post }: { post: Post }) => (
  <div className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]" style={{ height: post.height, marginBottom: GAP }}>
    <div className="flex items-center gap-3">
      <Avatar name={post.who} size={42} />
      <div>
        <div className="text-[15px] font-semibold text-zinc-900">{post.who}</div>
        <div className="text-[13px] text-zinc-500">
          {post.handle} · {post.when}
        </div>
      </div>
      <Icon name="more" size={20} stroke={3} className="ml-auto text-zinc-400" />
    </div>
    <div className="mt-3 text-[15.5px] leading-relaxed text-zinc-800">{post.text}</div>
    {post.art && post.label ? <Art background={post.art} label={post.label} /> : null}
    <div className="mt-4 flex gap-6 text-[13.5px] text-zinc-500">
      <span className="flex items-center gap-1.5">
        <Icon name="heart" size={17} />
        {post.stats[0]}
      </span>
      <span className="flex items-center gap-1.5">
        <Icon name="message" size={17} />
        {post.stats[1]}
      </span>
      <span className="ml-auto flex items-center gap-1.5">
        <Icon name="bookmark" size={17} />
      </span>
    </div>
  </div>
);

const NAV: [IconName, string][] = [
  ["home", "Home"],
  ["sparkles", "Launches"],
  ["users", "Makers"],
  ["bell", "Notifications"],
  ["bookmark", "Saved"],
];
const TRENDING = [
  ["#buildinpublic", "2.4k posts"],
  ["#designsystems", "1.1k posts"],
  ["#launchweek", "860 posts"],
  ["#indiehackers", "740 posts"],
];

export const ClipFeed = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const offset = interpolate(frame, [0, durationInFrames], [0, LOOP]);
  return (
    <Canvas scale={1.25} className="bg-[#f5f5f2]" style={{ fontFamily: INTER }}>
      <div className="flex h-full justify-center gap-8 px-10">
        <aside className="w-[220px] pt-8">
          <div className="flex items-center gap-2.5 px-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#ff5b35] text-white">
              <Icon name="zap" size={17} stroke={2.4} />
            </div>
            <span className="text-[18px] font-bold tracking-tight text-zinc-900">Makerline</span>
          </div>
          <div className="mt-8 flex flex-col gap-1">
            {NAV.map(([icon, label]) => (
              <div key={label} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] ${label === "Home" ? "bg-white font-semibold text-zinc-900 shadow-sm" : "text-zinc-600"}`}>
                <Icon name={icon} size={19} />
                {label}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-zinc-900 px-4 py-3 text-center text-[15px] font-semibold text-white">New post</div>
        </aside>

        <main className="relative w-[600px] overflow-hidden">
          <div style={{ transform: `translateY(${-offset}px)`, paddingTop: 32 }}>
            {[...POSTS, ...POSTS, ...POSTS].map((post, index) => (
              <Card key={`${post.who}-${index}`} post={post} />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#f5f5f2] to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#f5f5f2] to-transparent" />
        </main>

        <aside className="w-[280px] pt-8">
          <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-[14px] text-zinc-400 shadow-sm">
            <Icon name="search" size={16} />
            Search Makerline
          </div>
          <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
            <div className="text-[15px] font-semibold text-zinc-900">Trending today</div>
            {TRENDING.map(([tag, count]) => (
              <div key={tag} className="mt-4">
                <div className="text-[14.5px] font-medium text-zinc-800">{tag}</div>
                <div className="text-[12.5px] text-zinc-500">{count}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-2xl p-5 text-white" style={{ background: "linear-gradient(135deg,#ff5b35,#ff8a4c)" }}>
            <div className="text-[15px] font-semibold">Launch week starts Monday</div>
            <div className="mt-1 text-[13px] text-white/85">Schedule your post and get featured.</div>
          </div>
        </aside>
      </div>
    </Canvas>
  );
};
