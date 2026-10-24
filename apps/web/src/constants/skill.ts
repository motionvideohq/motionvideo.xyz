// The Pro agent skill (included in Pro and Business, documented at
// /docs/skill). Access to the private repository comes through the Dodo
// Payments customer portal.
export const SKILL = {
  INSTALL_COMMAND:
    "npx skills add https://github.com/motionvideohq/motionvideo-skill.git --skill '*' -a claude-code -y",
  REPO: "https://github.com/motionvideohq/motionvideo-skill",
  // The free setup skill (served at /skill.md), open source in the site's
  // repository.
  SETUP_SOURCE:
    "https://github.com/motionvideohq/motionvideo.xyz/blob/main/apps/web/content/skill.md",
} as const;
