// Stand-ins for the two licensed snapcn Pro components, which are gitignored
// (see .gitignore). remotion.config.ts and tsconfig.json resolve the real
// files when they are installed and fall back to these otherwise, so every
// other video in this project bundles, typechecks and renders without them.
// Only MotionVideoLaunch uses them; rendering it without them fails here.

const missing = (file: string): never => {
  throw new Error(
    `MotionVideoLaunch needs the licensed snapcn component src/components/snap-cn/${file}. Install it with SNAPCN_API_KEY=… npx shadcn@latest add @snapcn/manifesto @snapcn/lockup-reveal`
  );
};

export const Manifesto = (_props: Record<string, unknown>) => missing("manifesto.tsx");
export const LockupReveal = (_props: Record<string, unknown>) => missing("lockup-reveal.tsx");
