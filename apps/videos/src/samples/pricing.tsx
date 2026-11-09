import { INTER, SERIF } from "./fonts";
import type { IconName } from "./kit";
import { Canvas, Icon } from "./kit";

const ASSURANCES: [IconName, string][] = [
  ["shield", "SOC 2 Type II"],
  ["lock", "Encrypted at rest"],
  ["globe", "EU data residency"],
  ["users", "Free for nonprofits"],
];

/** Halcyra: the pricing page of a meeting-notes product, middle plan featured. */
const PLANS = [
  {
    name: "Personal",
    price: "$0",
    note: "Free forever",
    blurb: "For individuals capturing their own calls.",
    cta: "Get started",
    features: ["10 recorded meetings a month", "AI summaries", "Search across notes", "Calendar sync"],
  },
  {
    name: "Team",
    price: "$18",
    note: "per seat / month, billed yearly",
    blurb: "For teams that decide in meetings and need it written down.",
    cta: "Start 14-day trial",
    featured: true,
    features: [
      "Unlimited meetings",
      "Shared workspaces and folders",
      "Action items synced to your tracker",
      "Custom summary templates",
      "Admin controls",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    note: "Annual agreement",
    blurb: "For organisations with security and compliance needs.",
    cta: "Talk to sales",
    features: ["SAML SSO and SCIM", "Data residency (EU / US)", "Audit log export", "Dedicated success manager"],
  },
];

export const Pricing = () => (
  <Canvas scale={1.25} className="bg-[#f6f4ef] text-[#1b1a17]" style={{ fontFamily: INTER }}>
    <div className="relative flex h-full flex-col items-center px-16">
      <nav className="flex w-full items-center pt-7">
        <div className="flex items-center gap-2">
          <svg width="26" height="26" viewBox="0 0 26 26">
            <path d="M13 2a11 11 0 1 0 11 11h-11z" fill="#1b1a17" />
            <path d="M15 0v11h11A11 11 0 0 0 15 0z" fill="#3f6b4f" />
          </svg>
          <span className="text-[18px] font-semibold tracking-tight">Halcyra</span>
        </div>
        <div className="mx-auto flex gap-8 text-[14px] text-[#5d5a52]">
          {["Product", "Integrations", "Security", "Pricing", "Blog"].map((link) => (
            <span key={link} className={link === "Pricing" ? "font-medium text-[#1b1a17]" : ""}>
              {link}
            </span>
          ))}
        </div>
        <span className="rounded-lg border border-black/10 bg-white px-4 py-2 text-[14px] font-medium">
          Log in
        </span>
      </nav>

      <div className="mt-14 text-[13px] font-medium tracking-[0.14em] text-[#3f6b4f] uppercase">Pricing</div>
      <h1 className="mt-3 text-center text-[64px] leading-[1.02] tracking-[-0.01em]" style={{ fontFamily: SERIF }}>
        Simple plans for teams
        <br />
        that <em>talk things through</em>
      </h1>
      <div className="mt-7 flex items-center gap-3 rounded-full border border-black/[0.08] bg-white p-1 text-[14px]">
        <span className="px-4 py-1.5 text-[#5d5a52]">Monthly</span>
        <span className="flex items-center gap-2 rounded-full bg-[#1b1a17] px-4 py-1.5 font-medium text-white">
          Yearly
          <span className="rounded-full bg-[#b8e0c4] px-2 py-0.5 text-[11px] text-[#1f4a2e]">Save 20%</span>
        </span>
      </div>

      <div className="mt-10 grid w-full max-w-[1120px] grid-cols-3 items-stretch gap-5">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-3xl p-7 ${
              plan.featured
                ? "bg-[#1f3b2b] text-white shadow-[0_30px_60px_-24px_rgba(31,59,43,0.7)]"
                : "border border-black/[0.07] bg-white"
            }`}
          >
            {plan.featured ? (
              <span className="absolute top-6 right-6 rounded-full bg-[#b8e0c4] px-2.5 py-1 text-[11.5px] font-semibold text-[#1f4a2e]">
                Most popular
              </span>
            ) : null}
            <div className="text-[17px] font-semibold">{plan.name}</div>
            <div className={`mt-1.5 min-h-[38px] text-[14px] leading-snug ${plan.featured ? "text-white/70" : "text-[#6d6a62]"}`}>
              {plan.blurb}
            </div>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-[52px] leading-none tracking-tight" style={{ fontFamily: SERIF }}>
                {plan.price}
              </span>
            </div>
            <div className={`mt-2 text-[13px] ${plan.featured ? "text-white/60" : "text-[#8a867c]"}`}>{plan.note}</div>
            <div
              className={`mt-6 rounded-xl py-3 text-center text-[14.5px] font-medium ${
                plan.featured ? "bg-white text-[#1f3b2b]" : "border border-black/10 bg-[#f6f4ef]"
              }`}
            >
              {plan.cta}
            </div>
            <div className={`mt-6 h-px ${plan.featured ? "bg-white/15" : "bg-black/[0.07]"}`} />
            <ul className="mt-5 flex flex-col gap-3 text-[14px]">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full ${
                      plan.featured ? "bg-[#b8e0c4] text-[#1f4a2e]" : "bg-[#e6efe8] text-[#3f6b4f]"
                    }`}
                  >
                    <Icon name="check" size={12} stroke={3} />
                  </span>
                  <span className={plan.featured ? "text-white/90" : "text-[#3a3832]"}>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-9 flex items-center gap-8 text-[13.5px] text-[#6d6a62]">
        {ASSURANCES.map(([icon, label]) => (
          <span key={label} className="flex items-center gap-2">
            <Icon name={icon} size={16} />
            {label}
          </span>
        ))}
      </div>
    </div>
  </Canvas>
);
