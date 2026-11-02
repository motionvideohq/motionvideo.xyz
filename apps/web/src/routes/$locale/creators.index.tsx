import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useMemo, useState } from "react";
import { useIntlayer, useLocale } from "react-intlayer";
import { User } from "reicon-react/icons/User";

import { LocalizedLink as Link } from "@/components/localized-link";
import { PageHeader, PageMain } from "@/components/page";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Input } from "@/components/ui/input";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { MOTION_CREATORS } from "@/lib/motion-creators";
import { fillTemplate } from "@/lib/motion-video-route";
import { createMetadata } from "@/seo/metadata";
import { getLandingData } from "@/server/functions";

const CreatorAvatar = ({ src }: { src: string }) => {
  const [failed, setFailed] = useState(false);
  return src && !failed ? (
    <img
      src={src}
      alt=""
      width={48}
      height={48}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="bg-muted size-12 shrink-0 rounded-full object-cover"
    />
  ) : (
    <User
      aria-hidden="true"
      className="bg-muted text-muted-foreground size-12 shrink-0 rounded-full p-2"
    />
  );
};

const Creators = () => {
  const { signedIn } = Route.useLoaderData();
  const content = useIntlayer("creator-directory");
  const { locale } = useLocale();
  const [search, setSearch] = useState("");
  const formatter = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const creators = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? MOTION_CREATORS.filter(
          (creator) =>
            creator.name.toLowerCase().includes(query) ||
            `@${creator.handle}`.includes(query)
        )
      : MOTION_CREATORS;
  }, [search]);

  return (
    <>
      <SiteHeader signedIn={signedIn} />
      <PageMain width="full">
        <PageHeader title={content.title.value} intro={content.description} />
        <div className="max-w-sm">
          <label htmlFor="creator-search" className="sr-only">
            {content.search}
          </label>
          <Input
            id="creator-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={content.search.value}
            autoComplete="off"
            aria-controls="creator-list"
          />
        </div>
        {/* No virtualization: the initial HTML links to every real creator. */}
        <ul
          id="creator-list"
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {creators.map((creator) => (
            <li key={creator.handle} className="min-w-0">
              <Link
                to="/creators/$creator"
                params={{ creator: creator.handle }}
                className="border-border hover:bg-muted/50 focus-visible:ring-ring flex h-full items-center gap-3 rounded-xl border p-4 transition-colors outline-none focus-visible:ring-2"
              >
                <CreatorAvatar src={creator.avatar} />
                <div className="min-w-0">
                  <p className="truncate font-medium">{creator.name}</p>
                  <p className="text-muted-foreground truncate text-sm">
                    @{creator.handle}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {fillTemplate(content.videoCount.value, {
                      count: formatter.format(creator.count),
                    })}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        {creators.length === 0 && (
          <output className="text-muted-foreground block py-8 text-center">
            {content.noResults}
          </output>
        )}
      </PageMain>
      <SiteFooter />
    </>
  );
};

export const Route = createFileRoute("/$locale/creators/")({
  component: Creators,
  loader: () => getLandingData(),
  head: ({ params }) => {
    const copy = getIntlayer(
      "creator-directory",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    );
    return createMetadata({
      title: copy.metaTitle,
      description: copy.description,
    });
  },
});
