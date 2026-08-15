"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CreditCard, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/ui/PageShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge, statusTone, STATUS_LABEL } from "@/components/ui/Badge";
import { RequireCustomer } from "@/components/ui/RequireCustomer";

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
    <RequireCustomer>
    <PageShell backHref="/orders" backLabel="Back to orders" maxWidth="max-w-2xl">
      {loading ? (
        <Skeleton className="mt-8 h-96 rounded-3xl" />
      ) : !order ? (
        <EmptyState
          icon="🤷"
          title="Order not found"
          description="We couldn't find that order."
          action={
            <Link href="/orders">
              <Button variant="secondary">Back to orders</Button>
            </Link>
          }
        />
      ) : (
        <>
          <section className="animate-fade-up card card-pad mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Badge tone={statusTone(order.status)} dot>
                {STATUS_LABEL[order.status] ?? order.status}
              </Badge>
              <span className="font-mono text-xs text-ink-400">
                {order.id.slice(0, 13)}…
              </span>
            </div>
            <h1 className="heading mt-5 text-2xl sm:text-3xl">
              {order.restaurant_name}
            </h1>
            <p className="mt-1.5 text-sm text-ink-500">
              {new Date(order.created_at).toLocaleString()}
            </p>

            <ul className="mt-6 divide-y divide-beige-100 border-y border-beige-100">
              {(order.items ?? []).map((line, i) => (
                <li key={i} className="flex items-center justify-between gap-4 py-3.5 text-sm">
                  <span className="min-w-0 text-ink-700">
                    <span className="truncate">
                      {line.name ?? "Item"}
                    </span>{" "}
                    <span className="text-ink-400">× {line.qty ?? 1}</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular text-ink-900">
                    ₹{((line.price ?? 0) * (line.qty ?? 1)).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between text-lg font-extrabold text-ink-900">
              <span>Total</span>
              <span className="tabular">₹{Number(order.total).toFixed(2)}</span>
            </div>
          </section>

          <section className="card card-pad mt-5 flex flex-wrap items-center justify-between gap-3">
            <span className="flex items-center gap-3 text-sm font-semibold text-ink-700">
              <CreditCard className="size-5 text-primary-600" />
              Card on file
            </span>
            <span className="font-mono text-lg font-extrabold tracking-widest text-ink-900 tabular">
              {order.cc_number ?? "—"}
            </span>
          </section>

          <p className="mt-3 text-center text-xs text-ink-400">
            That card number? Stored in plaintext (A02) and readable by anyone
            who knows the order id (IDOR / A01).
          </p>

          <div className="mt-6 text-center">
            <Link href="/menu">
              <Button>
                <RotateCcw className="size-4" />
                Order again
              </Button>
            </Link>
          </div>
        </>
      )}
    </PageShell>
    </RequireCustomer>
  );
}
