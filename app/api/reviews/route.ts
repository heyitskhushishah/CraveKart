import { NextResponse } from "next/server";

type ReviewBody = {
  product_id?: string;
  author?: string;
  content?: string;
  rating?: number;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ReviewBody;
  const { product_id, author, content, rating } = body;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  if (!product_id || !content) {
    return NextResponse.json({ error: "product_id and content are required." }, { status: 400 });
  }

  // VULN (A01 + A03): anyone can post a review — no auth, no ownership
  // check, and the content is stored verbatim. It is rendered on the
  // product page without escaping (stored XSS).
  const res = await fetch(`${supabaseUrl}/rest/v1/reviews`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      "User-Agent": "foodrush-server/1.0",
    },
    body: JSON.stringify({
      product_id,
      author: author || "Anonymous",
      content,
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    }),
  });

  const data = await res.json().catch(() => null);

  if (res.status !== 201) {
    return NextResponse.json(
      { error: (data as { message?: string })?.message ?? "Could not post review." },
      { status: 400 }
    );
  }

  return NextResponse.json({ review: Array.isArray(data) ? data[0] : data });
}
