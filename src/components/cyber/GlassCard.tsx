import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function GlassCard({
  children,
  className,
  title,
  description,
  icon,
  delay = 0,
}: {
  children?: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: ReactNode;
  delay?: number;
}) {
  return (
    <section
      className={cn("glass animate-rise rounded-2xl p-5 sm:p-6", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {(title || description) && (
        <header className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <h2 className="flex min-w-0 items-center gap-2 text-base font-semibold sm:text-lg">
              {icon}
              <span className="min-w-0">{title}</span>
            </h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
        </header>
      )}
      {children}
    </section>
  );
}