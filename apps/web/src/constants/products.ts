import { LINK } from "@/constants/links";

// Other things Aniket builds, linked from the footer. Shadcn Labs goes last
// because the "Shadcn Labs projects" menu right below it lists its projects.
export const OTHER_PRODUCTS = [
  { name: "Heroicons Animated", url: "https://heroicons-animated.com" },
  { name: "OSS Perks", url: "https://www.ossperks.com" },
  { name: "Vercel Doctor", url: "https://www.vercel-doctor.com" },
  { name: "Shadcn Weekly", url: "https://www.shadcnweekly.com" },
  { name: "Shadcn Labs", url: LINK.SHADCN_LABS },
] as const;

// Projects listed on shadcn-labs.com.
export const SHADCN_LABS_PROJECTS = [
  { name: "agentcn", url: "https://agentcn.run" },
  { name: "editorcn", url: "https://editorcn.vercel.app" },
  { name: "emailcn", url: "https://emailcn.run" },
  { name: "framecn", url: "https://framecn.dev" },
  { name: "mcpcn", url: "https://mcpcn.dev" },
  { name: "ogimagecn", url: "https://ogimagecn.com" },
  { name: "pdfcn", url: "https://pdfcn.dev" },
  { name: "shadcn-cssinjs", url: "https://shadcn-cssinjs.com" },
  { name: "shadercn", url: "https://shadercn.run" },
  { name: "skills", url: "https://www.skills.sh/shadcn-labs/skills" },
  { name: "startercn", url: "https://startercn.vercel.app" },
  { name: "termcn", url: "https://termcn.dev" },
] as const;
