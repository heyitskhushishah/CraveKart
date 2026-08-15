"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CreditCard,
  IndianRupee,
  Receipt,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { AdminNav } from "@/components/ui/AdminNav";
import { useCurrentUser } from "@/lib/auth";
import dynamic from "next/dynamic";
const UserMenu = dynamic(
  () => import("@/components/ui/UserMenu").then((m) => m.UserMenu),
  { ssr: false }
);

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  password_md5: string | null;
};
type Coupon = { id: string; code: string; discount: number; uses: number; max_uses: number };
type OrderRow = { id: string; user_id: string | null; total: number; status: string };

const tableHead = "px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-ink-400";
const tableCell = "px-4 py-3.5 align-middle";

export default function AdminPage() {
  const profile = useCurrentUser();
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
    <PageShell
      backHref="/"
      backLabel="Go home"
      maxWidth="max-w-5xl"
      right={<UserMenu />}
    >
      {!isAdmin ? (
        <section className="card card-pad animate-fade-up mx-auto mt-20 max-w-md text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-beige-100 text-2xl">
            🔒
          </span>
          <h1 className="heading mt-4 text-xl">Admins only</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">
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
          <PageHeader
            icon={ShieldCheck}
            title="Admin dashboard"
            subtitle={
              <>
                Signed in as <b>{profile?.email}</b> · role {profile?.role}
              </>
            }
          />
          <AdminNav />

          {loading ? (
            <div className="mt-8">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-3xl" />
                ))}
              </div>
              <Skeleton className="mt-6 h-72 rounded-3xl" />
            </div>
          ) : (
            <div className="mt-8 grid gap-6">
              <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard icon={Users} label="Users" value={users.length} tone="neutral" />
                <StatCard icon={Receipt} label="Orders" value={orders.length} tone="brand" />
                <StatCard
                  icon={IndianRupee}
                  label="Revenue"
                  value={`₹${revenue.toFixed(2)}`}
                  tone="success"
                />
                <StatCard
                  icon={CreditCard}
                  label="Pending"
                  value={pending}
                  tone="warning"
                />
              </section>

              <section className="card overflow-hidden">
                <div className="flex items-center justify-between border-b border-beige-100 px-6 py-4">
                  <h2 className="flex items-center gap-2 font-bold text-ink-900">
                    <Users className="size-5 text-primary-600" />
                    All users
                  </h2>
                  <Badge tone="neutral">{users.length} total</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-cream">
                      <tr className="border-b border-beige-100">
                        <th className={tableHead}>Name</th>
                        <th className={tableHead}>Email</th>
                        <th className={tableHead}>Role</th>
                        <th className={tableHead}>Password (MD5)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-beige-100">
                      {users.map((u) => (
                        <tr key={u.id} className="transition-colors hover:bg-cream/70">
                          <td className={`${tableCell} font-semibold text-ink-900`}>
                            {u.name ?? "—"}
                          </td>
                          <td className={`${tableCell} text-ink-700`}>{u.email}</td>
                          <td className={tableCell}>
                            <Badge tone={u.role === "admin" ? "brand" : "neutral"}>
                              {u.role}
                            </Badge>
                          </td>
                          <td className={`${tableCell} font-mono text-xs text-ink-500`}>
                            {u.password_md5 ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="card overflow-hidden">
                <div className="flex items-center justify-between border-b border-beige-100 px-6 py-4">
                  <h2 className="flex items-center gap-2 font-bold text-ink-900">
                    <Receipt className="size-5 text-primary-600" />
                    Coupons
                  </h2>
                  <Badge tone="neutral">{coupons.length} active</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-cream">
                      <tr className="border-b border-beige-100">
                        <th className={tableHead}>Code</th>
                        <th className={tableHead}>Discount</th>
                        <th className={tableHead}>Uses</th>
                        <th className={tableHead}>Max</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-beige-100">
                      {coupons.map((c) => {
                        const usedUp = c.uses >= c.max_uses;
                        return (
                          <tr key={c.id} className="transition-colors hover:bg-cream/70">
                            <td className={`${tableCell} font-mono font-semibold text-ink-900`}>
                              {c.code}
                            </td>
                            <td className={`${tableCell} text-ink-700`}>₹{c.discount}</td>
                            <td className={tableCell}>
                              <Badge tone={usedUp ? "danger" : "neutral"} dot>
                                {c.uses}
                              </Badge>
                            </td>
                            <td className={`${tableCell} text-ink-700 tabular`}>
                              {c.max_uses}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}
        </>
      )}
    </PageShell>
  );
}
