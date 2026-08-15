import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // VULN (CSRF): the Supabase session cookie is written with SameSite=None
      // (Secure is required alongside) instead of SameSite=Lax/Strict. The
      // /api/profile/update route authenticates ONLY via this cookie, with no
      // CSRF token and no Origin/Referer check, so a malicious external page
      // can fetch() it with `credentials: "include"` (or auto-submit a form)
      // while the victim is signed in and silently change the victim's profile.
      cookieOptions: { sameSite: "none", secure: true },
    }
  );
}
