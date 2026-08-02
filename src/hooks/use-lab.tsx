import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

export type LogEntry = { id: string; at: string; level: "info" | "ok" | "warn"; message: string };
export type HistoryItem = { id: string; value: string; kind: "password" | "passphrase"; at: number };

const HISTORY_KEY = "cipher-sense/history";
const CLIPBOARD_TTL = 30;

type LabContext = {
  log: LogEntry[];
  pushLog: (message: string, level?: LogEntry["level"]) => void;
  clearLog: () => void;
  history: HistoryItem[];
  addHistory: (value: string, kind: HistoryItem["kind"]) => void;
  clearHistory: () => void;
  copy: (value: string, label?: string) => Promise<void>;
  clipboardCountdown: number | null;
};

const Ctx = createContext<LabContext | null>(null);

function nowStamp() {
  return new Date().toLocaleTimeString("en-GB", { hour12: false });
}

export function LabProvider({ children }: { children: ReactNode }) {
  const [log, setLog] = useState<LogEntry[]>([
    { id: "boot", at: nowStamp(), level: "ok", message: "Local security lab initialised — no data leaves this device." },
  ]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [clipboardCountdown, setClipboardCountdown] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw) as HistoryItem[]);
    } catch {
      /* ignore */
    }
  }, []);

  const pushLog = useCallback((message: string, level: LogEntry["level"] = "info") => {
    setLog((prev) => [{ id: crypto.randomUUID(), at: nowStamp(), level, message }, ...prev].slice(0, 60));
  }, []);

  const persist = useCallback((items: HistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, []);

  const addHistory = useCallback(
    (value: string, kind: HistoryItem["kind"]) => {
      setHistory((prev) => {
        const next = [{ id: crypto.randomUUID(), value, kind, at: Date.now() }, ...prev].slice(0, 20);
        try {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        } catch {
          /* storage unavailable */
        }
        return next;
      });
    },
    [],
  );

  const clearHistory = useCallback(() => {
    persist([]);
    pushLog("Local history wiped.", "warn");
  }, [persist, pushLog]);

  const copy = useCallback(
    async (value: string, label = "Secret") => {
      try {
        await navigator.clipboard.writeText(value);
        toast.success(`${label} copied`, { description: `Clipboard clears in ${CLIPBOARD_TTL}s.` });
        pushLog(`${label} copied to clipboard (auto-clear armed).`, "ok");
        if (timerRef.current) clearInterval(timerRef.current);
        setClipboardCountdown(CLIPBOARD_TTL);
        timerRef.current = setInterval(() => {
          setClipboardCountdown((c) => {
            if (c === null) return null;
            if (c <= 1) {
              if (timerRef.current) clearInterval(timerRef.current);
              navigator.clipboard.writeText("").catch(() => undefined);
              pushLog("Clipboard cleared automatically.", "warn");
              return null;
            }
            return c - 1;
          });
        }, 1000);
      } catch {
        toast.error("Clipboard unavailable in this browser");
      }
    },
    [pushLog],
  );

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const value = useMemo(
    () => ({ log, pushLog, clearLog: () => setLog([]), history, addHistory, clearHistory, copy, clipboardCountdown }),
    [log, pushLog, history, addHistory, clearHistory, copy, clipboardCountdown],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLab(): LabContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLab must be used inside LabProvider");
  return ctx;
}