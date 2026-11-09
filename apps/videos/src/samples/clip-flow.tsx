import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";

import { INTER, MONO } from "./fonts";
import { Canvas, Icon } from "./kit";

/**
 * A cursor pays in a checkout: it glides to the button, clicks, the button
 * spins, a check draws in, then the form resets and the cursor returns to
 * where it started, so the clip loops.
 */
const START = { x: 1060, y: 690 };
const BUTTON = { x: 806, y: 502 };
const clamp: { extrapolateLeft: "clamp"; extrapolateRight: "clamp" } = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
};
const ease = Easing.bezier(0.45, 0, 0.2, 1);

const Field = ({ label, value, mono, icon }: { label: string; value: string; mono?: boolean; icon?: boolean }) => (
  <div>
    <div className="text-[13px] font-medium text-zinc-600">{label}</div>
    <div className="mt-1.5 flex h-11 items-center rounded-xl border border-zinc-200 bg-white px-3.5 text-[15px] text-zinc-900" style={mono ? { fontFamily: MONO, fontSize: 14 } : undefined}>
      {value}
      {icon ? (
        <span className="ml-auto flex gap-1">
          <span className="h-5 w-8 rounded bg-gradient-to-r from-[#eb001b] to-[#f79e1b] opacity-90" />
        </span>
      ) : null}
    </div>
  </div>
);

export const ClipFlow = () => {
  const frame = useCurrentFrame();
  const { durationInFrames: end } = useVideoConfig();

  const go = interpolate(frame, [18, 54], [0, 1], { ...clamp, easing: ease });
  const back = interpolate(frame, [118, end - 10], [0, 1], { ...clamp, easing: ease });
  // A gentle arc on the way in, straight on the way back.
  const arc = Math.sin(go * Math.PI) * -40;
  const cursor = {
    x: interpolate(go - back, [0, 1], [START.x, BUTTON.x]),
    y: interpolate(go - back, [0, 1], [START.y, BUTTON.y]) + arc * (1 - back),
  };
  const press = interpolate(frame, [56, 60, 66], [0, 1, 0], clamp);
  const loading = interpolate(frame, [62, 66, 92, 96], [0, 1, 1, 0], clamp);
  const success = interpolate(frame, [94, 104, 136, 148], [0, 1, 1, 0], clamp);
  const check = interpolate(frame, [100, 116], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const ripple = interpolate(frame, [58, 80], [0, 1], clamp);
  // The label returns only after "Payment complete" has gone, so the two never overlap.
  const idle = interpolate(frame, [59, 63, 148, 158], [1, 0, 0, 1], clamp);

  return (
    <Canvas scale={1.25} style={{ fontFamily: INTER, background: "linear-gradient(135deg,#eef2ff 0%,#fdf2f8 55%,#fff7ed 100%)" }}>
      <div className="flex h-full items-center justify-center">
        <div className="flex h-[580px] w-[920px] overflow-hidden rounded-[28px] bg-white shadow-[0_40px_100px_-30px_rgba(76,29,149,0.35)] ring-1 ring-black/[0.04]">
          <div className="flex w-[360px] flex-col bg-[#18122b] p-9 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#a78bfa] to-[#f472b6]">
                <Icon name="layers" size={17} stroke={2.2} />
              </div>
              <span className="text-[17px] font-semibold">Prismo</span>
            </div>
            <div className="mt-10 text-[14px] text-white/60">Subscribe to Prismo Studio</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[46px] leading-none font-semibold tracking-tight">$49</span>
              <span className="text-[15px] text-white/60">per month</span>
            </div>
            <div className="mt-8 flex flex-col gap-4 text-[14px]">
              {[
                ["Studio plan", "$49.00"],
                ["3 seats included", "$0.00"],
                ["Tax", "$0.00"],
              ].map(([item, price]) => (
                <div key={item} className="flex text-white/80">
                  {item}
                  <span className="ml-auto">{price}</span>
                </div>
              ))}
              <div className="h-px bg-white/10" />
              <div className="flex font-semibold">
                Total due today
                <span className="ml-auto">$49.00</span>
              </div>
            </div>
            <div className="mt-auto flex items-center gap-2 text-[13px] text-white/50">
              <Icon name="lock" size={14} />
              Payments are encrypted end to end
            </div>
          </div>

          <div className="relative flex-1 p-10">
            <div className="text-[22px] font-semibold tracking-tight text-zinc-900">Payment details</div>
            <div className="mt-1 text-[14px] text-zinc-500">Cancel anytime from your account settings.</div>
            <div className="mt-7 flex flex-col gap-4">
              <Field label="Email" value="rosa@lantern.studio" />
              <Field label="Card number" value="4242 4242 4242 4242" mono icon />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Expiry" value="09 / 29" mono />
                <Field label="CVC" value="•••" mono />
              </div>
            </div>
            <div
              className="relative mt-7 flex h-[52px] items-center justify-center overflow-hidden rounded-xl text-[16px] font-semibold text-white"
              style={{
                background: success > 0 ? `color-mix(in srgb, #16a34a ${success * 100}%, #6d28d9)` : "#6d28d9",
                transform: `scale(${1 - press * 0.03})`,
                boxShadow: "0 12px 24px -10px rgba(109,40,217,0.6)",
              }}
            >
              <span
                className="absolute rounded-full bg-white/30"
                style={{
                  width: 40 + ripple * 600,
                  height: 40 + ripple * 600,
                  opacity: ripple > 0 && ripple < 1 ? 1 - ripple : 0,
                }}
              />
              <span className="absolute flex items-center gap-2" style={{ opacity: idle }}>
                Pay $49.00
                <Icon name="arrowRight" size={17} stroke={2.2} />
              </span>
              <span className="absolute flex items-center gap-2.5" style={{ opacity: loading }}>
                <svg width="20" height="20" viewBox="0 0 20 20" style={{ transform: `rotate(${frame * 14}deg)` }}>
                  <circle cx="10" cy="10" r="8" stroke="#ffffff40" strokeWidth="3" fill="none" />
                  <path d="M10 2a8 8 0 0 1 8 8" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
                Processing…
              </span>
              <span className="absolute flex items-center gap-2.5" style={{ opacity: success }}>
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="11" fill="#fff" />
                  <path
                    d="M7 12.5l3.2 3.2L17 9"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="2.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="16"
                    strokeDashoffset={16 * (1 - check)}
                  />
                </svg>
                Payment complete
              </span>
            </div>
            <div className="mt-4 text-center text-[12.5px] text-zinc-400" style={{ opacity: 1 - success }}>
              By paying you agree to the Prismo terms.
            </div>
            <div
              className="absolute inset-x-10 bottom-8 flex items-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-[13.5px] text-emerald-800"
              style={{ opacity: success, transform: `translateY(${(1 - success) * 12}px)` }}
            >
              <Icon name="mail" size={16} />
              Receipt sent to rosa@lantern.studio
            </div>
          </div>
        </div>
      </div>
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        className="absolute"
        style={{
          left: cursor.x,
          top: cursor.y,
          transform: `scale(${1 - press * 0.15})`,
          transformOrigin: "4px 3px",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))",
        }}
      >
        <path d="M4 3l14.5 7.2-6.3 1.7-2.4 6.3z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </Canvas>
  );
};
