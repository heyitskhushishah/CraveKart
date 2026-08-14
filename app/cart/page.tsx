"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { ArrowLeft, CreditCard, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import dynamic from "next/dynamic";
const UserMenu = dynamic(
  () => import("@/components/ui/UserMenu").then((m) => m.UserMenu),
  { ssr: false }
);
import { useCart } from "@/lib/cart";

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQty, clear, ready } = useCart();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = useMemo(() => cart.reduce((s, l) => s + l.price * l.qty, 0), [cart]);
  const total = Math.max(0, subtotal - discount);

  const applyCoupon = useCallback(async () => {
    setCouponMsg(null);
    try {
      const r = await fetch(`/api/coupon?code=${encodeURIComponent(coupon)}`);
      const d = await r.json();
      setDiscount(Number(d.discount) || 0);
      setCouponMsg(
        d.discount > 0
          ? `Coupon applied: ₹${d.discount} off`
          : `No discount for "${coupon}".`
      );
    } catch {
      setCouponMsg("Coupon lookup failed.");
    }
  }, [coupon]);

  const placeOrder = useCallback(async () => {
    setError(null);
    if (!/^\d{13,16}$/.test(cardNumber.replace(/\s/g, ""))) {
      setError("Card number must be 13–16 digits.");
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          card: { name: cardName, number: cardNumber, expiry, cvv },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Checkout failed.");
        return;
      }
      clear();
      router.push(`/orders/${data.order.id}`);
    } catch {
      setError("Network error.");
    } finally {
      setPlacing(false);
    }
  }, [cart, cardName, cardNumber, expiry, cvv, clear, router]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-beige-100 to-primary-100" />
      <div className="animate-blob absolute -right-24 top-0 size-96 rounded-full bg-primary-200/50 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/menu" className="focus-ring inline-flex items-center gap-2 rounded-full text-sm font-semibold text-ink-700 transition-colors hover:text-primary-600">
          <ArrowLeft className="size-4" />
          <Logo size="md" />
        </Link>
        <nav className="flex items-center gap-3">
          <UserMenu />
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-6 pb-20">
        <h1 className="animate-fade-up mt-8 flex items-center gap-3 text-3xl font-extrabold tracking-tight text-ink-900">
          <ShoppingBag className="size-7 text-primary-600" />
          Your cart
        </h1>

        {!ready ? (
          <div className="mt-16 space-y-4" aria-busy="true">
            <div className="h-24 animate-pulse rounded-3xl bg-beige-200/60" />
            <div className="h-24 animate-pulse rounded-3xl bg-beige-200/60" />
            <div className="h-24 animate-pulse rounded-3xl bg-beige-200/60" />
          </div>
        ) : cart.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-5xl">🛒</p>
            <p className="mt-4 text-lg font-semibold text-ink-700">Your cart is empty</p>
            <p className="mt-1 text-sm text-ink-400">
              Head back to the menu and pick something tasty.
            </p>
            <Link href="/menu" className="mt-6 inline-block">
              <Button>Browse menu</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
            <section className="space-y-4">
              {cart.map((line) => (
                <article
                  key={line.id}
                  className="flex items-center gap-4 rounded-3xl border border-beige-200 bg-white p-4 shadow-card"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-beige-100 text-3xl">
                    🍽️
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink-900">{line.name}</p>
                    <p className="text-sm text-ink-500">₹{line.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(line.id, -1)}
                      className="focus-ring grid size-8 place-items-center rounded-full border border-beige-200 text-ink-700 hover:bg-beige-100"
                      aria-label="Decrease"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-6 text-center font-bold text-ink-900">{line.qty}</span>
                    <button
                      onClick={() => updateQty(line.id, 1)}
                      className="focus-ring grid size-8 place-items-center rounded-full border border-beige-200 text-ink-700 hover:bg-beige-100"
                      aria-label="Increase"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <span className="w-20 text-right font-extrabold text-ink-900">
                    ₹{(line.price * line.qty).toFixed(2)}
                  </span>
                  <button
                    onClick={() => updateQty(line.id, -line.qty)}
                    className="focus-ring grid size-8 place-items-center rounded-full text-coral-500 hover:bg-coral-400/10"
                    aria-label="Remove"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </article>
              ))}
            </section>

            <aside className="space-y-5">
              <section className="rounded-3xl border border-beige-200 bg-white p-6 shadow-card">
                <h2 className="font-bold text-ink-900">Coupon</h2>
                <div className="mt-3 flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="e.g. FRESH10"
                    className="focus-ring h-11 min-w-0 flex-1 rounded-full border border-beige-200 bg-cream px-4 text-sm text-ink-900 placeholder:text-ink-400"
                  />
                  <Button variant="dark" onClick={applyCoupon}>
                    Apply
                  </Button>
                </div>
                {couponMsg && (
                  <p className="mt-2 text-sm font-medium text-sage-500">{couponMsg}</p>
                )}
                <p className="mt-3 text-xs text-ink-400">
                  Demo hint: try <code>FRESH10</code> … or anything wrapped in quotes.
                </p>
              </section>

              <section className="rounded-3xl border border-beige-200 bg-white p-6 shadow-card">
                <h2 className="flex items-center gap-2 font-bold text-ink-900">
                  <CreditCard className="size-5 text-primary-600" />
                  Payment
                </h2>
                <div className="mt-4 space-y-3">
                  <Field label="Name on card" htmlFor="cardName">
                    <Input value={cardName} onChange={(e) => setCardName(e.target.value)} placeholder="Ava Admin" />
                  </Field>
                  <Field label="Card number" htmlFor="cardNumber" hint="Stored exactly as entered.">
                    <Input value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} placeholder="4111 1111 1111 1111" inputMode="numeric" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Expiry" htmlFor="expiry">
                      <Input value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" />
                    </Field>
                    <Field label="CVV" htmlFor="cvv">
                      <Input value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="123" inputMode="numeric" />
                    </Field>
                  </div>
                </div>
                {error && <p className="mt-3 text-sm font-medium text-coral-500">{error}</p>}
              </section>

              <section className="rounded-3xl border border-beige-200 bg-white p-6 shadow-card">
                <div className="flex justify-between text-sm text-ink-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-ink-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm text-ink-500">
                  <span>Coupon</span>
                  <span className="font-semibold text-sage-500">− ₹{discount.toFixed(2)}</span>
                </div>
                <div className="mt-4 flex justify-between border-t border-beige-200 pt-4 text-lg font-extrabold text-ink-900">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <Button className="mt-5 w-full" size="lg" loading={placing} onClick={placeOrder}>
                  Place order · ₹{total.toFixed(2)}
                </Button>
              </section>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
