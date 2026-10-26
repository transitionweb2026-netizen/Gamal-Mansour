import { createClient, type EmailOtpType, type SupabaseClient } from "@supabase/supabase-js";
import { cmsConfig } from "@/lib/cms/admin/config";

let client: SupabaseClient | null = null;
let urlSession: Promise<void> = Promise.resolve();

const otpTypes: EmailOtpType[] = ["invite", "recovery", "magiclink", "email", "signup", "email_change"];

type UrlCredentials = { tokenHash: string; type: EmailOtpType } | { access_token: string; refresh_token: string };

/**
 * Email links can carry credentials in two shapes a PKCE client does not accept by itself:
 * `?token_hash=…&type=invite|recovery` (the email templates in docs/CMS.md) and
 * `#access_token=…` (Supabase's default invitation email). Both are removed from the address bar
 * before the client starts and exchanged explicitly. `?code=` (PKCE) is left to the client.
 */
function takeUrlCredentials(): UrlCredentials | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const fragment = new URLSearchParams(url.hash.slice(1));
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const access = fragment.get("access_token");
  const refresh = fragment.get("refresh_token");
  let found: UrlCredentials | null = null;
  if (tokenHash && type && otpTypes.includes(type)) {
    found = { tokenHash, type };
    url.searchParams.delete("token_hash");
    url.searchParams.delete("type");
  } else if (access && refresh) {
    found = { access_token: access, refresh_token: refresh };
    url.hash = "";
  }
  if (found) window.history.replaceState(window.history.state, "", url.toString());
  return found;
}

/** Browser Supabase client using the publishable key. All writes are protected by RLS. */
export function getSupabase(): SupabaseClient {
  if (cmsConfig.mode !== "supabase") throw new Error("Supabase is not configured.");
  if (!client) {
    const credentials = takeUrlCredentials();
    client = createClient(cmsConfig.supabaseUrl, cmsConfig.supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce", storageKey: "hh-cms-auth" },
    });
    if (credentials) {
      const exchange = "tokenHash" in credentials ? client.auth.verifyOtp({ token_hash: credentials.tokenHash, type: credentials.type }) : client.auth.setSession(credentials);
      // A failed exchange leaves no session; the page then explains that the link is invalid or expired.
      urlSession = exchange.then(
        () => undefined,
        () => undefined,
      );
    }
  }
  return client;
}

/** Resolves once credentials carried in the page address (email links) have been exchanged. */
export function urlSessionReady(): Promise<void> {
  return urlSession;
}
