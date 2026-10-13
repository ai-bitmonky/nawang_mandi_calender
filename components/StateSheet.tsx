"use client";
import { useState } from "react";
import Sheet from "./Sheet";
import { STATES, ZONES, type ZoneKey } from "@/lib/data";

const ZONE_ORDER = Object.keys(ZONES) as ZoneKey[];

/** "Your state": search as you type, states grouped by climate zone, the current one ticked. Tap = pick + close. */
export default function StateSheet({ city, embed, onPick, onClosed }: { city: string; embed: boolean; onPick: (c: string) => void; onClosed: () => void }) {
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const groups = ZONE_ORDER.map((z) => [z, STATES.filter(([n, k]) => k === z && n.toLowerCase().includes(needle)).map(([n]) => n)] as const).filter(
    ([, rows]) => rows.length,
  );
  return (
    <Sheet
      title="Your state"
      labelId="stateSheetTitle"
      embed={embed}
      onClosed={onClosed}
      top={
        <label className="ms-search">
          <svg viewBox="0 0 18 18" aria-hidden="true">
            <circle cx="7.8" cy="7.8" r="5.6" />
            <path d="M12 12l4.2 4.2" />
          </svg>
          <input
            type="search"
            enterKeyHint="search"
            placeholder="Search states"
            aria-label="Search states"
            autoComplete="off"
            spellCheck={false}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
      }
    >
      {(close) =>
        groups.length ? (
          groups.map(([z, rows]) => (
            <section key={z} aria-label={ZONES[z]}>
              <h3 className="ms-gh">{ZONES[z]}</h3>
              <div className="ms-card">
                {rows.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="ms-row"
                    aria-current={n === city ? "true" : undefined}
                    onClick={() => close(n === city ? undefined : () => onPick(n))}
                  >
                    <span>{n}</span>
                    {n === city ? (
                      <svg viewBox="0 0 18 18" aria-hidden="true">
                        <path d="M3.5 9.5l3.6 3.6 7.4-8" />
                      </svg>
                    ) : null}
                  </button>
                ))}
              </div>
            </section>
          ))
        ) : (
          <p className="ms-none">No state matches “{q.trim()}”.</p>
        )
      }
    </Sheet>
  );
}
