<div align="center">

<a href="https://motionvideo.xyz">
  <img src="public/og.png" alt="MotionVideo: Motion design, written in code." width="800" />
</a>

# MotionVideo

**Motion design, written in code.**

Agent skills that teach your coding agent motion design: timing, easing, and choreography.<br /> Showreels, intros, and launch films, rendered from a prompt.

[Website](https://motionvideo.xyz) · [About](https://motionvideo.xyz/about) · [Contact](https://motionvideo.xyz/contact)

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fmotionvideo.xyz&label=motionvideo.xyz&style=flat-square)](https://motionvideo.xyz) [![TanStack Start](https://img.shields.io/badge/TanStack_Start-React-FF4154?style=flat-square&logo=tanstack&logoColor=white)](https://tanstack.com/start) [![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflareworkers&logoColor=white)](https://workers.cloudflare.com) [![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com) [![Polar](https://img.shields.io/badge/Payments-Polar-0062FF?style=flat-square)](https://polar.sh) [![License: MIT](https://img.shields.io/github/license/motionvideohq/motionvideo.xyz?style=flat-square)](LICENSE) [![X](https://img.shields.io/badge/@alaymanguy-000000?style=flat-square&logo=x&logoColor=white)](https://x.com/alaymanguy)

</div>

---

This repository is the marketing and checkout site for MotionVideo. The site is open source; the skill pack itself is sold separately and delivered immediately as access to a private GitHub repository through [Polar](https://polar.sh).

## How it works

- **Checkout**: buy buttons go straight to a Polar checkout, no account needed. After paying, `/welcome` emails the buyer a sign-in link.
- **Access**: passwordless magic links are available to emails with a paid order. The Polar product carries a GitHub repository access benefit; each buyer links a GitHub account in Polar's customer portal to claim the invite.
- **Pricing**: $29 for the first 100 launch purchases, then $49, paid once. Both include instant private GitHub repository access and future updates. Polar applies a product-restricted $20 discount with a native, atomic 100-redemption cap; new checkouts automatically use $49 after the cap. Historic buyers retain access through the current product and the archived legacy product. No localized or purchasing-power pricing on the site.
- **Content**: landing page, about, brand assets, contact form, and legal pages (terms, privacy, refunds, DPA), with Open Graph tags and JSON-LD on every page.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | [TanStack Start](https://tanstack.com/start) (React 19, file-based routing, server functions) |
| UI | [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com), [Tailwind CSS v4](https://tailwindcss.com), [Lucide](https://lucide.dev) icons, [player.style](https://player.style) (Sutro) video player |
| Hosting | [Cloudflare Workers](https://workers.cloudflare.com), deployed with [Wrangler](https://developers.cloudflare.com/workers/wrangler/) and Workers Builds |
| Data | [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite) with [Drizzle ORM](https://orm.drizzle.team), [R2](https://developers.cloudflare.com/r2/) for video assets |
| Auth | [Better Auth](https://www.better-auth.com) (email magic links) |
| Email | [Resend](https://resend.com) (sign-in and contact messages), Cloudflare Email Routing (inbound) |
| Payments | [Polar](https://polar.sh) as merchant of record, with GitHub repository access delivery |
| Tooling | [pnpm](https://pnpm.io), [Vite](https://vite.dev), [Oxlint](https://oxc.rs) + [Oxfmt](https://oxc.rs) via [Ultracite](https://www.ultracite.ai), [Lefthook](https://lefthook.dev) |

## Getting started

```bash
pnpm install
cp .env.example .env
pnpm db:migrate:local
pnpm dev
```

Email templates are React Email components in `src/emails`. Preview them with `pnpm email:dev` (port 3001).

### Polar launch pricing

Set `POLAR_PRODUCT_ID` to the regular **$49 USD one-time** product, preserving its GitHub repository access benefit. Keep `POLAR_LEGACY_PRODUCT_ID` for archived-product buyers. Set `POLAR_LAUNCH_DISCOUNT_ID` to a **fixed $20 USD, once-only** discount restricted to that current product, with **maximum redemptions 100** and no public code. The site locks checkout to this product and disables customer-entered discount codes. Reuse this discount throughout the campaign; replacing it would reset the cap.

The landing page and structured pricing metadata read Polar's live `redemptions_count`. Polar atomically reserves redemptions while confirming payment and releases failed payments, so the remaining count can temporarily include payments still being confirmed. Merely opening a checkout does not reserve a spot. A previously opened discounted checkout can be rejected if the final spot is taken before payment; restart checkout to see the regular $49 price. No payment is silently increased.

The launch pricing card restores the layout before commit `132a4c5`: crossed-out regular price, live remaining-spots count, and a 100-segment meter. It is a launch discount, not a preorder; there is no calendar deadline or delayed delivery.

Local development reads these values from `.env`; production also needs `pnpm wrangler secret put POLAR_LAUNCH_DISCOUNT_ID` before deployment, along with the existing Polar secrets. Use a sandbox product and equivalent capped discount when testing actual payments. Polar's [discount documentation](https://polar.sh/docs/features/discounts) describes the cap; its [discount redemption service](https://github.com/polarsource/polar/blob/main/server/polar/discount/service.py) locks the capped discount during redemption, and its [checkout confirmation service](https://github.com/polarsource/polar/blob/main/server/polar/checkout/service.py) enforces the limit before confirming payment.

## Internationalization

The interface uses [Intlayer](https://intlayer.org/doc/environment/tanstack-start) with English (`en`, the default), Spanish (`es`), and French (`fr`). Dictionaries live beside their components and routes in `*.content.ts` files and declare every supported translation with `t({ en, es, fr })`. Components read them with `useIntlayer("dictionary-key")`; use a field's `.value` for string-only props such as accessible labels. The setup follows the dictionary/hooks approach in [pdfcn PR #8](https://github.com/shadcn-labs/pdfcn/pull/8), adapted to TanStack Start rather than Next.js.

`intlayer.config.ts` configures locales, and the `vite-intlayer` plugin generates dictionaries during development and production builds. TanStack ignores `.content.` files as routes. Generated `.intlayer/` resources are ignored by Git.

The language picker appears in the site header and authentication cards. Selection persists in browser local storage under `motionvideo-locale`; no locale cookie, automatic browser-language detection, or localized URL redirects are used. Server rendering and initial hydration always use English, including prerendered static pages. After hydration, the provider restores a supported saved locale and updates the visible interface and document `lang`. Without storage access, switching still works for the current visit. Existing URLs, canonical metadata, structured data, transactional emails, and third-party video-player controls retain their original language.

## License

The website source code is released under the [MIT License](LICENSE). The MotionVideo skill pack, brand name, and logomark are not covered by this license; the skill pack is sold separately under its own [terms](https://motionvideo.xyz/terms).

## Made by

[Aniket Pawar](https://www.aniketpawar.com) ([@alaymanguy](https://x.com/alaymanguy)), who also runs [Shadcn Labs](https://www.shadcn-labs.com).
