"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, MapPin, Plus, Search, ShoppingBag, SlidersHorizontal, Star, Timer } from "lucide-react";

import { Logo } from "@/components/ui/Logo";
import dynamic from "next/dynamic";
const UserMenu = dynamic(
  () => import("@/components/ui/UserMenu").then((m) => m.UserMenu),
  { ssr: false }
);
import { useCart } from "@/lib/cart";

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

type PriceRange = { id: string; label: string; min: number; max: number };

const PRICE_RANGES: PriceRange[] = [
  { id: "under5", label: "Under ₹5", min: 0, max: 5 },
  { id: "5to9", label: "₹5 – ₹9", min: 5, max: 9 },
  { id: "9plus", label: "₹9+", min: 9, max: Infinity },
];

export default function MenuPage() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [activeCuisine, setActiveCuisine] = useState<string | null>(null);
  const [activeRestaurant, setActiveRestaurant] = useState<string | null>(null);
  const [activePrice, setActivePrice] = useState<string | null>(null);

  // Debounced search term
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query), 350);
    return () => clearTimeout(id);
  }, [query]);

  // True while a search for the current term is still in flight -> skeleton.
  const pending = loadedFor !== debounced;

  // Search via /api/search -> supabase.rpc('search_items', { query })
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/search?q=${encodeURIComponent(debounced)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items ?? []);
        setLoadedFor(debounced);
      })
      .catch(() => null);
    return () => ctrl.abort();
  }, [debounced]);

  // Restaurant directory (for chips + tags)
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

  const cuisines = useMemo(
    () => [...new Set(restaurants.map((r) => r.cuisine))],
    [restaurants]
  );

  // Client-side filter over the search results (chips)
  const filtered = useMemo(() => {
    return items.filter((item) => {
      const rest = restaurantById.get(item.restaurant_id);
      if (activeCuisine && rest?.cuisine !== activeCuisine) return false;
      if (activeRestaurant && item.restaurant_id !== activeRestaurant) return false;
      if (activePrice) {
        const range = PRICE_RANGES.find((r) => r.id === activePrice)!;
        if (item.price < range.min || item.price >= range.max) return false;
      }
      return true;
    });
  }, [items, activeCuisine, activeRestaurant, activePrice, restaurantById]);

  const { cart, add: addToCart, remove: removeFromCart, count: cartCount } = useCart();

  const toggle = (
    setter: React.Dispatch<React.SetStateAction<string | null>>,
    value: string
  ) => setter((prev) => (prev === value ? null : value));

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
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-primary-600 px-1 text-[11px] font-bold text-white shadow-glow">
                {cartCount}
              </span>
            )}
          </Link>
          <UserMenu />
        </nav>
      </header>

      {/* Sticky search bar */}
      <div className="glass sticky top-0 z-20 border-x-0 border-t-0 px-6 pb-4 pt-3 sm:px-10">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-ink-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for pizzas, burgers, curries…"
              className="focus-ring h-13 w-full rounded-full border border-beige-200 bg-white pl-13 pr-5 text-ink-900 shadow-card placeholder:text-ink-400"
            />
          </div>
          <button className="focus-ring grid size-13 shrink-0 place-items-center rounded-full border border-beige-200 bg-white text-ink-700 shadow-card transition-colors hover:border-primary-300 hover:text-primary-600">
            <SlidersHorizontal className="size-5" />
          </button>
        </div>
      </div>

      <main className="relative z-10 mx-auto w-full max-w-5xl flex-1 px-6 pb-20">
        {/* Location / hint line */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-700">
            <MapPin className="size-3.5 text-primary-600" />
            1.2 km · {restaurants.length} restaurants near you
          </span>
          <p className="text-xs text-ink-400">
            Demo hint: try{" "}
            <code className="rounded-md bg-beige-200 px-1.5 py-0.5 text-[13px] text-ink-700">
              %&apos; or 1=1--
            </code>
          </p>
        </div>

        {/* Filter chips — horizontal scroll, active = highlighted */}
        <div className="-mx-6 mt-4 flex gap-2.5 overflow-x-auto px-6 pb-2 [scrollbar-width:none]">
          {cuisines.map((c) => (
            <button
              key={c}
              onClick={() => toggle(setActiveCuisine, c)}
              className={`focus-ring shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-150 active:scale-95 ${
                activeCuisine === c
                  ? "border-primary-600 bg-primary-600 text-white shadow-glow"
                  : "border-beige-200 bg-white/70 text-ink-700 hover:border-primary-300 hover:bg-primary-50"
              }`}
            >
              {c}
            </button>
          ))}
          {PRICE_RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => toggle(setActivePrice, r.id)}
              className={`focus-ring shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-150 active:scale-95 ${
                activePrice === r.id
                  ? "border-primary-600 bg-primary-600 text-white shadow-glow"
                  : "border-beige-200 bg-white/70 text-ink-700 hover:border-primary-300 hover:bg-primary-50"
              }`}
            >
              {r.label}
            </button>
          ))}
          <span className="my-auto h-5 w-px shrink-0 bg-beige-300" />
          {restaurants.map((r) => (
            <button
              key={r.id}
              onClick={() => toggle(setActiveRestaurant, r.id)}
              className={`focus-ring flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-150 active:scale-95 ${
                activeRestaurant === r.id
                  ? "border-primary-600 bg-primary-600 text-white shadow-glow"
                  : "border-beige-200 bg-white/70 text-ink-700 hover:border-primary-300 hover:bg-primary-50"
              }`}
            >
              <span className="text-base">{r.image_url}</span>
              {r.name}
            </button>
          ))}
        </div>

        <section className="mt-6">
          {pending ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-3xl bg-beige-200/60" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="mt-14 text-center">
              <div className="mx-auto grid size-28 place-items-center rounded-full bg-beige-100 text-6xl">
                🍽️
              </div>
              <p className="mt-6 text-xl font-bold text-ink-900">No dishes found</p>
              <p className="mt-1 text-sm text-ink-500">
                Try a different search — or a dash of SQL magic.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item, i) => {
                const rest = restaurantById.get(item.restaurant_id);
                const inCart = cart.some((c) => c.id === item.id);
                return (
                  <article
                    key={item.id}
                    className="animate-fade-up group relative flex flex-col rounded-3xl border border-beige-200 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-pop"
                    style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}
                  >
                    {/* Image */}
                    <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-2xl bg-beige-100 text-7xl">
                      <span className="drop-shadow-sm transition-transform duration-300 group-hover:scale-110">
                        {item.image_url ?? "🍲"}
                      </span>
                      {item.category && (
                        <span className="glass absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold text-ink-700">
                          {item.category}
                        </span>
                      )}
                      {/* Floating + button: turns into a green tick while the
                          item is in the cart and stays until deselected. */}
                      <button
                        onClick={() =>
                          inCart
                            ? removeFromCart(item.id)
                            : addToCart({ id: item.id, name: item.name, price: item.price })
                        }
                        aria-label={
                          inCart
                            ? `Remove ${item.name} from cart`
                            : `Add ${item.name} to cart`
                        }
                        className={`focus-ring absolute -bottom-4 right-4 grid size-11 place-items-center rounded-full shadow-glow transition-all duration-150 active:scale-90 hover:scale-110 ${
                          inCart
                            ? "bg-sage-500 text-white"
                            : "bg-primary-600 text-white hover:bg-primary-500"
                        }`}
                      >
                        {inCart ? <Check className="size-5" /> : <Plus className="size-5" />}
                      </button>
                    </div>

                    {/* Body */}
                    <div className="mt-6 flex items-center gap-2 text-[13px] text-ink-500">
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
                    <Link href={`/product/${item.id}`} className="mt-1.5">
                      <h2 className="text-lg font-bold text-ink-900 transition-colors group-hover:text-primary-600">
                        {item.name}
                      </h2>
                    </Link>
                    <p className="mt-0.5 line-clamp-2 flex-1 text-sm text-ink-500">
                      {item.description}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-lg font-extrabold text-ink-900">
                        ₹{Number(item.price).toFixed(2)}
                      </span>
                      <span className="text-sm text-ink-400">
                        {rest?.name}
                      </span>
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
