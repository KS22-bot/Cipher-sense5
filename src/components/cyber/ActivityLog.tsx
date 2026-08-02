import { useState } from "react";
import { Download, Terminal, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLab } from "@/hooks/use-lab";
import { toast } from "sonner";

async function encryptToFile(items: string[], passphrase: string): Promise<Blob> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const baseKey = await crypto.subtle.importKey("raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 250000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(items.join("\n")));
  const b64 = (b: ArrayBuffer | Uint8Array) =>
    btoa(String.fromCharCode(...new Uint8Array(b as ArrayBuffer)));
  const payload = [
    "CIPHER-SENSE ENCRYPTED EXPORT v1",
    "alg: AES-256-GCM / PBKDF2-SHA256 250k",
    `salt: ${b64(salt)}`,
    `iv: ${b64(iv)}`,
    `data: ${b64(cipher)}`,
  ].join("\n");
  return new Blob([payload], { type: "text/plain" });
}

export function ActivityLog() {
  const { log, clearLog, clipboardCountdown, history } = useLab();
  const [passphrase, setPassphrase] = useState("");
  const [busy, setBusy] = useState(false);

  const exportVault = async () => {
    if (!history.length) {
      toast.error("Nothing to export yet");
      return;
    }
    if (passphrase.length < 8) {
      toast.error("Use an export passphrase of at least 8 characters");
      return;
    }
    setBusy(true);
    try {
      const blob = await encryptToFile(history.map((h) => h.value), passphrase);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cipher-sense-export.txt";
      a.click();
      URL.revokeObjectURL(url);
      setPassphrase("");
      toast.success("Encrypted export downloaded");
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside className="space-y-4">
      {clipboardCountdown !== null && (
        <div className="animate-rise glass flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm">
          <Timer className="h-4 w-4 shrink-0 text-cyber-violet" />
          <span className="min-w-0 truncate text-muted-foreground">
            Clipboard clears in <span className="font-mono text-cyber-violet">{clipboardCountdown}s</span>
          </span>
        </div>
      )}

      <div className="glass rounded-2xl p-4">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <h3 className="flex min-w-0 items-center gap-2 text-sm font-semibold">
            <Terminal className="h-4 w-4 shrink-0 text-cyber-emerald" />
            <span className="truncate">Activity log</span>
          </h3>
          <button onClick={clearLog} className="shrink-0 text-xs text-muted-foreground hover:text-foreground">
            clear
          </button>
        </div>
        <div className="mt-3 max-h-64 space-y-1.5 overflow-y-auto rounded-lg bg-background/70 p-3 font-mono text-xs">
          {log.length === 0 && <p className="text-muted-foreground">no events</p>}
          {log.map((e) => (
            <p key={e.id} className="animate-rise break-words">
              <span className="text-muted-foreground">{e.at} </span>
              <span className={e.level === "ok" ? "text-cyber-emerald" : e.level === "warn" ? "text-cyber-violet" : "text-cyber-cyan"}>
                {e.message}
              </span>
            </p>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Local actions only — secret values are never logged.</p>
      </div>

      <div className="glass rounded-2xl p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Download className="h-4 w-4 shrink-0 text-cyber-cyan" />
          Encrypted export
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Export local history as an AES-256-GCM encrypted text file.
        </p>
        <Input
          type="password"
          className="mt-3"
          placeholder="Export passphrase"
          value={passphrase}
          autoComplete="new-password"
          onChange={(e) => setPassphrase(e.target.value)}
        />
        <Button variant="secondary" size="sm" className="mt-2 w-full" disabled={busy} onClick={exportVault}>
          Download encrypted file
        </Button>
      </div>
    </aside>
  );
}