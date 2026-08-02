import { useCallback, useEffect, useState } from "react";
import { Copy, RefreshCw, Sparkles, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { GlassCard } from "./GlassCard";
import { SecretField } from "./SecretField";
import { OptionToggle } from "./OptionToggle";
import { useLab } from "@/hooks/use-lab";
import {
  defaultPassphraseOptions,
  formatCrackTime,
  generatePassphrase,
  passphraseEntropy,
  type PassphraseOptions,
} from "@/lib/password";

const SEPARATORS = [
  { value: "-", label: "hyphen" },
  { value: ".", label: "dot" },
  { value: "_", label: "underscore" },
  { value: " ", label: "space" },
  { value: "", label: "none" },
];

export function PassphrasePanel() {
  const [options, setOptions] = useState<PassphraseOptions>(defaultPassphraseOptions);
  const [value, setValue] = useState("");
  const { copy, addHistory, pushLog } = useLab();

  const set = <K extends keyof PassphraseOptions>(k: K, v: PassphraseOptions[K]) =>
    setOptions((o) => ({ ...o, [k]: v }));

  const run = useCallback(
    (silent = false) => {
      const p = generatePassphrase(options);
      setValue(p);
      addHistory(p, "passphrase");
      if (!silent) pushLog(`Generated ${options.words}-word passphrase locally.`, "ok");
    },
    [options, addHistory, pushLog],
  );

  useEffect(() => {
    run(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bits = passphraseEntropy(options);
  const crack = formatCrackTime(Math.pow(2, bits) / 2 / 1e11);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <GlassCard
        title="Passphrase Generator"
        description="Memorable by design, brutal to brute-force."
        icon={<Type className="h-4 w-4 shrink-0 text-cyber-emerald" />}
      >
        <div className="glow-cyan min-h-24 rounded-xl bg-background/70 p-4">
          <SecretField value={value} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => run()} className="gap-2">
            <Sparkles className="h-4 w-4" /> Generate
          </Button>
          <Button variant="secondary" onClick={() => run()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Regenerate
          </Button>
          <Button variant="outline" onClick={() => value && copy(value, "Passphrase")} className="gap-2">
            <Copy className="h-4 w-4" /> Copy
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Entropy" value={`${bits} bits`} />
          <Metric label="Words" value={String(options.words)} />
          <Metric label="Crack time" value={crack} />
        </div>
      </GlassCard>

      <GlassCard title="Phrase rules" delay={60}>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <label htmlFor="words" className="min-w-0 text-sm font-medium">Number of words</label>
          <span className="shrink-0 font-mono text-lg text-cyber-emerald">{options.words}</span>
        </div>
        <Slider id="words" className="mt-3" min={3} max={12} step={1} value={[options.words]} onValueChange={([v]) => set("words", v ?? 5)} />

        <p className="mb-2 mt-6 text-sm font-medium">Separator</p>
        <div className="flex flex-wrap gap-2">
          {SEPARATORS.map((s) => (
            <button
              key={s.label}
              onClick={() => set("separator", s.value)}
              className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                options.separator === s.value
                  ? "border-cyber-cyan/60 bg-cyber-cyan/15 text-cyber-cyan"
                  : "border-border bg-secondary/40 text-muted-foreground hover:border-cyber-cyan/40"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-2.5">
          <OptionToggle id="cap" label="Capitalisation" hint="Capitalise each word" checked={options.capitalize} onChange={(v) => set("capitalize", v)} />
          <OptionToggle id="pnum" label="Include numbers" checked={options.numbers} onChange={(v) => set("numbers", v)} />
          <OptionToggle id="psym" label="Include symbols" checked={options.symbols} onChange={(v) => set("symbols", v)} />
        </div>
      </GlassCard>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-border/60 bg-secondary/40 px-3 py-2">
      <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="break-words font-mono text-sm">{value}</p>
    </div>
  );
}