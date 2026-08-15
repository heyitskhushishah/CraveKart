import type { ReactNode } from "react";
import {
  Bike,
  MapPin,
  ShieldCheck,
  Star,
  Clock,
  Pizza,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const features = [
  {
    icon: Bike,
    title: "Lightning-fast delivery",
    desc: "Hot, fresh food at your door in 30 minutes or less.",
  },
  {
    icon: MapPin,
    title: "Live order tracking",
    desc: "Follow every step from our kitchen to your doorstep.",
  },
  {
    icon: ShieldCheck,
    title: "Payments you can trust",
    desc: "Check out in seconds with your saved cards and addresses.",
  },
];

const stats = [
  { value: "10k+", label: "hungry students" },
  { value: "30 min", label: "avg. delivery" },
  { value: "120+", label: "local kitchens" },
];

export function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ---- Brand panel (desktop) ---- */}
      <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        {/* warm backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-cream via-beige-100 to-primary-100" />
        <div className="animate-blob absolute -left-24 top-10 size-72 rounded-full bg-primary-200/60 blur-3xl" />
        <div className="animate-blob absolute -bottom-16 right-0 size-80 rounded-full bg-coral-400/20 blur-3xl [animation-delay:-6s]" />
        <div className="absolute left-1/3 top-1/2 size-64 rounded-full bg-white/40 blur-3xl" />

        <div className="relative z-10 flex items-start justify-between">
          <Logo size="lg" />
          <span className="glass inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-ink-700">
            <Clock className="size-3.5 text-primary-600" />
            Open now · 30 min avg.
          </span>
        </div>

        <div className="relative z-10 max-w-lg space-y-9">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-600/10 px-3.5 py-1.5 text-[13px] font-semibold text-primary-700">
              <Star className="size-3.5 fill-primary-600 text-primary-600" />
              Loved by 10,000+ hungry students
            </span>
            <h1 className="text-5xl font-extrabold leading-[1.08] tracking-tight text-ink-900">
              Crave it. Order it.
              <span className="block bg-gradient-to-r from-primary-600 to-coral-500 bg-clip-text text-transparent">
                Get it fast.
              </span>
            </h1>
            <p className="text-lg leading-relaxed text-ink-500">
              CraveKart brings the best kitchens in town straight to your table —
              crispy, hot, and on time.
            </p>
          </div>

          <ul className="space-y-5">
            {features.map((f) => (
              <li key={f.title} className="flex items-start gap-4">
                <span className="mt-0.5 inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-card">
                  <f.icon className="size-5" strokeWidth={2} />
                </span>
                <div>
                  <p className="font-bold text-ink-900">{f.title}</p>
                  <p className="text-sm text-ink-500">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* floating glass order card */}
          <div className="glass animate-float max-w-sm rounded-3xl p-5 shadow-pop">
            <div className="flex items-center gap-4">
              <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                <Pizza className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center justify-between font-bold text-ink-900">
                  Margherita Pizza
                  <span className="text-primary-600">₹399</span>
                </p>
                <p className="flex items-center gap-2 text-[13px] text-ink-500">
                  <span className="inline-flex size-2 animate-pulse rounded-full bg-sage-500" />
                  On the way · 12 min
                </p>
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-beige-200">
                  <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-primary-500 to-coral-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-xl font-extrabold tracking-tight text-ink-900">
                  {s.value}
                </p>
                <p className="text-[13px] text-ink-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-sm text-ink-400">
          © {new Date().getFullYear()} CraveKart · Crafted for hungry humans.
        </p>
      </aside>

      {/* ---- Form panel ---- */}
      <main className="relative flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="pointer-events-none absolute inset-0 lg:hidden">
          <div className="animate-blob absolute -right-20 -top-20 size-64 rounded-full bg-primary-100 blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo size="lg" />
          </div>

          <div className="animate-fade-up">
            <h2 className="heading text-3xl sm:text-[2rem]">{title}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-500">
              {subtitle}
            </p>

            <div className="card card-pad mt-8 space-y-6">{children}</div>

            {footer && (
              <div className="mt-6 text-center text-sm text-ink-500">{footer}</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
