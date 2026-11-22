import { GITHUB, LINK } from "@/constants/links";

const SKILL_REPO = `${GITHUB.org}/motionvideo-skill`;
const GTA_REPO = `${GITHUB.org}/motionvideo-gta-skill`;

// The Pro agent skill (included in Pro and Business, documented at
// /docs/skill). Access to the private repository comes through the Dodo
// Payments customer portal.
export const SKILL = {
  INSTALL_COMMAND: `npx skills add https://github.com/${SKILL_REPO}.git --skill '*' -a claude-code -y`,
  /** The short form shown on /pro; SSH, since the repository is private. */
  INSTALL_COMMAND_SSH: `npx skills add git@github.com:${SKILL_REPO}.git`,
  REPO: `https://github.com/${SKILL_REPO}`,
  // The free setup skill (served at /skill.md), open source in the site's
  // repository.
  SETUP_SOURCE: `${LINK.GITHUB_REPO}/blob/main/apps/web/content/skill.md`,
} as const;

// The GTA 6 Clip Pack (/gta-6-clipping, documented at /docs/gta-6): renderer-agnostic
// skills that add a motion-graphics layer to gameplay clips. Sold once, and
// included in Pro annual, Pro lifetime and Business annual (GTA_PACK_PLANS);
// the private repository is granted the same way as the Pro skill's.
export const GTA_SKILL = {
  INSTALL_COMMAND: `npx skills add https://github.com/${GTA_REPO}.git --skill '*' -a claude-code -y`,
  /** The short form; SSH, since the repository is private. */
  INSTALL_COMMAND_SSH: `npx skills add git@github.com:${GTA_REPO}.git`,
  REPO: `https://github.com/${GTA_REPO}`,
  /** Skill folders in the repository, entry point first. */
  SKILLS: [
    "gta-clip",
    "gta-wanted",
    "gta-cards",
    "gta-captions",
    "gta-hud",
    "gta-impact",
  ],
} as const;

/** Shown verbatim wherever the pack is sold or documented. */
export const GTA_DISCLAIMER =
  "Not affiliated with, endorsed by, or sponsored by Rockstar Games or Take-Two Interactive. Grand Theft Auto and GTA are trademarks of Take-Two Interactive.";
