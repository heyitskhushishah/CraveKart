"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Receipt } from "lucide-react";

import { Logo } from "@/components/ui/Logo";

type Order = {
  id: string;
  restaurant_name: string;
  total: number;
  status: string;
  created_at: string;
  cc_number: string | null;
};

const statusLabel: Record<string, string> = {
  pending: "Pending",
  on_the_way: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => active && setOrders(d.orders ?? []))
      .catch(() => null)
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-beige-100 to-primary-100" />
      <div className="animate-blob absolute -left-24 top-16 size-96 rounded-full bg-primary-200/50 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/menu" className="focus-ring inline-flex items-center gap-2 rounded-full text-sm font-semibold text-ink-700 transition-colors hover:text-primary-600">
          <ArrowLeft className="size-4" />
          <Logo size="md" />
        </Link>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 px-6 pb-20">
        <h1 className="animate-fade-up mt-8 flex items-center gap-3 text-3xl font-extrabold tracking-tight text-ink-900">
          <Receipt className="size-7 text-primary-600" />
          Your orders
        </h1>
        <p className="mt-2 text-sm text-ink-500">
          Showing every order on record — no login required. 🔓
        </p>

        {loading ? (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-3xl bg-beige-200/60" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-5xl">📭</p>
            <p className="mt-4 text-lg font-semibold text-ink-700">No orders yet</p>
            <Link href="/menu" className="mt-4 inline-block text-sm font-semibold text-primary-600">
              Order something delicious
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((o) => (
              <Link key={o.id} href={`/orders/${o.id}`} className="block">
                <article className="flex items-center gap-4 rounded-3xl border border-beige-200 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-pop">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-beige-100 text-xl">
                    🧾
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink-900">{o.restaurant_name}</p>
                    <p className="text-sm text-ink-500">
                      {new Date(o.created_at).toLocaleString()} · {o.id.slice(0, 8)}…
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-ink-700">
                    {statusLabel[o.status] ?? o.status}
                  </span>
                  <span className="text-lg font-extrabold text-ink-900">
                    ₹{Number(o.total).toFixed(2)}
                  </span>
                </article>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
