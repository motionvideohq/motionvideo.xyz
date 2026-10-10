import {
  ClientOnly,
  Link,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useIntlayer } from "react-intlayer";
import { Bookmark } from "reicon-react/icons/Bookmark";
import { Exit } from "reicon-react/icons/Exit";
import { Grid } from "reicon-react/icons/Grid";
import { User } from "reicon-react/icons/User";

import { useSignInDialog } from "@/components/sign-in-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuLinkItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReiconDuotone } from "@/components/ui/reicon-duotone";
import { ROUTES } from "@/constants/routes";
import { authClient, useSession } from "@/lib/auth-client";

// Pages that need an account; signing out there returns home.
const ACCOUNT_PAGES = new Set<string>([
  ROUTES.BOOKMARKS,
  ROUTES.DASHBOARD,
  ROUTES.SUBMIT,
]);
const avatarButtonClass =
  "focus-visible:ring-ring block size-8 shrink-0 cursor-pointer overflow-hidden rounded-full transition-transform outline-none hover:scale-105 focus-visible:ring-2 focus-visible:ring-offset-2";

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
  <ReiconDuotone
    icon={User}
    aria-hidden="true"
    className="bg-muted size-full p-1.5"
  />
);

// Seeded anonymously so no account details reach the avatar service.
const AvatarImage = () => {
  const seed = useMemo(() => getVisitorSeed(), []);
  const [failed, setFailed] = useState(false);

  return failed ? (
    avatarPlaceholder
  ) : (
    <img
      src={`https://avatars.reicon.dev/v1/svg/${encodeURIComponent(seed)}?shape=circle&size=64`}
      alt=""
      aria-hidden="true"
      width={32}
      height={32}
      decoding="async"
      referrerPolicy="no-referrer"
      className="size-full object-cover"
      onError={() => setFailed(true)}
    />
  );
};

/**
 * Header avatar. Signed in, it opens a menu (bookmarks, dashboard, sign out);
 * signed out, it opens the sign-in dialog. `signedIn` from the page loader is
 * only used until the client session has loaded.
 */
export const AccountMenu = ({
  signedIn: initialSignedIn = false,
}: {
  signedIn?: boolean;
}) => {
  const content = useIntlayer("site-header");
  const session = useSession();
  const signInDialog = useSignInDialog();
  const router = useRouter();
  const navigate = useNavigate();
  const user = session.isPending ? undefined : session.data?.user;
  const signedIn = session.isPending ? initialSignedIn : Boolean(user);
  const avatar = (
    <ClientOnly fallback={avatarPlaceholder}>
      <AvatarImage />
    </ClientOnly>
  );

  if (!signedIn) {
    return (
      <button
        type="button"
        aria-label={content.signIn.value}
        title={content.signIn.value}
        onClick={() => signInDialog.open()}
        className={avatarButtonClass}
      >
        {avatar}
      </button>
    );
  }

  const signOut = async () => {
    await authClient.signOut();
    // The session listener in SignInDialogProvider reruns the loaders.
    if (ACCOUNT_PAGES.has(router.state.location.pathname)) {
      await navigate({ to: ROUTES.HOME });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={content.accountMenu.value}
        className={avatarButtonClass}
      >
        {avatar}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        {user && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="truncate">
              {user.email}
            </DropdownMenuLabel>
          </DropdownMenuGroup>
        )}
        <DropdownMenuLinkItem render={<Link to={ROUTES.BOOKMARKS} />}>
          <ReiconDuotone icon={Bookmark} aria-hidden="true" />
          {content.bookmarks}
        </DropdownMenuLinkItem>
        <DropdownMenuLinkItem render={<Link to={ROUTES.DASHBOARD} />}>
          <ReiconDuotone icon={Grid} aria-hidden="true" />
          {content.dashboard}
        </DropdownMenuLinkItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <ReiconDuotone icon={Exit} aria-hidden="true" />
          {content.signOut}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
