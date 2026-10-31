import { useIntlayer } from "react-intlayer";

import { XIcon } from "@/components/icons";
import type { Logo } from "@/constants/stack";
import testimonials from "@/data/testimonials.json";

// Companies whose people replied to MotionVideo's launch posts on X with
// something positive (see src/data/testimonials.json for the quotes). Any
// colour mark is drawn as one flat grey, so the row reads as a single tone.
const COMPANIES: readonly Logo[] = [
  { name: "Netlify", src: "/logos/companies/netlify.svg" },
  { name: "Appwrite", src: "/logos/companies/appwrite.svg" },
  { name: "mem0", src: "/logos/companies/mem0.svg" },
  { name: "Timeless", src: "/logos/companies/timeless.svg" },
];

/** A monochrome row of company marks with their names. */
const CompanyLogos = () => {
  const content = useIntlayer("social-proof");
  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-muted-foreground text-center text-sm">
        {content.lovedBy}
      </p>
      <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
        {COMPANIES.map((company) => (
          <li
            key={company.name}
            className="text-muted-foreground flex items-center gap-2"
          >
            <img
              src={company.src}
              alt=""
              width={22}
              height={22}
              className="size-[22px] object-contain opacity-60 brightness-0 dark:invert"
            />
            <span className="text-lg font-semibold tracking-tight">
              {company.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/** Replies to the launch posts, each linked to the original on X. */
const Testimonials = () => {
  const content = useIntlayer("social-proof");
  return (
    <ul
      aria-label={content.testimonials.value}
      className="grid w-full gap-4 md:grid-cols-3"
    >
      {testimonials.entries.map((entry) => (
        <li
          key={entry.handle}
          className="bg-card shadow-outline flex min-h-48 flex-col justify-between gap-6 rounded-xl p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <blockquote cite={entry.url} className="text-pretty">
              <p>{entry.quote}</p>
            </blockquote>
            <a
              href={entry.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${content.viewOnX.value}: ${entry.name}`}
              className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 shrink-0 rounded-sm transition-colors outline-none focus-visible:ring-3"
            >
              <XIcon className="size-4" />
            </a>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={entry.avatar}
              alt=""
              width={36}
              height={36}
              loading="lazy"
              className="bg-muted size-9 shrink-0 rounded-full object-cover"
            />
            <div className="min-w-0 text-sm leading-5">
              <p className="truncate font-medium">{entry.name}</p>
              <p className="text-muted-foreground truncate">{entry.role}</p>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

/** Company logos, then quotes, for the Pro page under the plans. */
export const SocialProof = () => (
  <section className="flex w-full max-w-5xl flex-col items-center gap-10">
    <CompanyLogos />
    <Testimonials />
  </section>
);
