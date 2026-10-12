"use client";
import StatusGlyph from "./StatusGlyph";
import type { TabKey } from "@/lib/season";
import { TABS } from "@/lib/ui";

/** Four lists with counts. A bottom bar on phones, a row on wider screens (CSS only). */
export default function Tabs({ tab, counts, onPick }: { tab: TabKey; counts: Record<TabKey, number>; onPick: (t: TabKey) => void }) {
  return (
    <nav className="tabs" role="tablist" aria-label="Lists">
      {TABS.map((t) => (
        <button
          key={t.k}
          type="button"
          role="tab"
          id={"tab-" + t.k}
          aria-selected={tab === t.k}
          aria-controls="lists"
          className={"t-" + t.k}
          onClick={() => tab !== t.k && onPick(t.k)}
        >
          <StatusGlyph k={t.g} />
          <b>{counts[t.k]}</b>
          <span className="tl">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
