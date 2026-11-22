---
name: motionvideo-design-system
description: Use when building or improving MotionVideo interfaces, working with its brand assets, or explicitly applying the MotionVideo design system. Covers typography, semantic colors, surfaces, motion, accessibility, and the public component registry.
---

# Design with MotionVideo

Build with MotionVideo's existing visual language: clear typography, neutral surfaces, yellow primary actions, and motion that explains interaction. Use the system as a foundation for the material, not a fixed page template. Preserve the host application's identity and structure; using these references does not imply MotionVideo authorship or endorsement.

## Start with the project

1. Preserve the caller's framework, routing, build system, content, and established component conventions.
2. In this repository, reuse the existing site header, footer, page layouts, theme controls, and navigation. Do not replace them with a different documentation shell.
3. Use installed components and semantic tokens before introducing new styles. Do not add another theme, font system, registry, or component library just to match a reference.
4. Keep narrative content in MDX. Use React specimens only where an illustration or interaction needs them.
5. Read the relevant foundation and component documentation before composing the interface. Keep supplied facts, labels, functionality, and accessibility requirements intact.

## Read the foundations

The live examples and current values are authoritative. Each page is also available as Markdown:

- [Overview](https://motionvideo.xyz/design/index.md): the system's foundations and entry points.
- [Colors](https://motionvideo.xyz/design/colors.md): semantic tokens, surface/foreground pairs, and state colors.
- [Typography](https://motionvideo.xyz/design/typography.md): Timeless Sans, Paper Mono, and the type scale.
- [Materials](https://motionvideo.xyz/design/materials.md): surfaces, depth, corner radii, and spacing.
- [Motion](https://motionvideo.xyz/design/motion.md): shared timing, easing, and reduced-motion behavior.
- [Brand assets](https://motionvideo.xyz/design/brand.md): logo files, color treatments, typography, and usage requirements.
- [Components](https://motionvideo.xyz/design/components.md): available components and installation.

Browse the human-readable system at https://motionvideo.xyz/design. Find the rest of the site's documentation through https://motionvideo.xyz/llms.txt; https://motionvideo.xyz/llms-full.txt includes the complete docs and design articles.

## Use the existing sources

Inside this repository:

- `apps/web/src/styles/globals.css` owns semantic colors, spacing, radii, easing, and interaction tokens.
- `apps/web/src/styles/fonts.css` owns font faces; do not duplicate their declarations in a page.
- `apps/web/src/components/page.tsx` owns shared page widths, top spacing, and page headers.
- `apps/web/content/design` owns design articles and component documentation as MDX.
- `apps/web/src/registry` owns the public component implementations.

Outside this repository, follow the documented roles and the caller's existing stack. Do not assume MotionVideo-specific import aliases or utilities exist in another project. Check font and third-party asset licenses before embedding or redistributing files.

## Compose the page

Start with the reader's task and a clear hierarchy. Give every section a purpose and align related text, controls, and evidence to shared edges. Use one page title and sequential heading levels.

Preserve the site's established header and footer. Use the document layout for reading pages and the existing collection layout for galleries. A reference is not a reason to copy another product's shell or replace MotionVideo's own navigation.

Separate preview surfaces from their captions with a quiet background or thin divider. Use cards for real groups and interactions, not as a wrapper around every paragraph. Keep spacing consistent within peers and larger between sections. Reflow columns on small screens instead of shrinking text or hiding important content.

## Color and materials

Choose colors by semantic role, not a hard-coded light-theme value. Keep the matching foreground with its surface: `bg-card text-card-foreground`, `bg-primary text-primary-foreground`, and `bg-popover text-popover-foreground`.

Keep most of the interface neutral. Reserve the yellow primary color for the main action or deliberate emphasis. Use `text-muted-foreground` for supporting content, `destructive` for errors and removal, and `ring` for visible keyboard focus. Convey state with text or an icon as well as color.

Reuse the shared spacing and radius scales. Use `border-border` for a structural edge, `shadow-outline` for a contained surface, and `shadow-popover` for a floating surface. Avoid stacking arbitrary shadows, gradients, or decorative effects. Check every surface and text pair in both light and dark themes.

## Typography

Use Timeless Sans for headings, navigation, and prose. Use Paper Mono for code, prompts, token names, file paths, timecodes, and precise numeric readouts. Keep body text readable; establish hierarchy through weight, measure, and spacing before adding another size.

Reuse the documented Tailwind type scale: `text-4xl` for a page title, `text-2xl` for a section, `text-base leading-7` for reading, and `text-sm font-medium` for labels. Use `text-5xl` only when a display heading is warranted. Do not compress important information into tiny muted text.

Typeface references: [Timeless Sans](https://www.timeless.co/type) and [Paper Mono](https://github.com/paper-design/paper-mono). Follow each typeface's license; serving a file on this site is not permission to redistribute it.

## Motion and interaction

Make actions take effect immediately. Add movement to explain a state change, preserve continuity, or acknowledge an interaction, not to delay reading or decorate the page.

Reuse the matching component's duration and the shared easing tokens. Prefer transform and opacity over animating layout. Apply motion with `motion-safe` and remove interpolation with `motion-reduce`; the state change, focus, and labels must still work without animation.

Use semantic buttons, links, labels, and controls. Preserve keyboard operation, visible focus, accessible names, and meaningful loading, empty, error, and disabled states. Make touch targets usable and prevent horizontal overflow on narrow screens.

## Use the public components

The public registry contains [Button](https://motionvideo.xyz/design/components/button.md) and [Virtual Masonry](https://motionvideo.xyz/design/components/virtual-masonry.md). Read each component's requirements, examples, and API before using it.

Install only the components the project needs with the shadcn CLI:

```bash
npx shadcn@latest add https://motionvideo.xyz/r/button.json
npx shadcn@latest add https://motionvideo.xyz/r/virtual-masonry.json
```

The CLI copies source into the caller's project. Keep the existing `components.json` and import conventions. Do not recreate installed components or publish third-party components without redistribution permission.

## Download the brand assets

Use the supplied files rather than redrawing, stretching, rotating, recoloring, or adding effects to the mark. Choose black for light backgrounds and white for dark backgrounds.

- Lockup: [Black SVG](https://motionvideo.xyz/brand/motionvideo-lockup-black.svg) · [White SVG](https://motionvideo.xyz/brand/motionvideo-lockup-white.svg).
- Logomark: [Black SVG](https://motionvideo.xyz/brand/motionvideo-logomark-black.svg) · [White SVG](https://motionvideo.xyz/brand/motionvideo-logomark-white.svg).
- [Complete SVG and PNG brand kit](https://motionvideo.xyz/brand/motionvideo-brand-assets.zip).

Write **MotionVideo**, as one word with capital M and V. Keep clear space of at least half the logomark's height, and display the mark at least 16 px tall. Do not imply endorsement. Read the [complete brand guidelines](https://motionvideo.xyz/design/brand.md) before using the assets.

## Before handing off

Review the actual interface at desktop and mobile sizes, in light and dark themes. Check hierarchy, wrapping, spacing, overflow, keyboard navigation, focus, contrast, and reduced-motion behavior. Confirm existing routes, header, footer, and interactions still work. Remove decorative elements or new abstractions that do not help the reader complete their task.
