import { INTER } from "./fonts";
import type { IconName } from "./kit";
import { Avatar, Canvas, HomeIndicator, Icon, StatusBar } from "./kit";

/** Ledgerleaf: a light personal-finance app home screen. */
const ACTIONS: [IconName, string][] = [
  ["send", "Send"],
  ["arrowDown", "Request"],
  ["plus", "Top up"],
  ["grid", "More"],
];
const SPEND = [
  ["Groceries", 0.34, "#0f766e"],
  ["Travel", 0.26, "#f59e0b"],
  ["Dining", 0.22, "#ef4444"],
  ["Other", 0.18, "#94a3b8"],
] as const;
const ACTIVITY: { icon: IconName; name: string; when: string; amount: string; tint: string; ink: string; income?: boolean }[] = [
  { icon: "coffee", name: "Little Fern Café", when: "Today, 8:41 AM", amount: "−$4.80", tint: "#fef3c7", ink: "#b45309" },
  { icon: "dollar", name: "Salary · Kitebird Labs", when: "Yesterday", amount: "+$4,250.00", tint: "#dcfce7", ink: "#15803d", income: true },
  { icon: "plane", name: "Skyline Air", when: "Nov 8", amount: "−$318.40", tint: "#e0f2fe", ink: "#0369a1" },
  { icon: "bag", name: "Greenrow Market", when: "Nov 7", amount: "−$62.15", tint: "#ccfbf1", ink: "#0f766e" },
  { icon: "user", name: "Noah Becker", when: "Nov 6", amount: "+$25.00", tint: "#ede9fe", ink: "#6d28d9", income: true },
];
const TABS: [IconName, string][] = [
  ["home", "Home"],
  ["chart", "Insights"],
  ["card", "Cards"],
  ["user", "Profile"],
];

export const MobileWallet = () => (
  <Canvas scale={3} className="bg-[#f4f6f3] text-[#0f1a14]" style={{ fontFamily: INTER }}>
    <div className="relative h-full overflow-hidden">
      <StatusBar color="#0f1a14" />
      <div className="px-5">
        <div className="mt-2 flex items-center gap-3">
          <Avatar name="Amira Haddad" size={42} hue={160} />
          <div>
            <div className="text-[13px] text-[#64746b]">Good morning</div>
            <div className="text-[17px] font-semibold">Amira Haddad</div>
          </div>
          <div className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
            <Icon name="bell" size={19} />
          </div>
        </div>

        <div className="mt-4 text-[14px] text-[#64746b]">Total balance</div>
        <div className="mt-1 flex items-end gap-2">
          <span className="text-[36px] leading-none font-semibold tracking-[-0.03em]">
            $12,480<span className="text-[#9aa79f]">.52</span>
          </span>
          <span className="mb-1 flex items-center gap-0.5 rounded-full bg-[#dcfce7] px-2 py-0.5 text-[12px] font-semibold text-[#15803d]">
            <Icon name="arrowUp" size={11} stroke={3} />
            2.4%
          </span>
        </div>

        <div className="relative mt-4 h-[180px] overflow-hidden rounded-[26px] p-5 text-white shadow-[0_20px_40px_-16px_rgba(15,118,110,0.6)]" style={{ background: "linear-gradient(135deg,#0f766e 0%,#115e59 45%,#134e4a 100%)" }}>
          <div className="absolute -top-16 -right-10 h-48 w-48 rounded-full border-[28px] border-white/10" />
          <div className="absolute -bottom-20 left-24 h-44 w-44 rounded-full bg-[#5eead4]/20 blur-2xl" />
          <div className="relative flex items-center">
            <div className="flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path d="M4 20C4 10 10 4 20 4c0 10-6 16-16 16z" fill="#99f6e4" />
                <path d="M4 20 14 10" stroke="#134e4a" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-[16px] font-semibold">Ledgerleaf</span>
            </div>
            <span className="ml-auto text-[12px] font-medium text-white/70">Everyday</span>
          </div>
          <div className="relative mt-5 h-8 w-11 rounded-md bg-gradient-to-br from-[#fde68a] to-[#d97706] opacity-90" />
          <div className="relative mt-4 text-[19px] font-medium tracking-[0.18em]">•••• •••• •••• 4821</div>
          <div className="relative mt-2 flex text-[12px] text-white/75">
            <span>AMIRA HADDAD</span>
            <span className="ml-auto">09/29</span>
          </div>
        </div>

        <div className="mt-4 flex justify-between">
          {ACTIONS.map(([icon, label]) => (
            <div key={label} className="flex flex-col items-center gap-1.5">
              <div className={`flex h-[52px] w-[52px] items-center justify-center rounded-2xl ${label === "Send" ? "bg-[#0f1a14] text-white" : "bg-white text-[#0f1a14] shadow-sm"}`}>
                <Icon name={icon} size={21} />
              </div>
              <span className="text-[12px] font-medium text-[#3d4a42]">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-[22px] bg-white p-4 shadow-sm">
          <div className="flex items-baseline">
            <span className="text-[15px] font-semibold">Spent in November</span>
            <span className="ml-auto text-[15px] font-semibold">$1,942</span>
          </div>
          <div className="mt-3 flex h-2.5 gap-1 overflow-hidden rounded-full">
            {SPEND.map(([name, share, color]) => (
              <div key={name} className="h-full rounded-full" style={{ width: `${share * 100}%`, background: color }} />
            ))}
          </div>
          <div className="mt-3 flex justify-between text-[11.5px] text-[#64746b]">
            {SPEND.map(([name, share, color]) => (
              <span key={name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                {name} {Math.round(share * 100)}%
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-baseline">
          <span className="text-[17px] font-semibold">Recent activity</span>
          <span className="ml-auto text-[13px] font-medium text-[#0f766e]">See all</span>
        </div>
        <div className="mt-2">
          {ACTIVITY.map((item) => (
            <div key={item.name} className="flex items-center gap-3 py-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: item.tint, color: item.ink }}>
                <Icon name={item.icon} size={20} />
              </div>
              <div>
                <div className="text-[14.5px] font-medium">{item.name}</div>
                <div className="text-[12px] text-[#7b8a81]">{item.when}</div>
              </div>
              <div className={`ml-auto text-[14.5px] font-semibold ${item.income ? "text-[#15803d]" : ""}`}>{item.amount}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-white/90 pt-3 pb-[34px] shadow-[0_-1px_0_rgba(0,0,0,0.06)] backdrop-blur">
        <div className="flex justify-around">
          {TABS.map(([icon, label], index) => (
            <div key={label} className={`flex flex-col items-center gap-1 text-[10.5px] font-semibold ${index === 0 ? "text-[#0f766e]" : "text-[#9aa79f]"}`}>
              <Icon name={icon} size={23} stroke={2} />
              {label}
            </div>
          ))}
        </div>
        <HomeIndicator color="#0f1a14" />
      </div>
    </div>
  </Canvas>
);
