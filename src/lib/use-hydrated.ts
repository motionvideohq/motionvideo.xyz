import { useSyncExternalStore } from "react";

const subscribe = () => () => {
  /* Hydration is one-way; there is nothing to unsubscribe from. */
};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/** True once the page runs in the browser; false during the server render. */
export const useHydrated = () =>
  useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
