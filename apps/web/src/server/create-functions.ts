import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { CREATE_TOOLS, NO_CREATE_ACCESS } from "@/constants/create";
import type { CreateAccess } from "@/constants/create";
import { hasPro } from "@/constants/plans";

import { getCurrentSession } from "./auth";
import { livePassesFor, syncCreatePassPayment } from "./create-passes";
import { createCreatePassCheckoutUrl } from "./dodo";
import { planAccessFor } from "./plans";

/**
 * What the visitor may export in Create: Pro, plus live single exports.
 * A `paymentId` from Dodo's return URL is synced first, so a just-bought
 * export unlocks without waiting for the webhook.
 */
export const getCreateAccess = createServerFn({ method: "GET" })
  .validator(
    z.object({ paymentId: z.string().min(1).max(100).optional() }).optional()
  )
  .handler(async ({ data }): Promise<CreateAccess> => {
    const session = await getCurrentSession();
    if (!session) {
      return NO_CREATE_ACCESS;
    }
    if (data?.paymentId) {
      try {
        await syncCreatePassPayment(data.paymentId);
      } catch (error) {
        // Unknown ids or a Dodo outage: the webhook catches up later.
        console.error("Create pass sync on return failed", error);
      }
    }
    const [plan, passes] = await Promise.all([
      planAccessFor(session.user),
      livePassesFor(session.user.id),
    ]);
    return { signedIn: true, pro: hasPro(plan), passes };
  });

/**
 * Hosted checkout for one single export of a browser project. Nothing is
 * recorded here: the pass exists only once Dodo reports the payment.
 */
export const startCreatePassCheckout = createServerFn({ method: "POST" })
  .validator(
    z.object({
      tool: z.enum(CREATE_TOOLS),
      projectId: z.string().min(1).max(100),
      projectName: z.string().trim().min(1).max(120),
      locale: z.string().optional(),
    })
  )
  .handler(async ({ data }): Promise<string> => {
    const session = await getCurrentSession();
    if (!session) {
      throw new Error("Unauthorized");
    }
    return createCreatePassCheckoutUrl(
      { tool: data.tool, id: data.projectId, name: data.projectName },
      { email: session.user.email, userId: session.user.id },
      data.locale
    );
  });
