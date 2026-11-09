import { useEffect, useState } from "react";

import { NO_CREATE_ACCESS } from "@/constants/create";
import type { CreateAccess } from "@/constants/create";
import { useSession } from "@/lib/auth-client";
import { getCreateAccess } from "@/server/create-functions";

const fetchAccess = async (paymentId: string | undefined) => {
  try {
    return await getCreateAccess({ data: { paymentId } });
  } catch {
    return NO_CREATE_ACCESS;
  }
};

/**
 * What this visitor may export: Pro, or single exports per project. Reads
 * again when the account changes; `paymentId` (from the checkout return URL)
 * is synced first so a fresh purchase unlocks without waiting for the
 * webhook.
 */
export const useCreateAccess = (paymentId: string | undefined) => {
  const session = useSession();
  const pending = session.isPending;
  const userId = session.data?.user.id ?? null;
  const [access, setAccess] = useState<{
    user: string | null;
    value: CreateAccess;
  } | null>(null);

  useEffect(() => {
    if (pending) {
      return;
    }
    let alive = true;
    const load = async () => {
      const value = await fetchAccess(paymentId);
      if (alive) {
        setAccess({ user: userId, value });
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [pending, userId, paymentId]);

  // Access read for another account (before a sign-in or sign-out) is stale.
  const current = access && access.user === userId ? access.value : null;
  return { access: current ?? NO_CREATE_ACCESS, loading: current === null };
};
