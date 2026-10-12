"use client";
import Art from "../Art";
import StatusGlyph from "../StatusGlyph";
import { MFULL, ZONES, type Item } from "@/lib/data";
import { listOf, type Buckets, type TabKey } from "@/lib/season";
import { CH } from "./types";

const UpIcon = () => (
  <svg viewBox="0 0 14 14" aria-hidden="true">
    <path d="M7 12V2M3 6l4-4 4 4" />
  </svg>
);
const MAX = 11;

/** The four lists as chapters: tap one to open it on both screens; tap a thumbnail to open its recipes. */
export default function Chapters({
  B,
  tab,
  month,
  ready,
  onTab,
  onItem,
}: {
  B: Buckets;
  tab: TabKey;
  month: number;
  ready: boolean;
  onTab: (k: TabKey) => void;
  onItem: (n: string) => void;
}) {
  return (
    <ol className="chs rv">
      {CH.map((c, i) => {
        const rows = ready ? listOf(B, c.k) : [];
        const on = tab === c.k;
        let cap = c.cap;
        if (c.k === "around" && ready) {
          const z = new Set<string>();
          B.away.forEach((a) => a.from.forEach((k) => z.add(ZONES[k])));
          const zs = [...z];
          cap = zs.length ? "This month they come from " + (zs.length > 1 ? zs.slice(0, -1).join(", ") + " and " + zs[zs.length - 1] : zs[0]) + "." : "Nothing is being shipped in this month.";
        }
        const list: Item[] = rows.map((r) => r.it).sort((a, b) => a.n.localeCompare(b.n));
        return (
          <li key={c.k} className={"ch st-" + c.k} data-on={String(on)}>
            <button className="ch-btn" type="button" aria-expanded={on} aria-controls={"chb-" + c.k} onClick={() => onTab(c.k)}>
              <span className="ch-num">0{i + 1}</span>
              <span className="ch-t">
                <StatusGlyph k={c.g} />
                {c.t}
              </span>
              <span className="ch-c">
                <span>{ready ? rows.length : "\u00a0"}</span>
                <small>{rows.length === 1 ? "item" : "items"}</small>
              </span>
            </button>
            <div className="ch-body" id={"chb-" + c.k}>
              <div className="ch-in">
                <div className="ch-grid">
                  <p className="ch-tag">{c.tag}</p>
                  <p className="ch-cap">{cap}</p>
                  <div className="ch-go">
                    <a className="up" href="#stage">
                      <UpIcon />
                      See it on both screens
                    </a>
                  </div>
                  {on &&
                    ready &&
                    (!rows.length ? (
                      <p className="ch-empty">Nothing on this list in {MFULL[month - 1]}.</p>
                    ) : (
                      <div className="thumbs">
                        {list.slice(0, MAX).map((it) => (
                          <button key={it.n} type="button" className="th" aria-label={"Open recipes for " + it.n} onClick={() => onItem(it.n)}>
                            <Art it={it} as="span" />
                            <span>{it.n}</span>
                          </button>
                        ))}
                        {list.length > MAX && (
                          <span className="th more">
                            +{list.length - MAX} more
                            <br />
                            in the app
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
