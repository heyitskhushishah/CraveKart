"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapPin, Plus, Search, ShoppingBag, Star, Timer } from "lucide-react";

import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

type MenuItem = {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
};

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  eta_min: string;
  image_url: string | null;
};

export default function MenuPage() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 350);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    fetch(`/api/search?q=${encodeURIComponent(debounced)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => null)
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, [debounced]);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch("/api/restaurants", { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => setRestaurants(d.restaurants ?? []))
      .catch(() => null);
    return () => ctrl.abort();
  }, []);

  const restaurantById = useMemo(
    () => new Map(restaurants.map((r) => [r.id, r])),
    [restaurants]
  );

  const addToCart = useCallback((item: MenuItem) => {
    const cart = JSON.parse(localStorage.getItem("foodrush_cart") ?? "[]") as {
      id: string;
      name: string;
      price: number;
      qty: number;
    }[];
    const existing = cart.find((c) => c.id === item.id);
    if (existing) existing.qty += 1;
    else cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
    localStorage.setItem("foodrush_cart", JSON.stringify(cart));
    setAdded(item.id);
    setTimeout(() => setAdded(null), 1200);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-beige-100 to-primary-100" />
      <div className="animate-blob absolute -right-24 top-0 size-96 rounded-full bg-primary-200/50 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" aria-label="FoodRush home">
          <Logo size="md" />
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/cart"
            className="focus-ring relative inline-flex items-center gap-2 rounded-full border border-beige-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:border-primary-300 hover:text-primary-600"
          >
            <ShoppingBag className="size-4" />
            Cart
          </Link>
          <Link href="/login" className="focus-ring rounded-full px-3 py-2 text-sm font-semibold text-ink-700 transition-colors hover:text-primary-600">
            Sign in
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-6 pb-20">
        <section className="animate-fade-up pt-8 text-center">
          <span className="glass inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold text-ink-700">
            <MapPin className="size-3.5 text-primary-600" />
            1.2 km · 12 restaurants near you
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl">
            What are you{" "}
            <span className="bg-gradient-to-r from-primary-600 to-coral-500 bg-clip-text text-transparent">
              craving
            </span>{" "}
            today?
          </h1>

          <div className="relative mx-auto mt-7 max-w-xl">
            <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for pizzas, burgers, curries…"
              className="focus-ring h-14 w-full rounded-full border border-beige-200 bg-white pl-13 pr-5 text-ink-900 shadow-card placeholder:text-ink-400"
            />
          </div>
          <p className="mt-3 text-sm text-ink-400">
            Pro tip: try searching{" "}
            <code className="rounded-md bg-beige-200 px-1.5 py-0.5 text-[13px] text-ink-700">
              %&apos; or 1=1--
            </code>
          </p>
        </section>

        <section className="mt-10">
          {restaurants.length > 0 && (
            <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-2 [scrollbar-width:none]">
              {restaurants.map((r) => (
                <button
                  key={r.id}
                  className="focus-ring flex shrink-0 items-center gap-2 rounded-full border border-beige-200 bg-white/70 px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
                >
                  <span className="text-base">{r.image_url}</span>
                  {r.name}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 animate-pulse rounded-3xl bg-beige-200/60" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="mt-16 text-center">
              <p className="text-5xl">🍽️</p>
              <p className="mt-4 text-lg font-semibold text-ink-700">No dishes found</p>
              <p className="mt-1 text-sm text-ink-400">
                Try a different search, or add a dash of SQL magic.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, i) => {
                const rest = restaurantById.get(item.restaurant_id);
                return (
                  <article
                    key={item.id}
                    className="animate-fade-up group flex flex-col rounded-3xl border border-beige-200 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-pop"
                    style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}
                  >
                    <div className="flex h-28 items-center justify-center rounded-2xl bg-beige-100 text-6xl">
                      <span className="drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
                        {item.image_url ?? "🍲"}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[13px] text-ink-500">
                      {rest && (
                        <>
                          <span className="flex items-center gap-1">
                            <Star className="size-3.5 fill-primary-500 text-primary-500" />
                            {rest.rating}
                          </span>
                          <span className="text-beige-300">•</span>
                          <span>{rest.cuisine}</span>
                          <span className="text-beige-300">•</span>
                          <span className="flex items-center gap-1">
                            <Timer className="size-3.5" />
                            {rest.eta_min} min
                          </span>
                        </>
                      )}
                    </div>
                    <h2 className="mt-2 text-lg font-bold text-ink-900">{item.name}</h2>
                    <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink-500">
                      {item.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-lg font-extrabold text-ink-900">
                        ₹{Number(item.price).toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => addToCart(item)}
                        className={added === item.id ? "!bg-sage-500" : undefined}
                      >
                        {added === item.id ? (
                          "Added ✓"
                        ) : (
                          <>
                            <Plus className="size-4" /> Add
                          </>
                        )}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
