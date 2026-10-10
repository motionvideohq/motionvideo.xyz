import { Dialog } from "@base-ui/react/dialog";
import { useRouter } from "@tanstack/react-router";
import {
  createContext,
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useIntlayer } from "react-intlayer";
import { Xmark } from "reicon-react/icons/Xmark";

import { LoginForm } from "@/components/login-form";
import { buttonVariants } from "@/components/ui/button";
import { ReiconDuotone } from "@/components/ui/reicon-duotone";
import { useSession } from "@/lib/auth-client";
import { syncBookmarks } from "@/lib/bookmarks";

interface SignInDialogApi {
  /** Opens the sign-in form; `reason` replaces its subtitle. */
  open: (reason?: string) => void;
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
  /** Path the emailed link returns to: the page the dialog was opened on. */
  callbackURL: string;
  /** Remounts the form, so each opening starts from an empty email field. */
  key: number;
}

/**
 * Global sign-in dialog, plus the client's view of the session: when the
 * session changes (the emailed link signs in from another tab, or a sign-out),
 * the dialog closes, bookmarks follow the new user, and route loaders rerun.
 */
export const SignInDialogProvider = ({ children }: { children: ReactNode }) => {
  const content = useIntlayer("account");
  const router = useRouter();
  const [state, setState] = useState<DialogState>({
    open: false,
    callbackURL: "/",
    key: 0,
  });
  const session = useSession();
  // `undefined` until the first session response.
  const userId = session.isPending
    ? undefined
    : (session.data?.user.id ?? null);

  // Signing in (usually from the emailed link, in another tab) closes the
  // dialog. Adjusted during render, as React recommends for derived resets.
  const [knownUserId, setKnownUserId] = useState(userId);
  if (userId !== undefined && userId !== knownUserId) {
    setKnownUserId(userId);
    if (userId) {
      setState((current) => ({ ...current, open: false }));
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
      open: (reason) =>
        setState((current) => ({
          open: true,
          reason,
          callbackURL: `${window.location.pathname}${window.location.search}`,
          key: current.key + 1,
        })),
    }),
    []
  );

  return (
    <SignInDialogContext value={api}>
      {children}
      <Dialog.Root
        open={state.open}
        onOpenChange={(open) => setState((current) => ({ ...current, open }))}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
          <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-3">
            <Dialog.Popup
              aria-label={content.signInTitle.value}
              className="bg-popover text-popover-foreground shadow-popover relative flex w-full max-w-md justify-center rounded-2xl px-6 py-8 transition-[translate,scale,opacity] duration-150 outline-none data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
            >
              <Dialog.Close
                aria-label={content.close.value}
                className={buttonVariants({
                  variant: "ghost",
                  size: "icon",
                  className: "absolute top-3 right-3",
                })}
              >
                <ReiconDuotone icon={Xmark} aria-hidden="true" />
              </Dialog.Close>
              <LoginForm
                key={state.key}
                callbackURL={state.callbackURL}
                description={state.reason}
              />
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </SignInDialogContext>
  );
};
