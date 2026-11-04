import { getIntlayer } from "intlayer";

import { DEFAULT_LOCALE } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import catalog from "@/data/motion-catalog.json";
import { CHANGELOG_ENTRIES, CHANGELOG_FEEDS } from "@/lib/changelog";
import { pickVideos } from "@/lib/video-picks";
import type { VideoPick } from "@/lib/video-picks";
import { FEED_MDX_COMPONENTS, feedHtml, pageUrl } from "@/server/feeds";
import type { FeedSource } from "@/server/feeds";

/** The changelog's feeds (src/server/feeds.tsx). */
export const CHANGELOG_FEED: FeedSource = {
  feeds: CHANGELOG_FEEDS,
  homePath: ROUTES.CHANGELOG,
  // The page's English intro.
  description: getIntlayer("changelog", DEFAULT_LOCALE).intro,
  items: () => {
    // The same posters as the cards on /changelog.
    const covers = pickVideos(
      CHANGELOG_ENTRIES.map((entry) => entry.data.cover),
      catalog.videos
    );
    return Promise.all(
      CHANGELOG_ENTRIES.map(async (entry) => {
        // Bodies load lazily; once loaded they render without suspending.
        await entry.data.preload();
        const { body: Body, date, description, title } = entry.data;
        const cover: VideoPick | undefined = covers[entry.data.cover];
        return {
          cover,
          date,
          html: feedHtml(cover, <Body components={FEED_MDX_COMPONENTS} />),
          summary: description,
          title,
          url: pageUrl(entry.url),
        };
      })
    );
  },
};
