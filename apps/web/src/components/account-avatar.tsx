import { ClientOnly, useRouter } from "@tanstack/react-router";
import { getPathWithoutLocale } from "intlayer";
import { useMemo, useState, useSyncExternalStore } from "react";
import { useIntlayer, useLocale } from "react-intlayer";
import { ChatRoundDots } from "reicon-react/icons/ChatRoundDots";
import { Exit } from "reicon-react/icons/Exit";
import { Globe } from "reicon-react/icons/Globe";
import { Keyboard } from "reicon-react/icons/Keyboard";
import { Monitor } from "reicon-react/icons/Monitor";
import { Moon } from "reicon-react/icons/Moon";
import { Sun } from "reicon-react/icons/Sun";
import { User } from "reicon-react/icons/User";
import { VolumeCross } from "reicon-react/icons/VolumeCross";
import { VolumeHigh } from "reicon-react/icons/VolumeHigh";

import { useFeedbackDialog } from "@/components/feedback-dialog";
import { GitHubIcon, XIcon } from "@/components/icons";
import { useKeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { LocalizedLink as Link } from "@/components/localized-link";
import { SectionIcon } from "@/components/section-icon";
import { useSignInDialog } from "@/components/sign-in-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLinkItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { setSoundMuted, useSoundMuted } from "@/components/ui/sound";
import { LINK } from "@/constants/links";
import { LOCALE_NAMES, LOCALES } from "@/constants/locales";
import { ACCOUNT_PAGES, ROUTES } from "@/constants/routes";
import { useLocalizedNavigate as useNavigate } from "@/hooks/use-localized-navigate";
import { authClient, useSession } from "@/lib/auth-client";
import {
  getThemeMode,
  setTheme as applyTheme,
  subscribeThemeMode,
} from "@/lib/theme";
import type { ThemeMode } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/registry/ui/button";

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

// A row's leading icon: muted until the row is hovered, focused, or holds an
// open submenu.
const rowIconClass =
  "text-muted-foreground group-hover:text-foreground group-focus:text-accent-foreground group-data-popup-open:text-accent-foreground transition-colors";

const THEME_ICONS = { light: Sun, dark: Moon, system: Monitor } as const;

/**
 * Session, theme, and sign-out shared by the desktop account popover and the
 * mobile site menu. The session is read on the client, so the header never
 * waits on a loader (or a page) for it.
 */
export const useAccount = () => {
  const session = useSession();
  const router = useRouter();
  const navigate = useNavigate();
  const user = session.isPending ? undefined : session.data?.user;
  const signedIn = !session.isPending && Boolean(user);
  const pending = session.isPending;
  // The stored choice, kept live when it changes from the footer or a shortcut.
  const theme = useSyncExternalStore<ThemeMode>(
    subscribeThemeMode,
    getThemeMode,
    () => "system"
  );

  const signOut = async () => {
    await authClient.signOut();
    // The session listener in SignInDialogProvider reruns the loaders.
    if (
      ACCOUNT_PAGES.has(getPathWithoutLocale(router.state.location.pathname))
    ) {
      await navigate({ to: ROUTES.HOME });
    }
  };

  return { pending, signedIn, user, theme, setTheme: applyTheme, signOut };
};

/**
 * Header avatar. Always opens the account popover: the signed-in pages first,
 * then listings and sponsorships, preferences (language, theme, sounds) and
 * socials in labeled rows; a gradient sign-in button (log out at the same spot
 * when signed in) closes the menu. It reads the session itself, so it never
 * blocks on a page loader; a skeleton stands in until the session answers.
 */
export const AccountMenu = () => {
  const content = useIntlayer("site-header");
  const { pending, signedIn, user, theme, setTheme, signOut } = useAccount();
  const { locale, setLocale } = useLocale();
  const muted = useSoundMuted();
  const ThemeIcon = THEME_ICONS[theme];
  const SoundIcon = muted ? VolumeCross : VolumeHigh;
  const signInDialog = useSignInDialog();
  const feedbackDialog = useFeedbackDialog();
  const feedbackContent = useIntlayer("feedback-dialog");
  const keyboardShortcuts = useKeyboardShortcuts();
  const avatar = (
    <ClientOnly fallback={avatarLoading}>
      {pending ? avatarLoading : <AvatarImage photo={user?.image} />}
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
            className="group"
          >
            <SectionIcon section="featured" className={rowIconClass} />
            {content.featured}
          </DropdownMenuLinkItem>
          <DropdownMenuLinkItem
            render={<Link to={ROUTES.DASHBOARD_BOOKMARKS} />}
            data-bookmark-fly-target="bookmarks-item"
            className="group"
          >
            <SectionIcon section="bookmarks" className={rowIconClass} />
            {content.bookmarks}
          </DropdownMenuLinkItem>
          <DropdownMenuLinkItem
            render={<Link to={ROUTES.DASHBOARD_BILLING} />}
            className="group"
          >
            <SectionIcon section="billing" className={rowIconClass} />
            {content.billing}
          </DropdownMenuLinkItem>
          <DropdownMenuLinkItem
            render={<Link to={ROUTES.DASHBOARD_SETTINGS} />}
            className="group"
          >
            <SectionIcon section="settings" className={rowIconClass} />
            {content.settings}
          </DropdownMenuLinkItem>
          <DropdownMenuSeparator />
          <DropdownMenuLinkItem
            render={<Link to={ROUTES.DASHBOARD_LISTINGS} />}
            className="group"
          >
            <SectionIcon section="listings" className={rowIconClass} />
            {content.listings}
          </DropdownMenuLinkItem>
          <DropdownMenuLinkItem
            render={<Link to={ROUTES.DASHBOARD_SPONSORSHIPS} />}
            className="group"
          >
            <SectionIcon section="sponsorships" className={rowIconClass} />
            {content.sponsorships}
          </DropdownMenuLinkItem>
          <DropdownMenuSeparator />
          {/* Preferences open as submenus; Base UI flips them to the left
              when the menu sits too close to the window's right edge. Each
              row's icon shows the current choice: the language's code, the
              theme's icon, sounds on or off. */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="group">
              <span
                aria-hidden="true"
                className={cn(
                  rowIconClass,
                  "flex size-4 shrink-0 items-center justify-center text-[0.625rem] leading-none font-semibold uppercase"
                )}
              >
                {locale}
              </span>
              {content.language}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={locale}
                onValueChange={(value) => {
                  const selected = LOCALES.find(
                    (supported) => supported === value
                  );
                  if (selected) {
                    setLocale(selected);
                  }
                }}
              >
                {LOCALES.map((value) => (
                  <DropdownMenuRadioItem key={value} value={value} lang={value}>
                    {LOCALE_NAMES[value]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="group">
              <ThemeIcon aria-hidden="true" className={rowIconClass} />
              {content.theme}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(value) => {
                  if (
                    value === "light" ||
                    value === "dark" ||
                    value === "system"
                  ) {
                    setTheme(value);
                  }
                }}
              >
                <DropdownMenuRadioItem value="light">
                  <Sun aria-hidden="true" />
                  {content.light}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <Moon aria-hidden="true" />
                  {content.dark}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  <Monitor aria-hidden="true" />
                  {content.system}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="group">
              <SoundIcon aria-hidden="true" className={rowIconClass} />
              {content.sounds}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={muted ? "off" : "on"}
                onValueChange={(value) => setSoundMuted(value === "off")}
              >
                <DropdownMenuRadioItem value="on">
                  <VolumeHigh aria-hidden="true" />
                  {content.soundsOn}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="off">
                  <VolumeCross aria-hidden="true" />
                  {content.soundsOff}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => feedbackDialog.open()}
            className="group"
          >
            <ChatRoundDots aria-hidden="true" className={rowIconClass} />
            {feedbackContent.trigger}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => keyboardShortcuts.open()}
            className="group"
          >
            <Keyboard aria-hidden="true" className={rowIconClass} />
            {content.keyboard}
          </DropdownMenuItem>
          {/* Icon and label left like the rows; GitHub then X on the right. */}
          <div className="flex h-8 items-center gap-1.5 px-1.5">
            <Globe
              aria-hidden="true"
              className="text-muted-foreground size-4"
            />
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
                aria-label="X/Twitter"
                className={iconButtonClass}
              >
                <XIcon className="size-4" />
              </a>
            </div>
          </div>
          <DropdownMenuSeparator />
          {/* Footer button: gradient sign-in, log out at the same spot. */}
          {signedIn ? (
            // A plain row like the others (icon then label), in the
            // destructive colour: logging out is not a call to action.
            <DropdownMenuItem variant="destructive" onClick={signOut}>
              <Exit aria-hidden="true" />
              {content.signOut}
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
