import { useCallback, useEffect, useState } from "react";
import { Copy, KeyRound, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { GlassCard } from "./GlassCard";
import { SecretField } from "./SecretField";
import { OptionToggle } from "./OptionToggle";
import { StrengthMeter } from "./StrengthMeter";
import { useLab } from "@/hooks/use-lab";
import { analyzePassword, defaultGeneratorOptions, generatePassword, type GeneratorOptions } from "@/lib/password";

export function GeneratorPanel() {
  const [options, setOptions] = useState<GeneratorOptions>(defaultGeneratorOptions);
  const [value, setValue] = useState("");
  const { copy, addHistory, pushLog, history, clearHistory } = useLab();

  const set = <K extends keyof GeneratorOptions>(key: K, v: GeneratorOptions[K]) =>
    setOptions((o) => ({ ...o, [key]: v }));

  const run = useCallback(
    (silent = false) => {
      const pw = generatePassword(options);
      setValue(pw);
      addHistory(pw, "password");
      if (!silent) pushLog(`Generated ${pw.length}-character password locally.`, "ok");
    },
    [options, addHistory, pushLog],
  );

  useEffect(() => {
    run(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "g") {
        e.preventDefault();
        run();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        if (value) void copy(value, "Password");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run, copy, value]);

  const analysis = analyzePassword(value);

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div className="space-y-6">
        <GlassCard title="Password Generator" description="Cryptographically random, generated on this device." icon={<KeyRound className="h-4 w-4 shrink-0 text-cyber-cyan" />}>
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
            <Button variant="outline" onClick={() => value && copy(value, "Password")} className="gap-2">
              <Copy className="h-4 w-4" /> Copy
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Shortcuts: <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono">⌘/Ctrl+G</kbd> generate ·{" "}
            <kbd className="rounded bg-secondary px-1.5 py-0.5 font-mono">⌘/Ctrl+Shift+C</kbd> copy
          </p>

          <div className="mt-5">
            <StrengthMeter analysis={analysis} />
          </div>
        </GlassCard>

        <GlassCard title="Local history" description="Kept in your browser only. Never transmitted." delay={80}>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No secrets generated yet.</p>
          ) : (
            <ul className="space-y-2">
              {history.slice(0, 8).map((h) => (
                <li key={h.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg bg-secondary/40 px-3 py-2">
                  <span className="min-w-0 truncate font-mono text-xs text-muted-foreground">{h.value}</span>
                  <Button size="sm" variant="ghost" className="shrink-0" onClick={() => copy(h.value, "Secret")}>
                    <Copy className="h-3.5 w-3.5" />
                    <span className="sr-only">Copy</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
          {history.length > 0 && (
            <Button variant="ghost" size="sm" className="mt-3 gap-2 text-destructive" onClick={clearHistory}>
              <Trash2 className="h-3.5 w-3.5" /> Wipe history
            </Button>
          )}
        </GlassCard>
      </div>

      <GlassCard title="Composition rules" description="Tune the entropy source." delay={40}>
        <div className="mb-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <label htmlFor="length" className="min-w-0 text-sm font-medium">
              Length
            </label>
            <span className="shrink-0 font-mono text-lg text-cyber-cyan">{options.length}</span>
          </div>
          <Slider
            id="length"
            className="mt-3"
            min={6}
            max={64}
            step={1}
            value={[options.length]}
            onValueChange={([v]) => set("length", v ?? 20)}
          />
        </div>

        <div className="grid gap-2.5">
          <OptionToggle id="upper" label="Uppercase letters" hint="A–Z" checked={options.uppercase} onChange={(v) => set("uppercase", v)} />
          <OptionToggle id="lower" label="Lowercase letters" hint="a–z" checked={options.lowercase} onChange={(v) => set("lowercase", v)} />
          <OptionToggle id="nums" label="Numbers" hint="0–9" checked={options.numbers} onChange={(v) => set("numbers", v)} />
          <OptionToggle id="syms" label="Symbols" hint="!@#$%^&*" checked={options.symbols} onChange={(v) => set("symbols", v)} />
          <OptionToggle id="amb" label="Exclude ambiguous characters" hint="No O/0, l/1, quotes" checked={options.excludeAmbiguous} onChange={(v) => set("excludeAmbiguous", v)} />
          <OptionToggle id="rep" label="Avoid repeated characters" hint="Each character used once" checked={options.avoidRepeats} onChange={(v) => set("avoidRepeats", v)} />
          <OptionToggle id="easy" label="Easy-to-read mode" hint="Optimised for typing from screen" checked={options.easyRead} onChange={(v) => set("easyRead", v)} />
        </div>
      </GlassCard>
    </div>
  );
}