import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Renders a secret with per-character colouring and a soft reveal animation. */
export function SecretField({ value, className }: { value: string; className?: string }) {
  const [key, setKey] = useState(0);
  useEffect(() => setKey((k) => k + 1), [value]);

  if (!value) {
    return (
      <p className={cn("font-mono text-sm text-muted-foreground", className)}>
        Press Generate to create a secret…
      </p>
    );
  }

  return (
    <p
      key={key}
      className={cn("break-all font-mono text-lg leading-relaxed sm:text-xl", className)}
      aria-label="Generated secret"
    >
      {value.split("").map((c, i) => (
        <span
          key={`${key}-${i}`}
          className={cn(
            "animate-flip-in inline-block",
            /[0-9]/.test(c) && "text-cyber-emerald",
            /[^A-Za-z0-9]/.test(c) && "text-cyber-violet",
            /[A-Z]/.test(c) && "text-cyber-cyan",
          )}
          style={{ animationDelay: `${Math.min(i * 12, 400)}ms` }}
        >
          {c}
        </span>
      ))}
    </p>
  );
}