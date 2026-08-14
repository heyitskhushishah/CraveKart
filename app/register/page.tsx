"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Mail, ShieldAlert, User } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";

function passwordScore(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const scoreLabels = ["Very weak", "Weak", "Okay", "Good", "Strong"];
const scoreColors = ["bg-coral-500", "bg-coral-400", "bg-amber-400", "bg-primary-500", "bg-sage-500"];

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [role, setRole] = useState("customer");
  const [agree, setAgree] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const score = useMemo(() => passwordScore(password), [password]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!agree) {
      setError("Please accept the Terms of Service.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const full = [
        data.error,
        data.detail,
        data.hint,
      ]
        .filter(Boolean)
        .join(" ");
      setError(full || "Something went wrong. Please try again.");
      setLoading(false);
      return;
    }

    // Auto sign-in after a successful registration.
    const supabase = createClient();
    await supabase.auth.signInWithPassword({ email, password });

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.trim().toLowerCase())
      .single();

    if (profile) {
      localStorage.setItem("foodrush_user", JSON.stringify(profile));
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle={
        <>
          Join FoodRush and get the best food in town, delivered in minutes.
        </>
      }
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary-600 transition-colors hover:text-primary-700"
          >
            Sign in
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

        <Field label="Full name" htmlFor="name">
          <Input
            id="name"
            name="name"
            autoComplete="name"
            placeholder="Jane Doe"
            icon={<User className="size-[18px]" />}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

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

        <Field label="Password" htmlFor="password" hint="Tip: use at least 8 characters for a stronger password.">
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="mt-2 flex items-center gap-2">
            <div className="flex h-1.5 flex-1 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-full flex-1 rounded-full transition-colors ${
                    password && i < score ? scoreColors[score] : "bg-beige-200"
                  }`}
                />
              ))}
            </div>
            {password && (
              <span className="w-20 text-right text-[11.5px] font-medium text-ink-500">
                {scoreLabels[score]}
              </span>
            )}
          </div>
        </Field>

        <Field label="Confirm password" htmlFor="confirm">
          <PasswordInput
            id="confirm"
            name="confirm"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>

        <Field label="Account type" htmlFor="role">
          <div className="relative">
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="focus-ring h-11 w-full appearance-none rounded-xl border border-beige-200 bg-white/80 px-4 pr-10 text-[15px] text-ink-900 transition-colors hover:border-beige-300 focus:border-primary-400"
            >
              <option value="customer">Customer (standard)</option>
              <option value="admin">Admin (owner)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" />
          </div>
          <p className="flex items-center gap-1.5 pt-1 text-[12px] text-ink-400">
            <ShieldAlert className="size-3.5" />
            Demo environment — all roles are available to select.
          </p>
        </Field>

        <label className="flex cursor-pointer select-none items-start gap-2.5 text-sm text-ink-500">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 size-4 cursor-pointer accent-primary-600"
          />
          <span>
            I agree to the{" "}
            <span className="font-semibold text-primary-600">Terms of Service</span> and{" "}
            <span className="font-semibold text-primary-600">Privacy Policy</span>.
          </span>
        </label>

        <Button type="submit" size="lg" loading={loading} className="w-full">
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
