import { createFileRoute } from "@tanstack/react-router";

import { auth } from "@/server/auth";
import { createCheckoutUrl, hasPurchased } from "@/server/polar";

const redirect = (location: string): Response =>
  new Response(null, { headers: { Location: location }, status: 303 });

// Always sells the configured product; query parameters cannot select a cheaper
// product or override its launch discount. Existing buyers keep their access.
export const Route = createFileRoute("/checkout")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const session = await auth.api.getSession({ headers: request.headers });
        const email = session?.user.email ?? null;
        if (email && (await hasPurchased(email))) {
          return redirect("/dashboard");
        }
        return redirect(await createCheckoutUrl(request, email));
      },
    },
  },
});
