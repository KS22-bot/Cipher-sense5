import { ShieldCheck } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <span className="glow-cyan relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary">
        <ShieldCheck className="h-5 w-5 text-cyber-cyan" strokeWidth={2.2} />
      </span>
      {!compact && (
        <span className="min-w-0 truncate font-display text-lg font-semibold tracking-tight">
          Cipher<span className="text-gradient">Sense</span>
        </span>
      )}
    </span>
  );
}