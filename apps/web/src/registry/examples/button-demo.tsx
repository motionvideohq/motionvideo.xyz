import { ArrowRight } from "reicon-react/icons/ArrowRight";

import { Button } from "@/registry/ui/button";

// The button's variants side by side, for its page on /design/components.
export const ButtonDemo = () => (
  <div className="flex flex-col items-center gap-4">
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button variant="gradient" size="lg">
        Get Pro
        <ArrowRight data-icon="inline-end" />
      </Button>
      <Button size="lg">Default</Button>
      <Button variant="secondary" size="lg">
        Secondary
      </Button>
      <Button variant="outline" size="lg">
        Outline
      </Button>
    </div>
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button variant="ghost">Ghost</Button>
      <Button variant="subtle">Subtle</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  </div>
);
