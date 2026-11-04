import { absoluteUrl } from "@/constants/url";

/** One feed file. `name` is the format's own name, the same in every language. */
export interface FeedFormat {
  name: string;
  path: string;
  type: string;
}

/** A section's feeds (changelog, blog), served by src/server/feeds.tsx. */
export interface Feeds {
  title: string;
  formats: { rss: FeedFormat; atom: FeedFormat; json: FeedFormat };
  /** `<link rel="alternate">` head tags so feed readers find the feeds. */
  links: { href: string; rel: string; title: string; type: string }[];
}

/** RSS 2.0, Atom 1.0 and JSON Feed 1.1 at the given paths. */
export const defineFeeds = (
  title: string,
  paths: { rss: string; atom: string; json: string }
): Feeds => {
  const formats = {
    rss: { name: "RSS", path: paths.rss, type: "application/rss+xml" },
    atom: { name: "Atom", path: paths.atom, type: "application/atom+xml" },
    json: {
      name: "JSON Feed",
      path: paths.json,
      type: "application/feed+json",
    },
  };
  return {
    title,
    formats,
    links: Object.values(formats).map((feed) => ({
      href: absoluteUrl(feed.path),
      rel: "alternate",
      title: `${title} (${feed.name})`,
      type: feed.type,
    })),
  };
};
