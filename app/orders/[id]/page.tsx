"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, CreditCard } from "lucide-react";

import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

type CartLine = { id?: string; name?: string; price?: number; qty?: number };
type Order = {
  id: string;
  restaurant_name: string;
  items: CartLine[];
  total: number;
  status: string;
  cc_number: string | null;
  created_at: string;
};

const statusLabel: Record<string, string> = {
  pending: "Pending",
  on_the_way: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`/api/orders/${params.id}`)
      .then((r) => r.json())
      .then((d) => active && setOrder(d.order ?? null))
      .catch(() => null)
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [params.id]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-beige-100 to-primary-100" />
      <div className="animate-blob absolute -right-24 top-16 size-96 rounded-full bg-primary-200/50 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/orders" className="focus-ring inline-flex items-center gap-2 rounded-full text-sm font-semibold text-ink-700 transition-colors hover:text-primary-600">
          <ArrowLeft className="size-4" />
          <Logo size="md" />
        </Link>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-2xl flex-1 px-6 pb-20">
        {loading ? (
          <div className="mt-10 h-80 animate-pulse rounded-3xl bg-beige-200/60" />
        ) : !order ? (
          <div className="mt-24 text-center">
            <p className="text-5xl">🤷</p>
            <p className="mt-4 text-lg font-semibold text-ink-700">Order not found</p>
            <Link href="/orders" className="mt-4 inline-block text-sm font-semibold text-primary-600">
              Back to orders
            </Link>
          </div>
        ) : (
          <>
            <section className="animate-fade-up mt-8 rounded-3xl border border-beige-200 bg-white p-7 shadow-card">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-600">
                  <CheckCircle2 className="size-4" />
                  {statusLabel[order.status] ?? order.status}
                </span>
                <span className="text-sm text-ink-400">{order.id.slice(0, 13)}…</span>
              </div>
              <h1 className="mt-4 text-2xl font-extrabold text-ink-900">
                {order.restaurant_name}
              </h1>
              <p className="mt-1 text-sm text-ink-500">
                {new Date(order.created_at).toLocaleString()}
              </p>

              <ul className="mt-6 divide-y divide-beige-100 border-y border-beige-100">
                {(order.items ?? []).map((line, i) => (
                  <li key={i} className="flex items-center justify-between py-3 text-sm">
                    <span className="text-ink-700">
                      {line.name ?? "Item"} × {line.qty ?? 1}
                    </span>
                    <span className="font-semibold text-ink-900">
                      ₹{((line.price ?? 0) * (line.qty ?? 1)).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex justify-between text-lg font-extrabold text-ink-900">
                <span>Total</span>
                <span>₹{Number(order.total).toFixed(2)}</span>
              </div>
            </section>

            <section className="mt-5 flex items-center justify-between rounded-3xl border border-beige-200 bg-white p-5 shadow-card">
              <span className="flex items-center gap-3 text-sm font-semibold text-ink-700">
                <CreditCard className="size-5 text-primary-600" />
                Card on file
              </span>
              <span className="font-mono text-lg font-extrabold tracking-widest text-ink-900">
                {order.cc_number ?? "—"}
              </span>
            </section>

            <p className="mt-3 text-center text-xs text-ink-400">
              That card number? Stored in plaintext (A02) and readable by anyone
              who knows the order id (IDOR / A01).
            </p>

            <div className="mt-6 text-center">
              <Link href="/menu">
                <Button>Order again</Button>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
