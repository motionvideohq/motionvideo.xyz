// MotionVideo Create: the browser tools (Showcase first), their plan limits
// and the one-time single export. Shared by the editors, the server access
// checks, checkout, pricing copy and the Dodo setup script (keep its
// PRODUCTS entry in sync with CREATE_PASS_CENTS).

export const CREATE_TOOLS = ["showcase"] as const;
export type CreateTool = (typeof CREATE_TOOLS)[number];

/** A single export: one project, every setting, re-exports for 7 days. */
export const CREATE_PASS_CENTS = 400;
export const CREATE_PASS_DAYS = 7;

/** What a free export may use; Pro or a single export lifts every limit. */
export const FREE_LIMITS = {
  /** Short side of the video in pixels (1080p). */
  resolution: 1080,
  fps: 30,
  /** Longest side of a still in pixels. */
  still: 1440,
  formats: ["mp4"],
  transparent: false,
  gif: false,
  sequence: false,
  proTemplates: false,
} as const;

/** Resolutions offered for video export: the frame's short side. */
export const VIDEO_RESOLUTIONS = [720, 1080, 1440, 2160] as const;
export const VIDEO_FPS = [24, 30, 60] as const;
export const STILL_SIZES = [1080, 1440, 2160, 4320] as const;
export const GIF_WIDTHS = [320, 480, 640, 800, 1080] as const;
export const GIF_FPS = [15, 20, 25] as const;

/** Media accepted by the editors. */
export const MAX_VIDEO_BYTES = 500 * 2 ** 20;
export const MAX_VIDEO_SECONDS = 60;
export const MAX_IMAGE_EDGE = 3200;
export const MAX_MEDIA_ITEMS = 60;

/**
 * What the signed-in visitor may export, from getCreateAccess. `passes` are
 * live single exports: one project each, until `expiresAt` (ms).
 */
export interface CreateAccess {
  signedIn: boolean;
  pro: boolean;
  passes: { tool: CreateTool; projectId: string; expiresAt: number }[];
}

export const NO_CREATE_ACCESS: CreateAccess = {
  signedIn: false,
  pro: false,
  passes: [],
};

/**
 * True when this project may use every export setting. `access.passes` only
 * holds live passes (the server drops expired and refunded ones).
 */
export const unlocked = (
  access: CreateAccess,
  tool: CreateTool,
  projectId: string
) =>
  access.pro ||
  access.passes.some((p) => p.tool === tool && p.projectId === projectId);
