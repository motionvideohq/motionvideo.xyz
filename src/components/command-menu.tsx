import { Autocomplete } from "@base-ui/react/autocomplete";
import { Dialog } from "@base-ui/react/dialog";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useIntlayer } from "react-intlayer";
import { ArrowRightUp } from "reicon-react/icons/ArrowRightUp";
import { Compass } from "reicon-react/icons/Compass";
import { Hashtag } from "reicon-react/icons/Hashtag";
import { Search } from "reicon-react/icons/Search";

import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { ReiconDuotone } from "@/components/ui/reicon-duotone";
import { useHotkey } from "@/hooks/use-hotkey";
import type { DirectoryEntry, DirectoryKind } from "@/lib/directories";
import { MOTION_CATEGORIES, filterMotionVideos } from "@/lib/motion-catalog";
import type { MotionCategory, MotionVideo } from "@/lib/motion-catalog";

type PagePath =
  | "/"
  | "/tools"
  | "/creatives"
  | "/skills"
  | "/extras"
  | "/submit"
  | "/bookmarks"
  | "/sponsor"
  | "/motionvideo-skill";

type CommandItem =
  | { kind: "page"; id: string; label: string; to: PagePath }
  | { kind: "category"; id: string; label: string; category: MotionCategory }
  | { kind: "video"; id: string; label: string; video: MotionVideo }
  | { kind: "link"; id: string; label: string; entry: DirectoryEntry };

// Base UI's `Group` type requires an index signature.
interface CommandGroup {
  [key: string]: string | CommandItem[];
  value: string;
  items: CommandItem[];
}

interface SearchData {
  videos: MotionVideo[];
  directories: Record<DirectoryKind, DirectoryEntry[]>;
}

const EMPTY_DATA: SearchData = {
  videos: [],
  directories: { tool: [], studio: [], skill: [], extra: [] },
};
const SUGGESTED_VIDEOS = 6;
const VIDEO_LIMIT = 12;
const DIRECTORY_LIMIT = 6;

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
const loadSearchData = async () => {
  dataPromise ??= importSearchData();
  try {
    return await dataPromise;
  } catch {
    // Pages and categories stay searchable; the next open retries the chunk.
    dataPromise = undefined;
    return EMPTY_DATA;
  }
};

const subscribeNever = () => () => {
  // The platform never changes while the page is open.
};

const matches = (text: string, words: string[]) => {
  const haystack = text.toLocaleLowerCase();
  return words.every((word) => haystack.includes(word));
};

const Thumbnail = ({ src }: { src: string | null }) => (
  <span className="bg-muted relative aspect-video w-16 shrink-0 overflow-hidden rounded-md">
    {src && (
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className="size-full object-cover"
      />
    )}
  </span>
);

const ItemBody = ({ item }: { item: CommandItem }) => {
  switch (item.kind) {
    case "page": {
      return (
        <>
          <ReiconDuotone
            icon={Compass}
            aria-hidden="true"
            className="text-muted-foreground size-4"
          />
          <span className="truncate">{item.label}</span>
        </>
      );
    }
    case "category": {
      return (
        <>
          <ReiconDuotone
            icon={Hashtag}
            aria-hidden="true"
            className="text-muted-foreground size-4"
          />
          <span className="truncate">{item.label}</span>
        </>
      );
    }
    case "video": {
      return (
        <>
          <Thumbnail src={item.video.poster} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate">{item.label}</span>
            <span className="text-muted-foreground truncate text-xs">
              @{item.video.handle}
            </span>
          </span>
        </>
      );
    }
    default: {
      return (
        <>
          <Thumbnail src={item.entry.cover} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate">{item.label}</span>
            <span lang="en" className="text-muted-foreground truncate text-xs">
              {item.entry.description}
            </span>
          </span>
          <ReiconDuotone
            icon={ArrowRightUp}
            aria-hidden="true"
            className="text-muted-foreground size-3.5"
          />
        </>
      );
    }
  }
};

export const CommandMenu = () => {
  const content = useIntlayer("command-menu");
  const gallery = useIntlayer("motion-gallery");
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [data, setData] = useState(EMPTY_DATA);
  const modifier = useSyncExternalStore(
    subscribeNever,
    () => (/mac|iphone|ipad/iu.test(navigator.userAgent) ? "⌘" : "Ctrl"),
    () => "⌘"
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === "k" &&
        (event.metaKey || event.ctrlKey) &&
        !event.altKey
      ) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  useHotkey(
    "/",
    (event) => {
      event.preventDefault();
      setOpen(true);
    },
    { enabled: !open }
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    let active = true;
    const load = async () => {
      const loaded = await loadSearchData();
      if (active) {
        setData(loaded);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [open]);

  const pages = useMemo<CommandItem[]>(
    () => [
      { kind: "page", id: "page:/", label: content.discover.value, to: "/" },
      {
        kind: "page",
        id: "page:/tools",
        label: content.tools.value,
        to: "/tools",
      },
      {
        kind: "page",
        id: "page:/creatives",
        label: content.creatives.value,
        to: "/creatives",
      },
      {
        kind: "page",
        id: "page:/skills",
        label: content.skills.value,
        to: "/skills",
      },
      {
        kind: "page",
        id: "page:/extras",
        label: content.extras.value,
        to: "/extras",
      },
      {
        kind: "page",
        id: "page:/submit",
        label: content.submit.value,
        to: "/submit",
      },
      {
        kind: "page",
        id: "page:/bookmarks",
        label: content.bookmarks.value,
        to: "/bookmarks",
      },
      {
        kind: "page",
        id: "page:/sponsor",
        label: content.sponsor.value,
        to: "/sponsor",
      },
      {
        kind: "page",
        id: "page:/motionvideo-skill",
        label: content.skill.value,
        to: "/motionvideo-skill",
      },
    ],
    [content]
  );
  const categories = useMemo<CommandItem[]>(
    () =>
      MOTION_CATEGORIES.map((category) => ({
        kind: "category",
        id: `category:${category}`,
        label: gallery.categories[category].value,
        category,
      })),
    [gallery]
  );

  const groups = useMemo<CommandGroup[]>(() => {
    const words = query
      .trim()
      .toLocaleLowerCase()
      .split(/\s+/u)
      .filter(Boolean);
    const toVideoItem = (video: MotionVideo): CommandItem => ({
      kind: "video",
      id: `video:${video.slug}`,
      label: video.title,
      video,
    });
    const toLinkItems = (entries: DirectoryEntry[]) =>
      entries
        .filter((entry) =>
          matches(`${entry.name} ${entry.description} ${entry.category}`, words)
        )
        .slice(0, DIRECTORY_LIMIT)
        .map((entry): CommandItem => ({
          kind: "link",
          id: `link:${entry.url}`,
          label: entry.name,
          entry,
        }));
    const result: CommandGroup[] = words.length
      ? [
          {
            value: content.videos.value,
            items: filterMotionVideos(data.videos, { q: query })
              .slice(0, VIDEO_LIMIT)
              .map(toVideoItem),
          },
          {
            value: content.categories.value,
            items: categories.filter((item) => matches(item.label, words)),
          },
          {
            value: content.pages.value,
            items: pages.filter((item) => matches(item.label, words)),
          },
          {
            value: content.tools.value,
            items: toLinkItems(data.directories.tool),
          },
          {
            value: content.creatives.value,
            items: toLinkItems(data.directories.studio),
          },
          {
            value: content.skills.value,
            items: toLinkItems(data.directories.skill),
          },
          {
            value: content.extras.value,
            items: toLinkItems(data.directories.extra),
          },
        ]
      : [
          { value: content.pages.value, items: pages },
          {
            value: content.popular.value,
            items: data.videos.slice(0, SUGGESTED_VIDEOS).map(toVideoItem),
          },
          { value: content.categories.value, items: categories },
        ];
    return result.filter((group) => group.items.length > 0);
  }, [query, data, pages, categories, content]);

  const runItem = (item: CommandItem) => {
    setOpen(false);
    setQuery("");
    switch (item.kind) {
      case "page": {
        void navigate({ to: item.to });
        break;
      }
      case "category": {
        void navigate({
          to: "/category/$category",
          params: { category: item.category },
        });
        break;
      }
      case "video": {
        void navigate({
          to: "/videos/$slug",
          params: { slug: item.video.slug },
          viewTransition: true,
        });
        break;
      }
      default: {
        window.open(item.entry.url, "_blank", "noopener,noreferrer");
      }
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setQuery("");
        }
      }}
    >
      <Dialog.Trigger
        aria-label={content.open.value}
        aria-keyshortcuts="Meta+K Control+K /"
        onPointerEnter={() => {
          loadSearchData();
        }}
        className="bg-secondary text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 flex h-9 w-full min-w-0 items-center gap-2 rounded-full px-3 text-sm transition-colors outline-none hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] focus-visible:ring-3 max-lg:size-9 max-lg:justify-center max-lg:px-0"
      >
        <ReiconDuotone icon={Search} aria-hidden="true" className="size-4" />
        <span className="hidden flex-1 truncate text-left lg:inline">
          {content.placeholder}
        </span>
        <KbdGroup className="hidden lg:inline-flex">
          <Kbd className="bg-background">{modifier}</Kbd>
          <Kbd className="bg-background">K</Kbd>
        </KbdGroup>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-start justify-center px-3 pt-[12svh] pb-3">
          <Dialog.Popup
            aria-label={content.open.value}
            className="bg-popover text-popover-foreground shadow-popover flex max-h-[min(36rem,80svh)] w-full max-w-xl flex-col overflow-hidden rounded-2xl transition-[translate,scale,opacity] duration-150 outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
          >
            <Autocomplete.Root
              open
              inline
              items={groups}
              filteredItems={groups}
              value={query}
              onValueChange={setQuery}
              itemToStringValue={(item: CommandItem) => item.label}
              autoHighlight="always"
              keepHighlight
            >
              <div className="flex items-center gap-2 px-4">
                <ReiconDuotone
                  icon={Search}
                  aria-hidden="true"
                  className="text-muted-foreground size-4"
                />
                <Autocomplete.Input
                  aria-label={content.open.value}
                  placeholder={content.placeholder.value}
                  className="placeholder:text-muted-foreground h-12 w-full bg-transparent text-sm outline-none"
                />
                <Dialog.Close
                  render={
                    <Kbd className="pointer-events-auto cursor-pointer" />
                  }
                  aria-label={content.close.value}
                >
                  Esc
                </Dialog.Close>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-2">
                <Autocomplete.Empty>
                  <p className="text-muted-foreground px-3 py-10 text-center text-sm">
                    {content.empty}
                  </p>
                </Autocomplete.Empty>
                <Autocomplete.List>
                  {(group: CommandGroup) => (
                    <Autocomplete.Group
                      key={group.value}
                      items={group.items}
                      className="pt-2"
                    >
                      <Autocomplete.GroupLabel className="text-muted-foreground px-3 py-1.5 text-xs font-medium">
                        {group.value}
                      </Autocomplete.GroupLabel>
                      <Autocomplete.Collection>
                        {(item: CommandItem) => (
                          <Autocomplete.Item
                            key={item.id}
                            value={item}
                            onClick={() => runItem(item)}
                            className="data-highlighted:bg-accent data-highlighted:text-accent-foreground flex min-h-9 cursor-default [scroll-margin-block:0.5rem] items-center gap-3 rounded-lg px-3 py-1.5 text-sm outline-none select-none"
                          >
                            <ItemBody item={item} />
                          </Autocomplete.Item>
                        )}
                      </Autocomplete.Collection>
                    </Autocomplete.Group>
                  )}
                </Autocomplete.List>
              </div>
            </Autocomplete.Root>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
