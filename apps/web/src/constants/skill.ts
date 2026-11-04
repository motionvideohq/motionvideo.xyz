import { GITHUB, LINK } from "@/constants/links";

const SKILL_REPO = `${GITHUB.org}/motionvideo-skill`;

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
