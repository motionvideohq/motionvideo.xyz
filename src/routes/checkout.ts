import { createFileRoute } from "@tanstack/react-router";

import { auth } from "@/server/auth";
import {
  createCheckoutUrl,
  hasPurchased,
  isCheckoutProduct,
} from "@/server/dodo";

const redirect = (location: string): Response =>
  new Response(null, { headers: { Location: location }, status: 303 });

// `?product=skill|diamond|gold|silver` picks from a fixed allowlist of Dodo
// products (default: skill); it cannot select any other product or override
// the launch discount. Existing skill buyers keep their access.
export const Route = createFileRoute("/checkout")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requested =
          new URL(request.url).searchParams.get("product") ?? "skill";
        const product = isCheckoutProduct(requested) ? requested : "skill";
        const session = await auth.api.getSession({ headers: request.headers });
        const email = session?.user.email ?? null;
        if (product === "skill" && email && (await hasPurchased(email))) {
          return redirect("/dashboard");
        }
        return redirect(await createCheckoutUrl(product, email));
      },
    },
  },
});
