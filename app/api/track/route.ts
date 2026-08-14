import { NextResponse } from "next/server";

// VULN (A10 — SSRF): the server fetches whatever URL the caller supplies.
// A tracking "code" is expected, but there is no validation at all, so the
// server can be pointed at internal services:
//   /api/track?url=http://localhost:3000/api/admin/users
//   /api/track?url=http://169.254.169.254/latest/meta-data/   (cloud metadata)
//   /api/track?url=file:///etc/passwd
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = (searchParams.get("url") ?? "").trim();
  const code = (searchParams.get("code") ?? "").trim();

  if (!url && !code) {
    return NextResponse.json({ error: "Provide ?url= or ?code=" }, { status: 400 });
  }

  const target = url || `https://track.foodrush.app/track/${encodeURIComponent(code)}`;

  try {
    const res = await fetch(target, { redirect: "follow", headers: { "User-Agent": "foodrush-server/1.0" } });
    const text = await res.text();
    return NextResponse.json({ target, status: res.status, body: text.slice(0, 4000) });
  } catch (err) {
    return NextResponse.json(
      { target, error: err instanceof Error ? err.message : "Fetch failed" },
      { status: 502 }
    );
  }
}
