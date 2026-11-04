export const GITHUB = {
  org: "motionvideohq",
  repo: "motionvideo.xyz",
} as const;

const X_HANDLE = "motionvideohq";

/** A creator's X/Twitter profile. */
export const xProfileUrl = (handle: string) => `https://x.com/${handle}`;

export const LINK = {
  AUTHOR_WEBSITE: "https://www.aniketpawar.com",
  DODO_PAYMENTS: "https://dodopayments.com",
  DODO_PAYMENTS_PRIVACY: "https://dodopayments.com/legal/privacy-policy",
  EMAIL: "hello@motionvideo.xyz",
  GITHUB: `https://github.com/${GITHUB.org}`,
  GITHUB_REPO: `https://github.com/${GITHUB.org}/${GITHUB.repo}`,
  MCP_REPO: `https://github.com/${GITHUB.org}/motionvideo-mcp`,
  SHADCN_LABS: "https://www.shadcn-labs.com",
  X: xProfileUrl(X_HANDLE),
  // Opens a DM to the founder's personal account (X needs the numeric user
  // id), where sponsorship questions go.
  X_DM: "https://x.com/messages/compose?recipient_id=1444537408431673345",
  X_FOLLOW: `https://x.com/intent/follow?screen_name=${X_HANDLE}`,
} as const;

// Large media lives in the R2 bucket `motionvideo-assets`, served from its
// custom domain so it doesn't ship with (or count against) the Worker.
export const ASSETS_URL = "https://assets.motionvideo.xyz";

export const ASSETS = {
  // Content-hashed key: R2 serves these immutable, so a new cut gets a new name.
  VIDEO_HERO: `${ASSETS_URL}/videos/motionvideo-launch-4ccff6ecea.mp4`,
  VIDEO_LAUNCH: `${ASSETS_URL}/videos/shadercn-launch.mp4`,
  VIDEO_SHOWREEL: `${ASSETS_URL}/videos/aniketpawar-reel.mp4`,
} as const;
