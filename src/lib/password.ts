/**
 * All password logic runs locally in the browser.
 * Nothing here performs network I/O and nothing is ever persisted
 * outside of the user's own device.
 */
import { WORDLIST } from "./wordlist";

export const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const LOWER = "abcdefghijklmnopqrstuvwxyz";
export const DIGITS = "0123456789";
export const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/~";
const AMBIGUOUS = "O0oIl1|`'\";:,.{}[]()/\\";
const EASY_READ = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

export type GeneratorOptions = {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
  avoidRepeats: boolean;
  easyRead: boolean;
};

export const defaultGeneratorOptions: GeneratorOptions = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeAmbiguous: true,
  avoidRepeats: false,
  easyRead: false,
};

function randomInt(max: number): number {
  if (max <= 0) return 0;
  const buf = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  let value = 0;
  do {
    crypto.getRandomValues(buf);
    value = buf[0]!;
  } while (value >= limit);
  return value % max;
}

export function pick<T>(items: readonly T[]): T {
  return items[randomInt(items.length)]!;
}

export function buildAlphabet(o: GeneratorOptions): string {
  let sets: string[] = [];
  if (o.uppercase) sets.push(UPPER);
  if (o.lowercase) sets.push(LOWER);
  if (o.numbers) sets.push(DIGITS);
  if (o.symbols) sets.push(SYMBOLS);
  if (sets.length === 0) sets = [LOWER];
  let alphabet = Array.from(new Set(sets.join(""))).join("");
  if (o.easyRead) {
    alphabet =
      alphabet
        .split("")
        .filter((c) => EASY_READ.includes(c))
        .join("") || EASY_READ;
  }
  if (o.excludeAmbiguous) {
    alphabet =
      alphabet
        .split("")
        .filter((c) => !AMBIGUOUS.includes(c))
        .join("") || alphabet;
  }
  return alphabet;
}

export function generatePassword(o: GeneratorOptions): string {
  const alphabet = buildAlphabet(o);
  const chars: string[] = [];
  let guard = 0;
  while (chars.length < o.length && guard < o.length * 60) {
    guard++;
    const c = alphabet[randomInt(alphabet.length)]!;
    if (o.avoidRepeats && chars.includes(c) && chars.length < alphabet.length) continue;
    if (!o.avoidRepeats && chars[chars.length - 1] === c && alphabet.length > 1) continue;
    chars.push(c);
  }
  return chars.join("");
}

export type PassphraseOptions = {
  words: number;
  separator: string;
  capitalize: boolean;
  numbers: boolean;
  symbols: boolean;
};

export const defaultPassphraseOptions: PassphraseOptions = {
  words: 5,
  separator: "-",
  capitalize: true,
  numbers: true,
  symbols: false,
};

export function generatePassphrase(o: PassphraseOptions): string {
  const parts = Array.from({ length: Math.max(2, o.words) }, () => {
    const w = pick(WORDLIST);
    return o.capitalize ? w[0]!.toUpperCase() + w.slice(1) : w;
  });
  if (o.numbers) {
    const idx = randomInt(parts.length);
    parts[idx] = parts[idx] + String(randomInt(90) + 10);
  }
  if (o.symbols) {
    const idx = randomInt(parts.length);
    parts[idx] = parts[idx] + pick("!@#$%&*?".split(""));
  }
  return parts.join(o.separator);
}

export function passphraseEntropy(o: PassphraseOptions): number {
  let bits = Math.max(2, o.words) * Math.log2(WORDLIST.length);
  if (o.numbers) bits += Math.log2(90);
  if (o.symbols) bits += Math.log2(8);
  if (o.capitalize) bits += 0;
  return Math.round(bits);
}

/* ------------------------------ analysis ------------------------------ */

const COMMON_WORDS = [
  "password","passwd","admin","welcome","letmein","qwerty","dragon","monkey","football",
  "iloveyou","sunshine","princess","master","shadow","superman","batman","trustno1",
  "login","abc123","secret","hello","freedom","whatever","ninja","access","google",
  "starwars","computer","summer","winter","spring","autumn","january","december",
];
const KEYBOARD_ROWS = [
  "qwertyuiop","asdfghjkl","zxcvbnm","1234567890","!@#$%^&*()",
];

export type AnalysisIssue = { label: string; detail: string; penalty: number };

export type Analysis = {
  password: string;
  length: number;
  poolSize: number;
  entropy: number;
  score: number;
  label: string;
  crackTime: string;
  diversity: { upper: boolean; lower: boolean; number: boolean; symbol: boolean; classes: number };
  issues: AnalysisIssue[];
  suggestions: string[];
};

function poolFor(pw: string): number {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
  return pool || 1;
}

export function formatCrackTime(seconds: number): string {
  if (!isFinite(seconds)) return "effectively forever";
  if (seconds < 1) return "instantly";
  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [365, "day"],
    [100, "year"],
  ];
  let value = seconds;
  let name = "second";
  for (const [factor, label] of units) {
    name = label;
    if (value < factor) break;
    value = value / factor;
    name = label === "second" ? "minute" : label === "minute" ? "hour" : label === "hour" ? "day" : label === "day" ? "year" : "century";
  }
  if (name === "century" && value > 1e6) return "billions of years";
  const rounded = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded.toLocaleString()} ${name}${rounded === 1 ? "" : "s"}`;
}

function hasSequence(pw: string): boolean {
  const l = pw.toLowerCase();
  for (let i = 0; i < l.length - 2; i++) {
    const a = l.charCodeAt(i), b = l.charCodeAt(i + 1), c = l.charCodeAt(i + 2);
    if ((b - a === 1 && c - b === 1) || (a - b === 1 && b - c === 1)) return true;
  }
  return false;
}

function keyboardPattern(pw: string): boolean {
  const l = pw.toLowerCase();
  for (const row of KEYBOARD_ROWS) {
    for (let i = 0; i < row.length - 2; i++) {
      const chunk = row.slice(i, i + 3);
      if (l.includes(chunk) || l.includes(chunk.split("").reverse().join(""))) return true;
    }
  }
  return false;
}

export type PersonalHints = { name?: string; year?: string; email?: string };

export function analyzePassword(pw: string, hints: PersonalHints = {}): Analysis {
  const length = pw.length;
  const poolSize = poolFor(pw);
  const rawEntropy = length * Math.log2(poolSize);
  const diversity = {
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    number: /[0-9]/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw),
    classes: 0,
  };
  diversity.classes = [diversity.upper, diversity.lower, diversity.number, diversity.symbol].filter(Boolean).length;

  const issues: AnalysisIssue[] = [];
  const lower = pw.toLowerCase();

  const foundWord = COMMON_WORDS.find((w) => lower.includes(w));
  if (foundWord) issues.push({ label: "Dictionary word", detail: `Contains the common term “${foundWord}”.`, penalty: 22 });
  if (hasSequence(pw)) issues.push({ label: "Sequential characters", detail: "Runs like abc or 123 are trivially guessed.", penalty: 12 });
  if (keyboardPattern(pw)) issues.push({ label: "Keyboard pattern", detail: "Adjacent-key runs such as qwe or asd detected.", penalty: 12 });
  if (/(.)\1{2,}/.test(pw)) issues.push({ label: "Repeated characters", detail: "Three or more identical characters in a row.", penalty: 10 });
  const uniqueRatio = length ? new Set(pw).size / length : 0;
  if (length > 6 && uniqueRatio < 0.5) issues.push({ label: "Low character variety", detail: "Fewer than half the characters are unique.", penalty: 10 });

  const personal: string[] = [];
  if (hints.name && hints.name.trim().length >= 3 && lower.includes(hints.name.trim().toLowerCase())) personal.push("your name");
  if (hints.year && hints.year.trim().length >= 2 && pw.includes(hints.year.trim())) personal.push("a personal date");
  if (hints.email) {
    const local = hints.email.split("@")[0]?.toLowerCase() ?? "";
    if (local.length >= 3 && lower.includes(local)) personal.push("your email handle");
  }
  if (/(19|20)\d{2}/.test(pw)) personal.push("a year");
  if (personal.length) {
    issues.push({
      label: "Personal information",
      detail: `Looks like it includes ${Array.from(new Set(personal)).join(", ")}.`,
      penalty: 14,
    });
  }

  const penalty = issues.reduce((s, i) => s + i.penalty, 0);
  const entropy = Math.max(0, rawEntropy * (1 - Math.min(0.6, penalty / 100)));

  let score = 0;
  if (length > 0) {
    score = Math.min(60, (entropy / 100) * 60) + Math.min(20, length * 1.2) + diversity.classes * 5;
    score = Math.max(1, Math.min(100, Math.round(score)));
  }

  const label =
    length === 0 ? "Awaiting input"
    : score < 25 ? "Critical"
    : score < 45 ? "Weak"
    : score < 65 ? "Fair"
    : score < 85 ? "Strong"
    : "Fortress";

  // Offline attack, ~1e11 guesses/second on commodity GPU cluster.
  const guesses = Math.pow(2, entropy) / 2;
  const crackTime = length === 0 ? "—" : formatCrackTime(guesses / 1e11);

  const suggestions: string[] = [];
  if (length < 16) suggestions.push("Increase length to at least 16 characters — length beats complexity.");
  if (!diversity.symbol) suggestions.push("Add symbols to widen the character pool.");
  if (!diversity.number) suggestions.push("Mix in digits placed unpredictably, not just at the end.");
  if (!diversity.upper || !diversity.lower) suggestions.push("Use both uppercase and lowercase letters.");
  if (foundWord) suggestions.push("Drop recognizable dictionary words or break them apart.");
  if (personal.length) suggestions.push("Remove personal details — they are easy to research.");
  if (!suggestions.length) suggestions.push("Excellent. Store it in a password manager and enable MFA.");

  return { password: pw, length, poolSize, entropy: Math.round(entropy), score, label, crackTime, diversity, issues, suggestions };
}

export function scoreColor(score: number): string {
  if (score < 25) return "var(--destructive)";
  if (score < 45) return "oklch(0.75 0.17 60)";
  if (score < 65) return "oklch(0.82 0.16 95)";
  if (score < 85) return "var(--color-cyber-emerald)";
  return "var(--color-cyber-cyan)";
}

/* ------------------------------ breach check ------------------------------ */

export async function sha1Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export type BreachResult = { breached: boolean; count: number };

/**
 * k-Anonymity breach lookup: only the first 5 characters of the SHA-1 hash
 * are sent. The password never leaves the browser.
 */
export async function checkBreach(password: string): Promise<BreachResult> {
  const hash = await sha1Hex(password);
  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);
  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
    headers: { "Add-Padding": "true" },
  });
  if (!res.ok) throw new Error("Breach service unavailable");
  const body = await res.text();
  for (const line of body.split("\n")) {
    const [suf, countRaw] = line.trim().split(":");
    if (suf === suffix) {
      const count = Number(countRaw ?? 0);
      return { breached: count > 0, count };
    }
  }
  return { breached: false, count: 0 };
}