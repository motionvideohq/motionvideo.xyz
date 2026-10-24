import {
  Link,
  createFileRoute,
  getRouteApi,
  notFound,
} from "@tanstack/react-router";
import { useIntlayer } from "react-intlayer";

import { LockedPrompt } from "@/components/locked-prompt";
import { PageMain } from "@/components/page";
import { PromptCustomizer } from "@/components/prompt-customizer";
import { ROUTES } from "@/constants/routes";
import { findPromptTemplate, templatePath } from "@/lib/prompt-templates";
import { createMetadata } from "@/seo/metadata";
import { getTemplatePrompt } from "@/server/template-functions";

const layoutApi = getRouteApi("/templates");

const CustomizeTemplate = () => {
  const content = useIntlayer("templates-page");
  const { signedIn } = layoutApi.useLoaderData();
  const { template, prompt } = Route.useLoaderData();
  const path = templatePath(template);

  return (
    <PageMain width={prompt.locked ? "narrow" : "full"} className="gap-8">
      <Link
        to="/templates/$templateId"
        params={{ templateId: template.id }}
        className="text-muted-foreground hover:text-foreground w-fit text-sm underline-offset-4 transition-colors hover:underline"
      >
        ← {template.name}
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          {content.customizeTitle} {template.name}
        </h1>
        <p className="text-muted-foreground text-sm text-pretty">
          {template.summary}
        </p>
      </header>

      {prompt.locked ? (
        <LockedPrompt
          title={content.lockedTitle}
          body={content.lockedBody}
          signInReason={content.signInReason}
          signedIn={signedIn}
          redirect={`${path}/customize`}
          track={{
            "data-track": "templates_unlock",
            "data-track-template": template.id,
          }}
        />
      ) : (
        <PromptCustomizer template={template} prompt={prompt.prompt} />
      )}
    </PageMain>
  );
};

// Pro only: the template's fields fill its prompt, and the dials apply.
// Everyone else gets the upgrade panel, never the form or the prompt.
export const Route = createFileRoute("/templates/$templateId/customize")({
  component: CustomizeTemplate,
  loader: async ({ params }) => {
    const template = findPromptTemplate(params.templateId);
    if (!template) {
      throw notFound();
    }
    const prompt = await getTemplatePrompt({ data: { id: template.id } });
    return { template, prompt };
  },
  head: ({ loaderData, params }) =>
    createMetadata({
      canonical: `${ROUTES.TEMPLATES}/${params.templateId}/customize`,
      title: loaderData
        ? `Customize: ${loaderData.template.name}`
        : "Customize a template",
      description: loaderData?.template.summary,
      // A Pro tool, not a page to land on from search: the template's own
      // page is the one to index.
      noIndex: true,
    }),
});
