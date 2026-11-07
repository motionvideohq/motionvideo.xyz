import { createFileRoute, getRouteApi, notFound } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";

import { JobsBoard } from "@/components/jobs-board";
import { JOB_TYPES } from "@/constants/jobs";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { createMetadata } from "@/seo/metadata";
import { getLandingData } from "@/server/functions";
import { getJobs } from "@/server/job-functions";

const routeApi = getRouteApi("/{-$locale}/jobs/$type");

const JobsOfType = () => {
  const { jobs, type } = routeApi.useLoaderData();
  return <JobsBoard jobs={jobs} type={type} />;
};

// /jobs/full-time, /jobs/part-time, /jobs/contract, /jobs/freelance. Unknown
// types 404; /jobs/post is its own (static) route and wins over this one.
export const Route = createFileRoute("/{-$locale}/jobs/$type")({
  component: JobsOfType,
  loader: async ({ params }) => {
    const type = JOB_TYPES.find((value) => value === params.type);
    if (!type) {
      throw notFound();
    }
    const [landing, jobs] = await Promise.all([getLandingData(), getJobs()]);
    return { ...landing, jobs, type };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {};
    }
    const meta = getIntlayer(
      "directory-meta",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    ).jobTypes[loaderData.type];
    return createMetadata({
      description: meta.description,
      title: meta.title,
    });
  },
});
