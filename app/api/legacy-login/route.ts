import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

// Guest-checkout login backed by the legacy_accounts table, which stores
// plain MD5 hashes instead of Supabase Auth (VULN — A02). No session is
// issued; it only demonstrates the weak-storage authentication path.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Guest email and password are required." }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  // The table (and its MD5 hashes) is publicly readable — RLS is off.
  const res = await fetch(
    `${supabaseUrl}/rest/v1/legacy_accounts?guest_email=eq.${encodeURIComponent(String(email).trim().toLowerCase())}&select=guest_email,password_hash`,
    {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}`, "User-Agent": "foodrush-server/1.0" },
    }
  );
  const rows = await res.json().catch(() => []);
  const row = Array.isArray(rows) ? rows[0] : null;

  if (!row) {
    return NextResponse.json({ error: "No guest account with that email." }, { status: 401 });
  }

  // MD5 password comparison (VULN — never do this in a real app).
  const hash = createHash("md5").update(String(password)).digest("hex");

  if (hash !== row.password_hash) {
    return NextResponse.json({ error: "Incorrect guest password." }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    guest: row.guest_email,
    note: "Legacy guest identity verified (MD5). No real session was issued.",
  });
}
