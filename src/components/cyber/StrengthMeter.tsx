import { scoreColor, type Analysis } from "@/lib/password";

export function StrengthMeter({ analysis }: { analysis: Analysis }) {
  const color = scoreColor(analysis.score);
  const entropyPct = Math.min(100, (analysis.entropy / 128) * 100);

  return (
    <div className="space-y-4">
      <div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
          <span className="min-w-0 truncate text-sm text-muted-foreground">Strength</span>
          <span className="shrink-0 font-display text-sm font-semibold" style={{ color }}>
            {analysis.label}
          </span>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-[width,background-color] duration-700 ease-out"
            style={{ width: `${analysis.score}%`, backgroundColor: color, boxShadow: `0 0 18px ${color}` }}
          />
        </div>
      </div>

      <div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
          <span className="min-w-0 truncate text-sm text-muted-foreground">Entropy</span>
          <span className="shrink-0 font-mono text-sm text-cyber-emerald">{analysis.entropy} bits</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-cyber-emerald transition-[width] duration-700 ease-out"
            style={{ width: `${entropyPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Score" value={`${analysis.score}/100`} />
        <Stat label="Length" value={String(analysis.length)} />
        <Stat label="Crack time" value={analysis.crackTime} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-border/60 bg-secondary/40 px-3 py-2">
      <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="break-words font-mono text-sm text-foreground">{value}</p>
    </div>
  );
}