import { Suspense, lazy, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";

import { SectionHeader } from "@/components/page";
import { Skeleton } from "@/components/ui/skeleton";
import type { AudienceStats } from "@/server/audience";
import { getAudienceStats } from "@/server/sponsorship-functions";

const cardClass = "bg-card shadow-outline flex flex-col gap-4 rounded-2xl p-5";

// Recharts is large; load the chart only once there are numbers to draw, so
// it never sits in the route's first bundle.
const loadChart = () => import("@/components/sponsor-audience-chart");

const SponsorAudience = lazy(async () => {
  const module = await loadChart();
  return { default: module.SponsorAudience };
});

/** One ranked-list card, holding the same five-row height as a loaded list. */
const BarListSkeleton = ({ title }: { title: ReactNode }) => (
  <section className={cardClass}>
    <h3 className="text-sm font-medium">{title}</h3>
    <ul className="flex min-h-[11.5rem] flex-col gap-1.5">
      {[0, 1, 2, 3, 4].map((row) => (
        <li key={row}>
          <Skeleton
            className="h-8 w-full"
            style={{ opacity: 1 - row * 0.14 }}
          />
        </li>
      ))}
    </ul>
  </section>
);

/** The audience block's shape while its numbers are on the way. */
const SponsorAudienceSkeleton = () => {
  const content = useIntlayer("sponsor");
  return (
    <div className="flex flex-col gap-3">
      <section className={cardClass}>
        <dl className="grid grid-cols-2 gap-4">
          {(["visitors", "pageviews"] as const).map((key) => (
            <div key={key} className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-sm">{content[key]}</dt>
              <dd className="text-3xl font-semibold tracking-tight tabular-nums">
                <Skeleton className="h-9 w-24" />
              </dd>
            </div>
          ))}
        </dl>
        <Skeleton className="h-56 w-full rounded-xl" />
      </section>
      <div className="grid gap-3 sm:grid-cols-2">
        <BarListSkeleton title={content.topCountries} />
        <BarListSkeleton title={content.topSources} />
      </div>
    </div>
  );
};

// One request per browser session: leaving and returning to /sponsor shows
// the numbers straight away instead of asking PostHog again.
let statsCache: AudienceStats | null | undefined;
let statsRequest: Promise<AudienceStats | null> | undefined;

const loadAudience = (): Promise<AudienceStats | null> => {
  if (statsCache !== undefined) {
    return Promise.resolve(statsCache);
  }
  statsRequest ??= (async () => {
    try {
      const stats = await getAudienceStats();
      statsCache = stats;
      return stats;
    } catch {
      // Let a later visit try again after a network or PostHog hiccup.
      statsRequest = undefined;
      return null;
    }
  })();
  return statsRequest;
};

// Start the chart download beside the data request; both are needed before
// the block can replace its skeleton.
const warmChart = async () => {
  try {
    await loadChart();
  } catch {
    // lazy() tries again when the numbers arrive.
  }
};

/**
 * Traffic proof for prospective sponsors. The route renders in full first
 * and the numbers arrive from the client, with a skeleton standing in, so a
 * slow PostHog query never holds up navigation to /sponsor.
 */
export const SponsorAudienceSection = () => {
  const content = useIntlayer("sponsor");
  // `undefined` while loading, `null` when analytics cannot be read.
  const [stats, setStats] = useState<AudienceStats | null | undefined>(
    statsCache
  );

  useEffect(() => {
    let active = true;
    const run = async () => {
      const data = await loadAudience();
      if (active) {
        setStats(data);
      }
    };
    void warmChart();
    void run();
    return () => {
      active = false;
    };
  }, []);

  // Without numbers there is nothing honest to show; leave the section out.
  if (stats === null) {
    return null;
  }

  return (
    <section
      aria-labelledby="audience"
      aria-busy={stats === undefined}
      className="flex w-full max-w-4xl flex-col gap-6"
    >
      <SectionHeader
        id="audience"
        title={content.audience}
        description={content.audienceIntro}
      />
      {stats === undefined ? (
        <>
          <output className="sr-only">{content.loadingAudience}</output>
          <SponsorAudienceSkeleton />
        </>
      ) : (
        <Suspense fallback={<SponsorAudienceSkeleton />}>
          <SponsorAudience stats={stats} />
        </Suspense>
      )}
    </section>
  );
};
