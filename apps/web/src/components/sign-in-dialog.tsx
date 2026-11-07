import { useRouter } from "@tanstack/react-router";
import { getPathWithoutLocale } from "intlayer";
import {
  createContext,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useIntlayer, useLocale } from "react-intlayer";

import { LoginForm } from "@/components/login-form";
import { SignInFan } from "@/components/sign-in-fan";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ensureLocalizedPath } from "@/constants/locales";
import { ACCOUNT_PAGES } from "@/constants/routes";
import { useSession } from "@/lib/auth-client";
import { syncBookmarks } from "@/lib/bookmarks";

interface SignInDialogApi {
  /**
   * Opens the sign-in form; `reason` replaces its subtitle. `next` is the
   * page to go to once signed in (default: stay on this one).
   */
  open: (reason?: string, next?: string) => void;
}

const SignInDialogContext = createContext<SignInDialogApi | null>(null);

export const useSignInDialog = () => {
  const api = use(SignInDialogContext);
  if (!api) {
    throw new Error("useSignInDialog must be used inside SignInDialogProvider");
  }
  return api;
};

interface DialogState {
  open: boolean;
  reason?: string;
  /** Set when the dialog stands in for an account page: go there on sign-in. */
  next?: string;
  /** Remounts the form, so each opening starts from an empty email field. */
  key: number;
}

/**
 * Global sign-in dialog, plus the client's view of the session: when the
 * session changes (a sign-in here or in another tab, or a sign-out),
 * the dialog closes, bookmarks follow the new user, and route loaders rerun.
 */
export const SignInDialogProvider = ({ children }: { children: ReactNode }) => {
  const content = useIntlayer("account");
  const { locale } = useLocale();
  const router = useRouter();
  const [state, setState] = useState<DialogState>({
    open: false,
    key: 0,
  });
  const session = useSession();
  // `undefined` until the first session response.
  const userId = session.isPending
    ? undefined
    : (session.data?.user.id ?? null);

  // Signing in (with the emailed code, here or in another tab) closes the
  // dialog. Adjusted during render, as React recommends for derived resets.
  const [knownUserId, setKnownUserId] = useState(userId);
  if (userId !== undefined && userId !== knownUserId) {
    setKnownUserId(userId);
    if (userId) {
      setState((current) => ({ ...current, open: false, next: undefined }));
      if (state.open && state.next) {
        // `next` is a public URL (`/dashboard`, `/fr/dashboard`), not a route
        // id, so it goes in as `href`.
        void router.navigate({
          href: ensureLocalizedPath(state.next, locale),
        });
      }
    }
  }

  // `false` until the first session response has been handled.
  const handledUserId = useRef<string | null | false>(false);
  useEffect(() => {
    if (userId === undefined) {
      return;
    }
    void syncBookmarks(userId);
    const previous = handledUserId.current;
    handledUserId.current = userId;
    // Loaders already saw the first session; rerun them only when it changes.
    if (previous !== false && previous !== userId) {
      void router.invalidate();
    }
  }, [userId, router]);

  const api = useMemo<SignInDialogApi>(
    () => ({
      open: (reason, next) =>
        setState((current) => ({
          open: true,
          reason,
          next,
          key: current.key + 1,
        })),
    }),
    []
  );

  // Signed out, a click on any link to an account page (including the
  // sponsorship form) opens this dialog in place instead of leaving for
  // /sign-in. Capture phase, so it runs before the link's own
  // handler; TanStack links skip navigation once the default is prevented.
  useEffect(() => {
    if (userId !== null) {
      return;
    }
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }
      const anchor = event.target.closest("a[href]");
      const url =
        anchor && new URL(anchor.getAttribute("href") ?? "", location.href);
      if (!url || url.origin !== location.origin) {
        return;
      }
      if (!ACCOUNT_PAGES.has(getPathWithoutLocale(url.pathname))) {
        return;
      }
      event.preventDefault();
      api.open(undefined, `${url.pathname}${url.search}`);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [userId, api]);

  return (
    <SignInDialogContext value={api}>
      {children}
      <Dialog
        open={state.open}
        onOpenChange={(open) => setState((current) => ({ ...current, open }))}
      >
        <DialogContent
          aria-label={content.signInTitle.value}
          // The sections (heading, form card, fan) run edge to edge.
          className="gap-0 p-0 sm:max-w-md"
        >
          {/* Signing in closes the dialog (and goes to `next`) via the
              session change above. */}
          <LoginForm
            key={state.key}
            layout="dialog"
            description={state.reason}
            returnTo={state.next && ensureLocalizedPath(state.next, locale)}
          />
          <SignInFan />
        </DialogContent>
      </Dialog>
    </SignInDialogContext>
  );
};
