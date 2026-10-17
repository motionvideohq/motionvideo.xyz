import { Link } from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import { CopyPromptButton } from "@/components/copy-prompt-button";
import { buttonVariants } from "@/components/ui/button";
import { parseInline } from "@/lib/blog";
import type { BlogBlock, BlogVideo } from "@/lib/blog";
import { cn } from "@/lib/utils";

const inlineLink = "text-foreground underline underline-offset-4";

// Inline text from a post. Every node becomes a React element or string, so
// the source can never inject markup.
const Inline = ({ text }: { text: string }) =>
  parseInline(text).map((node, index) => {
    const key = `${index}-${node.type}`;
    switch (node.type) {
      case "bold": {
        return (
          <strong key={key} className="text-foreground font-semibold">
            {node.text}
          </strong>
        );
      }
      case "code": {
        return (
          <code
            key={key}
            className="bg-muted text-foreground rounded px-1 py-0.5 font-mono text-[0.9em]"
          >
            {node.text}
          </code>
        );
      }
      case "link": {
        return node.href.startsWith("/") ? (
          <Link key={key} to={node.href} className={inlineLink}>
            {node.text}
          </Link>
        ) : (
          <a key={key} href={node.href} className={inlineLink}>
            {node.text}
          </a>
        );
      }
      default: {
        return node.text;
      }
    }
  });

const PromptBlock = ({
  caption,
  prompt,
}: {
  caption: string;
  prompt: string;
}) => (
  <figure className="flex flex-col gap-2">
    <div className="flex items-center justify-between gap-3">
      <figcaption className="text-foreground text-sm font-medium">
        {caption}
      </figcaption>
      <CopyPromptButton text={prompt} analytics={{ from: "blog" }} />
    </div>
    <pre className="bg-muted text-foreground rounded-xl p-4 font-serif text-sm leading-relaxed whitespace-pre-wrap">
      {prompt}
    </pre>
  </figure>
);

const VideoCards = ({
  caption,
  videos,
}: {
  caption: string | undefined;
  videos: BlogVideo[];
}) => {
  const content = useIntlayer("blog");
  return (
    <figure className="flex flex-col gap-3">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {videos.map((video) => (
          <li key={video.slug}>
            <Link
              to="/videos/$slug"
              params={{ slug: video.slug }}
              className="group flex flex-col gap-1.5"
            >
              <img
                src={video.poster}
                alt=""
                width={video.width}
                height={video.height}
                loading="lazy"
                className="bg-muted aspect-video w-full rounded-lg object-cover transition-opacity group-hover:opacity-85"
              />
              <span className="text-foreground line-clamp-1 text-sm font-medium">
                {video.title}
              </span>
              <span className="text-muted-foreground line-clamp-1 text-xs">
                {content.by} @{video.handle}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {caption && (
        <figcaption className="text-muted-foreground text-sm">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

const Block = ({
  block,
  videos,
}: {
  block: BlogBlock;
  videos: Record<string, BlogVideo>;
}) => {
  switch (block.type) {
    case "heading": {
      const Heading = block.level === 2 ? "h2" : "h3";
      return (
        <Heading
          className={cn(
            "text-foreground font-semibold tracking-tight",
            block.level === 2 ? "mt-4 text-xl" : "mt-2 text-lg"
          )}
        >
          {block.text}
        </Heading>
      );
    }
    case "paragraph": {
      return (
        <p>
          <Inline text={block.text} />
        </p>
      );
    }
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return (
        <List
          className={cn(
            "flex flex-col gap-2 pl-5",
            block.ordered ? "list-decimal" : "list-disc"
          )}
        >
          {block.items.map((item) => (
            <li key={item}>
              <Inline text={item} />
            </li>
          ))}
        </List>
      );
    }
    case "prompt": {
      return <PromptBlock caption={block.caption} prompt={block.prompt} />;
    }
    case "videos": {
      // Slugs missing from the catalog (a removed video) are dropped.
      const found = block.slugs.flatMap((slug) => {
        const video = videos[slug];
        return video ? [video] : [];
      });
      return found.length > 0 ? (
        <VideoCards caption={block.caption} videos={found} />
      ) : null;
    }
    case "callout": {
      return (
        <aside className="bg-muted/60 flex flex-col items-start gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-foreground text-sm">{block.text}</p>
          <Link
            to={block.href}
            className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
          >
            {block.label}
            <ArrowRight data-icon="inline-end" />
          </Link>
        </aside>
      );
    }
    default: {
      return null;
    }
  }
};

/** A blog post body. `videos` holds the catalog entries its video blocks name. */
export const BlogContent = ({
  blocks,
  videos,
}: {
  blocks: BlogBlock[];
  videos: Record<string, BlogVideo>;
}) => (
  <div className="text-muted-foreground flex flex-col gap-5 leading-7">
    {blocks.map((block, index) => (
      // Static list; the index is a stable key.
      // oxlint-disable-next-line react/no-array-index-key
      <Block key={index} block={block} videos={videos} />
    ))}
  </div>
);
