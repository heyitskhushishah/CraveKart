"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, ShieldAlert, ShoppingBag, Star } from "lucide-react";

import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { UserMenu } from "@/components/ui/UserMenu";
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

type Review = {
  id: string;
  product_id: string;
  author: string;
  content: string;
  rating: number;
  created_at: string;
};

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const [item, setItem] = useState<MenuItem | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { add: addToCart, count: cartCount } = useCart();
  const [added, setAdded] = useState(false);

  const addItem = useCallback(() => {
    if (!item) return;
    addToCart({ id: item.id, name: item.name, price: item.price });
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  }, [item, addToCart]);

  useEffect(() => {
    let active = true;
    fetch(`/api/product/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setItem(d.item ?? null);
        setReviews(d.reviews ?? []);
        const rest = (d.restaurants ?? []).find(
          (r: { id: string }) => r.id === d.item?.restaurant_id
        );
        setRestaurantName(rest?.name ?? null);
      })
      .catch(() => null)
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [params.id]);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setPosting(true);
      setError(null);
      try {
        const res = await fetch("/api/reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: params.id, author, content, rating }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Could not post review.");
          return;
        }
        setReviews((prev) => [data.review, ...prev]);
        setAuthor("");
        setContent("");
      } catch {
        setError("Network error.");
      } finally {
        setPosting(false);
      }
    },
    [params.id, author, content, rating]
  );

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return null;
    return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cream via-beige-100 to-primary-100" />
      <div className="animate-blob absolute -left-32 top-16 size-96 rounded-full bg-primary-200/50 blur-3xl" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/menu" className="focus-ring inline-flex items-center gap-2 rounded-full text-sm font-semibold text-ink-700 transition-colors hover:text-primary-600">
          <ArrowLeft className="size-4" />
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

      <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-6 pb-20">
        {loading ? (
          <div className="mt-10 h-72 animate-pulse rounded-3xl bg-beige-200/60" />
        ) : !item ? (
          <div className="mt-24 text-center">
            <p className="text-5xl">🤷</p>
            <p className="mt-4 text-lg font-semibold text-ink-700">Dish not found</p>
            <Link href="/menu" className="mt-4 inline-block text-sm font-semibold text-primary-600">
              Back to menu
            </Link>
          </div>
        ) : (
          <>
            <section className="animate-fade-up mt-8 grid gap-6 rounded-3xl border border-beige-200 bg-white p-6 shadow-card sm:grid-cols-[1.2fr_1fr] sm:p-8">
              <div className="flex min-h-56 items-center justify-center rounded-2xl bg-beige-100 text-[9rem]">
                <span className="drop-shadow-lg">{item.image_url ?? "🍲"}</span>
              </div>
              <div className="flex flex-col">
                {restaurantName && (
                  <span className="text-sm font-semibold uppercase tracking-wide text-primary-600">
                    {restaurantName}
                  </span>
                )}
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900">
                  {item.name}
                </h1>
                <p className="mt-3 flex-1 text-ink-500">{item.description}</p>
                <div className="mt-5 flex items-center gap-2 text-sm text-ink-500">
                  {avgRating && (
                    <span className="flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 font-semibold text-primary-600">
                      <Star className="size-4 fill-primary-500 text-primary-500" />
                      {avgRating}
                    </span>
                  )}
                  <span className="rounded-full bg-beige-100 px-3 py-1 font-semibold text-ink-700">
                    {reviews.length} review{reviews.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <span className="text-3xl font-extrabold text-ink-900">
                    ₹{Number(item.price).toFixed(2)}
                  </span>
                  <Button onClick={addItem} className={added ? "!bg-sage-500" : undefined}>
                    <Plus className="size-4" />
                    {added ? "Added to cart ✓" : "Add to cart"}
                  </Button>
                </div>
              </div>
            </section>

            <section className="mt-10">
              <h2 className="flex items-center gap-2 text-xl font-bold text-ink-900">
                <ShieldAlert className="size-5 text-primary-600" />
                Reviews
              </h2>

              <form
                onSubmit={submit}
                className="mt-4 rounded-3xl border border-beige-200 bg-white p-5 shadow-card"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Your name"
                    className="focus-ring h-11 rounded-full border border-beige-200 bg-cream px-4 text-sm text-ink-900 placeholder:text-ink-400"
                  />
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        className="focus-ring p-1"
                        aria-label={`${n} stars`}
                      >
                        <Star
                          className={`size-5 ${n <= rating ? "fill-primary-500 text-primary-500" : "text-beige-300"}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  required
                  placeholder="Tell everyone what you thought… (HTML is welcome!)"
                  className="focus-ring mt-3 w-full rounded-2xl border border-beige-200 bg-cream p-4 text-sm text-ink-900 placeholder:text-ink-400"
                />
                {error && <p className="mt-2 text-sm font-medium text-coral-500">{error}</p>}
                <div className="mt-4 flex justify-end">
                  <Button type="submit" loading={posting}>
                    Post review
                  </Button>
                </div>
              </form>

              <div className="mt-5 space-y-4">
                {reviews.map((r) => (
                  <article
                    key={r.id}
                    className="rounded-3xl border border-beige-200 bg-white p-5 shadow-card"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink-900">{r.author}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`size-4 ${i < r.rating ? "fill-primary-500 text-primary-500" : "text-beige-300"}`}
                          />
                        ))}
                      </div>
                    </div>
                    {/* VULN (A03): review HTML is rendered unescaped → stored XSS.
                        The seeded review for the Classic Cheeseburger already
                        contains <img src=x onerror=...> */}
                    <div
                      className="mt-2 break-words text-sm leading-relaxed text-ink-700"
                      dangerouslySetInnerHTML={{ __html: r.content }}
                    />
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
