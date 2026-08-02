import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Info, KeyRound, Lightbulb, ScanSearch, Type } from "lucide-react";
import { CyberBackground } from "@/components/cyber/CyberBackground";
import { Logo } from "@/components/cyber/Logo";
import { GeneratorPanel } from "@/components/cyber/GeneratorPanel";
import { AnalyzerPanel } from "@/components/cyber/AnalyzerPanel";
import { PassphrasePanel } from "@/components/cyber/PassphrasePanel";
import { TipsPanel } from "@/components/cyber/TipsPanel";
import { AboutPanel } from "@/components/cyber/AboutPanel";
import { ActivityLog } from "@/components/cyber/ActivityLog";
import { LabProvider } from "@/hooks/use-lab";

export const Route = createFileRoute("/lab")({
  head: () => ({
    meta: [
      { title: "Security Lab — Cipher Sense" },
      { name: "description", content: "Generate passwords and passphrases, analyze strength and entropy, and run privacy-preserving breach checks — all locally in your browser." },
      { property: "og:title", content: "Security Lab — Cipher Sense" },
      { property: "og:description", content: "A local-first console for generating and auditing credentials." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LabPage,
});

const SECTIONS = [
  { id: "generator", label: "Password Generator", icon: KeyRound },
  { id: "analyzer", label: "Password Analyzer", icon: ScanSearch },
  { id: "passphrase", label: "Passphrase Generator", icon: Type },
  { id: "tips", label: "Security Tips", icon: Lightbulb },
  { id: "about", label: "About", icon: Info },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

function LabPage() {
  const [active, setActive] = useState<SectionId>("generator");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <LabProvider>
      <CyberBackground />
      <div className="min-h-screen">
        <header className="glass sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-none border-x-0 border-t-0 px-4 py-3 sm:px-6">
          <Link to="/" className="min-w-0">
            <Logo />
          </Link>
          <Link
            to="/"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-cyber-cyan/50 hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Home</span>
          </Link>
        </header>

        <div className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_300px]">
          <nav aria-label="Sections" className="glass h-fit rounded-2xl p-2 lg:sticky lg:top-24">
            <ul className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {SECTIONS.map((s) => {
                const isActive = s.id === active;
                return (
                  <li key={s.id} className="shrink-0 lg:shrink">
                    <button
                      onClick={() => setActive(s.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-sm transition-all ${
                        isActive
                          ? "bg-cyber-cyan/15 text-cyber-cyan shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-cyber-cyan)_35%,transparent)]"
                          : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                      }`}
                    >
                      <s.icon className="h-4 w-4 shrink-0" />
                      <span className="min-w-0 truncate">{s.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <main key={active} className="animate-rise min-w-0">
            {!mounted ? (
              <div className="glass grid h-64 place-items-center rounded-2xl">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-cyber-cyan/30 border-t-cyber-cyan" />
              </div>
            ) : (
              <>
                {active === "generator" && <GeneratorPanel />}
                {active === "analyzer" && <AnalyzerPanel />}
                {active === "passphrase" && <PassphrasePanel />}
                {active === "tips" && <TipsPanel />}
                {active === "about" && <AboutPanel />}
              </>
            )}
          </main>

          <div className="min-w-0 xl:sticky xl:top-24 xl:h-fit">
            <ActivityLog />
          </div>
        </div>
      </div>
    </LabProvider>
  );
}