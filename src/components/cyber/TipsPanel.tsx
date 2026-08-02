import { useEffect, useState } from "react";
import { Bug, Fingerprint, KeyRound, RefreshCcw, Repeat2, Vault } from "lucide-react";
import { GlassCard } from "./GlassCard";

const TIPS = [
  { icon: Fingerprint, title: "Use unique passwords", body: "One breached site should never compromise another. Every account gets its own secret." },
  { icon: KeyRound, title: "Enable MFA everywhere", body: "A stolen password is useless without the second factor. Prefer an authenticator app or hardware key over SMS." },
  { icon: Repeat2, title: "Never reuse passwords", body: "Credential-stuffing bots replay leaked pairs across thousands of services within minutes." },
  { icon: Vault, title: "Use a password manager", body: "Long random secrets only work if you don't have to remember them. Guard the vault with a strong passphrase." },
  { icon: Bug, title: "Beware of phishing", body: "Check the domain before you type. Managers refuse to autofill on look-alike sites — treat that as an alarm." },
  { icon: RefreshCcw, title: "Keep software updated", body: "Most real-world compromises exploit patched bugs on unpatched machines. Turn on automatic updates." },
];

export function TipsPanel() {
  const [highlight, setHighlight] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setHighlight((h) => (h + 1) % TIPS.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6">
      <GlassCard title="Security Tips" description="Rotating guidance from real-world incident patterns.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {TIPS.map((t, i) => (
            <article
              key={t.title}
              className={`animate-rise rounded-xl border p-4 transition-all duration-500 ${
                i === highlight
                  ? "border-cyber-cyan/50 bg-cyber-cyan/10 shadow-[0_0_30px_-12px_var(--color-cyber-cyan)]"
                  : "border-border/60 bg-secondary/30"
              }`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <t.icon className={`h-5 w-5 ${i === highlight ? "text-cyber-cyan" : "text-muted-foreground"}`} />
              <h3 className="mt-3 text-sm font-semibold">{t.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{t.body}</p>
            </article>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}