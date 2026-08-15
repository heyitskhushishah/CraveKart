"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, Users } from "lucide-react";

const TABS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-6 inline-flex flex-wrap gap-2">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`focus-ring inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
              active
                ? "border-primary-600 bg-primary-600 text-white shadow-glow"
                : "border-beige-200 bg-white/70 text-ink-700 hover:border-primary-300 hover:bg-primary-50"
            }`}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </Link>
        );
      })}
      <Link
        href="/profile"
        className="focus-ring inline-flex items-center gap-2 rounded-full border border-beige-200 bg-white/70 px-4 py-2 text-sm font-semibold text-ink-700 transition-colors hover:border-primary-300 hover:bg-primary-50"
      >
        <Users className="size-4" />
        Profile
      </Link>
    </nav>
  );
}
