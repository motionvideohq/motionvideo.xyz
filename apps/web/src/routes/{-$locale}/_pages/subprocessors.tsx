import { createFileRoute } from "@tanstack/react-router";
import { getIntlayer } from "intlayer";
import { useIntlayer } from "react-intlayer";

import { LocalizedLink as Link } from "@/components/localized-link";
import { LegalPageHeader, SupportEmail } from "@/components/page";
import { DEFAULT_LOCALE, isLocale } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import { breadcrumbJsonLd } from "@/seo/json-ld";
import { createMetadata } from "@/seo/metadata";

const linkClass = "text-foreground underline underline-offset-4";
const cellClass = "border-border border-b px-3 py-3 align-top first:pl-0";

const Subprocessors = () => {
  const copy = useIntlayer("legal-subprocessors");
  const sections = useIntlayer("site-footer");

  // Keep in sync with the providers named in the privacy policy (section 2).
  const providers = [
    ["Cloudflare", copy.cloudflarePurpose, copy.cloudflareLocation],
    ["Dodo Payments", copy.dodoPurpose, copy.dodoLocation],
    ["Resend", copy.resendPurpose, copy.resendLocation],
    ["PostHog", copy.posthogPurpose, copy.posthogLocation],
    ["GitHub", copy.githubPurpose, copy.githubLocation],
  ] as const;

  return (
    <>
      <LegalPageHeader title={sections.subprocessors.value} />
      <div className="text-muted-foreground flex flex-col gap-6 leading-7">
        <p>{copy.intro}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="text-foreground">
                <th className={`${cellClass} font-semibold`}>
                  {copy.providerColumn}
                </th>
                <th className={`${cellClass} font-semibold`}>
                  {copy.purposeColumn}
                </th>
                <th className={`${cellClass} font-semibold`}>
                  {copy.locationColumn}
                </th>
              </tr>
            </thead>
            <tbody>
              {providers.map(([name, purpose, location]) => (
                <tr key={name}>
                  <td className={`${cellClass} text-foreground font-medium`}>
                    {name}
                  </td>
                  <td className={cellClass}>{purpose}</td>
                  <td className={cellClass}>{location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>{copy.connected}</p>
        <p>
          {copy.changes} <SupportEmail />. {copy.more}{" "}
          <Link to={ROUTES.PRIVACY} className={linkClass}>
            {copy.morePrivacy}
          </Link>
          .
        </p>
      </div>
    </>
  );
};

export const Route = createFileRoute("/{-$locale}/_pages/subprocessors")({
  component: Subprocessors,
  head: ({ params }) => {
    const meta = getIntlayer(
      "directory-meta",
      isLocale(params.locale) ? params.locale : DEFAULT_LOCALE
    ).subprocessors;
    return {
      ...createMetadata({ description: meta.description, title: meta.title }),
      scripts: [
        breadcrumbJsonLd(
          { page: "subprocessors", path: ROUTES.SUBPROCESSORS },
          params.locale
        ),
      ],
    };
  },
});
