import { useState } from "react";
import type { ReactNode } from "react";
import { Check } from "reicon-react/icons/Check";
import { ChevronDown } from "reicon-react/icons/ChevronDown";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { buttonVariants } from "@/registry/ui/button";

/**
 * "Details" under a plan card's price (sponsorship and job post forms):
 * everything the plan includes, behind a ghost toggle.
 */
export const PlanDetails = ({
  label,
  perks,
}: {
  label: ReactNode;
  perks: readonly { key: string; node: ReactNode }[];
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="flex flex-col">
      <CollapsibleTrigger
        className={buttonVariants({
          variant: "ghost",
          size: "xs",
          className: "group -ml-2 w-fit",
        })}
      >
        {label}
        <ChevronDown
          aria-hidden="true"
          className="transition-transform duration-150 ease-out group-data-panel-open:rotate-180"
        />
      </CollapsibleTrigger>
      {/* -mx-1/px-1 leave room for shadows inside the clipped
          (height-animated) panel. */}
      <CollapsibleContent className="-mx-1 h-(--collapsible-panel-height) overflow-hidden px-1 transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none [&[hidden]:not([hidden='until-found'])]:hidden">
        <ul className="flex flex-col gap-2 pt-3 pb-1 text-sm">
          {perks.map(({ key, node }) => (
            <li key={key} className="flex gap-2">
              <Check
                aria-hidden="true"
                className="text-primary mt-0.5 size-4 shrink-0"
              />
              {node}
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
};
