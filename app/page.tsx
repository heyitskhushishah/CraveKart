"use client";

import Link from "next/link";
import {
  ArrowRight,
  Bike,
  Flame,
  Receipt,
  ShieldCheck,
  Star,
  Timer,
} from "lucide-react";

import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { useIsAdmin } from "@/lib/auth";

function FloatingOrderCard() {
  return (
    <div className="glass animate-float absolute hidden rounded-3xl p-4 shadow-pop xl:block">
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-2xl shadow-glow">
          🍕
        </span>
        <div>
          <p className="text-sm font-bold text-ink-900">Margherita Pizza</p>
          <p className="flex items-center gap-1.5 text-xs text-ink-500">
            <Star className="size-3 fill-amber-500 text-amber-500" />
            4.8 · ₹399
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-ink-500">
        <span className="inline-flex size-2 animate-pulse rounded-full bg-sage-500" />
        On the way · 12 min
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-beige-200">
        <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary-500 to-coral-400" />
      </div>
    </div>
  );
}

const trust = [
  { icon: Timer, label: "30-min delivery" },
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: Star, label: "4.8 avg. rating" },
  { icon: Bike, label: "Live tracking" },
];

export default function HomePage() {
  const isAdmin = useIsAdmin();

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-beige-100 to-primary-100" />
      <div className="animate-blob absolute -left-32 top-10 size-96 rounded-full bg-primary-200/60 blur-3xl" />
      <div className="animate-blob absolute -right-24 top-1/3 size-80 rounded-full bg-coral-400/20 blur-3xl [animation-delay:-7s]" />
      <div className="absolute bottom-0 left-1/2 h-64 w-[70rem] max-w-full -translate-x-1/2 rounded-full bg-white/40 blur-3xl" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo size="lg" />
        <nav className="flex items-center gap-2.5">
          {isAdmin ? (
            <Link href="/admin">
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="focus-ring rounded-full px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:text-primary-600"
              >
                Sign in
              </Link>
              <Link href="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 pb-20 text-center sm:px-6">
        {isAdmin ? (
          <>
            <span className="glass inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold text-ink-700">
              <Flame className="size-3.5 text-primary-600" />
              Admin console
            </span>
            <h1 className="mt-6 max-w-2xl text-5xl font-extrabold leading-[1.06] tracking-tight text-ink-900 sm:text-6xl">
              Manage your{" "}
              <span className="bg-gradient-to-r from-primary-600 to-coral-500 bg-clip-text text-transparent">
                CraveKart
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-500">
              Oversee users, track orders, and keep the kitchen humming — all
              from the admin dashboard.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="/admin">
                <Button size="lg">
                  Open dashboard <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/admin/orders">
                <Button size="lg" variant="secondary">
                  View orders <Receipt className="size-4" />
                </Button>
              </Link>
            </div>
            <footer className="mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-500">
              <Link href="/admin" className="transition-colors hover:text-primary-600">
                Dashboard
              </Link>
              <Link href="/admin/orders" className="transition-colors hover:text-primary-600">
                Orders
              </Link>
              <Link href="/profile" className="transition-colors hover:text-primary-600">
                Profile
              </Link>
            </footer>
          </>
        ) : (
          <>
            <FloatingOrderCard />
            <span className="glass inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold text-ink-700">
              <Flame className="size-3.5 text-primary-600" />
              Hot food, delivered in 30 minutes
            </span>
            <h1 className="mt-6 max-w-2xl text-5xl font-extrabold leading-[1.06] tracking-tight text-ink-900 sm:text-6xl">
              Your cravings,{" "}
              <span className="bg-gradient-to-r from-primary-600 to-coral-500 bg-clip-text text-transparent">
                one tap away
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-500">
              CraveKart connects you with the best restaurants nearby — from
              sizzling burgers to soul-warming bowls.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="/menu">
                <Button size="lg">
                  Order now <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="secondary">
                  Sign in
                </Button>
              </Link>
            </div>

            <div className="glass mt-14 grid max-w-2xl grid-cols-2 gap-y-4 rounded-3xl px-6 py-5 shadow-card sm:grid-cols-4">
              {trust.map((t) => (
                <div key={t.label} className="flex flex-col items-center gap-1.5 text-center">
                  <t.icon className="size-5 text-primary-600" />
                  <span className="text-[13px] font-semibold text-ink-700">
                    {t.label}
                  </span>
                </div>
              ))}
            </div>

            <footer className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-500">
              <Link href="/menu" className="transition-colors hover:text-primary-600">
                Menu
              </Link>
              <Link href="/orders" className="transition-colors hover:text-primary-600">
                Orders
              </Link>
              <Link href="/track" className="transition-colors hover:text-primary-600">
                Track
              </Link>
              <Link href="/profile" className="transition-colors hover:text-primary-600">
                Profile
              </Link>
              <Link href="/cart" className="transition-colors hover:text-primary-600">
                Cart
              </Link>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
