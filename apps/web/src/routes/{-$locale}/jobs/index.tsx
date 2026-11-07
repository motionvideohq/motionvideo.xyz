import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { JobsBoard } from "@/components/jobs-board";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { createMetadata } from "@/seo/metadata";
import { getLandingData } from "@/server/functions";
import { getJobs } from "@/server/job-functions";

const routeApi = getRouteApi("/{-$locale}/jobs/");

const Jobs = () => {
  const { jobs } = routeApi.useLoaderData();
  return <JobsBoard jobs={jobs} type={undefined} />;
};

export const Route = createFileRoute("/{-$locale}/jobs/")({
  component: Jobs,
  head: ({ params }) => {
    const meta = getIntlayer(
      "directory-meta",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    ).jobs;
    return createMetadata({
      description: meta.description,
      title: meta.title,
    });
  },
  loader: async () => {
    const [landing, jobs] = await Promise.all([getLandingData(), getJobs()]);
    return { ...landing, jobs };
  },
});
