"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, PackageSearch } from "lucide-react";

import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export default function TrackPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ target: string; status?: number; body?: string; error?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function lookUp() {
    setLoading(true);
    try {
      const r = await fetch(`/api/track?url=${encodeURIComponent(input)}`);
      const d = await r.json();
      setResult(d);
    } catch {
      setResult({ target: input, error: "Request failed." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-beige-100 to-primary-100" />
      <div className="animate-blob absolute -right-24 top-16 size-96 rounded-full bg-primary-200/50 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-full text-sm font-semibold text-ink-700 transition-colors hover:text-primary-600">
          <ArrowLeft className="size-4" />
          <Logo size="md" />
        </Link>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-2xl flex-1 px-6 pb-20">
        <h1 className="animate-fade-up mt-8 flex items-center gap-3 text-3xl font-extrabold tracking-tight text-ink-900">
          <PackageSearch className="size-7 text-primary-600" />
          Track your order
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Paste your tracking URL and our courier gateway will look it up for you.
        </p>

        <div className="mt-6 rounded-3xl border border-beige-200 bg-white p-6 shadow-card">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookUp()}
            placeholder="https://track.cravekart.app/ABC123"
            className="focus-ring h-12 w-full rounded-full border border-beige-200 bg-cream px-5 text-sm text-ink-900 placeholder:text-ink-400"
          />
          <Button className="mt-4 w-full" loading={loading} onClick={lookUp}>
            Track now
          </Button>
        </div>

        {result && (
          <pre className="mt-5 max-h-80 overflow-auto rounded-3xl border border-beige-200 bg-ink-900 p-5 text-xs leading-relaxed text-cream shadow-card">
{JSON.stringify(result, null, 2)}
          </pre>
        )}
      </main>
    </div>
  );
}
