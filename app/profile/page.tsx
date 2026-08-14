"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, UserRound } from "lucide-react";

import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";

export default function ProfilePage() {
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
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-beige-100 to-primary-100" />
      <div className="animate-blob absolute -left-24 top-16 size-96 rounded-full bg-primary-200/50 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-full text-sm font-semibold text-ink-700 transition-colors hover:text-primary-600">
          <ArrowLeft className="size-4" />
          <Logo size="md" />
        </Link>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-md flex-1 px-6 pb-20">
        <h1 className="animate-fade-up mt-8 flex items-center gap-3 text-3xl font-extrabold tracking-tight text-ink-900">
          <UserRound className="size-7 text-primary-600" />
          Your profile
        </h1>

        <section className="mt-8 rounded-3xl border border-beige-200 bg-white p-6 shadow-card">
          <h2 className="font-bold text-ink-900">Change email</h2>
          <div className="mt-4 space-y-3">
            <Field label="Current email" htmlFor="current">
              <Input
                id="current"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="you@example.com"
              />
            </Field>
            <Field label="New email" htmlFor="email">
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="new@example.com"
              />
            </Field>
          </div>
          <Button className="mt-5 w-full" loading={loading} onClick={changeEmail}>
            Save changes
          </Button>
          {result && (
            <p className={`mt-3 text-sm font-medium ${result.ok ? "text-sage-500" : "text-coral-500"}`}>
              {result.message}
            </p>
          )}
          <p className="mt-4 text-xs text-ink-400">
            Demo hint: this change happens over a plain GET with no CSRF token —
            an attacker page can change your email with just{" "}
            <code>{`<img src="/api/profile?current=…&email=…">`}</code>
          </p>
        </section>
      </main>
    </div>
  );
}
