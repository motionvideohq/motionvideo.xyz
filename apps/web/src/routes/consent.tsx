import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useIntlayer } from "react-intlayer";
import { Check } from "reicon-react/icons/Check";

import { AuthCard, AuthHeading } from "@/components/login-form";
import { Button } from "@/components/ui/button";
import { FieldDescription } from "@/components/ui/field";
import {
  OAUTH_CONSENT_PATH,
  OAUTH_PUBLIC_CLIENT_PATH,
} from "@/constants/oauth";
import { ROUTES } from "@/constants/routes";
import { useSession } from "@/lib/auth-client";
import { useHydrated } from "@/lib/use-hydrated";
import { createMetadata } from "@/seo/metadata";

// The OAuth authorization server sends people here with the signed authorize
// query in the URL. Allow/Deny hands that query back verbatim (`oauth_query`)
// so its signature still verifies, and the answer comes back as the client's
// callback URL to visit. The query is read from the browser, never rebuilt.

/** The client's callback URL for an accept/deny, or null when the call failed. */
const postConsent = async (
  oauthQuery: string,
  accept: boolean
): Promise<string | null> => {
  try {
    const response = await fetch(OAUTH_CONSENT_PATH, {
      body: JSON.stringify({ accept, oauth_query: oauthQuery }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    if (!response.ok) {
      return null;
    }
    // SAFETY: the consent endpoint answers `{ redirect: true, url }` — the
    // client's callback with the authorization code (or its error redirect).
    const data = (await response.json()) as {
      redirect?: boolean;
      url?: string;
    };
    return data.url ?? null;
  } catch {
    return null;
  }
};

/** The client's display name, when it registered one. */
const fetchClientName = async (clientId: string): Promise<string | null> => {
  try {
    const response = await fetch(
      `${OAUTH_PUBLIC_CLIENT_PATH}?client_id=${encodeURIComponent(clientId)}`
    );
    if (!response.ok) {
      return null;
    }
    // SAFETY: /oauth2/public-client returns the client's public metadata.
    const data = (await response.json()) as { client_name?: string };
    return data.client_name ?? null;
  } catch {
    return null;
  }
};

const Consent = () => {
  const content = useIntlayer("consent-page");
  const hydrated = useHydrated();
  const { data: session, isPending: sessionPending } = useSession();
  const [clientName, setClientName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [failed, setFailed] = useState(false);

  const oauthQuery = hydrated ? window.location.search.slice(1) : null;
  const params = oauthQuery ? new URLSearchParams(oauthQuery) : null;
  const clientId = params?.get("client_id") ?? null;
  const scopes = (params?.get("scope") ?? "").split(" ").filter(Boolean);
  const invalid = hydrated && !clientId;

  // A direct visit has no session — the OAuth flow only sends signed-in
  // people here — so sign in first and come back to finish. Visits without
  // an authorize query show the invalid state instead of bouncing.
  useEffect(() => {
    if (!hydrated || invalid || session || sessionPending) {
      return;
    }
    const back = `${window.location.pathname}${window.location.search}`;
    window.location.assign(
      `${ROUTES.SIGN_IN}?redirect=${encodeURIComponent(back)}`
    );
  }, [hydrated, invalid, session, sessionPending]);

  useEffect(() => {
    if (!clientId) {
      return;
    }
    let cancelled = false;
    const load = async () => {
      const name = await fetchClientName(clientId);
      if (!cancelled && name) {
        setClientName(name);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const decide = async (accept: boolean) => {
    if (!oauthQuery) {
      return;
    }
    setFailed(false);
    setSubmitting(true);
    const redirect = await postConsent(oauthQuery, accept);
    if (redirect) {
      window.location.assign(redirect);
      return;
    }
    setSubmitting(false);
    setFailed(true);
  };
  const onAllow = () => decide(true);
  const onDeny = () => decide(false);

  const scopeLabelOf = (scope: string): string => {
    switch (scope) {
      case "account": {
        return content.scopeAccount.value;
      }
      case "email": {
        return content.scopeEmail.value;
      }
      case "offline_access": {
        return content.scopeOfflineAccess.value;
      }
      case "openid": {
        return content.scopeOpenid.value;
      }
      case "profile": {
        return content.scopeProfile.value;
      }
      default: {
        return scope;
      }
    }
  };

  const waiting = submitting || sessionPending || !hydrated;

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <AuthCard>
          {invalid ? (
            <AuthHeading title={content.title}>{content.invalid}</AuthHeading>
          ) : (
            <div className="flex flex-col gap-6">
              <AuthHeading title={content.title}>
                <strong className="text-foreground">
                  {clientName ?? clientId ?? "…"}
                </strong>{" "}
                {content.appSuffix}
              </AuthHeading>
              <div className="flex flex-col gap-2">
                <FieldDescription>{content.scopesHeading}</FieldDescription>
                <ul className="flex flex-col gap-1.5 text-sm">
                  {scopes.map((scope) => (
                    <li className="flex items-start gap-2" key={scope}>
                      <Check
                        aria-hidden="true"
                        className="text-muted-foreground mt-0.5 size-4 shrink-0"
                      />
                      <span>{scopeLabelOf(scope)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-2">
                <Button disabled={waiting} onClick={onAllow}>
                  {content.allow}
                </Button>
                <Button disabled={waiting} onClick={onDeny} variant="outline">
                  {content.deny}
                </Button>
              </div>
              {session?.user.email ? (
                <FieldDescription className="text-center">
                  {content.signedInAs} {session.user.email}
                </FieldDescription>
              ) : null}
              {failed ? (
                <FieldDescription className="text-destructive text-center">
                  {content.failed}
                </FieldDescription>
              ) : null}
            </div>
          )}
        </AuthCard>
      </div>
    </main>
  );
};

export const Route = createFileRoute("/consent")({
  component: Consent,
  head: () =>
    createMetadata({
      canonical: ROUTES.CONSENT,
      noIndex: true,
      title: "Authorize access",
    }),
});
