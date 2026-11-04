import type { ComponentProps } from "react";

import { SECTION_ICONS } from "@/constants/section-icons";
import type { Section } from "@/constants/section-icons";

/** A section's icon as an element: `<SectionIcon section="extras" />`. */
export const SectionIcon = ({
  section,
  ...props
}: ComponentProps<(typeof SECTION_ICONS)[Section]> & { section: Section }) => {
  const Icon = SECTION_ICONS[section];
  return <Icon aria-hidden="true" {...props} />;
};
