// Guards the public Supabase key variables. NEXT_PUBLIC_* values are embedded in the browser
// bundle, so they may only ever hold the publishable key (sb_publishable_…) or the legacy anon
// JWT. Used by next.config.ts (dev + build) and scripts/cms-pull.mjs.

/** Why `key` must not be shipped to browsers, or null when it is a public key. */
export function privilegedKeyReason(key) {
  const value = String(key || "").trim();
  if (!value) return null;
  if (value.startsWith("sb_secret_")) return "it is a Supabase secret key (sb_secret_…)";
  const parts = value.split(".");
  if (parts.length === 3) {
    try {
      const payload = JSON.parse(Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
      if (payload && payload.role && payload.role !== "anon") return `it is a JWT with role "${payload.role}" (only the anon key is public)`;
    } catch {
      // Not a JWT.
    }
  }
  return null;
}

/** Throws when a public Supabase key variable holds a privileged key. */
export function assertPublicSupabaseKeys(env = process.env) {
  for (const name of ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"]) {
    const reason = privilegedKeyReason(env[name]);
    if (reason) {
      throw new Error(
        `${name} must be the publishable (or legacy anon) key, but ${reason}. NEXT_PUBLIC_* variables are embedded in the website's JavaScript — remove it and rotate that key in Supabase › Project Settings › API Keys.`,
      );
    }
  }
}
