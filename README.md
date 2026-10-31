<div align="center">

<a href="https://motionvideo.xyz">
  <img src="apps/web/public/og.jpg" alt="MotionVideo: motion videos made with AI and code." width="800" />
</a>

# MotionVideo

[![GitHub stars](https://img.shields.io/github/stars/motionvideohq/motionvideo.xyz?style=flat)](https://github.com/motionvideohq/motionvideo.xyz/stargazers) [![CI](https://github.com/motionvideohq/motionvideo.xyz/actions/workflows/ci.yml/badge.svg)](https://github.com/motionvideohq/motionvideo.xyz/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/github/license/motionvideohq/motionvideo.xyz?style=flat)](LICENSE) [![Follow on X](https://img.shields.io/badge/Follow-%40motionvideohq-000000?style=flat&logo=x&logoColor=white)](https://x.com/motionvideohq)

<p align="center">
  <sub><a href="docs/readme/README.zh-CN.md">中文</a> · <a href="docs/readme/README.ja.md">日本語</a> · <a href="docs/readme/README.ko.md">한국어</a> · <a href="docs/readme/README.es.md">Español</a> · <a href="docs/readme/README.fr.md">Français</a> · <a href="docs/readme/README.pt.md">Português</a> · <a href="docs/readme/README.de.md">Deutsch</a> · <a href="docs/readme/README.ru.md">Русский</a></sub>
</p>

<p align="center">
  <strong>Motion design, written in code.</strong><br/>
  A directory of motion videos made with AI and code, with the prompts and skills behind them.<br /> Plus agent skills that teach your coding agent timing, easing, and choreography.
</p>

[Website](https://motionvideo.xyz) · [About](https://motionvideo.xyz/about) · [Contact](https://motionvideo.xyz/contact) · [Sponsor](https://motionvideo.xyz/sponsor)

</div>

---

## Browsing and video URLs

Every video has one public URL: `/videos/<slug>` (with the site's locale prefix). Category, color, model, type, and creator cards all link there. The originating collection and its filters are stored in browser history state, so the gallery remains behind the player, previous/next follow that collection, and closing restores it. A direct or newly shared video link falls back to Discover. Old scoped video URLs permanently redirect to the canonical video URL.

Directory categories and standalone filters have dedicated pages, including `/tools/freemium`, `/creatives/brand`, `/skills/blender`, and `/extras/prompts`. Selecting a standalone filter uses its page; combining a content category and filter keeps the category path with `?filter=`, while sort remains a query parameter. Legacy standalone filter queries permanently redirect to their dedicated pages, preserving sort.

`apps/web/src/lib/directory-discovery.ts` defines the editorial filter landing pages promoted in contextual navigation, the footer, and the localized sitemap. A selected filter must have matching entries. Core category pages remain indexable; unselected or empty filter pages and category/filter combinations return `noindex, follow`, omit canonical/alternate links, and stay out of the sitemap. They remain crawlable so search engines can read the directive. Sort-only variants canonicalize to their collection without query parameters.

### Creator collections

Every creator in the video catalog has a collection at `/creators/<lowercase-x-handle>`, for example [`/creators/twoclipping`](https://motionvideo.xyz/creators/twoclipping). The video sidebar's outline “More by this creator” button opens the collection; creator names and avatars link to their X profile. Collections include all of the creator's catalog videos, shared prompts and skills, category/model/type/color filters, and sorting.

Collections are generated from `apps/web/src/data/motion-catalog.json`; no separate creator records are needed. Unknown handles return 404, mixed-case handles redirect to lowercase, and collection URLs are included in the localized sitemap.

The footer links to core public pages, directory categories, and selected filter landing pages. Six featured creators link to their collections; “Browse all creators” opens `/creators`, a localized, searchable directory with server-rendered links to every creator. Featured creators are selected by video count, with handles breaking ties.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | [TanStack Start](https://tanstack.com/start) (React 19, file-based routing, server functions) |
| UI | [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com), [Tailwind CSS v4](https://tailwindcss.com), [intlayer](https://intlayer.org) |
| Hosting | [Cloudflare Workers](https://workers.cloudflare.com) with Durable Objects (live presence), deployed with [Wrangler](https://developers.cloudflare.com/workers/wrangler/) and Workers Builds |
| Data | [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite) with [Drizzle ORM](https://orm.drizzle.team), [R2](https://developers.cloudflare.com/r2/) for video assets and uploads |
| Auth | [Better Auth](https://www.better-auth.com) (email sign-in codes), [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) |
| Email | [Resend](https://resend.com), Cloudflare Email Routing (inbound) |
| Payments | [Dodo Payments](https://dodopayments.com) as merchant of record (skill bundle, sponsorships, job posts) |
| Analytics | [PostHog](https://posthog.com) |
| Tooling | [pnpm](https://pnpm.io), [Vite](https://vite.dev), [Oxlint](https://oxc.rs) + [Oxfmt](https://oxc.rs) via [Ultracite](https://www.ultracite.ai), [Lefthook](https://lefthook.dev) |

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for local setup, checks, generated files, and the pull request process. Use [issues](https://github.com/motionvideohq/motionvideo.xyz/issues) for bugs and feature requests. By participating, you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## Security

Please do not open public issues for security vulnerabilities. Follow [SECURITY.md](SECURITY.md) and report them privately through GitHub Security Advisories.

## Contributors

[![Contributors](https://contrib.rocks/image?repo=motionvideohq/motionvideo.xyz)](https://github.com/motionvideohq/motionvideo.xyz/graphs/contributors)

## License

The website source code is released under the [MIT License](LICENSE). The MotionVideo skill pack, brand name, and logomark are not covered by this license; the skill pack is sold separately under its own [terms](https://motionvideo.xyz/terms).

## Made by

[Aniket Pawar](https://www.aniketpawar.com) ([@alaymanguy](https://x.com/alaymanguy)), who also runs [Shadcn Labs](https://www.shadcn-labs.com).
