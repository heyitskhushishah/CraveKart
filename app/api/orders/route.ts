import { NextResponse } from "next/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  // VULN (A01): no authentication, no per-user filter — the full order
  // history of every customer (plus their stored card numbers) is listed.
  const res = await fetch(`${supabaseUrl}/rest/v1/orders?select=*&order=created_at.desc`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "User-Agent": "foodrush-server/1.0",
    },
  });
  const data = await res.json().catch(() => []);

  return NextResponse.json({ orders: Array.isArray(data) ? data : [] });
}
