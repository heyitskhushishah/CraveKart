import { NextResponse } from "next/server";

type WebhookBody = {
  order_id?: string;
  status?: string;
  coupon_code?: string;
  max_uses?: number;
};

// VULN (A01 + A05): this "payment/webhook" endpoint is supposed to be called
// by the (trusted) payment provider, but it does NOT verify any signature or
// shared secret. Anyone who discovers the URL can:
//   POST /api/webhook  { "order_id": "<id>", "status": "delivered" }
//   POST /api/webhook  { "coupon_code": "HACKME99", "max_uses": 999999 }
// (The expected secret is also trivially findable — the team committed it to
// the client bundle config as "sk_live_webhook_foodrush_2024_001".)
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as WebhookBody;
  const { order_id, status, coupon_code, max_uses } = body;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
    "User-Agent": "foodrush-server/1.0",
  };

  if (order_id && status) {
    const res = await fetch(`${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(order_id)}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });
    const data = await res.json().catch(() => null);
    if (res.status !== 200) {
      return NextResponse.json({ error: "Order update failed." }, { status: 400 });
    }
    return NextResponse.json({ ok: true, updated: Array.isArray(data) ? data : data });
  }

  if (coupon_code && max_uses !== undefined) {
    const res = await fetch(`${supabaseUrl}/rest/v1/coupons?code=eq.${encodeURIComponent(coupon_code)}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ max_uses }),
    });
    const data = await res.json().catch(() => null);
    if (res.status !== 200) {
      return NextResponse.json({ error: "Coupon update failed." }, { status: 400 });
    }
    return NextResponse.json({ ok: true, updated: Array.isArray(data) ? data : data });
  }

  return NextResponse.json({ error: "Send order_id+status or coupon_code+max_uses." }, { status: 400 });
}
