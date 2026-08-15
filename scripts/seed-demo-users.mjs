// Recreates the demo auth users via the Supabase Admin API so their rows are
// guaranteed-valid (raw SQL inserts into auth.users can leave GoTrue unable to
// authenticate them). Requires .env.local (run with node --env-file=.env.local).
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const demoUsers = [
  { email: "admin@cravekart.app", password: "admin123", name: "Ava Admin" },
  { email: "priya@cravekart.app", password: "priya123", name: "Priya Sharma" },
  { email: "alex@cravekart.app", password: "alex123", name: "Alex Rivera" },
];

const { data: listed } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

for (const u of listed.users) {
  if (u.email?.endsWith("@foodrush.app")) {
    await supabase.auth.admin.deleteUser(u.id);
  }
}

for (const u of demoUsers) {
  const existing = listed.users.find((x) => x.email === u.email);
  if (existing) {
    await supabase.auth.admin.deleteUser(existing.id);
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { name: u.name },
  });
  if (error) {
    console.error("FAIL", u.email, error.message);
  } else {
    console.log("OK", u.email, data.user?.id ?? "(no id returned)");
  }
}
