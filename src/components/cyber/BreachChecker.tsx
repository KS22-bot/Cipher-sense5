import { useState } from "react";
import { Loader2, ShieldAlert, ShieldCheck, Radar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "./GlassCard";
import { checkBreach, sha1Hex, type BreachResult } from "@/lib/password";
import { useLab } from "@/hooks/use-lab";

export function BreachChecker({ password }: { password: string }) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<BreachResult | null>(null);
  const [prefix, setPrefix] = useState("");
  const { pushLog } = useLab();

  const run = async () => {
    if (!password) return;
    setState("loading");
    try {
      setPrefix((await sha1Hex(password)).slice(0, 5));
      const res = await checkBreach(password);
      setResult(res);
      setState("done");
      pushLog(`Breach lookup completed via k-anonymity (prefix only).`, res.breached ? "warn" : "ok");
    } catch {
      setState("error");
      pushLog("Breach lookup failed — network unavailable.", "warn");
    }
  };

  return (
    <GlassCard
      title="Breach Checker"
      description="Have I Been Pwned k-Anonymity lookup."
      icon={<Radar className="h-4 w-4 shrink-0 text-cyber-violet" />}
      delay={40}
    >
      <Button onClick={run} disabled={!password || state === "loading"} className="gap-2">
        {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Radar className="h-4 w-4" />}
        Check for breaches
      </Button>

      {state === "done" && result && (
        <div
          className={`animate-rise mt-4 flex gap-3 rounded-xl border p-4 ${
            result.breached ? "border-destructive/30 bg-destructive/10" : "border-cyber-emerald/30 bg-cyber-emerald/10"
          }`}
        >
          {result.breached ? (
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          ) : (
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-cyber-emerald" />
          )}
          <div className="min-w-0">
            <p className="font-medium">{result.breached ? "Found in known breaches" : "Safe — no known breaches"}</p>
            <p className="text-sm text-muted-foreground">
              {result.breached
                ? `Seen ${result.count.toLocaleString()} time${result.count === 1 ? "" : "s"} in leaked datasets. Stop using it everywhere.`
                : "This secret does not appear in the Pwned Passwords corpus."}
            </p>
          </div>
        </div>
      )}

      {state === "error" && (
        <p className="mt-4 text-sm text-destructive">Lookup failed. Check your connection and try again.</p>
      )}

      <div className="mt-4 rounded-xl border border-border/60 bg-background/60 p-3 font-mono text-xs text-muted-foreground">
        <p className="text-cyber-cyan">// privacy model</p>
        <p>SHA-1 computed locally → only the first 5 hex characters are sent.</p>
        <p>prefix sent: {prefix || "—————"} · suffix &amp; password: never leave this browser.</p>
      </div>
    </GlassCard>
  );
}