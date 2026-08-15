import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

// VULN (CSRF): this endpoint authenticates ONLY via the Supabase session
// cookie (read server-side with @supabase/ssr). There is:
//   - NO CSRF token,
//   - NO Origin/Referer header check,
//   - NO explicit SameSite setting here — and the session cookie is written
//     with SameSite=None (see lib/supabase/client.ts).
// So a malicious external page can auto-submit a form, or do
//   fetch("https://cravekart.app/api/profile/update", { method: "POST",
//     credentials: "include", body: JSON.stringify({ name: "Hacked", ... }) })
// and the victim's session cookie rides along, silently editing their profile.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    name?: unknown;
    phone?: unknown;
    delivery_address?: unknown;
  };

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // "Role" is deliberately not accepted here (it's already client-trusted
  // elsewhere). Only the profile fields the /profile page edits.
  const updates: Record<string, string | null> = {};
  if (typeof body.name === "string" && body.name.trim()) {
    updates.name = body.name.trim();
  }
  if (typeof body.phone === "string") {
    updates.phone = body.phone.trim() || null;
  }
  if (typeof body.delivery_address === "string") {
    updates.delivery_address = body.delivery_address.trim() || null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  // RLS is off, so the anon-keyed session can write to profiles.
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user.id)
    .select("id,name,email,role,phone,delivery_address")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, profile: data });
}
