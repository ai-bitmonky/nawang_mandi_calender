"use client";
import { useSyncExternalStore } from "react";
import { THEME_KEY, store } from "@/lib/appState";

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
