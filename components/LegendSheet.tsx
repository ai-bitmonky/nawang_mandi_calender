"use client";
import Sheet from "./Sheet";
import StatusGlyph from "./StatusGlyph";
import { Appearance } from "./ThemeToggle";
import { LEGEND, LEGEND_NOTE } from "@/lib/ui";

/** Phone version of "How to read it": the four signs, then Appearance in the footer. */
export default function LegendSheet({ embed, onClosed }: { embed: boolean; onClosed: () => void }) {
  return (
    <Sheet title="How to read it" labelId="legendSheetTitle" embed={embed} onClosed={onClosed} footer={<Appearance embed={embed} />}>
      {() => (
        <>
          <div className="ml-card">
            {LEGEND.map(([st, g, b, t]) => (
              <div key={st} className={"lrow st-" + st}>
                <StatusGlyph k={g} />
                <div>
                  <b>{b}</b>
                  <span>{t}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="ml-note">{LEGEND_NOTE}</p>
        </>
      )}
    </Sheet>
  );
}
