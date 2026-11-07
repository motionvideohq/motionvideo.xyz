import type { LocalesValues } from "intlayer";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useIntlayer, useLocale } from "react-intlayer";
import { DocumentCode } from "reicon-react/icons/DocumentCode";
import { Monitor } from "reicon-react/icons/Monitor";
import { Moon } from "reicon-react/icons/Moon";
import { MoreH } from "reicon-react/icons/MoreH";
import { Reply2 } from "reicon-react/icons/Reply2";
import { Search } from "reicon-react/icons/Search";
import { Sun } from "reicon-react/icons/Sun";
import { Ufo } from "reicon-react/icons/Ufo";

import { GitHubIcon, XIcon } from "@/components/icons";
import { SectionIcon } from "@/components/section-icon";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroupButton } from "@/components/ui/input-group";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { LINK } from "@/constants/links";
import { LOCALES, LOCALE_NAMES } from "@/constants/locales";
import { ROUTES } from "@/constants/routes";
import type { Section } from "@/constants/section-icons";
import { useHotkey } from "@/hooks/use-hotkey";
import { useLocalizedNavigate as useNavigate } from "@/hooks/use-localized-navigate";
import { useIsMac } from "@/hooks/use-mac";
import { track } from "@/lib/analytics";
import type { DirectoryEntry, DirectoryKind } from "@/lib/directories";
import type { MotionVideo } from "@/lib/motion-catalog";
import type { MOTION_CREATORS } from "@/lib/motion-creators";
import { setTheme } from "@/lib/theme";
import { getSearchIndex } from "@/server/search-functions";
import type { SearchIndex } from "@/server/search-functions";

// Public pages only: account pages need sign-in and live in the account menu.
type PagePath = (typeof ROUTES)[
  | "HOME"
  | "TOOLS"
  | "CREATIVES"
  | "SKILLS"
  | "EXTRAS"
  | "CUSTOMIZE"
  | "JOBS"
  | "SPONSOR"
  | "MOVES"
  | "TEMPLATES"
  | "DOCS"
  | "MOTIONVIDEO_MCP"
  | "MOTIONVIDEO_SKILL"
  | "ABOUT"
  | "BLOG"
  | "DESIGN"
  | "DESIGN_BRAND"
  | "DESIGN_COMPONENTS"
  | "CONTACT"
  | "PRIVACY"
  | "TERMS"
  | "REFUNDS"];

interface SearchData {
  videos: MotionVideo[];
  creators: typeof MOTION_CREATORS;
  directories: Record<DirectoryKind, DirectoryEntry[]>;
}

const EMPTY_DATA: SearchData = {
  videos: [],
  creators: [],
  directories: { tool: [], studio: [], skill: [], extra: [] },
};

const importSearchData = async (): Promise<SearchData> => {
  // motion-creators reads the same catalog JSON: one chunk for both.
  const [catalog, creators, directories] = await Promise.all([
    import("@/data/motion-catalog.json"),
    import("@/lib/motion-creators"),
    import("@/lib/directories"),
  ]);
  return {
    videos: catalog.default.videos,
    creators: creators.MOTION_CREATORS,
    directories: directories.DIRECTORY_ENTRIES,
  };
};

// The catalog is ~370 kB; load it only once someone reaches for search.
let dataPromise: Promise<SearchData> | undefined;
const loadSearchData = async (): Promise<SearchData> => {
  dataPromise ??= importSearchData();
  try {
    return await dataPromise;
  } catch {
    // The palette stays usable; the next open retries the chunk.
    dataPromise = undefined;
    return EMPTY_DATA;
  }
};

const EMPTY_INDEX: SearchIndex = {
  moves: [],
  templates: [],
  blog: [],
  changelog: [],
  docs: [],
};

// Moves, templates, posts, changelog and docs come from the server, which
// keeps move bodies and prompts out of the browser. Docs titles depend on the
// locale, so each locale loads once; a failed load retries on the next open.
const indexPromises = new Map<string, Promise<SearchIndex>>();
const loadSearchIndex = async (locale: string): Promise<SearchIndex> => {
  const promise = indexPromises.get(locale) ?? getSearchIndex({ data: locale });
  indexPromises.set(locale, promise);
  try {
    return await promise;
  } catch {
    indexPromises.delete(locale);
    return EMPTY_INDEX;
  }
};

// English names to search by, beside each language's own name (LOCALE_NAMES).
const LANGUAGE_KEYWORDS: Record<LocalesValues, string> = {
  en: "english",
  es: "spanish",
  fr: "french",
  zh: "chinese simplified 中文 简体",
  ko: "korean",
  ja: "japanese",
  de: "german",
  pt: "portuguese",
  ru: "russian",
};

interface PaletteItem {
  id: string;
  label: string;
  /** Extra terms cmdk matches against, beyond the label and id. */
  keywords?: string[];
  icon?: ReactNode;
  /** Right-aligned muted text (e.g. an `@handle` or description). */
  hint?: string;
  action: () => void;
}

interface PaletteGroup {
  id: string;
  heading: ReactNode;
  items: PaletteItem[];
}

// Sections the search can be narrowed to (the scope menu beside the input).
// Each id is also its label key in command-menu.content.ts and its key in
// SECTION_ICONS.
const SEARCH_SCOPES = [
  "videos",
  "creators",
  "moves",
  "templates",
  "docs",
  "blog",
  "changelog",
  "tools",
  "creatives",
  "skills",
  "extras",
] as const satisfies readonly Section[];

type SearchScope = (typeof SEARCH_SCOPES)[number];

export const CommandMenu = () => {
  const content = useIntlayer("command-menu");
  const header = useIntlayer("site-header");
  const footer = useIntlayer("site-footer");
  const { locale, setLocale } = useLocale();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // "all": the default palette; a section: only its entries, listed even
  // before anything is typed.
  const [scope, setScope] = useState<SearchScope | "all">("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState(EMPTY_DATA);
  const [index, setIndex] = useState(EMPTY_INDEX);
  const modifier = useIsMac() ? "⌘" : "Ctrl";

  // Both load in parallel; the palette shows its data as soon as it arrives.
  const ensureData = async () => {
    const indexLoad = loadSearchIndex(locale);
    setData(await loadSearchData());
    setIndex(await indexLoad);
  };

  // One event per opening, however it was opened (click, ⌘K, /).
  useEffect(() => {
    if (open) {
      track("search_open");
    }
  }, [open]);

  useHotkey("/", () => {
    void ensureData();
    setOpen(true);
  });

  // kmenu used to own ⌘K/Ctrl+K; with cmdk the palette is plain state, so the
  // global toggle lives here. preventDefault keeps it off the browser's own.
  useEffect(() => {
    const onKeyDown = async (event: KeyboardEvent) => {
      if (
        !(event.metaKey || event.ctrlKey) ||
        event.key.toLowerCase() !== "k"
      ) {
        return;
      }
      event.preventDefault();
      const indexLoad = loadSearchIndex(locale);
      setData(await loadSearchData());
      setOpen((wasOpen) => !wasOpen);
      setIndex(await indexLoad);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [locale]);

  const hasQuery = query.trim().length > 0;
  const groups = useMemo<PaletteGroup[]>(() => {
    // PagePath limits `page()` to real pages; the localized navigate adds the
    // locale prefix (none in English).
    const page = (
      to: PagePath,
      label: string,
      section: Section,
      keywords: string[] = []
    ): PaletteItem => ({
      id: `page:${to}`,
      label,
      keywords: [to, ...keywords],
      icon: <SectionIcon section={section} />,
      action: () => navigate({ to }),
    });
    const videos: PaletteItem[] = data.videos.map((video) => ({
      id: `video:${video.slug}`,
      label: video.title,
      keywords: [video.title, `@${video.handle}`, video.handle],
      hint: `@${video.handle}`,
      action: () =>
        navigate({
          to: ROUTES.VIDEO,
          params: { slug: video.slug },
          viewTransition: true,
        }),
    }));
    const linkItems = (entries: DirectoryEntry[]): PaletteItem[] =>
      entries.map((entry) => ({
        id: `link:${entry.url}`,
        label: entry.name,
        keywords: [entry.name, entry.description, entry.category],
        hint: entry.description,
        action: () => {
          window.open(entry.url, "_blank", "noopener,noreferrer");
        },
      }));
    const creators: PaletteItem[] = data.creators.map((creator) => ({
      id: `creator:${creator.handle}`,
      label: creator.name,
      keywords: [creator.name, `@${creator.handle}`, creator.handle],
      hint: `@${creator.handle}`,
      action: () =>
        navigate({
          to: ROUTES.CREATOR,
          params: { creator: creator.handle },
        }),
    }));
    const moves: PaletteItem[] = index.moves.map((move) => ({
      id: `move:${move.slug}`,
      label: move.name,
      keywords: [
        move.name,
        ...move.aka,
        move.summary,
        ...move.goodFor,
        move.family,
      ],
      hint: move.summary,
      action: () =>
        navigate({
          to: ROUTES.MOVE,
          params: { family: move.family, slug: move.slug },
        }),
    }));
    const templates: PaletteItem[] = index.templates.map((template) => ({
      id: `template:${template.id}`,
      label: template.name,
      keywords: [template.name, template.summary, "template"],
      hint: template.summary,
      action: () =>
        navigate({
          to: ROUTES.TEMPLATE,
          params: { templateId: template.id },
        }),
    }));
    const blogPosts: PaletteItem[] = index.blog.map((post) => ({
      id: `blog:${post.slug}`,
      label: post.title,
      keywords: [post.title, post.description],
      hint: post.description,
      action: () =>
        navigate({ to: ROUTES.BLOG_POST, params: { slug: post.slug } }),
    }));
    const changelog: PaletteItem[] = index.changelog.map((entry) => ({
      id: `changelog:${entry.slug}`,
      label: entry.title,
      keywords: [entry.title, entry.description],
      hint: entry.description,
      action: () =>
        navigate({ to: ROUTES.CHANGELOG_ENTRY, params: { slug: entry.slug } }),
    }));
    // Each docs page, then each of its headings as a deep link into it.
    const docs = index.docs.flatMap((docsPage): PaletteItem[] => {
      const splat = docsPage.slugs.join("/");
      const openDocs = (hash?: string) =>
        splat
          ? navigate({ to: ROUTES.DOCS_PAGE, params: { _splat: splat }, hash })
          : navigate({ to: ROUTES.DOCS, hash });
      return [
        {
          id: `docs:/${splat}`,
          label: docsPage.title,
          keywords: [docsPage.title, docsPage.description],
          hint: docsPage.description,
          action: () => openDocs(),
        },
        ...docsPage.headings.map((heading) => ({
          id: `docs:/${splat}#${heading.id}`,
          label: heading.title,
          keywords: [heading.title, docsPage.title],
          hint: docsPage.title,
          action: () => openDocs(heading.id),
        })),
      ];
    });
    const item = (entry: Omit<PaletteItem, "action">, action: () => void) => ({
      ...entry,
      action,
    });
    // Always visible: Pages, Theme, Socials. Videos, content and directory
    // entries stay hidden until the user types, but remain searchable via cmdk
    // filtering.
    const visible: PaletteGroup[] = [
      {
        // The header's Explore sections, after a random video.
        id: "go-to",
        heading: content.goTo.value,
        items: [
          {
            id: "go-to:surprise",
            label: content.surpriseMe.value,
            keywords: ["random", "surprise", "shuffle", "video"],
            icon: <Ufo aria-hidden="true" />,
            hint: content.randomVideo.value,
            action: () => {
              const video =
                data.videos[Math.floor(Math.random() * data.videos.length)];
              if (video) {
                navigate({
                  to: ROUTES.VIDEO,
                  params: { slug: video.slug },
                  viewTransition: true,
                });
              }
            },
          },
          page(ROUTES.HOME, header.videos.value, "videos", [
            "gallery",
            "discover",
          ]),
          page(ROUTES.TOOLS, header.tools.value, "tools"),
          page(ROUTES.CREATIVES, header.creatives.value, "creatives"),
          page(ROUTES.SKILLS, header.skills.value, "skills"),
          page(ROUTES.EXTRAS, header.extras.value, "extras"),
          page(ROUTES.JOBS, header.jobs.value, "jobs", [
            "hiring",
            "career",
            "work",
          ]),
        ],
      },
      {
        // What coding agents use: the MCP server, the skill, and the site
        // map written for them.
        id: "agents",
        heading: content.agents.value,
        items: [
          page(ROUTES.MOTIONVIDEO_MCP, content.mcp.value, "mcp", [
            "mcp",
            "claude",
            "cursor",
            "server",
          ]),
          page(ROUTES.MOTIONVIDEO_SKILL, content.skill.value, "skill", [
            "skill",
            "SKILL.md",
            "agent",
            "pro",
          ]),
          {
            id: "agents:llms-txt",
            label: "llms.txt",
            keywords: ["llms", "llms.txt", "agents", "markdown", "ai"],
            icon: <DocumentCode aria-hidden="true" />,
            // A server route, not an app page: a full document load.
            action: () => {
              window.location.assign(ROUTES.LLMS_TXT);
            },
          },
        ],
      },
      {
        id: "pages",
        heading: content.pages.value,
        items: [
          page(ROUTES.MOVES, header.moves.value, "moves", [
            "techniques",
            "prompts",
            "easing",
          ]),
          page(ROUTES.TEMPLATES, header.templates.value, "templates", [
            "prompt",
            "template",
            "pro",
          ]),
          page(ROUTES.CUSTOMIZE, content.customize.value, "customize", [
            "prompt",
            "customize",
            "personalize",
          ]),
          page(ROUTES.DOCS, header.docs.value, "docs", [
            "documentation",
            "quickstart",
            "api",
            "skill.md",
          ]),
          page(ROUTES.ABOUT, footer.about.value, "about"),
          page(ROUTES.DESIGN, footer.design.value, "design", [
            "design system",
            "components",
            "registry",
            "shadcn",
          ]),
          page(ROUTES.DESIGN_BRAND, footer.brand.value, "design", [
            "brand",
            "logo",
            "logomark",
            "colors",
          ]),
          page(ROUTES.BLOG, header.blog.value, "blog", ["articles", "guides"]),
          page(ROUTES.CONTACT, footer.contact.value, "contact"),
          page(ROUTES.SPONSOR, footer.sponsor.value, "sponsor"),
          page(ROUTES.TERMS, footer.terms.value, "terms"),
          page(ROUTES.PRIVACY, footer.privacy.value, "privacy"),
          page(ROUTES.REFUNDS, footer.refunds.value, "refunds"),
        ],
      },
      {
        id: "theme",
        heading: content.theme.value,
        items: [
          item(
            {
              id: "theme:light",
              label: content.light.value,
              keywords: ["theme", "appearance", "mode", "light"],
              icon: <Sun aria-hidden="true" />,
            },
            () => setTheme("light")
          ),
          item(
            {
              id: "theme:dark",
              label: content.dark.value,
              keywords: ["theme", "appearance", "mode", "dark"],
              icon: <Moon aria-hidden="true" />,
            },
            () => setTheme("dark")
          ),
          item(
            {
              id: "theme:system",
              label: content.system.value,
              keywords: ["theme", "appearance", "mode", "system", "auto"],
              icon: <Monitor aria-hidden="true" />,
            },
            () => setTheme("system")
          ),
        ],
      },
      {
        id: "language",
        heading: content.language.value,
        items: LOCALES.map((code): PaletteItem => ({
          id: `language:${code}`,
          label: LOCALE_NAMES[code],
          keywords: [
            "language",
            "locale",
            "translate",
            LOCALE_NAMES[code],
            LANGUAGE_KEYWORDS[code],
          ],
          icon: (
            <span
              aria-hidden="true"
              className="text-muted-foreground w-4 shrink-0 text-center text-[11px] font-semibold tracking-wide"
            >
              {code.toUpperCase()}
            </span>
          ),
          action: () => setLocale(code),
        })),
      },
      {
        id: "socials",
        heading: content.socials.value,
        items: [
          {
            id: "other:github",
            label: "GitHub",
            keywords: ["github", "git", "repo", "star"],
            icon: <GitHubIcon className="size-4" />,
            action: () => {
              window.open(LINK.GITHUB_REPO, "_blank", "noopener,noreferrer");
            },
          },
          {
            id: "other:x",
            label: "X/Twitter",
            keywords: ["x", "twitter", "follow"],
            icon: <XIcon className="size-4" />,
            action: () => {
              window.open(LINK.X, "_blank", "noopener,noreferrer");
            },
          },
        ],
      },
    ];
    if (scope === "all" && !hasQuery) {
      return visible;
    }
    const searchItems: Record<SearchScope, PaletteItem[]> = {
      videos,
      creators,
      moves,
      templates,
      docs,
      blog: blogPosts,
      changelog,
      tools: linkItems(data.directories.tool),
      creatives: linkItems(data.directories.studio),
      skills: linkItems(data.directories.skill),
      extras: linkItems(data.directories.extra),
    };
    const searchGroups = SEARCH_SCOPES.filter(
      (id) => scope === "all" || scope === id
    ).map((id): PaletteGroup => ({
      id,
      heading: (
        <span className="flex items-center gap-1.5">
          <SectionIcon section={id} className="size-3" />
          {header[id].value}
        </span>
      ),
      items: searchItems[id],
    }));
    return scope === "all" ? [...visible, ...searchGroups] : searchGroups;
  }, [
    data,
    index,
    content,
    header,
    footer,
    navigate,
    hasQuery,
    scope,
    setLocale,
  ]);

  const scopeName = scope === "all" ? content.scopeAll : header[scope];

  return (
    <>
      <button
        type="button"
        aria-label={content.open.value}
        aria-keyshortcuts="Meta+K Control+K /"
        onPointerEnter={() => {
          void ensureData();
        }}
        onClick={() => {
          void ensureData();
          setOpen(true);
        }}
        className="bg-secondary text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex h-8 w-8 min-w-0 shrink-0 items-center gap-2 rounded-lg px-3 text-sm transition-colors outline-none hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] focus-visible:ring-3 max-lg:justify-center max-lg:rounded-full max-lg:px-0 lg:w-56 xl:w-64"
      >
        <Search aria-hidden="true" className="size-4" />
        <span className="hidden flex-1 truncate text-left lg:inline">
          {content.placeholder}
        </span>
        <KbdGroup className="hidden lg:inline-flex">
          <Kbd className="bg-background">{modifier}</Kbd>
          <Kbd className="bg-background">K</Kbd>
        </KbdGroup>
      </button>
      <CommandDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setQuery("");
            setScope("all");
          }
        }}
        title={content.open.value}
        description={content.placeholder.value}
      >
        <Command>
          <CommandInput
            ref={inputRef}
            placeholder={
              scope === "all"
                ? content.placeholder.value
                : content.scopePlaceholder({ section: scopeName.value }).value
            }
            value={query}
            onValueChange={setQuery}
            onKeyDown={(event) => {
              // Backspace in an empty input widens the search back to all.
              if (
                event.key === "Backspace" &&
                query === "" &&
                scope !== "all"
              ) {
                setScope("all");
              }
            }}
            addon={
              <DropdownMenu>
                {/* "All" is just the ellipsis; a section shows its name. */}
                <DropdownMenuTrigger
                  aria-label={`${content.scopeLabel.value}: ${scopeName.value}`}
                  render={
                    <InputGroupButton
                      size={scope === "all" ? "icon-xs" : "xs"}
                    />
                  }
                >
                  {scope === "all" ? (
                    <MoreH aria-hidden="true" />
                  ) : (
                    <>
                      <SectionIcon section={scope} />
                      {scopeName}
                    </>
                  )}
                </DropdownMenuTrigger>
                {/* About half the palette's height; the rest scrolls. */}
                <DropdownMenuContent
                  align="end"
                  className="w-44"
                  finalFocus={inputRef}
                >
                  {/* Scrolls inside the popup: the fade is a mask, which on
                      the popup itself would clip its shadow. `-mx-1 px-1`
                      spans the popup's padding so the separator reaches its
                      edges without overflowing. */}
                  <DropdownMenuRadioGroup
                    className="scroll-fade-y no-scrollbar -mx-1 max-h-44 overflow-y-auto px-1"
                    value={scope}
                    onValueChange={(value) => {
                      // Anything but a section id (i.e. "all") searches everything.
                      const next =
                        SEARCH_SCOPES.find((id) => id === value) ?? "all";
                      setScope(next);
                      track("search_scope", { scope: next });
                    }}
                  >
                    <DropdownMenuRadioItem value="all">
                      <Search aria-hidden="true" />
                      {content.scopeAll}
                    </DropdownMenuRadioItem>
                    <DropdownMenuSeparator />
                    {SEARCH_SCOPES.map((id) => (
                      <DropdownMenuRadioItem key={id} value={id}>
                        <SectionIcon section={id} />
                        {header[id]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            }
          />
          <CommandList className="scroll-fade-y">
            <CommandEmpty>{content.empty.value}</CommandEmpty>
            {groups.map((group) => (
              // cmdk sorts matches by moving their DOM nodes and doesn't move
              // them back when the query is cleared; a new key on clearing
              // rebuilds the groups in their own order (Surprise me first).
              <CommandGroup
                key={`${group.id}:${hasQuery}`}
                heading={group.heading}
              >
                {group.items.map((entry) => (
                  <CommandItem
                    key={entry.id}
                    // Unique per entry while still starting with the label, so
                    // cmdk ranks label-prefix matches first.
                    value={`${entry.label} ${entry.id}`}
                    keywords={entry.keywords}
                    onSelect={() => {
                      track("search_select", { id: entry.id });
                      entry.action();
                      setOpen(false);
                    }}
                  >
                    {entry.icon}
                    <span className="truncate">{entry.label}</span>
                    {entry.hint && (
                      <CommandShortcut className="max-w-1/2 truncate tracking-normal">
                        {entry.hint}
                      </CommandShortcut>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
          {/* Keyboard hints; touch screens have no keys to hint at. */}
          <CommandFooter aria-hidden="true" className="max-sm:hidden">
            <span className="flex items-center gap-1.5">
              <KbdGroup>
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd>
              </KbdGroup>
              {content.hintMove}
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>
                <Reply2 aria-hidden="true" />
              </Kbd>
              {content.hintOpen}
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <Kbd>esc</Kbd>
              {content.hintClose}
            </span>
          </CommandFooter>
        </Command>
      </CommandDialog>
    </>
  );
};
