import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";

import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-beige-100 to-primary-100" />
      <div className="animate-blob absolute -left-32 top-10 size-96 rounded-full bg-primary-200/60 blur-3xl" />
      <div className="animate-blob absolute -right-24 top-1/3 size-80 rounded-full bg-coral-400/20 blur-3xl [animation-delay:-7s]" />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <Logo size="lg" />
        <nav className="flex items-center gap-3">
          <Link href="/login" className="focus-ring rounded-full px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:text-primary-600">
            Sign in
          </Link>
          <Link href="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </nav>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
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
          FoodRush connects you with the best restaurants nearby — from sizzling
          burgers to soul-warming bowls.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/register">
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
      </main>
    </div>
  );
}
