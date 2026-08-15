import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  icon: Icon,
  title,
  subtitle,
  actions,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="animate-fade-up mt-6 sm:mt-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <span className="mt-0.5 grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-glow">
            <Icon className="size-5" strokeWidth={2.2} />
          </span>
          <div>
            <h1 className="heading text-3xl sm:text-[2rem]">{title}</h1>
            {subtitle && (
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-500">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        {actions}
      </div>
    </div>
  );
}
