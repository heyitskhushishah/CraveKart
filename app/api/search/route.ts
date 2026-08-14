import { NextResponse } from "next/server";

// VULN (A03): the raw search term is forwarded straight into the
// `search_menu` Postgres function, which builds SQL via string
// concatenation (see supabase/migrations/20260814000001_...). PostgREST
// RPC passes the JSON value through unmodified, so a term like
//   x' or 1=1--
// is injected verbatim into the query. No escaping, no parameterization.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/search_menu`, {
    method: "POST",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      "User-Agent": "foodrush-server/1.0",
    },
    body: JSON.stringify({ search_term: q }),
  });

  const data = await res.json().catch(() => null);

  if (res.status !== 200) {
    return NextResponse.json(
      { items: [], error: (data as { message?: string })?.message ?? "Search failed." },
      { status: 200 }
    );
  }

  return NextResponse.json({ items: Array.isArray(data) ? data : [] });
}
