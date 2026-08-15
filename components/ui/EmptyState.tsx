import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="animate-fade-up mt-12 text-center">
      <div className="mx-auto grid size-24 place-items-center rounded-full border border-beige-200 bg-white text-5xl shadow-card">
        <span aria-hidden="true">{icon}</span>
      </div>
      <h2 className="mt-5 text-xl font-bold text-ink-900">{title}</h2>
      {description && (
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-ink-500">
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
