"use client";

import { useState } from "react";
import { Mail, ShieldCheck, UserRound } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { AdminNav } from "@/components/ui/AdminNav";
import { useCurrentUser, useIsAdmin } from "@/lib/auth";

function initials(name: string | null | undefined): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "U";
}

export default function ProfilePage() {
  const profile = useCurrentUser();
  const isAdmin = useIsAdmin();

  const [current, setCurrent] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<{ ok?: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function changeEmail() {
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch(`/api/profile?current=${encodeURIComponent(current)}&email=${encodeURIComponent(email)}`);
      const d = await r.json();
      setResult(r.ok ? { ok: true, message: "Email updated!" } : { message: d.error ?? "Failed." });
    } catch {
      setResult({ message: "Network error." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell backHref="/" backLabel="Go home" maxWidth="max-w-2xl">
      <PageHeader
        icon={UserRound}
        title="Your profile"
        subtitle="Manage your account details and preferences."
      />

      {isAdmin && <AdminNav />}

      <section className="card card-pad mt-8">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-xl font-bold text-white shadow-glow">
            {initials(profile?.name ?? profile?.email)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xl font-extrabold tracking-tight text-ink-900">
              {profile?.name ?? "Signed out"}
            </p>
            <p className="truncate text-sm text-ink-500">{profile?.email ?? "—"}</p>
          </div>
          <Badge tone={isAdmin ? "brand" : "neutral"} dot>
            {profile?.role ?? "guest"}
          </Badge>
        </div>
        {profile?.id && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-cream px-4 py-2.5">
            <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-ink-400">
              User ID
            </span>
            <code className="min-w-0 flex-1 truncate font-mono text-xs text-ink-700">
              {profile.id}
            </code>
          </div>
        )}
      </section>

      <section className="card card-pad mt-5">
        <h2 className="flex items-center gap-2 font-bold text-ink-900">
          <Mail className="size-5 text-primary-600" />
          Change email
        </h2>
        <div className="mt-4 space-y-3">
          <Field label="Current email" htmlFor="current">
            <Input
              id="current"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="you@example.com"
              icon={<Mail className="size-[18px]" />}
            />
          </Field>
          <Field label="New email" htmlFor="email">
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="new@example.com"
              icon={<ShieldCheck className="size-[18px]" />}
            />
          </Field>
        </div>
        <Button className="mt-5 w-full" size="lg" loading={loading} onClick={changeEmail}>
          Save changes
        </Button>
        {result && (
          <p
            className={`mt-3 text-center text-sm font-medium ${result.ok ? "text-sage-500" : "text-coral-500"}`}
            role="status"
          >
            {result.message}
          </p>
        )}
      </section>
    </PageShell>
  );
}
