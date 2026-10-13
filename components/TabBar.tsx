"use client";
import type { TabKey } from "@/lib/season";
import { TABS, plural } from "@/lib/ui";

/* 24px line icons, one stroke style: leaf, hourglass, calendar with arrow, truck. */
const ICONS: Record<TabKey, React.ReactNode> = {
  now: (
    <>
      <path d="M5 19C5 10.5 10.5 5 19.5 4.5 19 13.5 13.5 19 5 19z" />
      <path d="M5 19l8.5-8.5" />
    </>
  ),
  ending: (
    <>
      <path d="M6.5 3.5h11M6.5 20.5h11" />
      <path d="M8 3.5v2.2c0 2.6 4 3.9 4 6.3s-4 3.7-4 6.3v2.2M16 3.5v2.2c0 2.6-4 3.9-4 6.3s4 3.7 4 6.3v2.2" />
      <path d="M9.6 18.4h4.8" />
    </>
  ),
  next: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 9.8h17M8 3v3.6M16 3v3.6" />
      <path d="M9 15.2h6M13 13l2.2 2.2L13 17.4" />
    </>
  ),
  around: (
    <>
      <path d="M2.5 6.5h11v10h-11z" />
      <path d="M13.5 9.5h4l3 3.4v3.6h-7" />
      <circle cx="6.5" cy="17.5" r="1.9" />
      <circle cx="16.8" cy="17.5" r="1.9" />
    </>
  ),
};

/** Phone tab bar: icon, label, count badge. Hidden on desktop (the list has its own row of tabs there). */
export default function TabBar({
  tab,
  counts,
  home,
  onPick,
}: {
  tab: TabKey;
  counts: Record<TabKey, number> | null;
  home: boolean;
  onPick: (t: TabKey) => void;
}) {
  return (
    <nav className="mtabs" aria-label="Lists">
      {TABS.map((t) => {
        const n = counts ? counts[t.k] : 0;
        return (
          <button
            key={t.k}
            type="button"
            className={"mtab t-" + t.k}
            data-on={counts && tab === t.k ? "" : undefined}
            aria-current={counts && home && tab === t.k ? "page" : undefined}
            aria-label={counts ? t.label + ", " + plural(n, "item", "items") : t.label}
            onClick={() => onPick(t.k)}
          >
            <span className="mic" aria-hidden="true">
              <svg viewBox="0 0 24 24">{ICONS[t.k]}</svg>
              {n ? <b className="badge">{n}</b> : null}
            </span>
            <span className="mlab" aria-hidden="true">
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
