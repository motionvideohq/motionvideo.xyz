import type { MDXComponents } from "mdx/types";
import type { ComponentProps, ReactNode } from "react";
import { useLocale } from "react-intlayer";

import { localizedPath } from "@/constants/locales";

// Entries link to site pages without a locale (`/color/blue`), so one file
// serves every language; the reader's locale is added here. External and
// hash links pass through.
const EntryLink = ({ href = "", children, ...props }: ComponentProps<"a">) => {
  const { locale } = useLocale();
  const internal = href.startsWith("/") && !href.startsWith("//");
  return (
    <a
      {...props}
      href={internal ? localizedPath(href, locale) : href}
      className="text-foreground underline underline-offset-4"
    >
      {children}
    </a>
  );
};

// The text pages' type scale (PageSection, PageList), applied to MDX output
// for changelog entries and blog posts.
const components: MDXComponents = {
  a: EntryLink,
  h2: ({ children, ...props }) => (
    <h2
      {...props}
      className="text-foreground mt-6 text-xl font-semibold tracking-tight first:mt-0"
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 {...props} className="text-foreground mt-2 font-semibold">
      {children}
    </h3>
  ),
  code: (props) => (
    <code
      {...props}
      className="bg-muted text-foreground rounded px-1 py-0.5 font-mono text-[0.9em]"
    />
  ),
  img: (props) => (
    // oxlint-disable-next-line jsx-a11y/alt-text -- alt comes from the MDX
    <img {...props} loading="lazy" className="rounded-xl border" />
  ),
  li: (props) => <li {...props} className="pl-1" />,
  ol: (props) => (
    <ol {...props} className="flex list-decimal flex-col gap-2 pl-5" />
  ),
  strong: (props) => (
    <strong {...props} className="text-foreground font-semibold" />
  ),
  ul: (props) => (
    <ul {...props} className="flex list-disc flex-col gap-2 pl-5" />
  ),
};

/**
 * A rendered MDX body (changelog entry, blog post), styled like the other
 * text pages. `extra` adds a collection's own components (<Prompt>, …).
 */
export const ProseBody = ({
  Body,
  extra,
}: {
  Body: (props: { components?: MDXComponents }) => ReactNode;
  extra?: MDXComponents;
}) => (
  <div className="text-muted-foreground flex flex-col gap-4 leading-7">
    <Body components={extra ? { ...components, ...extra } : components} />
  </div>
);
