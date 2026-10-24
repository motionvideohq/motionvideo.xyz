import { Link } from "@tanstack/react-router";
import type { MDXComponents } from "mdx/types";
import type { ComponentProps, ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { AlertTriangle } from "reicon-react/icons/AlertTriangle";
import { ArrowRight } from "reicon-react/icons/ArrowRight";
import { Hashtag } from "reicon-react/icons/Hashtag";
import { InfoCircle } from "reicon-react/icons/InfoCircle";

import { CodeBlock } from "@/components/docs/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

// Site-relative path (not protocol-relative `//host`), optional #fragment.
const INTERNAL_HREF = /^(?<path>\/(?!\/)[^#]*)(?:#(?<hash>.*))?$/u;

const linkClass =
  "text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground";

/**
 * Markdown links: site paths go through the router, `#anchors` and `mailto:`
 * stay plain, anything else opens in a new tab.
 */
export const DocsLink = ({
  href = "",
  className,
  children,
  ...props
}: ComponentProps<"a">) => {
  const content = useIntlayer("docs-layout");
  const internal = INTERNAL_HREF.exec(href)?.groups;
  if (internal) {
    return (
      <Link to={internal.path} hash={internal.hash} className={className}>
        {children}
      </Link>
    );
  }
  if (href.startsWith("#") || href.startsWith("mailto:")) {
    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={className}
      {...props}
    >
      {children}
      <span className="sr-only"> {content.opensInNewTab}</span>
    </a>
  );
};

/** h2–h4 with the id from remark-heading and a hover anchor link. */
const Heading = ({
  as: Tag,
  id,
  className,
  children,
  ...props
}: ComponentProps<"h2"> & { as: "h2" | "h3" | "h4" }) => {
  const content = useIntlayer("docs-layout");
  return (
    <Tag
      id={id}
      className={cn(
        "group/heading text-foreground scroll-mt-6 font-semibold tracking-tight text-balance",
        className
      )}
      {...props}
    >
      {children}
      {id ? (
        <a
          href={`#${id}`}
          aria-label={content.linkToSection.value}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring ml-2 inline-flex rounded-sm align-middle opacity-0 transition-opacity outline-none group-hover/heading:opacity-100 focus-visible:opacity-100 focus-visible:ring-2"
        >
          <Hashtag aria-hidden="true" className="size-4" />
        </a>
      ) : null}
    </Tag>
  );
};

const CALLOUT = {
  info: {
    icon: InfoCircle,
    className: "bg-card shadow-outline",
    iconClassName: "text-muted-foreground",
  },
  warn: {
    icon: AlertTriangle,
    className:
      "bg-amber-500/8 shadow-[inset_0_0_0_1px] shadow-amber-500/25 dark:bg-amber-400/8",
    iconClassName: "text-amber-600 dark:text-amber-400",
  },
} as const;

export const Callout = ({
  type = "info",
  title,
  children,
}: {
  type?: keyof typeof CALLOUT;
  title?: ReactNode;
  children?: ReactNode;
}) => {
  const { icon: Icon, className, iconClassName } = CALLOUT[type];
  return (
    <aside className={cn("flex gap-3 rounded-xl p-4 text-sm", className)}>
      <Icon
        aria-hidden="true"
        className={cn("mt-1 size-4 shrink-0", iconClassName)}
      />
      <div className="flex min-w-0 flex-col gap-2 leading-6 [&_p]:leading-6">
        {title ? <p className="text-foreground font-medium">{title}</p> : null}
        {children}
      </div>
    </aside>
  );
};

/** Numbered vertical steps; each Step holds a `### Heading` and its body. */
export const Steps = ({ children }: { children?: ReactNode }) => (
  <div className="flex flex-col [counter-reset:docs-step]">{children}</div>
);

export const Step = ({ children }: { children?: ReactNode }) => (
  <section className="border-border before:bg-muted before:text-foreground relative ml-3.5 flex flex-col gap-4 border-l pb-8 pl-8 [counter-increment:docs-step] before:absolute before:top-0 before:left-0 before:flex before:size-7 before:-translate-x-1/2 before:items-center before:justify-center before:rounded-full before:font-mono before:text-xs before:font-medium before:content-[counter(docs-step)] last:border-transparent last:pb-0 [&>h3]:mt-0 [&>h3]:leading-7">
    {children}
  </section>
);

export const Cards = ({ children }: { children?: ReactNode }) => (
  <div className="grid gap-3 sm:grid-cols-2">{children}</div>
);

export const Card = ({
  title,
  href,
  description,
}: {
  title: ReactNode;
  href: string;
  description?: ReactNode;
}) => (
  <DocsLink
    href={href}
    className="group/card bg-card shadow-outline hover:bg-muted/50 focus-visible:ring-ring flex flex-col gap-1 rounded-xl p-4 transition-colors outline-none focus-visible:ring-2"
  >
    <span className="text-foreground flex items-center gap-1.5 font-medium">
      {title}
      <ArrowRight
        aria-hidden="true"
        className="size-3.5 transition-transform group-hover/card:translate-x-0.5"
      />
    </span>
    {description ? (
      <span className="text-muted-foreground text-sm leading-6">
        {description}
      </span>
    ) : null}
  </DocsLink>
);

export const DocsTabs = ({
  items,
  children,
}: {
  items: string[];
  children?: ReactNode;
}) => (
  <Tabs defaultValue={items[0]} className="gap-3">
    <TabsList className="max-w-full justify-start overflow-x-auto">
      {items.map((item) => (
        <TabsTrigger key={item} value={item} className="px-2.5">
          {item}
        </TabsTrigger>
      ))}
    </TabsList>
    {children}
  </Tabs>
);

export const DocsTab = ({
  value,
  children,
}: {
  value: string;
  children?: ReactNode;
}) => (
  <TabsContent
    value={value}
    className="flex flex-col gap-4 text-base leading-7"
  >
    {children}
  </TabsContent>
);

// Element styles for compiled MDX; the article sets colour, rhythm (a flex
// column with gaps) and line height, so these only add what differs.
export const docsMdxComponents = {
  h2: (props) => <Heading as="h2" className="mt-6 text-xl" {...props} />,
  h3: (props) => <Heading as="h3" className="mt-3 text-base" {...props} />,
  h4: (props) => <Heading as="h4" className="mt-2 text-sm" {...props} />,
  a: ({ className, ...props }) => (
    <DocsLink className={cn(linkClass, className)} {...props} />
  ),
  strong: ({ className, ...props }) => (
    <strong
      className={cn("text-foreground font-medium", className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul
      className={cn(
        "marker:text-muted-foreground/60 flex list-disc flex-col gap-2 pl-5",
        className
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      className={cn(
        "marker:text-muted-foreground flex list-decimal flex-col gap-2 pl-5",
        className
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }) => (
    <li className={cn("pl-1 [&>ol]:mt-2 [&>ul]:mt-2", className)} {...props} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "border-border flex flex-col gap-3 border-l-2 pl-4 italic",
        className
      )}
      {...props}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr className={cn("border-border my-2", className)} {...props} />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn(
        "bg-muted text-foreground rounded-md px-1.5 py-0.5 font-mono text-[0.8125em]",
        className
      )}
      {...props}
    />
  ),
  pre: CodeBlock,
  table: ({ className, ...props }) => (
    <div className="shadow-outline overflow-x-auto rounded-xl">
      <table
        className={cn("w-full text-left text-sm leading-6", className)}
        {...props}
      />
    </div>
  ),
  thead: ({ className, ...props }) => (
    <thead
      className={cn("bg-muted/50 text-foreground", className)}
      {...props}
    />
  ),
  tr: ({ className, ...props }) => (
    <tr
      className={cn(
        "border-border border-t align-top first:border-t-0",
        className
      )}
      {...props}
    />
  ),
  th: ({ className, ...props }) => (
    <th className={cn("px-4 py-2.5 font-medium", className)} {...props} />
  ),
  td: ({ className, ...props }) => (
    <td
      className={cn(
        "px-4 py-3 text-pretty [&_code]:whitespace-nowrap",
        className
      )}
      {...props}
    />
  ),
  img: ({ className, alt = "", ...props }) => (
    <img
      alt={alt}
      loading="lazy"
      className={cn("shadow-outline rounded-xl", className)}
      {...props}
    />
  ),
  Callout,
  Steps,
  Step,
  Cards,
  Card,
  Tabs: DocsTabs,
  Tab: DocsTab,
} satisfies MDXComponents;
