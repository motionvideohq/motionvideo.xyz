/**
 * Release flag for Launch Videos. Off in production until
 * `VITE_LAUNCH_VIDEOS=1` is set at build time: the pages and the API answer
 * 404, the nav hides the section and the sitemap leaves it out.
 */
export const LAUNCH_VIDEOS_LIVE: boolean =
  import.meta.env.DEV || import.meta.env.VITE_LAUNCH_VIDEOS === "1";
