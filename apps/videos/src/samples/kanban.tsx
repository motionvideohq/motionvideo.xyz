import { INTER } from "./fonts";
import type { IconName } from "./kit";
import { Avatar, Canvas, Icon } from "./kit";

/** Mossbank: a colourful sprint board for a product team. */
type Task = {
  title: string;
  tag: [string, string, string];
  people: string[];
  comments?: number;
  files?: number;
  progress?: number;
  cover?: string;
  priority?: "High" | "Urgent";
};

const TAGS = {
  design: ["Design", "#fce7f3", "#be185d"],
  web: ["Web", "#dbeafe", "#1d4ed8"],
  ios: ["iOS", "#ede9fe", "#6d28d9"],
  research: ["Research", "#dcfce7", "#15803d"],
  growth: ["Growth", "#ffedd5", "#c2410c"],
  infra: ["Infra", "#e0f2fe", "#0369a1"],
} satisfies Record<string, [string, string, string]>;

const COLUMNS: { name: string; color: string; tasks: Task[] }[] = [
  {
    name: "Backlog",
    color: "#a1a1aa",
    tasks: [
      { title: "Interview five churned teams about invites", tag: TAGS.research, people: ["Ivy Chen"], comments: 4 },
      { title: "Empty states for reports", tag: TAGS.design, people: ["Noor Haddad", "Leo Park"], files: 2 },
      { title: "Rate-limit public webhooks", tag: TAGS.infra, people: ["Ravi Shah"], comments: 1 },
      { title: "Audit colour contrast in charts", tag: TAGS.design, people: ["Leo Park"], comments: 2, files: 1 },
      { title: "Pricing page A/B: annual toggle default", tag: TAGS.growth, people: ["Maja Holm", "Ivy Chen"] },
    ],
  },
  {
    name: "To do",
    color: "#f59e0b",
    tasks: [
      {
        title: "Referral landing page",
        tag: TAGS.growth,
        people: ["Maja Holm", "Ivy Chen"],
        cover: "linear-gradient(135deg,#fde68a,#fb923c 55%,#f472b6)",
        comments: 6,
        files: 3,
      },
      { title: "Widget picker keyboard support", tag: TAGS.web, people: ["Leo Park"], priority: "High" },
      { title: "Usability test: new navigation", tag: TAGS.research, people: ["Ivy Chen", "Noor Haddad"], comments: 5, files: 2 },
      { title: "Push notification settings screen", tag: TAGS.ios, people: ["Tomas Ruiz"], comments: 1 },
    ],
  },
  {
    name: "In progress",
    color: "#3b82f6",
    tasks: [
      { title: "New onboarding checklist", tag: TAGS.design, people: ["Noor Haddad", "Maja Holm", "Leo Park"], progress: 0.64, comments: 12, files: 5 },
      { title: "Offline drafts on iPhone", tag: TAGS.ios, people: ["Tomas Ruiz"], progress: 0.3, priority: "Urgent", comments: 3 },
      { title: "Move image uploads to edge storage", tag: TAGS.infra, people: ["Ravi Shah", "Ivy Chen"], progress: 0.82, files: 1 },
    ],
  },
  {
    name: "Review",
    color: "#8b5cf6",
    tasks: [
      {
        title: "Dark mode for the mobile app",
        tag: TAGS.ios,
        people: ["Tomas Ruiz", "Noor Haddad"],
        cover: "linear-gradient(135deg,#1e1b4b,#4338ca 60%,#a78bfa)",
        comments: 8,
      },
      { title: "Billing page copy pass", tag: TAGS.growth, people: ["Maja Holm"], comments: 2 },
      { title: "Retry queue for failed exports", tag: TAGS.infra, people: ["Ravi Shah"], progress: 1, files: 2 },
      { title: "Share sheet for reports", tag: TAGS.web, people: ["Leo Park", "Noor Haddad"], comments: 4 },
    ],
  },
];

const Meta = ({ icon, value }: { icon: IconName; value: number }) => (
  <span className="flex items-center gap-1">
    <Icon name={icon} size={13} />
    {value}
  </span>
);

const Card = ({ task }: { task: Task }) => (
  <div className="rounded-xl border border-black/[0.06] bg-white p-3.5 shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
    {task.cover ? (
      <div className="relative mb-3 h-[92px] overflow-hidden rounded-lg" style={{ background: task.cover }}>
        <div className="absolute bottom-3 left-3 h-[44px] w-[70px] rounded-md bg-white/85 p-1.5 shadow">
          <div className="h-1.5 w-8 rounded bg-black/20" />
          <div className="mt-1.5 h-1.5 w-12 rounded bg-black/10" />
          <div className="mt-1.5 h-3 w-6 rounded bg-black/70" />
        </div>
        <div className="absolute top-3 right-3 h-[60px] w-[34px] rounded-md border-2 border-white/80 bg-white/30" />
      </div>
    ) : null}
    <div className="flex items-center gap-1.5">
      <span className="rounded-md px-2 py-0.5 text-[11.5px] font-medium" style={{ background: task.tag[1], color: task.tag[2] }}>
        {task.tag[0]}
      </span>
      {task.priority ? (
        <span className={`rounded-md px-2 py-0.5 text-[11.5px] font-medium ${task.priority === "Urgent" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"}`}>
          {task.priority}
        </span>
      ) : null}
    </div>
    <div className="mt-2 text-[14px] leading-snug font-medium text-zinc-900">{task.title}</div>
    {task.progress === undefined ? null : (
      <div className="mt-3">
        <div className="flex text-[11.5px] text-zinc-500">
          Progress
          <span className="ml-auto font-medium text-zinc-700">{Math.round(task.progress * 100)}%</span>
        </div>
        <div className="mt-1.5 h-1.5 rounded-full bg-zinc-100">
          <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${task.progress * 100}%` }} />
        </div>
      </div>
    )}
    <div className="mt-3 flex items-center text-[12px] text-zinc-400">
      <div className="flex -space-x-1.5">
        {task.people.map((name) => (
          <Avatar key={name} name={name} size={22} ring="#fff" />
        ))}
      </div>
      <div className="ml-auto flex gap-3">
        {task.comments ? <Meta icon="message" value={task.comments} /> : null}
        {task.files ? <Meta icon="paperclip" value={task.files} /> : null}
      </div>
    </div>
  </div>
);

export const Kanban = () => (
  <Canvas scale={1.25} className="bg-[#f4f4f1] text-zinc-900" style={{ fontFamily: INTER }}>
    <div className="flex h-full flex-col">
      <header className="flex items-center border-b border-black/[0.06] bg-white px-7 py-3.5">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 grid-cols-2 gap-[3px] rounded-lg bg-[#166534] p-[5px]">
            <span className="rounded-full bg-[#86efac]" />
            <span className="rounded-sm bg-white" />
            <span className="rounded-sm bg-white" />
            <span className="rounded-full bg-[#86efac]" />
          </div>
          <span className="text-[16px] font-semibold">Mossbank</span>
        </div>
        <Icon name="chevronRight" size={16} className="mx-3 text-zinc-300" />
        <span className="text-[14px] text-zinc-500">Product</span>
        <Icon name="chevronRight" size={16} className="mx-3 text-zinc-300" />
        <span className="text-[14px] font-medium">Sprint 24</span>
        <div className="ml-auto flex items-center gap-3">
          <div className="flex w-[220px] items-center gap-2 rounded-lg bg-zinc-100 px-3 py-2 text-[13px] text-zinc-400">
            <Icon name="search" size={15} />
            Search tasks
          </div>
          <Icon name="bell" size={19} className="text-zinc-500" />
          <Avatar name="Maja Holm" size={30} />
        </div>
      </header>

      <div className="flex items-end px-7 pt-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-semibold tracking-tight">Sprint 24</h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[12px] font-medium text-emerald-700">Active</span>
          </div>
          <div className="mt-1 text-[13.5px] text-zinc-500">Nov 4 – Nov 15 · 14 of 23 tasks done · 6 days left</div>
        </div>
        <div className="ml-auto flex items-center gap-2.5">
          <div className="flex -space-x-2">
            {["Ivy Chen", "Noor Haddad", "Leo Park", "Ravi Shah", "Tomas Ruiz"].map((name) => (
              <Avatar key={name} name={name} size={30} ring="#f4f4f1" />
            ))}
          </div>
          <span className="flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-[13px] font-medium">
            <Icon name="filter" size={14} />
            Filter
          </span>
          <span className="flex items-center gap-1.5 rounded-lg bg-[#166534] px-3 py-2 text-[13px] font-medium text-white">
            <Icon name="plus" size={15} stroke={2.4} />
            New task
          </span>
        </div>
      </div>

      <div className="flex gap-1 px-7 pt-4 text-[13.5px]">
        {["Board", "List", "Timeline", "Files"].map((view) => (
          <span key={view} className={`rounded-md px-3 py-1.5 ${view === "Board" ? "bg-white font-medium shadow-sm" : "text-zinc-500"}`}>
            {view}
          </span>
        ))}
      </div>

      <div className="grid flex-1 grid-cols-4 gap-4 overflow-hidden px-7 pt-4">
        {COLUMNS.map((column) => (
          <div key={column.name} className="flex flex-col gap-3 rounded-2xl bg-black/[0.03] p-3">
            <div className="flex items-center gap-2 px-1 text-[13.5px] font-semibold">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: column.color }} />
              {column.name}
              <span className="rounded-md bg-black/[0.06] px-1.5 text-[12px] font-medium text-zinc-500">{column.tasks.length}</span>
              <Icon name="plus" size={16} className="ml-auto text-zinc-400" />
            </div>
            {column.tasks.map((task) => (
              <Card key={task.title} task={task} />
            ))}
          </div>
        ))}
      </div>
    </div>
  </Canvas>
);
