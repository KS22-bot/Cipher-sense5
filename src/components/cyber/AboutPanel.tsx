import { Cpu, Lock, ShieldCheck, WifiOff } from "lucide-react";
import { GlassCard } from "./GlassCard";

const PRINCIPLES = [
  { icon: WifiOff, title: "Offline by default", body: "Generation, analysis and scoring run in your browser. The only network call is the optional k-anonymity breach lookup." },
  { icon: Lock, title: "Nothing is stored remotely", body: "History lives in this browser's local storage and can be wiped in one click. No accounts, no servers, no telemetry." },
  { icon: Cpu, title: "Real cryptographic randomness", body: "Secrets come from the Web Crypto CSPRNG with rejection sampling — never Math.random()." },
  { icon: ShieldCheck, title: "No sensitive logging", body: "The activity log records actions, never the values you generate or type." },
];

export function AboutPanel() {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <GlassCard title="About Cipher Sense" description="A privacy-first security lab for credentials.">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Cipher Sense is a client-side toolkit for creating and auditing credentials. It combines a
          cryptographically secure generator, a heuristic strength analyzer with entropy modelling and crack-time
          estimation, a memorable passphrase builder, and a privacy-preserving breach lookup — all inside a single
          browser tab.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          Crack-time estimates assume an offline attack at roughly 10<sup>11</sup> guesses per second against a fast
          hash, and are discounted for detected patterns such as dictionary words, sequences and keyboard runs.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          {["React", "TypeScript", "Tailwind CSS", "Web Crypto API", "HIBP k-Anonymity"].map((t) => (
            <span key={t} className="rounded-full border border-cyber-cyan/30 bg-cyber-cyan/10 px-3 py-1 text-cyber-cyan">
              {t}
            </span>
          ))}
        </div>
      </GlassCard>

      <GlassCard title="Privacy principles" delay={60}>
        <ul className="space-y-4">
          {PRINCIPLES.map((p) => (
            <li key={p.title} className="flex gap-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-secondary">
                <p.icon className="h-4 w-4 text-cyber-emerald" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{p.title}</p>
                <p className="text-sm text-muted-foreground">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}