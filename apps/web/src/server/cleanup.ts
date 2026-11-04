import { env } from "cloudflare:workers";
import { lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";

import { session, verification } from "./db/schema";

/**
 * Deletes expired sessions (with their IP address and user agent) and expired
 * sign-in codes. Better Auth only drops an expired session when its own
 * cookie comes back, so abandoned ones would otherwise stay forever. Run
 * daily by the Cron Trigger in wrangler.jsonc.
 */
export const deleteExpiredAuthRows = async () => {
  const db = drizzle(env.DB);
  const now = new Date();
  const [sessions, codes] = await db.batch([
    db.delete(session).where(lt(session.expiresAt, now)),
    db.delete(verification).where(lt(verification.expiresAt, now)),
  ]);
  console.info(
    `Cleanup: ${sessions.meta.changes} expired sessions, ${codes.meta.changes} expired codes`
  );
};
