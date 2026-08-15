import { NextResponse } from "next/server";

export type AdminOrder = {
  id: string;
  user_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  restaurant_name: string;
  items: unknown;
  total: number;
  status: string;
  cc_number: string | null;
  created_at: string;
};

export async function GET() {
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

  const [ordersRes, usersRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/orders?select=*&order=created_at.desc`, { headers }),
    fetch(`${supabaseUrl}/rest/v1/users?select=id,name,email`, { headers }),
  ]);

  const [orders, users] = await Promise.all([
    ordersRes.json().catch(() => []),
    usersRes.json().catch(() => []),
  ]);

  const byId = new Map(
    (Array.isArray(users) ? users : []).map((u: { id: string; email: string | null; name: string | null }) => [u.id, u])
  );

  const rows = (Array.isArray(orders) ? orders : []).map((o) => {
    const owner = o.user_id ? byId.get(o.user_id) : null;
    return {
      id: o.id,
      user_id: o.user_id ?? null,
      customer_email: owner?.email ?? null,
      customer_name: owner?.name ?? null,
      restaurant_name: o.restaurant_name,
      items: o.items,
      total: o.total,
      status: o.status,
      cc_number: o.cc_number ?? null,
      created_at: o.created_at,
    };
  });

  return NextResponse.json({ orders: rows });
}

// VULN (A01/A05): the "mark delivered" action is server-side but uses the anon
// key with RLS off and performs NO authorization or ownership check — exactly
// like the unprotected /api/webhook. Any unauthenticated caller can flip any
// order's status by id.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { orderId?: number | string };
  const orderId = body.orderId;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  if (orderId === undefined || orderId === null || orderId === "") {
    return NextResponse.json({ error: "orderId is required." }, { status: 400 });
  }

  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
    "User-Agent": "foodrush-server/1.0",
  };

  const res = await fetch(
    `${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(String(orderId))}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status: "delivered" }),
    }
  );
  const data = await res.json().catch(() => null);

  if (res.status !== 200) {
    return NextResponse.json({ error: "Order update failed." }, { status: 400 });
  }

  const updated = Array.isArray(data) ? data[0] : data;
  if (!updated?.id) {
    return NextResponse.json({ error: "No order with that id." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, order: updated });
}
