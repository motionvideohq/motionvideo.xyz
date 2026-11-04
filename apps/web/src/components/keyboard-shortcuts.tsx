import { createContext, use, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";

import { useFeedbackDialog } from "@/components/feedback-dialog";
import {
  setLiveCursorsEnabled,
  useLiveCursorsEnabled,
} from "@/components/live-presence";
import { useSignInDialog } from "@/components/sign-in-dialog";
import { toggleTheme } from "@/components/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { setSoundMuted, useSoundMuted } from "@/components/ui/sound";
import { ACCOUNT_PAGES, ROUTES } from "@/constants/routes";
import { SHORTCUT_KEYS, keyLabel } from "@/constants/shortcuts";
import { useHotkey } from "@/hooks/use-hotkey";
import { useLocalizedNavigate as useNavigate } from "@/hooks/use-localized-navigate";
import { useIsMac } from "@/hooks/use-mac";
import { useSession } from "@/lib/auth-client";

interface KeyboardShortcutsApi {
  open: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsApi | null>(
  null
);

export const useKeyboardShortcuts = () => {
  const api = use(KeyboardShortcutsContext);
  if (!api) {
    throw new Error(
      "useKeyboardShortcuts must be used inside KeyboardShortcutsProvider"
    );
  }
  return api;
};

// The video player has its own keys (M mutes, digits seek); leave them be.
const inVideoPlayer = (event: KeyboardEvent) =>
  event.target instanceof Element &&
  Boolean(event.target.closest("media-theme-sutro"));

/**
 * Registers the site-wide single-key shortcuts and renders the dialog that
 * lists them (opened with ? or from the account menu). Account pages still
 * redirect signed-out visitors to sign in.
 */
export const KeyboardShortcutsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const content = useIntlayer("keyboard-shortcuts");
  const header = useIntlayer("site-header");
  const feedbackContent = useIntlayer("feedback-dialog");
  const feedbackDialog = useFeedbackDialog();
  const navigate = useNavigate();
  const session = useSession();
  const signInDialog = useSignInDialog();
  const muted = useSoundMuted();
  const cursorsEnabled = useLiveCursorsEnabled();
  const [open, setOpen] = useState(false);
  const modifier = useIsMac() ? "⌘" : "Ctrl";

  const routes = [
    [SHORTCUT_KEYS.discover, ROUTES.HOME, header.videos],
    [SHORTCUT_KEYS.tools, ROUTES.TOOLS, header.tools],
    [SHORTCUT_KEYS.creatives, ROUTES.CREATIVES, header.creatives],
    [SHORTCUT_KEYS.skills, ROUTES.SKILLS, header.skills],
    [SHORTCUT_KEYS.extras, ROUTES.EXTRAS, header.extras],
    [SHORTCUT_KEYS.jobs, ROUTES.JOBS, header.jobs],
    [SHORTCUT_KEYS.featured, ROUTES.DASHBOARD_FEATURED, header.featured],
    [SHORTCUT_KEYS.bookmarks, ROUTES.DASHBOARD_BOOKMARKS, header.bookmarks],
    [
      SHORTCUT_KEYS.sponsorships,
      ROUTES.DASHBOARD_SPONSORSHIPS,
      header.sponsorships,
    ],
    [SHORTCUT_KEYS.settings, ROUTES.DASHBOARD_SETTINGS, header.settings],
  ] as const;
  const sectionRoutes = routes.slice(0, 6);
  const accountRoutes = routes.slice(6);

  const go = (to: string) => (event: KeyboardEvent) => {
    if (inVideoPlayer(event)) {
      return;
    }
    // Signed out, account pages open the sign-in dialog in place.
    if (session.data === null && ACCOUNT_PAGES.has(to)) {
      signInDialog.open(undefined, to);
      return;
    }
    void navigate({ to });
  };
  // One hook per key keeps each registration stable across renders.
  useHotkey(SHORTCUT_KEYS.discover, go(ROUTES.HOME));
  useHotkey(SHORTCUT_KEYS.tools, go(ROUTES.TOOLS));
  useHotkey(SHORTCUT_KEYS.creatives, go(ROUTES.CREATIVES));
  useHotkey(SHORTCUT_KEYS.skills, go(ROUTES.SKILLS));
  useHotkey(SHORTCUT_KEYS.extras, go(ROUTES.EXTRAS));
  useHotkey(SHORTCUT_KEYS.jobs, go(ROUTES.JOBS));
  useHotkey(SHORTCUT_KEYS.featured, go(ROUTES.DASHBOARD_FEATURED));
  useHotkey(SHORTCUT_KEYS.bookmarks, go(ROUTES.DASHBOARD_BOOKMARKS));
  useHotkey(SHORTCUT_KEYS.sponsorships, go(ROUTES.DASHBOARD_SPONSORSHIPS));
  useHotkey(SHORTCUT_KEYS.settings, go(ROUTES.DASHBOARD_SETTINGS));
  useHotkey(SHORTCUT_KEYS.feedback, () => feedbackDialog.open());
  useHotkey(SHORTCUT_KEYS.theme, toggleTheme);
  useHotkey(SHORTCUT_KEYS.liveCursors, () =>
    setLiveCursorsEnabled(!cursorsEnabled)
  );
  useHotkey(SHORTCUT_KEYS.sounds, (event) => {
    if (!inVideoPlayer(event)) {
      setSoundMuted(!muted);
    }
  });
  useHotkey(SHORTCUT_KEYS.shortcuts, () => setOpen(true));

  const api = useMemo<KeyboardShortcutsApi>(
    () => ({ open: () => setOpen(true) }),
    []
  );

  const groups: { title: ReactNode; rows: [ReactNode, string[]][] }[] = [
    {
      title: content.general,
      rows: [
        [content.search, [`${modifier} K`, "/"]],
        [feedbackContent.trigger, [SHORTCUT_KEYS.feedback]],
        [content.toggleTheme, [SHORTCUT_KEYS.theme]],
        [content.toggleSounds, [SHORTCUT_KEYS.sounds]],
        [content.toggleCursors, [SHORTCUT_KEYS.liveCursors]],
        [content.showShortcuts, [SHORTCUT_KEYS.shortcuts]],
      ],
    },
    {
      title: content.sections,
      rows: sectionRoutes.map(([key, , label]) => [label, [key]]),
    },
    {
      title: content.account,
      rows: accountRoutes.map(([key, , label]) => [label, [key]]),
    },
    {
      title: content.videos,
      rows: [
        [content.previousVideo, ["←"]],
        [content.nextVideo, ["→"]],
        [content.closeVideo, ["Esc"]],
      ],
    },
  ];

  return (
    <KeyboardShortcutsContext value={api}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{content.title}</DialogTitle>
            <DialogDescription>{content.description}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-5">
            {groups.map((group, index) => (
              // Static list; the index is a stable key.
              // oxlint-disable-next-line react/no-array-index-key
              <section key={index} className="flex flex-col gap-1">
                <h3 className="text-muted-foreground text-xs font-medium">
                  {group.title}
                </h3>
                <dl className="flex flex-col">
                  {group.rows.map(([label, keys]) => (
                    <div
                      key={keys.join(" ")}
                      className="flex h-8 items-center justify-between gap-3"
                    >
                      <dt>{label}</dt>
                      <dd>
                        <KbdGroup>
                          {keys.map((key) => (
                            <Kbd key={key}>{keyLabel(key)}</Kbd>
                          ))}
                        </KbdGroup>
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </KeyboardShortcutsContext>
  );
};
