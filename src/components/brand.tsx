import { Link } from "@tanstack/react-router";

import { Logomark } from "@/components/logomark";
import { SITE } from "@/constants/site";

export const Brand = () => (
  <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
    <Logomark className="h-4 w-auto" />
    {SITE.NAME}
  </Link>
);
