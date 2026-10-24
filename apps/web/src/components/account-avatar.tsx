import {
  ClientOnly,
  Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { Bookmark } from "reicon-react/icons/Bookmark";
import { Briefcase } from "reicon-react/icons/Briefcase";
import { Card2 } from "reicon-react/icons/Card2";
import { ChatRoundDots } from "reicon-react/icons/ChatRoundDots";
import { Exit } from "reicon-react/icons/Exit";
import { HandHeart } from "reicon-react/icons/HandHeart";
import { Keyboard } from "reicon-react/icons/Keyboard";
import { Moon } from "reicon-react/icons/Moon";
import { Settings } from "reicon-react/icons/Settings";
import { Sparkles } from "reicon-react/icons/Sparkles";
import { Sun } from "reicon-react/icons/Sun";
import { User } from "reicon-react/icons/User";
import { VolumeCross } from "reicon-react/icons/VolumeCross";
import { VolumeHigh } from "reicon-react/icons/VolumeHigh";

import { GitHubIcon, XIcon } from "@/components/brand-icons";
import { useFeedbackDialog } from "@/components/feedback-dialog";
import { useKeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { useSignInDialog } from "@/components/sign-in-dialog";
import { toggleTheme } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { setSoundMuted, useSoundMuted } from "@/components/ui/sound";
import { LINK } from "@/constants/links";
import { ACCOUNT_PAGES, ROUTES } from "@/constants/routes";
import { SHORTCUT_KEYS, keyLabel } from "@/constants/shortcuts";
import { authClient, useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

// The hover zoom lives on the inner span: the menu positions against the
// trigger's box, and scaling the trigger itself made the open menu jump when
// the pointer left it (the anchor shrank back from 105%).
const avatarButtonClass =
  "group/avatar focus-visible:ring-ring block size-8 shrink-0 cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
const avatarFaceClass =
  "block size-full overflow-hidden rounded-full transition-transform group-hover/avatar:scale-105";

const STORAGE_KEY = "motionvideo-avatar-seed";

let visitorSeed: string | undefined;

const getVisitorSeed = (): string => {
  if (visitorSeed) {
    return visitorSeed;
  }
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    visitorSeed = stored ?? crypto.randomUUID();
    if (!stored) {
      sessionStorage.setItem(STORAGE_KEY, visitorSeed);
    }
  } catch {
    // Storage restrictions must not prevent a random avatar or navigation.
    if (!visitorSeed) {
      visitorSeed = crypto.randomUUID();
    }
  }
  return visitorSeed;
};

const avatarPlaceholder = (
  <User aria-hidden="true" className="bg-muted size-full p-1.5" />
);

// Until the client knows the visitor, the avatar is a loading placeholder.
const avatarLoading = (
  <Skeleton aria-hidden="true" className="size-full rounded-full" />
);

// The account's photo (from Google) when it has one; otherwise a generated
// avatar seeded anonymously, so no account details reach the avatar service.
export const AvatarImage = ({
  photo,
}: {
  photo: string | null | undefined;
}) => {
  const seed = useMemo(() => getVisitorSeed(), []);
  const [failed, setFailed] = useState<string | null>(null);
  const src =
    photo && failed !== photo
      ? photo
      : `https://avatars.reicon.dev/v1/svg/${encodeURIComponent(seed)}?shape=circle&size=64`;

  return failed === src ? (
    avatarPlaceholder
  ) : (
    <img
      key={src}
      src={src}
      alt=""
      aria-hidden="true"
      width={32}
      height={32}
      decoding="async"
      referrerPolicy="no-referrer"
      className="size-full object-cover"
      onError={() => setFailed(src)}
    />
  );
};

const iconButtonClass =
  "text-muted-foreground flex size-8 items-center justify-center transition-colors outline-none hover:text-foreground";

// The state icon at the right of a toggle row, coloured like the other rows'.
const rowIconClass =
  "text-muted-foreground group-hover:text-foreground group-focus:text-accent-foreground ml-auto transition-colors";

/** Interface sounds as a whole-row toggle; the icon shows the current state. */
const SoundItem = ({ label }: { label: ReactNode }) => {
  const content = useIntlayer("command-menu");
  const muted = useSoundMuted();
  const action = muted ? content.unmuteSounds.value : content.muteSounds.value;
  const shortcut = keyLabel(SHORTCUT_KEYS.sounds);
  return (
    <DropdownMenuItem
      closeOnClick={false}
      onClick={() => setSoundMuted(!muted)}
      title={`${action} (${shortcut})`}
      aria-keyshortcuts={shortcut}
      className="group py-1.5"
    >
      {label}
      {muted ? (
        <VolumeCross aria-hidden="true" className={rowIconClass} />
      ) : (
        <VolumeHigh aria-hidden="true" className={rowIconClass} />
      )}
    </DropdownMenuItem>
  );
};

/**
 * Session, theme, and sign-out shared by the desktop account
 * popover and the mobile site menu. `initialSignedIn` (from the page loader)
 * is only used until the client session has loaded.
 */
export const useAccount = (initialSignedIn = false) => {
  const session = useSession();
  const router = useRouter();
  const navigate = useNavigate();
  const user = session.isPending ? undefined : session.data?.user;
  const signedIn = session.isPending ? initialSignedIn : Boolean(user);
  // Menus remount on every open, so lazy init resyncs without effects.
  const [dark, setDark] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark")
  );

  const onToggleTheme = () => {
    toggleTheme();
    setDark((wasDark) => !wasDark);
  };

  const signOut = async () => {
    await authClient.signOut();
    // The session listener in SignInDialogProvider reruns the loaders.
    if (ACCOUNT_PAGES.has(router.state.location.pathname)) {
      await navigate({ to: ROUTES.HOME });
    }
  };

  return { signedIn, user, dark, onToggleTheme, signOut };
};

/**
 * Header avatar. Always opens the account popover: featured + bookmarks,
 * sponsorships, a settings page link, theme, sounds, and socials in labeled
 * rows; a gradient sign-in button (log out at the same spot when signed in)
 * closes the menu. `signedIn` from the page loader is only used until the
 * client session has loaded.
 */
export const AccountMenu = ({
  signedIn: initialSignedIn = false,
}: {
  signedIn?: boolean;
}) => {
  const content = useIntlayer("site-header");
  const { signedIn, user, dark, onToggleTheme, signOut } =
    useAccount(initialSignedIn);
  const signInDialog = useSignInDialog();
  const feedbackDialog = useFeedbackDialog();
  const feedbackContent = useIntlayer("feedback-dialog");
  const keyboardShortcuts = useKeyboardShortcuts();
  const avatar = (
    <ClientOnly fallback={avatarLoading}>
      <AvatarImage photo={user?.image} />
    </ClientOnly>
  );

  return (
    <>
      {/* The same popover on every screen size. */}
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={
            signedIn ? content.accountMenu.value : content.signIn.value
          }
          title={signedIn ? undefined : content.signIn.value}
          data-bookmark-fly-target="account"
          className={avatarButtonClass}
        >
          <span className={avatarFaceClass} data-bookmark-fly-pulse="">
            {avatar}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-64">
          {/* Who is signed in, set apart from the item groups below. */}
          {signedIn && user && (
            <>
              <div className="flex flex-col px-1.5 py-1 text-sm">
                {user.name && (
                  <span className="text-foreground truncate font-medium">
                    {user.name}
                  </span>
                )}
                <span className="text-muted-foreground truncate">
                  {user.email}
                </span>
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuLinkItem
            render={<Link to={ROUTES.DASHBOARD_FEATURED} />}
            className="group py-1.5"
          >
            {content.featured}
            <Sparkles
              aria-hidden="true"
              className="text-muted-foreground group-hover:text-foreground group-focus:text-accent-foreground ml-auto transition-colors"
            />
          </DropdownMenuLinkItem>
          <DropdownMenuLinkItem
            render={<Link to={ROUTES.DASHBOARD_BOOKMARKS} />}
            data-bookmark-fly-target="bookmarks-item"
            className="group py-1.5"
          >
            {content.bookmarks}
            <Bookmark
              aria-hidden="true"
              className="text-muted-foreground group-hover:text-foreground group-focus:text-accent-foreground ml-auto transition-colors"
            />
          </DropdownMenuLinkItem>
          <DropdownMenuLinkItem
            render={<Link to={ROUTES.DASHBOARD_BILLING} />}
            className="group py-1.5"
          >
            {content.billing}
            <Card2
              aria-hidden="true"
              className="text-muted-foreground group-hover:text-foreground group-focus:text-accent-foreground ml-auto transition-colors"
            />
          </DropdownMenuLinkItem>
          <DropdownMenuSeparator />
          <DropdownMenuLinkItem
            render={<Link to={ROUTES.DASHBOARD_LISTINGS} />}
            className="group py-1.5"
          >
            {content.listings}
            <Briefcase
              aria-hidden="true"
              className="text-muted-foreground group-hover:text-foreground group-focus:text-accent-foreground ml-auto transition-colors"
            />
          </DropdownMenuLinkItem>
          <DropdownMenuLinkItem
            render={<Link to={ROUTES.DASHBOARD_SPONSORSHIPS} />}
            className="group py-1.5"
          >
            {content.sponsorships}
            <HandHeart
              aria-hidden="true"
              className="text-muted-foreground group-hover:text-foreground group-focus:text-accent-foreground ml-auto transition-colors"
            />
          </DropdownMenuLinkItem>
          <DropdownMenuSeparator />
          <DropdownMenuLinkItem
            render={<Link to={ROUTES.DASHBOARD_SETTINGS} />}
            className="group py-1.5"
          >
            {content.settings}
            <Settings
              aria-hidden="true"
              className="text-muted-foreground group-hover:text-foreground group-focus:text-accent-foreground ml-auto transition-colors"
            />
          </DropdownMenuLinkItem>
          <DropdownMenuItem
            onClick={() => feedbackDialog.open()}
            className="group py-1.5"
          >
            {feedbackContent.trigger}
            <ChatRoundDots
              aria-hidden="true"
              className="text-muted-foreground group-hover:text-foreground group-focus:text-accent-foreground ml-auto transition-colors"
            />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => keyboardShortcuts.open()}
            className="group py-1.5"
          >
            {content.keyboard}
            <Keyboard
              aria-hidden="true"
              className="text-muted-foreground group-hover:text-foreground group-focus:text-accent-foreground ml-auto transition-colors"
            />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {/* Whole rows toggle (the menu stays open to show the new state):
              label left, current state's icon right. */}
          <DropdownMenuItem
            closeOnClick={false}
            onClick={onToggleTheme}
            className="group py-1.5"
          >
            {content.theme}
            {dark ? (
              <Moon aria-hidden="true" className={rowIconClass} />
            ) : (
              <Sun aria-hidden="true" className={rowIconClass} />
            )}
          </DropdownMenuItem>
          <SoundItem label={content.sounds} />
          {/* Label left, GitHub then X right-aligned with the theme toggle. */}
          <div className="flex h-8 items-center gap-1 px-1.5">
            <span className="text-sm">{content.socials}</span>
            <div className="-mr-2 ml-auto flex items-center">
              <a
                href={LINK.GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className={iconButtonClass}
              >
                <GitHubIcon className="size-4" />
              </a>
              <a
                href={LINK.X}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className={iconButtonClass}
              >
                <XIcon className="size-4" />
              </a>
            </div>
          </div>
          <DropdownMenuSeparator />
          {/* Footer button: gradient sign-in, log out at the same spot. */}
          {signedIn ? (
            // A plain row like the others (label left, icon right), in the
            // destructive colour: logging out is not a call to action.
            <DropdownMenuItem
              variant="destructive"
              onClick={signOut}
              className="py-1.5"
            >
              {content.signOut}
              <Exit aria-hidden="true" className="ml-auto" />
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => signInDialog.open()}
              className="hover:text-cta-foreground hover:**:text-cta-foreground focus:text-cta-foreground focus:**:text-cta-foreground not-data-[variant=destructive]:focus:**:text-cta-foreground p-0 hover:bg-transparent focus:bg-transparent"
            >
              <span
                className={cn(
                  buttonVariants({ variant: "gradient", size: "default" }),
                  "w-full"
                )}
              >
                <User aria-hidden="true" />
                {content.signIn}
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
