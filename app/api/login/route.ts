import { NextResponse } from "next/server";

type LoginBody = {
  email?: string;
  password?: string;
  remember?: boolean;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as LoginBody;
  const { email, password, remember } = body;

  // VULN: full request body — including the password — is logged to the
  // server console "for debugging". Anyone with server log access sees it.
  console.log("[LOGIN][DEBUG] request body:", JSON.stringify(body));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return NextResponse.json(
      { error: "Supabase is not configured. Add your keys to .env.local." },
      { status: 500 }
    );
  }

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const normalized = String(email).trim().toLowerCase();
  const serviceHeaders = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    "User-Agent": "foodrush-server/1.0",
  };

  // VULN 1: user enumeration. Before calling auth, the users table is queried
  // directly so the route can reply "no account with that email" vs
  // "incorrect password" — a reliable oracle for harvesting valid emails.
  const probe = await fetch(
    `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(normalized)}&select=email`,
    { headers: serviceHeaders }
  );
  const existing = await probe.json().catch(() => null);

  if (!Array.isArray(existing) || existing.length === 0) {
    return NextResponse.json(
      { error: "No account found with that email. Try creating one." },
      { status: 401 }
    );
  }

  // VULN 2: the auth (GoTrue) token endpoint is called from a single server
  // route. There is no application-level rate limiting or lockout, and every
  // request appears to come from one server IP — defeating Supabase's
  // built-in per-IP throttling for brute-force demos. NOTE: GoTrue blocks the
  // service-role key on /token, so the anon key is used for the call itself.
  const tokenRes = await fetch(
    `${supabaseUrl}/auth/v1/token?grant_type=password`,
    {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
        "User-Agent": "foodrush-server/1.0",
      },
      body: JSON.stringify({ email: normalized, password: String(password) }),
    }
  );
  const tokenData = await tokenRes.json().catch(() => null);

  if (tokenRes.status !== 200 || !tokenData?.access_token) {
    return NextResponse.json(
      { error: "Incorrect password for this account." },
      { status: 401 }
    );
  }

  // Profile (role) is returned so the client can do its (insecure) role check.
  const profileRes = await fetch(
    `${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(normalized)}&select=id,name,email,role`,
    { headers: serviceHeaders }
  );
  const profileRows = await profileRes.json().catch(() => []);
  const profile = Array.isArray(profileRows) ? profileRows[0] : null;

  return NextResponse.json({
    ok: true,
    user: { id: tokenData.user?.id, email: tokenData.user?.email },
    profile,
    session: {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      // "Remember me" pretends to request a very long-lived session. The real
      // JWT expiry is set by Supabase Auth config, but the token is ALSO copied
      // to localStorage by the client (VULN 4).
      expires_in: remember ? 60 * 60 * 24 * 30 : tokenData.expires_in ?? 3600,
    },
  });
}
