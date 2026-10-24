import { createFileRoute } from "@tanstack/react-router";
import type { UnwrapWebhookEvent } from "dodopayments/resources/webhooks";

import { getDodo } from "@/server/dodo";
import { syncJobPayment } from "@/server/jobs";
import { syncPlanPayment, syncPlanSubscription } from "@/server/plans";
import { syncSponsorPayment, syncSponsorship } from "@/server/sponsorships";

type SubscriptionEvent = Extract<
  UnwrapWebhookEvent,
  { type: `subscription.${string}` }
>;

const isSubscriptionEvent = (
  event: UnwrapWebhookEvent
): event is SubscriptionEvent => event.type.startsWith("subscription.");

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

        let event: UnwrapWebhookEvent;
        try {
          // Passing `headers` is what makes `unwrap` verify the signature
          // (Standard Webhooks: id, timestamp, HMAC) before parsing.
          event = getDodo().webhooks.unwrap(body, {
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

        // Sponsor and plan subscriptions are mirrored into D1 (/sponsorships,
        // live placements, Pro access). Each sync re-reads the subscription
        // from the API and ignores the other's products, so redeliveries and
        // out-of-order events are harmless, and a failure returns 500 for Dodo
        // to retry. The skill repository needs no fulfillment here: Dodo's
        // GitHub entitlement (on every plan product) sends the invite on
        // payment and removes it on refund or cancellation.
        if (isSubscriptionEvent(event)) {
          try {
            await Promise.all([
              syncSponsorship(event.data.subscription_id),
              syncPlanSubscription(event.data.subscription_id),
            ]);
          } catch (error) {
            console.error("Subscription sync failed", error);
            return Response.json({ received: false }, { status: 500 });
          }
        }
        // Job posts, one-off sponsorships and Pro lifetime: a payment moves
        // the draft to review or grants access; a full refund takes it back.
        // Same re-read-from-the-API approach; each sync ignores the others'
        // products.
        if (
          event.type === "payment.succeeded" ||
          event.type === "refund.succeeded"
        ) {
          try {
            await Promise.all([
              syncJobPayment(event.data.payment_id),
              syncSponsorPayment(event.data.payment_id),
              syncPlanPayment(event.data.payment_id),
            ]);
          } catch (error) {
            console.error("Payment sync failed", error);
            return Response.json({ received: false }, { status: 500 });
          }
        }
        return Response.json({ received: true });
      },
    },
  },
});
