import { Switch } from "@/components/ui/switch";

export function OptionToggle({
  id,
  label,
  hint,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/60 bg-secondary/40 px-3.5 py-2.5 transition-colors hover:border-cyber-cyan/40">
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} className="shrink-0" />
    </div>
  );
}