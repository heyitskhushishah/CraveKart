"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CreditCard, Receipt } from "lucide-react";

import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { AdminNav } from "@/components/ui/AdminNav";
import type { AdminOrder } from "@/app/api/admin/orders/route";

const statusLabel: Record<string, string> = {
  pending: "Pending",
  on_the_way: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function AdminOrdersPage() {
  const [profile] = useState<{ email?: string; role?: string } | null>(() =>
    JSON.parse(
      typeof window !== "undefined"
        ? (localStorage.getItem("foodrush_user") ?? "null")
        : "null"
    )
  );
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setOrders(d.orders ?? []);
      })
      .catch(() => null)
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const isAdmin = profile?.role === "admin";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-beige-100 to-primary-100" />
      <div className="animate-blob absolute -right-24 top-0 size-96 rounded-full bg-primary-200/50 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-full text-sm font-semibold text-ink-700 transition-colors hover:text-primary-600">
          <ArrowLeft className="size-4" />
          <Logo size="md" />
        </Link>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-6 pb-20">
        {!isAdmin ? (
          <section className="animate-fade-up mx-auto mt-20 max-w-md rounded-3xl border border-beige-200 bg-white p-8 text-center shadow-card">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-beige-100 text-2xl">
              🔒
            </span>
            <h1 className="mt-4 text-xl font-extrabold text-ink-900">Admins only</h1>
            <p className="mt-2 text-sm text-ink-500">
              You must be signed in as an admin to view this page.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/login">
                <Button variant="secondary">Sign in</Button>
              </Link>
            </div>
          </section>
        ) : (
          <>
            <div className="animate-fade-up mt-8">
              <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-ink-900">
                <Receipt className="size-7 text-primary-600" />
                Orders
              </h1>
              <p className="mt-2 text-sm text-ink-500">
                Signed in as <b>{profile?.email}</b> · role {profile?.role}
              </p>
              <AdminNav />
            </div>

            {loading ? (
              <div className="mt-8 h-72 animate-pulse rounded-3xl bg-beige-200/60" />
            ) : (
              <section className="mt-8 rounded-3xl border border-beige-200 bg-white p-6 shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-beige-200 text-xs uppercase tracking-wide text-ink-400">
                        <th className="pb-2 font-semibold">Customer</th>
                        <th className="pb-2 font-semibold">Restaurant</th>
                        <th className="pb-2 font-semibold">Items</th>
                        <th className="pb-2 font-semibold">Total</th>
                        <th className="pb-2 font-semibold">Status</th>
                        <th className="pb-2 font-semibold">Card</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-ink-400">
                            No orders yet.
                          </td>
                        </tr>
                      ) : (
                        orders.map((o) => (
                          <tr key={o.id} className="border-b border-beige-100 last:border-0">
                            <td className="py-3">
                              <p className="font-semibold text-ink-900">
                                {o.customer_name ?? "Guest"}
                              </p>
                              <p className="text-xs text-ink-400">{o.customer_email ?? "—"}</p>
                            </td>
                            <td className="py-3 text-ink-700">{o.restaurant_name}</td>
                            <td className="py-3 text-ink-700">
                              {Array.isArray(o.items) ? o.items.length : 1} item(s)
                            </td>
                            <td className="py-3 font-semibold text-ink-900">₹{Number(o.total).toFixed(2)}</td>
                            <td className="py-3">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  o.status === "delivered"
                                    ? "bg-sage-50 text-sage-600"
                                    : o.status === "on_the_way"
                                      ? "bg-primary-50 text-primary-600"
                                      : "bg-amber-50 text-amber-600"
                                }`}
                              >
                                {statusLabel[o.status] ?? o.status}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-ink-600">
                                <CreditCard className="size-3.5 text-ink-400" />
                                {o.cc_number ?? "—"}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
