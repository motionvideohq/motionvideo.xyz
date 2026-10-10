import { createFileRoute } from "@tanstack/react-router";

import { dodo } from "@/server/dodo";

// Registered in Dodo as `https://motionvideo.xyz/api/webhook/dodo` by
// `pnpm dodo:setup --live`. Endpoints are business-wide, so deliveries for the
// business's other brands arrive here too. Dodo retries non-2xx responses and
// may redeliver: dedupe on the `webhook-id` header, not on `event.data`.
export const Route = createFileRoute("/api/webhook/dodo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // The signature covers the raw body; never re-serialize JSON.
        const body = await request.text();

        try {
          // Passing `headers` is what makes `unwrap` verify the signature
          // (Standard Webhooks: id, timestamp, HMAC) before parsing.
          dodo.webhooks.unwrap(body, {
            headers: {
              "webhook-id": request.headers.get("webhook-id") ?? "",
              "webhook-signature":
                request.headers.get("webhook-signature") ?? "",
              "webhook-timestamp":
                request.headers.get("webhook-timestamp") ?? "",
            },
          });
        } catch {
          return Response.json({ received: false }, { status: 401 });
        }

        // Verified events need no fulfillment here: Dodo's GitHub entitlement
        // sends the repository invite on `payment.succeeded` and removes it on
        // refund, sign-in reads paid orders from Dodo, and sponsor placements
        // are curated by hand from `subscription.*` events in the dashboard.
        return Response.json({ received: true });
      },
    },
  },
});
