import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Supabase is not configured. Add your keys to .env.local." },
      { status: 500 }
    );
  }

  // Server-only client built with the service-role key (bypasses RLS).
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const body = await request.json().catch(() => ({}));
  const { name, email, password, role } = body as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  // NOTE: role is trusted straight from the client — privilege escalation surface.
  const safeName = String(name);
  const safeEmail = String(email).toLowerCase();
  const safePassword = String(password);
  const requestedRole = String(role ?? "customer");

  // Password policy is deliberately lax — anything non-empty is accepted.
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: safeEmail,
    password: safePassword,
    email_confirm: true,
    user_metadata: { name: safeName },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { error: profileError } = await supabaseAdmin
    .from("users")
    .insert({ id: data.user.id, name: safeName, email: safeEmail, role: requestedRole });

  if (profileError) {
    return NextResponse.json(
      {
        error: "Account created but profile failed.",
        detail: profileError.message,
        hint:
          "If the users table does not exist, run supabase/setup.sql in the Supabase SQL Editor first.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, user: { id: data.user.id, email: safeEmail, role: requestedRole } });
}
