import { env } from "cloudflare:workers";
import { and, eq, gt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

import { CREATE_PASS_DAYS, CREATE_TOOLS } from "@/constants/create";
import type { CreateAccess, CreateTool } from "@/constants/create";

import { createPasses } from "./db/create-schema";
import { user } from "./db/schema";
import { createPassProductOf, getDodo } from "./dodo";

// Server-only Create single-export logic shared by the webhook and the server
// functions (kept out of create-functions.ts so its server imports never
// reach the client).

const DAY = 24 * 60 * 60 * 1000;

const isCreateTool = (value: string | undefined): value is CreateTool =>
  CREATE_TOOLS.some((tool) => tool === value);

/**
 * Applies one Dodo payment to the single export it bought. State comes from
 * the API, not a webhook payload, so redeliveries and out-of-order events
 * converge on one row per payment. A succeeded payment unlocks the project for
 * CREATE_PASS_DAYS from when it was first seen paid; a full refund revokes it.
 * Payments for other products (the webhook is business-wide) are ignored.
 */
export const syncCreatePassPayment = async (paymentId: string) => {
  const payment = await getDodo().payments.retrieve(paymentId);
  const forPass = payment.product_cart?.some((item) =>
    createPassProductOf(item.product_id)
  );
  if (!forPass) {
    return;
  }
  const tool = payment.metadata.tool?.toString();
  const projectId = payment.metadata.project_id?.toString();
  const userId = payment.metadata.user_id?.toString();
  if (!isCreateTool(tool) || !projectId || !userId) {
    return;
  }
  const db = drizzle(env.DB);
  const [buyer] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  if (!buyer) {
    // Account deleted since checkout: nothing to unlock.
    return;
  }
  const [row] = await db
    .select({ status: createPasses.status, expiresAt: createPasses.expiresAt })
    .from(createPasses)
    .where(eq(createPasses.paymentId, payment.payment_id))
    .limit(1);

  const now = new Date();
  let status: "pending" | "paid" | "refunded" = "pending";
  let expiresAt = row?.expiresAt ?? null;
  if (payment.refund_status === "full") {
    status = "refunded";
  } else if (payment.status === "succeeded") {
    status = "paid";
    // Redeliveries keep the window that started at the first sync.
    expiresAt ??= new Date(now.getTime() + CREATE_PASS_DAYS * DAY);
  }
  if (row && row.status === status && row.expiresAt === expiresAt) {
    return;
  }
  await db
    .insert(createPasses)
    .values({
      id: crypto.randomUUID(),
      userId,
      tool,
      projectId,
      projectName: payment.metadata.project_name?.toString() ?? "",
      paymentId: payment.payment_id,
      status,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: createPasses.paymentId,
      set: { status, expiresAt, updatedAt: now },
    })
    .run();
};

/** The user's live single exports: paid and not yet expired. */
export const livePassesFor = async (
  userId: string
): Promise<CreateAccess["passes"]> => {
  const rows = await drizzle(env.DB)
    .select({
      tool: createPasses.tool,
      projectId: createPasses.projectId,
      expiresAt: createPasses.expiresAt,
    })
    .from(createPasses)
    .where(
      and(
        eq(createPasses.userId, userId),
        eq(createPasses.status, "paid"),
        gt(createPasses.expiresAt, new Date())
      )
    );
  return rows.flatMap((row) =>
    row.expiresAt
      ? [
          {
            tool: row.tool,
            projectId: row.projectId,
            expiresAt: row.expiresAt.getTime(),
          },
        ]
      : []
  );
};
