import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Cpu, Gauge, KeyRound, Radar, ShieldCheck, Terminal, Type } from "lucide-react";
import { CyberBackground } from "@/components/cyber/CyberBackground";
import { Logo } from "@/components/cyber/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cipher Sense — Generate Smarter. Stay Safer." },
      {
        name: "description",
        content:
          "Cipher Sense is a local-first security lab: build cryptographically strong passwords and passphrases, analyze entropy and crack time, and check breaches privately.",
      },
      { property: "og:title", content: "Cipher Sense — Generate Smarter. Stay Safer." },
      { property: "og:description", content: "A premium, privacy-first password generator and strength analyzer that runs entirely in your browser." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const FEATURES = [
  { icon: KeyRound, title: "Password Generator", body: "Web Crypto randomness with granular rules: length, character classes, ambiguity filtering and easy-read mode." },
  { icon: Gauge, title: "Strength Analyzer", body: "Entropy modelling, dictionary and keyboard-pattern detection, a 0–100 score and realistic crack-time estimates." },
  { icon: Type, title: "Passphrase Builder", body: "Memorable multi-word secrets with separators, capitalisation and injected digits or symbols." },
  { icon: Radar, title: "Private Breach Check", body: "k-Anonymity lookups against Have I Been Pwned — only a 5-character hash prefix ever leaves the browser." },
  { icon: Terminal, title: "Local Activity Log", body: "A terminal-style trail of every action you take. Actions are recorded; secret values never are." },
  { icon: Cpu, title: "Zero Backend", body: "No accounts, no servers, no telemetry. Everything computes on your device and stays there." },
];

function Index() {
  return (
    <>
      <CyberBackground dense />
      <div className="min-h-screen">
        <header className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-5 sm:px-6">
          <Logo />
          <Link
            to="/lab"
            className="shrink-0 rounded-lg border border-border px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-cyber-cyan/50 hover:text-foreground"
          >
            Open Lab
          </Link>
        </header>

        <main className="mx-auto max-w-7xl px-4 sm:px-6">
          <section className="animate-rise py-16 text-center sm:py-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyber-emerald/30 bg-cyber-emerald/10 px-3.5 py-1.5 text-xs text-cyber-emerald">
              <ShieldCheck className="h-3.5 w-3.5" /> 100% local · nothing leaves your device
            </span>
            <h1 className="mx-auto mt-6 max-w-4xl text-balance font-display text-4xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
              Generate Smarter. <span className="text-gradient">Stay Safer.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Cipher Sense is a privacy-first security lab for credentials. Create cryptographically strong passwords
              and memorable passphrases, then audit them with entropy analysis, pattern detection and private breach
              lookups — all computed in your browser.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                to="/lab"
                className="glow-cyan group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-medium text-primary-foreground transition-transform duration-200 hover:scale-[1.03]"
              >
                Launch Security Lab
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center rounded-xl border border-border px-6 py-3 font-medium text-muted-foreground transition-colors hover:border-cyber-cyan/50 hover:text-foreground"
              >
                Explore capabilities
              </a>
            </div>
          </section>

          <section id="features" className="pb-24">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f, i) => (
                <article
                  key={f.title}
                  className="glass animate-rise group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyber-cyan/40"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-secondary transition-colors group-hover:bg-cyber-cyan/15">
                    <f.icon className="h-5 w-5 text-cyber-cyan" />
                  </span>
                  <h2 className="mt-4 text-lg font-semibold">{f.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                </article>
              ))}
            </div>
          </section>
        </main>

        <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
          Cipher Sense · Generation and analysis run locally. Passwords are never stored or transmitted.
        </footer>
      </div>
    </>
  );
}
