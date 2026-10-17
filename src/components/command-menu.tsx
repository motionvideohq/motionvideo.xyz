import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useIntlayer, useLocale } from "react-intlayer";
import { Briefcase } from "reicon-react/icons/Briefcase";
import { Compass } from "reicon-react/icons/Compass";
import { Designtools } from "reicon-react/icons/Designtools";
import { Envelope } from "reicon-react/icons/Envelope";
import { File } from "reicon-react/icons/File";
import { HandHeart } from "reicon-react/icons/HandHeart";
import { Information } from "reicon-react/icons/Information";
import { Lock } from "reicon-react/icons/Lock";
import { Monitor } from "reicon-react/icons/Monitor";
import { Moon } from "reicon-react/icons/Moon";
import { Play } from "reicon-react/icons/Play";
import { Plus } from "reicon-react/icons/Plus";
import { Scroll } from "reicon-react/icons/Scroll";
import { Search } from "reicon-react/icons/Search";
import { Sparkles } from "reicon-react/icons/Sparkles";
import { Sun } from "reicon-react/icons/Sun";
import { Undo } from "reicon-react/icons/Undo";
import { User2 } from "reicon-react/icons/User2";

import { GitHubIcon, XIcon } from "@/components/brand-icons";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { LINK } from "@/constants/links";
import { useHotkey } from "@/hooks/use-hotkey";
import { useIsMac } from "@/hooks/use-mac";
import { track } from "@/lib/analytics";
import type { DirectoryEntry, DirectoryKind } from "@/lib/directories";
import type { MotionVideo } from "@/lib/motion-catalog";
import { setTheme } from "@/lib/theme";

// Public pages only: account pages need sign-in and live in the account menu.
type PagePath =
  | "/"
  | "/tools"
  | "/creatives"
  | "/skills"
  | "/extras"
  | "/jobs"
  | "/sponsor"
  | "/motionvideo-skill"
  | "/about"
  | "/brand"
  | "/contact"
  | "/privacy"
  | "/terms"
  | "/refunds";

interface SearchData {
  videos: MotionVideo[];
  directories: Record<DirectoryKind, DirectoryEntry[]>;
}

const EMPTY_DATA: SearchData = {
  videos: [],
  directories: { tool: [], studio: [], skill: [], extra: [] },
};

const importSearchData = async (): Promise<SearchData> => {
  const [catalog, directories] = await Promise.all([
    import("@/data/motion-catalog.json"),
    import("@/lib/directories"),
  ]);
  return {
    videos: catalog.default.videos,
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

const LANGUAGE_OPTIONS: {
  code: "en" | "es" | "fr" | "zh" | "ko" | "ja" | "de";
  label: string;
  keywords: string;
}[] = [
  { code: "en", label: "English", keywords: "english" },
  { code: "es", label: "Español", keywords: "spanish español" },
  { code: "fr", label: "Français", keywords: "french français" },
  { code: "zh", label: "简体中文", keywords: "chinese simplified 中文 简体" },
  { code: "ko", label: "한국어", keywords: "korean 한국어" },
  { code: "ja", label: "日本語", keywords: "japanese 日本語" },
  { code: "de", label: "Deutsch", keywords: "german deutsch" },
];

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

export const CommandMenu = () => {
  const content = useIntlayer("command-menu");
  const { setLocale } = useLocale();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [data, setData] = useState(EMPTY_DATA);
  const modifier = useIsMac() ? "⌘" : "Ctrl";

  const ensureData = async () => {
    setData(await loadSearchData());
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
      setData(await loadSearchData());
      setOpen((wasOpen) => !wasOpen);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const groups = useMemo<PaletteGroup[]>(() => {
    // SAFETY: every page below is a literal member of the PagePath union, so
    // these casts are exact.
    const page = (
      to: PagePath,
      label: string,
      icon: ReactNode,
      keywords: string[] = []
    ): PaletteItem => ({
      id: `page:${to}`,
      label,
      keywords: [to, ...keywords],
      icon,
      action: () => navigate({ to: to as PagePath }),
    });
    const videos: PaletteItem[] = data.videos.map((video) => ({
      id: `video:${video.slug}`,
      label: video.title,
      keywords: [video.title, `@${video.handle}`, video.handle],
      hint: `@${video.handle}`,
      action: () =>
        navigate({
          to: "/videos/$slug",
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
    const item = (entry: Omit<PaletteItem, "action">, action: () => void) => ({
      ...entry,
      action,
    });
    // Always visible: Pages, Theme, Socials. Videos + directory entries stay
    // hidden until the user types, but remain searchable via cmdk filtering.
    const hasQuery = query.trim().length > 0;
    const visible: PaletteGroup[] = [
      {
        id: "pages",
        heading: content.pages.value,
        items: [
          page("/", content.discover.value, <Compass aria-hidden="true" />),
          page(
            "/tools",
            content.tools.value,
            <Designtools aria-hidden="true" />
          ),
          page(
            "/creatives",
            content.creatives.value,
            <User2 aria-hidden="true" />
          ),
          page(
            "/skills",
            content.skills.value,
            <Sparkles aria-hidden="true" />
          ),
          page("/extras", content.extras.value, <Plus aria-hidden="true" />),
          page("/jobs", content.jobs.value, <Briefcase aria-hidden="true" />, [
            "hiring",
            "career",
            "work",
          ]),
          page("/motionvideo-skill", "SKILL.md", <File aria-hidden="true" />, [
            "skill",
            "skill.md",
            "agent",
          ]),
          page(
            "/about",
            content.about.value,
            <Information aria-hidden="true" />
          ),
          page(
            "/contact",
            content.contact.value,
            <Envelope aria-hidden="true" />
          ),
          page(
            "/sponsor",
            content.sponsor.value,
            <HandHeart aria-hidden="true" />
          ),
          page("/terms", content.terms.value, <Scroll aria-hidden="true" />),
          page("/privacy", content.privacy.value, <Lock aria-hidden="true" />),
          page("/refunds", content.refunds.value, <Undo aria-hidden="true" />),
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
        items: LANGUAGE_OPTIONS.map((language): PaletteItem => ({
          id: `language:${language.code}`,
          label: language.label,
          keywords: ["language", "locale", "translate", language.keywords],
          icon: (
            <span
              aria-hidden="true"
              className="text-muted-foreground w-4 shrink-0 text-center text-[11px] font-semibold tracking-wide"
            >
              {language.code.toUpperCase()}
            </span>
          ),
          action: () => setLocale(language.code),
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
            label: "X",
            keywords: ["x", "twitter", "follow"],
            icon: <XIcon className="size-4" />,
            action: () => {
              window.open(LINK.X, "_blank", "noopener,noreferrer");
            },
          },
        ],
      },
    ];
    if (!hasQuery) {
      return visible;
    }
    return [
      ...visible,
      {
        id: "videos",
        heading: (
          <span className="flex items-center gap-1.5">
            <Play aria-hidden="true" className="size-3" />
            {content.videos.value}
          </span>
        ),
        items: videos,
      },
      {
        id: "tools",
        heading: (
          <span className="flex items-center gap-1.5">
            <Designtools aria-hidden="true" className="size-3" />
            {content.tools.value}
          </span>
        ),
        items: linkItems(data.directories.tool),
      },
      {
        id: "creatives",
        heading: (
          <span className="flex items-center gap-1.5">
            <User2 aria-hidden="true" className="size-3" />
            {content.creatives.value}
          </span>
        ),
        items: linkItems(data.directories.studio),
      },
      {
        id: "skills",
        heading: (
          <span className="flex items-center gap-1.5">
            <Sparkles aria-hidden="true" className="size-3" />
            {content.skills.value}
          </span>
        ),
        items: linkItems(data.directories.skill),
      },
      {
        id: "extras",
        heading: (
          <span className="flex items-center gap-1.5">
            <Plus aria-hidden="true" className="size-3" />
            {content.extras.value}
          </span>
        ),
        items: linkItems(data.directories.extra),
      },
    ];
  }, [data, content, navigate, query, setLocale]);

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
        className="bg-secondary text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex h-8 w-full min-w-0 items-center gap-2 rounded-lg px-3 text-sm transition-colors outline-none hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] focus-visible:ring-3 max-lg:size-9 max-lg:justify-center max-lg:rounded-full max-lg:px-0 lg:w-56 xl:w-64"
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
          }
        }}
        title={content.open.value}
        description={content.placeholder.value}
      >
        <Command loop>
          <CommandInput
            placeholder={content.placeholder.value}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>{content.empty.value}</CommandEmpty>
            {groups.map((group) => (
              <CommandGroup key={group.id} heading={group.heading}>
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
        </Command>
      </CommandDialog>
    </>
  );
};
