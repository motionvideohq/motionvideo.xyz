import type { ReactNode } from "react";
import { useIntlayer, useLocale } from "react-intlayer";

import { EvilLineChart } from "@/components/evilcharts/charts/recharts-line-chart";
import type { ChartConfig } from "@/components/evilcharts/ui/recharts-chart";
import { flagOf } from "@/lib/country";
import type { AudienceStats } from "@/server/audience";

const cardClass = "bg-card shadow-outline flex flex-col gap-4 rounded-2xl p-5";

/** A ranked list with each row's share drawn as a bar behind it. */
const BarList = ({
  title,
  rows,
  format,
}: {
  title: ReactNode;
  rows: { key: string; label: ReactNode; value: number }[];
  format: (value: number) => string;
}) => {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <section className={cardClass}>
      <h3 className="text-sm font-medium">{title}</h3>
      {/* Five rows plus gaps: the skeleton reserves this exact height. */}
      <ul className="flex min-h-[11.5rem] flex-col gap-1.5">
        {rows.map((row) => (
          <li
            key={row.key}
            className="relative flex items-center justify-between gap-3 overflow-hidden rounded-md px-2.5 py-1.5 text-sm"
          >
            <span
              aria-hidden="true"
              className="bg-muted absolute inset-y-0 left-0 rounded-md"
              style={{ width: `${(row.value / max) * 100}%` }}
            />
            <span className="relative min-w-0 truncate">{row.label}</span>
            <span className="text-muted-foreground relative tabular-nums">
              {format(row.value)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
};

/**
 * The /sponsor audience block: 30-day visitors and page views, their daily
 * line, and where visitors come from (countries and referring sites). Loaded
 * on demand so the charting library never weighs on navigation to the page.
 */
export const SponsorAudience = ({ stats }: { stats: AudienceStats }) => {
  const content = useIntlayer("sponsor");
  const { locale } = useLocale();
  const number = new Intl.NumberFormat(locale);
  // UTC on both sides: the days are UTC dates, and server and browser must
  // render the same label.
  const dayLabel = new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  const regions = new Intl.DisplayNames([locale], { type: "region" });
  const data = stats.daily.map((row) => ({
    ...row,
    label: dayLabel.format(new Date(`${row.day}T00:00:00Z`)),
  }));
  const config = {
    visitors: {
      label: content.visitors.value,
      colors: { light: ["var(--primary)"], dark: ["var(--primary)"] },
    },
    pageviews: {
      label: content.pageviews.value,
      colors: {
        light: ["var(--muted-foreground)"],
        dark: ["var(--muted-foreground)"],
      },
    },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col gap-3">
      <section className={cardClass}>
        <dl className="grid grid-cols-2 gap-4">
          {(["visitors", "pageviews"] as const).map((key) => (
            <div key={key} className="flex flex-col gap-1">
              <dt className="text-muted-foreground text-sm">{content[key]}</dt>
              <dd className="text-3xl font-semibold tracking-tight tabular-nums">
                {number.format(stats[key])}
              </dd>
            </div>
          ))}
        </dl>
        <EvilLineChart
          data={data}
          config={config}
          xDataKey="label"
          curveType="monotone"
          // A fixed height: the container defaults to a flexible 16:9 box.
          className="aspect-auto h-56 w-full flex-none"
        >
          <EvilLineChart.Grid />
          <EvilLineChart.XAxis dataKey="label" />
          <EvilLineChart.YAxis
            tickFormatter={(value: number) =>
              new Intl.NumberFormat(locale, { notation: "compact" }).format(
                value
              )
            }
          />
          <EvilLineChart.Legend />
          <EvilLineChart.Tooltip />
          <EvilLineChart.Line dataKey="pageviews" strokeWidth={1.5} />
          <EvilLineChart.Line dataKey="visitors" strokeWidth={2} />
        </EvilLineChart>
      </section>
      <div className="grid gap-3 sm:grid-cols-2">
        <BarList
          title={content.topCountries}
          format={(value) => number.format(value)}
          rows={stats.countries.map(({ code, visitors }) => ({
            key: code,
            label: `${flagOf(code)} ${regions.of(code) ?? code}`,
            value: visitors,
          }))}
        />
        <BarList
          title={content.topSources}
          format={(value) => number.format(value)}
          rows={stats.referrers.map(({ name, visitors }) => ({
            key: name,
            label: name,
            value: visitors,
          }))}
        />
      </div>
    </div>
  );
};
