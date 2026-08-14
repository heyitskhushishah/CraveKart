import { NextResponse } from "next/server";

type Params = Promise<{ id: string }>;

export async function GET(_request: Request, { params }: { params: Params }) {
  const { id } = await params;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    "User-Agent": "foodrush-server/1.0",
  };

  // VULN (A01 IDOR): the order is fetched purely by id — no check that the
  // caller owns it, and no authentication at all. RLS is off, so the anon
  // key can read every order, including the plaintext card number (A02).
  const res = await fetch(
    `${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(id)}&select=*`,
    { headers }
  );
  const rows = await res.json().catch(() => []);

  return NextResponse.json({ order: Array.isArray(rows) ? rows[0] ?? null : null });
}
