import { NextResponse } from "next/server";

type CartItem = { id?: string; name?: string; price?: number; qty?: number };
type CheckoutBody = {
  items?: CartItem[];
  card?: { number?: string; expiry?: string; cvv?: string; name?: string };
  email?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CheckoutBody;
  const { items = [], card = {}, email } = body;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  if (items.length === 0 || !card.number) {
    return NextResponse.json({ error: "Cart and card number are required." }, { status: 400 });
  }

  // VULN (A02): the full card number is stored in plaintext in the orders
  // table. RLS is off, so anyone with the anon key can later read it via
  // the REST API.
  const total = items.reduce((sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 0), 0);

  // VULN (business logic): the total is trusted from the client. A crafted
  // request can set prices/qty to anything (e.g. 0.01) and checkout anyway.
  const order = {
    user_id: email ? null : null,
    restaurant_name: "Order Summary",
    items,
    total,
    status: "pending",
    cc_number: String(card.number),
  };

  const res = await fetch(`${supabaseUrl}/rest/v1/orders`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      "User-Agent": "foodrush-server/1.0",
    },
    body: JSON.stringify(order),
  });

  const data = await res.json().catch(() => null);

  if (res.status !== 201) {
    return NextResponse.json(
      { error: (data as { message?: string })?.message ?? "Checkout failed." },
      { status: 400 }
    );
  }

  const created = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({ order: created });
}
