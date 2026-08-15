import type { LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "brand",
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  tone?: "brand" | "success" | "warning" | "danger" | "neutral";
}) {
  const iconTone: Record<string, string> = {
    brand: "bg-primary-50 text-primary-600",
    success: "bg-sage-50 text-sage-600",
    warning: "bg-amber-50 text-amber-600",
    danger: "bg-coral-50 text-coral-500",
    neutral: "bg-beige-100 text-ink-700",
  };

  return (
    <div className="card card-hover p-5">
      <div className="flex items-center gap-3.5">
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-2xl ${iconTone[tone]}`}
        >
          <Icon className="size-5" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-extrabold leading-none tracking-tight text-ink-900 tabular">
            {value}
          </p>
          <p className="mt-1.5 truncate text-[13px] font-medium text-ink-500">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}
