import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Eye, EyeOff, Lightbulb, ScanSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassCard } from "./GlassCard";
import { StrengthMeter } from "./StrengthMeter";
import { BreachChecker } from "./BreachChecker";
import { analyzePassword, type PersonalHints } from "@/lib/password";

export function AnalyzerPanel() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [hints, setHints] = useState<PersonalHints>({});

  const analysis = useMemo(() => analyzePassword(password, hints), [password, hints]);

  const diversity = [
    { label: "Uppercase", ok: analysis.diversity.upper },
    { label: "Lowercase", ok: analysis.diversity.lower },
    { label: "Numbers", ok: analysis.diversity.number },
    { label: "Symbols", ok: analysis.diversity.symbol },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <GlassCard
          title="Password Analyzer"
          description="Analysis runs entirely in this tab. Nothing is stored or sent."
          icon={<ScanSearch className="h-4 w-4 shrink-0 text-cyber-cyan" />}
        >
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <Input
              type={show ? "text" : "password"}
              value={password}
              autoComplete="off"
              spellCheck={false}
              placeholder="Type or paste a password to inspect"
              onChange={(e) => setPassword(e.target.value)}
              className="min-w-0 font-mono"
              aria-label="Password to analyze"
            />
            <Button variant="outline" size="icon" className="shrink-0" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>

          <div className="mt-5">
            <StrengthMeter analysis={analysis} />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {diversity.map((d) => (
              <span
                key={d.label}
                className={`rounded-full border px-3 py-1 text-xs ${d.ok ? "border-cyber-emerald/40 bg-cyber-emerald/10 text-cyber-emerald" : "border-border bg-secondary/40 text-muted-foreground"}`}
              >
                {d.label}
              </span>
            ))}
          </div>
        </GlassCard>

        <GlassCard title="Pattern findings" delay={60}>
          {password.length === 0 ? (
            <p className="text-sm text-muted-foreground">Enter a password to see detected weaknesses.</p>
          ) : analysis.issues.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-cyber-emerald">
              <CheckCircle2 className="h-4 w-4 shrink-0" /> No dictionary words, sequences, keyboard runs or repeats detected.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {analysis.issues.map((i) => (
                <li key={i.label} className="flex gap-3 rounded-xl border border-destructive/25 bg-destructive/10 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{i.label}</p>
                    <p className="text-xs text-muted-foreground">{i.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      </div>

      <div className="space-y-6">
        <BreachChecker password={password} />

        <GlassCard title="Improvement suggestions" icon={<Lightbulb className="h-4 w-4 shrink-0 text-cyber-emerald" />} delay={100}>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {analysis.suggestions.map((s) => (
              <li key={s} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyber-cyan" />
                <span className="min-w-0">{s}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard
          title="Personal information heuristics"
          description="Optional. These hints stay in memory and are compared locally."
          delay={140}
        >
          <div className="grid gap-2.5 sm:grid-cols-2">
            <Input placeholder="Your name" autoComplete="off" onChange={(e) => setHints((h) => ({ ...h, name: e.target.value }))} />
            <Input placeholder="Birth year" autoComplete="off" onChange={(e) => setHints((h) => ({ ...h, year: e.target.value }))} />
            <Input className="sm:col-span-2" placeholder="Email address" autoComplete="off" onChange={(e) => setHints((h) => ({ ...h, email: e.target.value }))} />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}