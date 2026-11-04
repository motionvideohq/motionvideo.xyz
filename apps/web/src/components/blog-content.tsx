import type { MDXComponents } from "mdx/types";
import { createContext, use } from "react";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { ArrowRight } from "reicon-react/icons/ArrowRight";

import { CopyPromptButton } from "@/components/copy-prompt-button";
import { LocalizedLink as Link } from "@/components/localized-link";
import { ProseBody } from "@/components/prose-mdx";
import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { VideoPick } from "@/lib/video-picks";

/** `<Prompt caption="…" prompt="…" />`: a prompt excerpt the reader can copy. */
const Prompt = ({ caption, prompt }: { caption: string; prompt: string }) => (
  <figure className="flex flex-col gap-2">
    <div className="flex items-center justify-between gap-3">
      <figcaption className="text-foreground text-sm font-medium">
        {caption}
      </figcaption>
      <CopyPromptButton prompt={prompt} analytics={{ from: "blog" }} />
    </div>
    <pre className="bg-muted text-foreground rounded-xl p-4 font-serif text-sm leading-relaxed whitespace-pre-wrap">
      {prompt}
    </pre>
  </figure>
);

/** Gallery videos as poster cards. */
const VideoCards = ({
  caption,
  videos,
}: {
  caption: string | undefined;
  videos: VideoPick[];
}) => {
  const content = useIntlayer("blog");
  return (
    <figure className="flex flex-col gap-3">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {videos.map((video) => (
          <li key={video.slug}>
            <Link
              to={ROUTES.VIDEO}
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

// The post's videos, by slug, for <Videos> inside the MDX body.
const PostVideos = createContext<Record<string, VideoPick>>({});

/** `<Videos caption="…" slugs={[…]} />`; slugs not in the post's videos drop. */
const Videos = ({ caption, slugs }: { caption?: string; slugs: string[] }) => {
  const videos = use(PostVideos);
  const found = slugs.flatMap((slug) => {
    const video = videos[slug];
    return video ? [video] : [];
  });
  return found.length > 0 ? (
    <VideoCards caption={caption} videos={found} />
  ) : null;
};

/** `<Callout href="/…" label="…">text</Callout>`: a pointer to another page. */
const Callout = ({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) => (
  <aside className="bg-muted/60 flex flex-col items-start gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="text-foreground text-sm [&>p]:m-0">{children}</div>
    <Link
      to={href}
      className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
    >
      {label}
      <ArrowRight data-icon="inline-end" />
    </Link>
  </aside>
);

const extra: MDXComponents = { Callout, Prompt, Videos };

/**
 * A blog post's MDX body. `videos` holds the catalog entries listed in the
 * post's `videos` frontmatter, the only ones its <Videos> can show.
 */
export const BlogContent = ({
  Body,
  videos,
}: {
  Body: (props: { components?: MDXComponents }) => ReactNode;
  videos: Record<string, VideoPick>;
}) => (
  <PostVideos value={videos}>
    <ProseBody Body={Body} extra={extra} />
  </PostVideos>
);
