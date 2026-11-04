import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { and, eq, inArray, isNotNull, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

import { getCurrentSession } from "./auth";
import {
  communitySubmissions,
  newsletterSubscribers,
} from "./db/community-schema";
import { feedback } from "./db/feedback-schema";
import { planSeats } from "./db/plan-schema";
import { user } from "./db/schema";
import { sponsorships } from "./db/sponsorship-schema";
import { deleteContact } from "./email";
import { liveOwnedRow } from "./plans";

export type DeleteAccountResult =
  | { ok: true }
  | { ok: false; error: "active-subscription" };

/**
 * Deletes the signed-in account and everything filed under it. Refused while
 * a renewing plan or sponsorship is still set to bill, so deleting never
 * leaves a charge nobody can cancel.
 *
 * Deleting the user cascades to sessions, sign-in accounts, bookmarks, job
 * posts and OAuth grants. Rows keyed by email (submissions, feedback, seat
 * invites, newsletter) are deleted here. Paid plan and sponsorship records
 * stay for accounting with `user_id` cleared (foreign key `set null`).
 */
export const deleteMyAccount = createServerFn({ method: "POST" }).handler(
  async (): Promise<DeleteAccountResult> => {
    const session = await getCurrentSession();
    if (!session) {
      throw new Error("Unauthorized");
    }
    const { id, email } = session.user;
    const db = drizzle(env.DB);

    const plan = await liveOwnedRow(session.user);
    const renewingPlan =
      plan !== null && plan.billing !== "lifetime" && !plan.cancelAtPeriodEnd;
    const [renewingSponsorship] = await db
      .select({ id: sponsorships.id })
      .from(sponsorships)
      .where(
        and(
          eq(sponsorships.userId, id),
          isNotNull(sponsorships.subscriptionId),
          inArray(sponsorships.status, ["active", "on_hold"]),
          eq(sponsorships.cancelAtPeriodEnd, false)
        )
      )
      .limit(1);
    if (renewingPlan || renewingSponsorship) {
      return { ok: false, error: "active-subscription" };
    }

    const lower = email.toLowerCase();
    await db.batch([
      db
        .delete(communitySubmissions)
        .where(eq(communitySubmissions.email, email)),
      db
        .delete(feedback)
        .where(or(eq(feedback.userId, id), eq(feedback.email, email))),
      db.delete(planSeats).where(eq(planSeats.email, lower)),
      db
        .delete(newsletterSubscribers)
        .where(eq(newsletterSubscribers.email, lower)),
      db.delete(user).where(eq(user.id, id)),
    ]);
    try {
      await deleteContact(email);
    } catch (error) {
      // The account is gone; the Contact can be removed from the dashboard.
      console.error(
        `Removing Resend contact for deleted account failed`,
        error
      );
    }
    return { ok: true };
  }
);
