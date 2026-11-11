# Recurring revenue opportunities

Ideas for monthly recurring revenue on MotionVideo, ranked by fit with what already exists: the gallery, the Tools / Creatives / Skills / Extras directories, the Pro and Business plans, sponsorships, the job board, and Dodo Payments.

## What is live

- **Pro**: $9/mo, $79/yr, or $149 lifetime. **Business**: $29/mo or $249/yr, 3 seats. Both include every move's prompt, the full prompt templates with the customizer, the Pro agent skill, and the Pro MCP tools. PPP discounts apply, plus a yearly Black Friday code.
- The one-time Skill Bundle is retired; existing owners keep repo access, and the skill now ships in Pro and Business.
- **Sponsorships**: each tier has 3 slots (`SPONSOR_SLOTS = 3` in `apps/web/src/constants/sponsors.ts`).
- **Job board**: `/jobs`.

## Founding sponsors

[Shadcn Labs](https://www.shadcn-labs.com), [Kobra](https://kobra.systems/), [beUI](https://beui.dev/), and [Illos](https://illos.dev/) are credited on `/sponsor`. Founding sponsors do not occupy paid seats; they fill the sponsored grid card while no Diamond sponsor is live.

## Opportunities

| # | Idea | Price idea | Fit | Risk / caveat |
| --- | --- | --- | --- | --- |
| 1 | **Sponsorships** (live) | $100–$250/mo, or once for 30 days | Already built | 3 slots per tier caps revenue |
| 2 | **Pro and Business plans** (live) | Pro $9/mo, $79/yr, $149 lifetime; Business $29/mo, $249/yr | Already built; supersedes the earlier Skill Bundle updates plan and Pro membership ideas | Never paywall creators' freely shared prompts; it breaks trust and their goodwill |
| 3 | **Featured listings** in Tools, Skills and Creatives, separate from sponsor tiers | $49–$99/mo | High: directories already exist | Label them "Featured" so the directory stays credible |
| 4 | **Creatives "Hire me" profiles**: studio or freelancer profile with a lead form | $19–$49/mo | Medium–high | Only valuable once traffic is meaningful |
| 5 | **Team / agency plan** | Covered by Business seats | Seats live | Shared collections and boards are still not built |
| 6 | **Prompt and video data API or feed** for tool makers | $99+/mo (B2B) | Medium | Licensing: videos and prompts belong to their creators |
| 7 | **Job board** (live: `/jobs`) | $99 Standard / $199 Featured per 30-day post | High: same audience as the gallery | One-time, not recurring; becomes steady revenue only with repeat employers |
| 8 | **Recurring affiliate commissions** (video tools, payments) | Revenue share | Easy to add | Small amounts; disclose affiliate links to keep editorial trust |

## Suggested order

1. **Featured listings**: reuses the directories and the sponsorship review flow (`/admin/sponsorships`).
2. **Creatives "Hire me" profiles**: once traffic makes leads worth paying for.

Everything else waits for demand (shared team collections) or for licensing clarity (data API).
