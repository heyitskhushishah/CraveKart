"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  IndianRupee,
  Receipt,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { AdminNav } from "@/components/ui/AdminNav";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  password_md5: string | null;
};
type Coupon = { id: string; code: string; discount: number; uses: number; max_uses: number };
type OrderRow = { id: string; user_id: string | null; total: number; status: string };

export default function AdminPage() {
  const [profile] = useState<{ email?: string; role?: string } | null>(() =>
    JSON.parse(
      typeof window !== "undefined"
        ? (localStorage.getItem("foodrush_user") ?? "null")
        : "null"
    )
  );
  const [users, setUsers] = useState<UserRow[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setUsers(d.users ?? []);
        setCoupons(d.coupons ?? []);
        setOrders(d.orders ?? []);
      })
      .catch(() => null)
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  // VULN (A01): this is a CLIENT-SIDE role check only. The /api/admin/users
  // endpoint performs no authorization, so the check below can be bypassed by
  // editing localStorage (e.g. set foodrush_user to {"role":"admin"}).
  const isAdmin = profile?.role === "admin";

  const revenue = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const pending = orders.filter((o) => o.status === "pending").length;

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
              You must be signed in as an admin to view this page.{" "}
              {profile ? (
                <>
                  You are <b>{profile.email}</b> (role: {profile.role ?? "unknown"}).
                </>
              ) : (
                "You aren't signed in."
              )}
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
                <ShieldCheck className="size-7 text-primary-600" />
                Admin dashboard
              </h1>
              <p className="mt-2 text-sm text-ink-500">
                Signed in as <b>{profile?.email}</b> · role {profile?.role}
              </p>
              <AdminNav />
            </div>

            {loading ? (
              <div className="mt-8 h-72 animate-pulse rounded-3xl bg-beige-200/60" />
            ) : (
              <div className="mt-8 grid gap-6">
                <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-3xl border border-beige-200 bg-white p-5 text-center shadow-card">
                    <Users className="mx-auto size-5 text-primary-600" />
                    <p className="mt-2 text-3xl font-extrabold text-ink-900">{users.length}</p>
                    <p className="mt-1 text-sm text-ink-500">Users</p>
                  </div>
                  <div className="rounded-3xl border border-beige-200 bg-white p-5 text-center shadow-card">
                    <Receipt className="mx-auto size-5 text-primary-600" />
                    <p className="mt-2 text-3xl font-extrabold text-ink-900">{orders.length}</p>
                    <p className="mt-1 text-sm text-ink-500">Orders</p>
                  </div>
                  <div className="rounded-3xl border border-beige-200 bg-white p-5 text-center shadow-card">
                    <IndianRupee className="mx-auto size-5 text-primary-600" />
                    <p className="mt-2 text-3xl font-extrabold text-ink-900">₹{revenue.toFixed(2)}</p>
                    <p className="mt-1 text-sm text-ink-500">Revenue</p>
                  </div>
                  <div className="rounded-3xl border border-beige-200 bg-white p-5 text-center shadow-card">
                    <CreditCard className="mx-auto size-5 text-primary-600" />
                    <p className="mt-2 text-3xl font-extrabold text-ink-900">{pending}</p>
                    <p className="mt-1 text-sm text-ink-500">Pending</p>
                  </div>
                </section>

                <section className="rounded-3xl border border-beige-200 bg-white p-6 shadow-card">
                  <h2 className="flex items-center gap-2 font-bold text-ink-900">
                    <Users className="size-5 text-primary-600" />
                    All users
                  </h2>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-beige-200 text-xs uppercase tracking-wide text-ink-400">
                          <th className="pb-2 font-semibold">Name</th>
                          <th className="pb-2 font-semibold">Email</th>
                          <th className="pb-2 font-semibold">Role</th>
                          <th className="pb-2 font-semibold">Password (MD5)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id} className="border-b border-beige-100 last:border-0">
                            <td className="py-3 font-semibold text-ink-900">{u.name ?? "—"}</td>
                            <td className="py-3 text-ink-700">{u.email}</td>
                            <td className="py-3">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  u.role === "admin"
                                    ? "bg-primary-50 text-primary-600"
                                    : "bg-beige-100 text-ink-700"
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 font-mono text-xs text-ink-500">
                              {u.password_md5 ?? "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="rounded-3xl border border-beige-200 bg-white p-6 shadow-card">
                  <h2 className="font-bold text-ink-900">Coupons</h2>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-beige-200 text-xs uppercase tracking-wide text-ink-400">
                          <th className="pb-2 font-semibold">Code</th>
                          <th className="pb-2 font-semibold">Discount</th>
                          <th className="pb-2 font-semibold">Uses</th>
                          <th className="pb-2 font-semibold">Max</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coupons.map((c) => (
                          <tr key={c.id} className="border-b border-beige-100 last:border-0">
                            <td className="py-3 font-mono font-semibold text-ink-900">{c.code}</td>
                            <td className="py-3 text-ink-700">₹{c.discount}</td>
                            <td className="py-3 text-ink-700">{c.uses}</td>
                            <td className="py-3 text-ink-700">{c.max_uses}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
