import { NextResponse } from "next/server";

// VULN (A01 — CSRF): a state-changing action performed over GET, with no
// CSRF token and no Origin/Referer check. An attacker page can trigger it
// with a single <img src="/api/profile?current=...&email=..."> — the browser
// will happily send the request with the victim's session cookies.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const current = (searchParams.get("current") ?? "").trim().toLowerCase();
  const email = (searchParams.get("email") ?? "").trim().toLowerCase();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  if (!current || !email) {
    return NextResponse.json({ error: "?current= and ?email= are required." }, { status: 400 });
  }

  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
    "User-Agent": "foodrush-server/1.0",
  };

  const res = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(current)}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ email }),
  });

  const data = await res.json().catch(() => null);

  if (res.status !== 200) {
    return NextResponse.json({ error: "Could not change email." }, { status: 400 });
  }

  const updated = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({ ok: true, updated });
}
