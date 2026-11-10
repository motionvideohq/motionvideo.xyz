import { useIntlayer } from "react-intlayer";

import { XIcon } from "@/components/icons";
import { LogosSwap } from "@/components/logos-swap";
import testimonials from "@/data/testimonials.json";
import { cn } from "@/lib/utils";

interface Company {
  name: string;
  src: string;
  /** The logo already spells the name, so it shows alone. */
  wordmark?: boolean;
}

// Companies whose people replied to MotionVideo's launch posts on X with
// something positive (see src/data/testimonials.json for the quotes), then
// paying customers on their company domains. Any colour mark is drawn as one
// flat grey, so the row reads as a single tone.
const COMPANIES: readonly Company[] = [
  { name: "Netlify", src: "/logos/companies/netlify.svg" },
  { name: "Appwrite", src: "/logos/companies/appwrite.svg" },
  { name: "mem0", src: "/logos/companies/mem0.svg" },
  { name: "Timeless", src: "/logos/companies/timeless.svg" },
  {
    name: "General Matters",
    src: "/logos/companies/general-matters.svg",
    wordmark: true,
  },
  { name: "Setu", src: "/logos/companies/setu.svg", wordmark: true },
  {
    name: "Voortraject",
    src: "/logos/companies/voortraject.png",
    wordmark: true,
  },
  {
    name: "Travel Likes Me",
    src: "/logos/companies/travel-likes-me.png",
    wordmark: true,
  },
];

const logoClass = "object-contain opacity-60 brightness-0 dark:invert";

/** Monochrome company marks, swapping a few at a time. */
const CompanyLogos = () => {
  const content = useIntlayer("social-proof");
  return (
    <div className="flex w-full flex-col items-center gap-5">
      <p className="text-muted-foreground text-center text-sm">
        {content.lovedBy}
      </p>
      {/* The row moves on its own, so screen readers get the full list
          instead. */}
      <ul className="sr-only">
        {COMPANIES.map((company) => (
          <li key={company.name}>{company.name}</li>
        ))}
      </ul>
      <LogosSwap
        aria-hidden="true"
        columnCount={6}
        className="w-full max-w-4xl gap-x-2 [--column-count:3] sm:[--column-count:6]"
        logos={COMPANIES.map((company) =>
          company.wordmark ? (
            <img
              key={company.name}
              src={company.src}
              alt=""
              className={cn("h-7 max-w-full", logoClass)}
            />
          ) : (
            <span
              key={company.name}
              className="text-muted-foreground flex items-center gap-2"
            >
              <img
                src={company.src}
                alt=""
                width={22}
                height={22}
                className={cn("size-[22px]", logoClass)}
              />
              <span className="text-lg font-semibold tracking-tight">
                {company.name}
              </span>
            </span>
          )
        )}
      />
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
