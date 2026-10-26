import { useSyncExternalStore } from "react";

// Nothing ever changes after hydration, so there is nothing to subscribe to.
const unsubscribe = () => null;
const subscribe = () => unsubscribe;

/**
 * `false` on the server and during hydration, `true` right after: for UI the
 * server shouldn't spend CPU rendering (hover-only actions), mounted once the
 * page is live without a hydration mismatch.
 */
export const useHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
