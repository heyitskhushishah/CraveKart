"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, UserRound } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { AUTH_EVENT } from "@/lib/cart";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [guestEmail, setGuestEmail] = useState("guest1@cravekart.app");
  const [guestPassword, setGuestPassword] = useState("");
  const [guestError, setGuestError] = useState<string | null>(null);
  const [guestOk, setGuestOk] = useState<string | null>(null);
  const [guestLoading, setGuestLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    // Login is routed through a custom API route (VULN 2) so the auth endpoint
    // is hit server-side with the service-role key — no app-level rate limiting.
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, remember }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setError(data.error ?? "Login failed. Please try again.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // VULN 4: "Remember me" stores the raw access token in localStorage
    // (readable via localStorage.getItem("foodrush_access_token") or XSS)
    // instead of an httpOnly cookie.
    if (data.session?.access_token) {
      if (remember) {
        localStorage.setItem("foodrush_access_token", data.session.access_token);
      }
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }

    // Keep the real auth user id alongside the profile (the profile id is a
    // fixed seed value for demo users, so the auth id is the accurate one).
    if (data.user?.id) {
      localStorage.setItem("foodrush_auth_id", data.user.id);
    }

    // Profile (incl. role) is trusted from the client — stored in localStorage.
    const profile =
      data.profile ??
      (
        await supabase
          .from("users")
          .select("*")
          .eq("email", email.trim().toLowerCase())
          .single()
      ).data;

    if (profile) {
      localStorage.setItem("foodrush_user", JSON.stringify(profile));
    }

    // Notify open pages (menu/cart headers) that the signed-in user changed,
    // so they switch to this user's saved cart.
    window.dispatchEvent(new Event("foodrush:auth-changed"));

    const role = profile?.role as string | undefined;
    const requested = searchParams.get("next");
    const next =
      requested ??
      (role === "admin" ? "/admin" : "/menu");
    router.replace(next);
    router.refresh();
  }

  async function handleForgot() {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError("Enter your email address first, then click Forgot password.");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
    if (error) {
      setError(error.message);
      return;
    }
    setInfo("If that account exists, a password reset link is on its way.");
  }

  async function handleGuest(e: React.FormEvent) {
    e.preventDefault();
    setGuestError(null);
    setGuestOk(null);
    if (!guestEmail.trim() || !guestPassword) {
      setGuestError("Enter the guest email and password.");
      return;
    }
    setGuestLoading(true);
    try {
      const res = await fetch("/api/legacy-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: guestEmail, password: guestPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGuestError(data.error ?? "Guest sign-in failed.");
        return;
      }
      // The legacy route only verifies the MD5 hash — no session is issued.
      // A local guest profile stands in so the browse/checkout flow works.
      localStorage.setItem(
        "foodrush_user",
        JSON.stringify({ email: data.guest, name: "Guest", role: "customer" })
      );
      localStorage.removeItem("foodrush_access_token");
      localStorage.removeItem("foodrush_auth_id");
      window.dispatchEvent(new Event(AUTH_EVENT));
      setGuestOk(`Verified ${data.guest} — taking you to the menu.`);
      router.replace("/menu");
      router.refresh();
    } catch {
      setGuestError("Guest sign-in failed.");
    } finally {
      setGuestLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle={
        <>
          Sign in to pick up where you left off — your cravings are waiting.
        </>
      }
      footer={
        <>
          New to CraveKart?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary-600 transition-colors hover:text-primary-700"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="animate-fade-in rounded-xl border border-coral-500/25 bg-coral-500/10 px-4 py-3 text-sm font-medium text-coral-500">
            {error}
          </div>
        )}

        {info && (
          <div className="animate-fade-in rounded-xl border border-sage-500/25 bg-sage-500/10 px-4 py-3 text-sm font-medium text-sage-600">
            {info}
          </div>
        )}

        <Field label="Email address" htmlFor="email">
          <Input
            id="email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            icon={<Mail className="size-[18px]" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer select-none items-center gap-2 text-ink-500">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="size-4 cursor-pointer accent-primary-600"
            />
            Keep me signed in
          </label>
          <button
            type="button"
            onClick={handleForgot}
            className="font-semibold text-primary-600 transition-colors hover:text-primary-700"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          Sign in
        </Button>
      </form>

        <div className="mt-6 rounded-2xl border border-dashed border-beige-300 bg-beige-100/50 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-ink-800">
            <UserRound className="size-4 text-primary-600" />
            Legacy guest checkout
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-500">
            MD5-backed guest accounts power the guest login flow — try{" "}
            <code className="rounded bg-cream px-1 py-0.5 font-mono text-[11px] text-ink-700">
              guest1@cravekart.app
            </code>{" "}
            /{" "}
            <code className="rounded bg-cream px-1 py-0.5 font-mono text-[11px] text-ink-700">
              guestpass1
            </code>
            . No real session is issued.
          </p>
          <form onSubmit={handleGuest} className="mt-3 space-y-3">
            <Field label="Guest email" htmlFor="guestEmail">
              <Input
                id="guestEmail"
                type="email"
                name="guestEmail"
                autoComplete="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="guest1@cravekart.app"
                icon={<Mail className="size-[18px]" />}
              />
            </Field>
            <Field label="Guest password" htmlFor="guestPassword">
              <PasswordInput
                id="guestPassword"
                name="guestPassword"
                autoComplete="current-password"
                value={guestPassword}
                onChange={(e) => setGuestPassword(e.target.value)}
                placeholder="guestpass1"
              />
            </Field>
            {guestError && (
              <p
                className="rounded-xl border border-coral-500/25 bg-coral-500/10 px-4 py-2.5 text-sm font-medium text-coral-500"
                role="alert"
              >
                {guestError}
              </p>
            )}
            {guestOk && (
              <p className="rounded-xl border border-sage-500/25 bg-sage-500/10 px-4 py-2.5 text-sm font-medium text-sage-600">
                {guestOk}
              </p>
            )}
            <Button type="submit" variant="dark" className="w-full" loading={guestLoading}>
              Continue as guest
            </Button>
          </form>
        </div>
    </AuthShell>
  );
}
