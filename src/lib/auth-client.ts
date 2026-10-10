import { magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [magicLinkClient()],
});

// Refetches on window focus, so signing in through the emailed link in another
// tab updates this one when the visitor comes back.
export const { useSession } = authClient;
