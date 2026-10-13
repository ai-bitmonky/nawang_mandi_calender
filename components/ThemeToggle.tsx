"use client";
import { useSyncExternalStore } from "react";
import { THEME_KEY, store } from "@/lib/appState";
import { postTheme } from "@/lib/embed";

export type Theme = "light" | "dark";

function current(): Theme {
  const t = document.documentElement.dataset.theme;
  if (t === "light" || t === "dark") return t;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function subscribe(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  return () => {
    mo.disconnect();
    mq.removeEventListener("change", cb);
  };
}
/** Live theme, following data-theme on <html> (set by the inline script, this toggle, or the showcase). */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, current, () => "light");
}

export function setTheme(t: Theme, key: string | null | undefined) {
  document.documentElement.dataset.theme = t;
  if (key) store.set(key, t);
}

/** Sun / moon button. Saves the choice per browser, or reports it (onChange). */
export default function ThemeToggle({
  className = "info theme",
  storageKey = THEME_KEY,
  onChange,
}: {
  className?: string;
  /** null: do not remember (inside the showcase frames the page remembers) */
  storageKey?: string | null;
  onChange?: (t: Theme) => void;
}) {
  const theme = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      className={className}
      aria-label={dark ? "Light mode" : "Dark mode"}
      aria-pressed={dark}
      onClick={() => {
        const next: Theme = dark ? "light" : "dark";
        setTheme(next, storageKey);
        onChange?.(next);
      }}
    >
      <svg className="sun" viewBox="0 0 18 18" aria-hidden="true">
        <circle cx="9" cy="9" r="3.4" />
        <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M3.7 14.3l1.4-1.4M12.9 5.1l1.4-1.4" />
      </svg>
      <svg className="moon" viewBox="0 0 18 18" aria-hidden="true">
        <path d="M14.8 11.2A6.5 6.5 0 0 1 6.8 3.2a6.5 6.5 0 1 0 8 8z" />
      </svg>
    </button>
  );
}

/* ---------- phone: "Appearance: Light · Dark · Auto" in the help sheet ---------- */
export type ThemeChoice = Theme | "auto";

function currentChoice(): ThemeChoice {
  const t = document.documentElement.dataset.theme;
  return t === "light" || t === "dark" ? t : "auto";
}
/** What the user picked: a fixed theme, or Auto (follow the phone). */
export function useThemeChoice(): ThemeChoice {
  return useSyncExternalStore(subscribe, currentChoice, () => "auto");
}

const CHOICES: ReadonlyArray<readonly [ThemeChoice, string]> = [
  ["light", "Light"],
  ["dark", "Dark"],
  ["auto", "Auto"],
];

/** Segmented control. Inside the showcase frames the page owns the theme, so there is no Auto and the pick is reported. */
export function Appearance({ embed }: { embed: boolean }) {
  const choice = useThemeChoice();
  const pick = (c: ThemeChoice) => {
    if (c === "auto") {
      delete document.documentElement.dataset.theme;
      store.del(THEME_KEY);
      return;
    }
    setTheme(c, embed ? null : THEME_KEY);
    if (embed) postTheme(c);
  };
  return (
    <div className="appear">
      <span id="appearLabel">Appearance</span>
      <div className="seg" role="radiogroup" aria-labelledby="appearLabel">
        {CHOICES.filter(([c]) => !embed || c !== "auto").map(([c, label]) => (
          <button key={c} type="button" role="radio" aria-checked={choice === c} onClick={() => choice !== c && pick(c)}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
