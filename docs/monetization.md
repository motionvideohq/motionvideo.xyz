# Recurring revenue opportunities

Ideas for monthly recurring revenue on MotionVideo, ranked by fit with what already exists: the gallery, the Tools / Creatives / Skills / Extras directories, the paid MotionVideo Skill Bundle, sponsorships, and Dodo Payments (which supports subscriptions).

## Founding sponsors

[Shadcn Labs](https://www.shadcn-labs.com), [Kobra](https://kobra.systems/), [beUI](https://beui.dev/), and [Illos](https://illos.dev/) are credited on `/sponsor`. Founding sponsors do not occupy paid seats; they fill the sponsored grid card while no Diamond sponsor is live.

## Opportunities

| # | Idea | Price idea | Fit | Risk / caveat |
| --- | --- | --- | --- | --- |
| 1 | **Sponsorships** (live) | $100–$250/mo, or once for 30 days | Already built | Diamond is capped at 2 slots, which caps revenue |
| 2 | **Skill Bundle updates plan**: keep the one-time $29, add a monthly plan for new skills, updated prompts and templates | $9–$15/mo | Very high: same buyers, same repo, Dodo subscriptions | Needs a steady release cadence to justify it |
| 3 | **Pro membership**: your own original prompts, full source projects (Remotion / HyperFrames), private bookmark collections, early access | $8–$12/mo | High | Never paywall creators' freely shared prompts; it breaks trust and their goodwill |
| 4 | **Featured listings** in Tools, Skills and Creatives, separate from sponsor tiers | $49–$99/mo | High: directories already exist | Label them "Featured" so the directory stays credible |
| 5 | **Creatives "Hire me" profiles**: studio or freelancer profile with a lead form | $19–$49/mo | Medium–high | Only valuable once traffic is meaningful |
| 6 | **Team / agency plan**: shared collections and boards | $29+/mo | Medium | Needs real collaboration features |
| 7 | **Prompt and video data API or feed** for tool makers | $99+/mo (B2B) | Medium | Licensing: videos and prompts belong to their creators |
| 9 | **Job board** (live: `/jobs`) | $99 Standard / $199 Featured per 30-day post | High: same audience as the gallery | One-time, not recurring; becomes steady revenue only with repeat employers |
| 8 | **Recurring affiliate commissions** (video tools, payments) | Revenue share | Easy to add | Small amounts; disclose affiliate links to keep editorial trust |
| 10 | **Create single export** (live: Showcase at `/create/showcase`) | $4 once per project, no purchasing-power parity | High: free browser tool funnels into Pro | One-time; most value is as an upgrade path to Pro |

## MotionVideo Create

Create is the set of browser creative tools; Showcase (images and videos to a looping 3D motion video) is the first. Rendering and export run in the visitor's browser with Remotion, so there is no render cost per export. Plan constants live in `apps/web/src/constants/create.ts`.

- **Free**: MP4 up to 1080p (short side) at 30 fps, stills up to 1440 px, no watermark. No Pro templates, transparent video, GIF or PNG sequence.
- **Single export**: $4 one-time (`CREATE_PASS_CENTS`), unlocks every export setting for one project in one tool for 7 days (`CREATE_PASS_DAYS`), re-exports included, nothing renews. Requires sign-in. Refunded only in the general refund-policy cases (double charge, not delivered, not as described).
- **Pro / Business**: unlimited exports at every setting in every project.

Fulfillment mirrors the job board: `startCreatePassCheckout` creates a hosted Dodo checkout for product `DODO_PRODUCT_CREATE_PASS` with `tool`, `project_id` and `user_id` metadata; `syncCreatePassPayment` (`apps/web/src/server/create-passes.ts`) re-reads the payment from the Dodo API and upserts one `create_pass` row per payment, from the webhook (`payment.succeeded`, `refund.succeeded`) and from `getCreateAccess` when Dodo returns to the editor with `payment_id`. A full refund marks the row refunded. Media and projects stay in the browser (IndexedDB); the server stores only the purchase record.

## Suggested order

1. **Skill Bundle updates plan**: cheapest to ship on top of the existing Dodo checkout and bundle repo.
2. **Featured listings**: reuses the directories and the sponsorship review flow (`/admin/sponsorships`).
3. **Pro membership**: only with content MotionVideo owns, never by gating community prompts.

Everything else waits for traffic (hire profiles, team plan) or for licensing clarity (data API).
