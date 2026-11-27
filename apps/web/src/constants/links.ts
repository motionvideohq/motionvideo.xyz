/** The handle MotionVideo uses across its social accounts. */
export const SOCIAL_HANDLE = "motionvideohq";

export const GITHUB = {
  org: SOCIAL_HANDLE,
  repo: "motionvideo.xyz",
} as const;

const X_HANDLE = SOCIAL_HANDLE;

/** A creator's X/Twitter profile. */
export const xProfileUrl = (handle: string) => `https://x.com/${handle}`;

export const LINK = {
  AUTHOR_WEBSITE: "https://www.aniketpawar.com",
  DODO_PAYMENTS: "https://dodopayments.com",
  DODO_PAYMENTS_PRIVACY: "https://dodopayments.com/legal/privacy-policy",
  EMAIL: "hello@motionvideo.xyz",
  FACEBOOK: `https://www.facebook.com/${SOCIAL_HANDLE}/`,
  GITHUB: `https://github.com/${GITHUB.org}`,
  GITHUB_REPO: `https://github.com/${GITHUB.org}/${GITHUB.repo}`,
  INSTAGRAM: `https://www.instagram.com/${SOCIAL_HANDLE}/`,
  LINKEDIN: `https://www.linkedin.com/company/${SOCIAL_HANDLE}/`,
  MCP_REPO: `https://github.com/${GITHUB.org}/motionvideo-mcp`,
  PINTEREST: `https://www.pinterest.com/${SOCIAL_HANDLE}/`,
  SHADCN_LABS: "https://www.shadcn-labs.com",
  THREADS: `https://www.threads.com/@${SOCIAL_HANDLE}`,
  X: xProfileUrl(X_HANDLE),
  YOUTUBE: `https://www.youtube.com/@${SOCIAL_HANDLE}`,
  // Opens a DM to the founder's personal account (X needs the numeric user
  // id), where sponsorship questions go.
  X_DM: "https://x.com/messages/compose?recipient_id=1444537408431673345",
  X_FOLLOW: `https://x.com/intent/follow?screen_name=${X_HANDLE}`,
  // Follow/subscribe intents: Threads' documented follow intent, and YouTube's
  // `sub_confirmation=1`, which opens the subscribe dialog on the channel.
  // Pinterest, LinkedIn, Instagram and Facebook have no follow intent.
  THREADS_FOLLOW: `https://www.threads.com/intent/follow?username=${SOCIAL_HANDLE}`,
  YOUTUBE_SUBSCRIBE: `https://www.youtube.com/@${SOCIAL_HANDLE}?sub_confirmation=1`,
} as const;

// Large media lives in the R2 bucket `motionvideo-assets`, served from its
// custom domain so it doesn't ship with (or count against) the Worker.
export const ASSETS_URL = "https://assets.motionvideo.xyz";

export const ASSETS = {
  // Content-hashed key: R2 serves these immutable, so a new cut gets a new name.
  VIDEO_HERO: `${ASSETS_URL}/videos/motionvideo-launch-4ccff6ecea.mp4`,
  VIDEO_LAUNCH: `${ASSETS_URL}/videos/shadercn-launch.mp4`,
  // The share video (og:video), rendered by `pnpm og:render` in apps/videos.
  VIDEO_OG: `${ASSETS_URL}/videos/og-7dfae62675.mp4`,
  VIDEO_SHOWREEL: `${ASSETS_URL}/videos/aniketpawar-reel.mp4`,
} as const;
