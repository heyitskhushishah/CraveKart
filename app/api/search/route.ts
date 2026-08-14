import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// VULN (A03 — SQL injection): the raw search term is passed unmodified to the
// `search_items` Postgres RPC, which builds its query with string concatenation:
//
//     execute 'select * from public.menu_items where name ilike ''%' || query || '%'''
//
// (see supabase/migrations/20260814000004_search_items.sql). There is no
// escaping, no format()/%L, no parameterization. A term like
//   x' or 1=1--
// is injected verbatim and returns every row.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, anonKey);

  const { data, error } = await supabase.rpc("search_items", { query });

  if (error) {
    return NextResponse.json(
      { items: [], error: error.message ?? "Search failed." },
      { status: 200 }
    );
  }

  return NextResponse.json({ items: Array.isArray(data) ? data : [] });
}
