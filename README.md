<div align="center">

<a href="https://motionvideo.xyz">
  <img src="public/og.png" alt="MotionVideo: Motion design, written in code." width="800" />
</a>

# MotionVideo

**Motion design, written in code.**

Agent skills that teach your coding agent motion design: timing, easing, and choreography.<br /> Showreels, intros, and launch films, rendered from a prompt.

[Website](https://motionvideo.xyz) · [About](https://motionvideo.xyz/about) · [Contact](https://motionvideo.xyz/contact)

[![GitHub stars](https://img.shields.io/github/stars/motionvideohq/motionvideo.xyz?style=flat-square)](https://github.com/motionvideohq/motionvideo.xyz/stargazers) [![License: MIT](https://img.shields.io/github/license/motionvideohq/motionvideo.xyz?style=flat-square)](LICENSE) [![Follow on X](https://img.shields.io/badge/Follow-%40alaymanguy-000000?style=flat-square&logo=x&logoColor=white)](https://x.com/alaymanguy)

</div>

---

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

## License

The website source code is released under the [MIT License](LICENSE). The MotionVideo skill pack, brand name, and logomark are not covered by this license; the skill pack is sold separately under its own [terms](https://motionvideo.xyz/terms).

## Made by

[Aniket Pawar](https://www.aniketpawar.com) ([@alaymanguy](https://x.com/alaymanguy)), who also runs [Shadcn Labs](https://www.shadcn-labs.com).
