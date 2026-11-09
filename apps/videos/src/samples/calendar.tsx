import { INTER } from "./fonts";
import { Avatar, Canvas, Icon } from "./kit";

/** Cadenzo: a light week calendar with colour-coded events. */
const HOUR = 76;
const FIRST = 8;
const HOURS = Array.from({ length: 10 }, (_, index) => FIRST + index);
const DAYS = [
  ["Mon", 10],
  ["Tue", 11],
  ["Wed", 12],
  ["Thu", 13],
  ["Fri", 14],
  ["Sat", 15],
  ["Sun", 16],
] as const;
const TODAY = 2;
const NOW = 13.4;

const PALETTE = {
  blue: ["#eff6ff", "#3b82f6", "#1e3a8a"],
  violet: ["#f5f3ff", "#8b5cf6", "#4c1d95"],
  green: ["#ecfdf5", "#10b981", "#064e3b"],
  orange: ["#fff7ed", "#f97316", "#7c2d12"],
  pink: ["#fdf2f8", "#ec4899", "#831843"],
  yellow: ["#fefce8", "#eab308", "#713f12"],
} as const;

type Event = {
  day: number;
  start: number;
  end: number;
  title: string;
  color: keyof typeof PALETTE;
  where?: string;
  people?: string[];
};

const EVENTS: Event[] = [
  { day: 0, start: 9, end: 9.5, title: "Team standup", color: "blue" },
  { day: 1, start: 9, end: 9.5, title: "Team standup", color: "blue" },
  { day: 2, start: 9, end: 9.5, title: "Team standup", color: "blue" },
  { day: 3, start: 9, end: 9.5, title: "Team standup", color: "blue" },
  { day: 4, start: 9, end: 9.5, title: "Team standup", color: "blue" },
  { day: 0, start: 10.5, end: 12, title: "Design review: checkout", color: "violet", where: "Room Juniper", people: ["Ana Ruiz", "Lin Zhao", "Ben Ode"] },
  { day: 0, start: 14, end: 15, title: "1:1 with Priya", color: "green", where: "Video call" },
  { day: 1, start: 11, end: 12.5, title: "Customer interview", color: "orange", where: "Video call", people: ["Kai Moreno", "Ana Ruiz"] },
  { day: 1, start: 13, end: 14, title: "Lunch with Sam", color: "yellow", where: "Café Lumiere" },
  { day: 1, start: 15, end: 17, title: "Deep work: Q1 plan", color: "pink" },
  { day: 2, start: 10, end: 11.5, title: "Roadmap sync", color: "violet", where: "Room Cedar", people: ["Ben Ode", "Lin Zhao", "Tia Brooks", "Kai Moreno"] },
  { day: 2, start: 12, end: 13, title: "Hiring debrief", color: "green", where: "Room Cedar" },
  { day: 4, start: 13, end: 14, title: "Vendor call", color: "orange", where: "Video call" },
  { day: 2, start: 14.5, end: 16, title: "Workshop: pricing experiments", color: "blue", where: "Room Juniper", people: ["Tia Brooks", "Ana Ruiz"] },
  { day: 3, start: 10, end: 11, title: "Brand check-in", color: "pink", where: "Studio" },
  { day: 3, start: 13, end: 15.5, title: "Offsite planning", color: "yellow", where: "Main hall", people: ["Lin Zhao", "Ben Ode", "Priya Nair"] },
  { day: 3, start: 16, end: 17, title: "Board prep", color: "violet" },
  { day: 4, start: 11, end: 12, title: "Demo day dry run", color: "orange", where: "Room Cedar" },
  { day: 4, start: 15, end: 16.5, title: "Team retro", color: "green", people: ["Ana Ruiz", "Ben Ode", "Kai Moreno"] },
  { day: 5, start: 10, end: 12, title: "Climbing", color: "blue", where: "Boulder Barn" },
  { day: 6, start: 11, end: 12.5, title: "Brunch", color: "yellow" },
];

const label = (hour: number) => `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? "PM" : "AM"}`;
const time = (value: number) => {
  const hour = Math.floor(value);
  const minutes = Math.round((value - hour) * 60);
  return `${hour > 12 ? hour - 12 : hour}:${String(minutes).padStart(2, "0")}`;
};

const MONTH = Array.from({ length: 35 }, (_, index) => index - 5);

export const Calendar = () => (
  <Canvas scale={1.25} className="bg-white text-zinc-900" style={{ fontFamily: INTER }}>
    <div className="flex h-full">
      <aside className="flex w-[256px] flex-col border-r border-zinc-100 bg-[#fafafa] px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-zinc-200">
            <div className="h-2.5 bg-[#ef4444]" />
            <div className="flex flex-1 items-center justify-center text-[12px] font-bold">12</div>
          </div>
          <span className="text-[17px] font-semibold tracking-tight">Cadenzo</span>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-zinc-900 py-2.5 text-[14px] font-medium text-white">
          <Icon name="plus" size={16} stroke={2.4} />
          New event
        </div>
        <div className="mt-6 flex items-center">
          <span className="text-[14px] font-semibold">November 2026</span>
          <Icon name="chevronLeft" size={16} className="ml-auto text-zinc-400" />
          <Icon name="chevronRight" size={16} className="ml-2 text-zinc-400" />
        </div>
        <div className="mt-3 grid grid-cols-7 gap-y-1 text-center text-[12px]">
          {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
            <span key={`${day}${index}`} className="pb-1 text-zinc-400">{day}</span>
          ))}
          {MONTH.map((value) => {
            const day = value < 1 ? 31 + value : value > 30 ? value - 30 : value;
            const muted = value < 1 || value > 30;
            const inWeek = value >= 10 && value <= 16;
            return (
              <span
                key={value}
                className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full ${
                  value === 12 ? "bg-[#ef4444] font-semibold text-white" : inWeek ? "bg-zinc-200/70 font-medium" : muted ? "text-zinc-300" : "text-zinc-600"
                }`}
              >
                {day}
              </span>
            );
          })}
        </div>
        <div className="mt-7 text-[12px] font-medium tracking-wider text-zinc-400 uppercase">My calendars</div>
        <div className="mt-3 flex flex-col gap-2.5 text-[14px]">
          {[
            ["Work", PALETTE.blue[1]],
            ["Product", PALETTE.violet[1]],
            ["People", PALETTE.green[1]],
            ["Customers", PALETTE.orange[1]],
            ["Focus", PALETTE.pink[1]],
            ["Personal", PALETTE.yellow[1]],
          ].map(([name, color]) => (
            <span key={name} className="flex items-center gap-2.5 text-zinc-700">
              <span className="flex h-4 w-4 items-center justify-center rounded text-white" style={{ background: color }}>
                <Icon name="check" size={11} stroke={3.2} />
              </span>
              {name}
            </span>
          ))}
        </div>
        <div className="mt-auto rounded-xl border border-zinc-200 bg-white p-3.5">
          <div className="text-[12px] font-medium text-zinc-400">UP NEXT · IN 25 MIN</div>
          <div className="mt-1.5 text-[14px] font-semibold">Workshop: pricing experiments</div>
          <div className="mt-1 text-[12.5px] text-zinc-500">2:30 – 4:00 PM · Room Juniper</div>
          <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-[#eff6ff] py-1.5 text-[12.5px] font-medium text-[#1d4ed8]">
            <Icon name="video" size={14} />
            Join call
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center px-6 py-4">
          <h1 className="text-[22px] font-semibold tracking-tight">
            November 10 – 16
          </h1>
          <span className="ml-3 rounded-md bg-zinc-100 px-2 py-0.5 text-[12px] text-zinc-500">Week 46</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-lg border border-zinc-200 px-3 py-1.5 text-[13px] font-medium">Today</span>
            <div className="flex rounded-lg bg-zinc-100 p-0.5 text-[13px]">
              {["Day", "Week", "Month"].map((view) => (
                <span key={view} className={`rounded-md px-3 py-1 ${view === "Week" ? "bg-white font-medium shadow-sm" : "text-zinc-500"}`}>{view}</span>
              ))}
            </div>
            <div className="ml-2 flex -space-x-1.5">
              {["Ana Ruiz", "Ben Ode", "Lin Zhao"].map((name) => (
                <Avatar key={name} name={name} size={28} ring="#fff" />
              ))}
            </div>
          </div>
        </header>

        <div className="flex border-b border-zinc-100 pl-[60px]">
          {DAYS.map(([day, date], index) => (
            <div key={day} className="flex flex-1 items-baseline gap-1.5 px-2 pb-3">
              <span className={`text-[12px] font-medium ${index === TODAY ? "text-[#ef4444]" : "text-zinc-400"}`}>{day}</span>
              <span
                className={`text-[20px] font-semibold ${index === TODAY ? "flex h-8 w-8 items-center justify-center rounded-full bg-[#ef4444] text-[16px] text-white" : index > 4 ? "text-zinc-400" : ""}`}
              >
                {date}
              </span>
            </div>
          ))}
        </div>

        <div className="relative flex flex-1 overflow-hidden">
          <div className="w-[60px] shrink-0">
            {HOURS.map((hour) => (
              <div key={hour} className="relative text-right text-[11px] text-zinc-400" style={{ height: HOUR }}>
                <span className="absolute -top-2 right-2.5">{hour === FIRST ? "" : label(hour)}</span>
              </div>
            ))}
          </div>
          <div className="relative flex flex-1">
            {DAYS.map(([day], index) => (
              <div key={day} className={`relative flex-1 border-l border-zinc-100 ${index > 4 ? "bg-zinc-50/80" : ""}`}>
                {HOURS.map((hour) => (
                  <div key={hour} className="border-b border-zinc-100" style={{ height: HOUR }} />
                ))}
              </div>
            ))}
            {EVENTS.map((event) => {
              const [bg, accent, ink] = PALETTE[event.color];
              const short = event.end - event.start <= 0.5;
              return (
                <div
                  key={`${event.day}-${event.start}-${event.title}`}
                  className="absolute overflow-hidden rounded-lg border-l-[3px] px-2 py-1.5"
                  style={{
                    top: (event.start - FIRST) * HOUR + 1,
                    height: (event.end - event.start) * HOUR - 3,
                    left: `calc(${(event.day / 7) * 100}% + 3px)`,
                    width: `calc(${100 / 7}% - 6px)`,
                    background: bg,
                    borderColor: accent,
                    color: ink,
                  }}
                >
                  <div className={`truncate font-semibold ${short ? "text-[11.5px]" : "text-[12.5px] leading-tight"}`}>
                    {event.title}
                    {short ? <span className="ml-1 font-normal opacity-60">{time(event.start)}</span> : null}
                  </div>
                  {short ? null : (
                    <div className="mt-0.5 text-[11.5px] opacity-70">
                      {time(event.start)} – {time(event.end)}
                    </div>
                  )}
                  {event.where && event.end - event.start >= 1 ? (
                    <div className="mt-0.5 truncate text-[11.5px] opacity-70">{event.where}</div>
                  ) : null}
                  {event.people && event.end - event.start >= 1.5 ? (
                    <div className="mt-1.5 flex -space-x-1">
                      {event.people.map((name) => (
                        <Avatar key={name} name={name} size={18} ring={bg} />
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
            <div className="absolute right-0 left-0 flex items-center" style={{ top: (NOW - FIRST) * HOUR }}>
              <div
                className="absolute h-[2px] bg-[#ef4444]"
                style={{ left: `${(TODAY / 7) * 100}%`, width: `${100 / 7}%` }}
              />
              <div className="absolute h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#ef4444]" style={{ left: `${(TODAY / 7) * 100}%` }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  </Canvas>
);
