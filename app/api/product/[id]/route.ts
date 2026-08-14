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

  // VULN (A01): RLS is off and the anon key can read everything, so the
  // full item row — including any data we should never have exposed — is
  // served. Reviews are returned raw and rendered unsanitized on the page
  // (stored XSS, A03).
  const itemRes = await fetch(
    `${supabaseUrl}/rest/v1/menu_items?id=eq.${encodeURIComponent(id)}&select=*`,
    { headers }
  );
  const reviewsRes = await fetch(
    `${supabaseUrl}/rest/v1/reviews?product_id=eq.${encodeURIComponent(id)}&select=*&order=created_at`,
    { headers }
  );
  const restaurantsRes = await fetch(`${supabaseUrl}/rest/v1/restaurants?select=*`, {
    headers,
  });

  const [itemRows, reviews, restaurants] = await Promise.all([
    itemRes.json().catch(() => []),
    reviewsRes.json().catch(() => []),
    restaurantsRes.json().catch(() => []),
  ]);

  const item = Array.isArray(itemRows) ? itemRows[0] : null;

  return NextResponse.json({
    item,
    reviews: Array.isArray(reviews) ? reviews : [],
    restaurants: Array.isArray(restaurants) ? restaurants : [],
  });
}
