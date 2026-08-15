import { UtensilsCrossed } from "lucide-react";

export function Logo({
  className = "",
  withText = true,
  size = "md",
}: {
  className?: string;
  withText?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const box = size === "lg" ? "size-12 rounded-2xl" : size === "sm" ? "size-8 rounded-xl" : "size-10 rounded-xl";
  const icon = size === "lg" ? "size-6" : size === "sm" ? "size-4" : "size-5";
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-lg" : "text-xl";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span
        className={`${box} inline-flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-glow`}
      >
        <UtensilsCrossed className={icon} strokeWidth={2.4} />
      </span>
      {withText && (
        <span className={`${text} font-extrabold tracking-tight text-ink-900`}>
          Crave<span className="text-primary-600">Kart</span>
        </span>
      )}
    </div>
  );
}
