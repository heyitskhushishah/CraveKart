import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = (searchParams.get("code") ?? "").trim();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  // VULN (A03): `code` is passed raw into the redeem_coupon function, which
  // builds SQL by string concatenation — same injection surface as search.
  // PostgREST RPC passes the JSON value verbatim, so e.g.
  //   x' OR '1'='1
  // returns the discount from the first coupon row.
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/redeem_coupon`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      "User-Agent": "foodrush-server/1.0",
    },
    body: JSON.stringify({ code }),
  });

  const discount = await res.json().catch(() => 0);
  return NextResponse.json({ code, discount: Number(discount) || 0 });
}
