import { Bezier } from "reicon-react/icons/Bezier";
import { Bookmark } from "reicon-react/icons/Bookmark";
import { BookOpen } from "reicon-react/icons/BookOpen";
import { Briefcase } from "reicon-react/icons/Briefcase";
import { Card2 } from "reicon-react/icons/Card2";
import { Code } from "reicon-react/icons/Code";
import { Designtools } from "reicon-react/icons/Designtools";
import { Docs } from "reicon-react/icons/Docs";
import { DocumentText } from "reicon-react/icons/DocumentText";
import { Envelope } from "reicon-react/icons/Envelope";
import { HandHeart } from "reicon-react/icons/HandHeart";
import { History } from "reicon-react/icons/History";
import { Layout } from "reicon-react/icons/Layout";
import { Lock } from "reicon-react/icons/Lock";
import { Office } from "reicon-react/icons/Office";
import { Plug } from "reicon-react/icons/Plug";
import { ProfileCircle } from "reicon-react/icons/ProfileCircle";
import { Scroll } from "reicon-react/icons/Scroll";
import { Settings } from "reicon-react/icons/Settings";
import { Sliders } from "reicon-react/icons/Sliders";
import { Sparkles } from "reicon-react/icons/Sparkles";
import { Star } from "reicon-react/icons/Star";
import { Undo } from "reicon-react/icons/Undo";
import { User2 } from "reicon-react/icons/User2";
import { VideoLib } from "reicon-react/icons/VideoLib";

/**
 * The one icon for each section and page, wherever it's listed: the header's
 * Explore menu and mobile sheet, the command menu (Go to, Pages and the search
 * scope), the account menu and the dashboard. Change a section's icon here.
 * Icons for actions (copy, export, close…) belong to their controls instead.
 */
export const SECTION_ICONS = {
  videos: VideoLib,
  tools: Designtools,
  creatives: User2,
  skills: Sparkles,
  extras: BookOpen,
  jobs: Briefcase,
  creators: ProfileCircle,
  moves: Bezier,
  templates: Layout,
  customize: Sliders,
  docs: Docs,
  blog: DocumentText,
  changelog: History,
  mcp: Plug,
  skill: Code,
  about: Office,
  contact: Envelope,
  sponsor: HandHeart,
  terms: Scroll,
  privacy: Lock,
  refunds: Undo,
  // Signed-in pages.
  featured: Star,
  bookmarks: Bookmark,
  billing: Card2,
  listings: Briefcase,
  sponsorships: HandHeart,
  settings: Settings,
} as const;

export type Section = keyof typeof SECTION_ICONS;
