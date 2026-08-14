import { NextResponse } from "next/server";

// VULN (A01): this endpoint has NO authorization check at all — it dumps
// every user row (emails, roles, legacy password hashes) to anyone who asks.
// The admin panel relies purely on a client-side role check.
export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const [usersRes, couponsRes, ordersRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/users?select=*`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "User-Agent": "foodrush-server/1.0",
      },
    }),
    fetch(`${supabaseUrl}/rest/v1/coupons?select=*`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "User-Agent": "foodrush-server/1.0",
      },
    }),
    fetch(`${supabaseUrl}/rest/v1/orders?select=id,user_id,total,status`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "User-Agent": "foodrush-server/1.0",
      },
    }),
  ]);

  const [users, coupons, orders] = await Promise.all([
    usersRes.json().catch(() => []),
    couponsRes.json().catch(() => []),
    ordersRes.json().catch(() => []),
  ]);

  return NextResponse.json({
    users: Array.isArray(users) ? users : [],
    coupons: Array.isArray(coupons) ? coupons : [],
    orders: Array.isArray(orders) ? orders : [],
  });
}
