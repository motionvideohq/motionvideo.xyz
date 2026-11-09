import { INTER } from "./fonts";
import type { IconName } from "./kit";
import { Avatar, Canvas, Icon } from "./kit";

/** Ferrow: a neutral, light workspace settings screen. */
const RAIL: IconName[] = ["home", "inbox", "folder", "calendar", "chart"];
const SECTIONS: [IconName, string][] = [
  ["sliders", "General"],
  ["users", "Members"],
  ["card", "Billing"],
  ["bell", "Notifications"],
  ["shield", "Security"],
  ["layers", "Integrations"],
  ["code", "API keys"],
];
const TOGGLES = [
  ["Weekly digest", "A Monday summary of what changed in your projects.", true],
  ["Smart notifications", "Only ping me when I'm mentioned or assigned.", true],
  ["Public project links", "Anyone with the link can view, not edit.", false],
] as const;
const MEMBERS = [
  ["Elena Varga", "elena@ferrow.app", "Owner", 12],
  ["Jonah Pierce", "jonah@ferrow.app", "Admin", 200],
  ["Priya Nair", "priya@ferrow.app", "Member", 320],
] as const;

const Toggle = ({ on }: { on: boolean }) => (
  <div className={`flex h-[24px] w-[42px] items-center rounded-full p-[3px] ${on ? "bg-[#2563eb]" : "bg-zinc-200"}`}>
    <div className={`h-[18px] w-[18px] rounded-full bg-white shadow ${on ? "translate-x-[18px]" : ""}`} />
  </div>
);

const Field = ({ label, value, prefix, icon }: { label: string; value: string; prefix?: string; icon?: IconName }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[13px] font-medium text-zinc-700">{label}</span>
    <span className="flex h-10 items-center overflow-hidden rounded-lg border border-zinc-200 bg-white text-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {prefix ? <span className="flex h-full items-center border-r border-zinc-200 bg-zinc-50 px-3 text-zinc-500">{prefix}</span> : null}
      <span className="flex-1 px-3 text-zinc-900">{value}</span>
      {icon ? <Icon name={icon} size={16} className="mr-3 text-zinc-400" /> : null}
    </span>
  </label>
);

export const Settings = () => (
  <Canvas scale={1.25} className="bg-white text-zinc-900" style={{ fontFamily: INTER }}>
    <div className="flex h-full">
      <div className="flex w-[64px] flex-col items-center gap-2 border-r border-zinc-100 bg-zinc-50 py-4">
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-[15px] font-bold text-white">F</div>
        {RAIL.map((icon) => (
          <div key={icon} className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400">
            <Icon name={icon} size={19} />
          </div>
        ))}
        <div className="mt-auto flex h-10 w-10 items-center justify-center rounded-lg bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200">
          <Icon name="sliders" size={19} />
        </div>
        <Avatar name="Elena Varga" size={32} hue={12} className="mt-2" />
      </div>

      <div className="w-[236px] border-r border-zinc-100 px-4 py-6">
        <div className="px-2 text-[18px] font-semibold tracking-tight">Settings</div>
        <div className="mt-1 px-2 text-[13px] text-zinc-500">Ferrow Studio workspace</div>
        <div className="mt-6 flex flex-col gap-0.5">
          {SECTIONS.map(([icon, label]) => (
            <div
              key={label}
              className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-[14px] ${label === "General" ? "bg-zinc-100 font-medium text-zinc-900" : "text-zinc-600"}`}
            >
              <Icon name={icon} size={16} />
              {label}
            </div>
          ))}
        </div>
        <div className="mt-8 px-2 text-[11.5px] font-medium tracking-wider text-zinc-400 uppercase">Account</div>
        {["Profile", "Preferences", "Sessions"].map((label) => (
          <div key={label} className="px-2.5 py-2 text-[14px] text-zinc-600">{label}</div>
        ))}
      </div>

      <main className="flex-1 overflow-hidden px-12 py-8">
        <div className="flex items-start">
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight">General</h1>
            <p className="mt-1 text-[14px] text-zinc-500">Manage how your workspace looks and who can find it.</p>
          </div>
          <div className="ml-auto flex gap-2.5">
            <span className="rounded-lg border border-zinc-200 px-4 py-2 text-[14px] font-medium">Cancel</span>
            <span className="rounded-lg bg-zinc-900 px-4 py-2 text-[14px] font-medium text-white">Save changes</span>
          </div>
        </div>

        <section className="mt-8 grid grid-cols-[220px_1fr] gap-10 border-t border-zinc-100 pt-7">
          <div>
            <div className="text-[15px] font-semibold">Workspace profile</div>
            <div className="mt-1 text-[13px] leading-relaxed text-zinc-500">Shown on invites, shared links and emails.</div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-[26px] font-bold text-white shadow-lg shadow-blue-500/20">
                F
              </div>
              <div>
                <div className="flex gap-2">
                  <span className="rounded-lg border border-zinc-200 px-3 py-1.5 text-[13px] font-medium">Upload logo</span>
                  <span className="px-2 py-1.5 text-[13px] text-zinc-500">Remove</span>
                </div>
                <div className="mt-1.5 text-[12px] text-zinc-400">SVG or PNG, at least 256 × 256 px.</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Workspace name" value="Ferrow Studio" />
              <Field label="Workspace URL" prefix="ferrow.app/" value="studio" />
              <Field label="Time zone" value="(GMT+01:00) Amsterdam" icon="chevronDown" />
              <Field label="Default language" value="English (UK)" icon="chevronDown" />
            </div>
          </div>
        </section>

        <section className="mt-7 grid grid-cols-[220px_1fr] gap-10 border-t border-zinc-100 pt-7">
          <div>
            <div className="text-[15px] font-semibold">Notifications</div>
            <div className="mt-1 text-[13px] leading-relaxed text-zinc-500">Defaults for new members. Each person can change their own.</div>
          </div>
          <div className="divide-y divide-zinc-100 rounded-xl border border-zinc-200">
            {TOGGLES.map(([title, text, on]) => (
              <div key={title} className="flex items-center gap-4 px-4 py-3.5">
                <div>
                  <div className="text-[14px] font-medium">{title}</div>
                  <div className="mt-0.5 text-[13px] text-zinc-500">{text}</div>
                </div>
                <div className="ml-auto">
                  <Toggle on={on} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-7 grid grid-cols-[220px_1fr] gap-10 border-t border-zinc-100 pt-7">
          <div>
            <div className="text-[15px] font-semibold">Members</div>
            <div className="mt-1 text-[13px] leading-relaxed text-zinc-500">3 of 10 seats used on the Team plan.</div>
          </div>
          <div>
            {MEMBERS.map(([name, email, role, hue]) => (
              <div key={name} className="flex items-center gap-3 border-b border-zinc-100 py-2.5 last:border-0">
                <Avatar name={name} size={34} hue={hue} />
                <div>
                  <div className="text-[14px] font-medium">{name}</div>
                  <div className="text-[13px] text-zinc-500">{email}</div>
                </div>
                <span className="ml-auto flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-[13px] text-zinc-700">
                  {role}
                  <Icon name="chevronDown" size={14} className="text-zinc-400" />
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  </Canvas>
);
