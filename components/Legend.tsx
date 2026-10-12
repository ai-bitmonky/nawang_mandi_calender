"use client";
import { useEffect, useRef } from "react";
import StatusGlyph from "./StatusGlyph";
import { LEGEND, LEGEND_NOTE } from "@/lib/ui";

/** "How to read it" sheet. Esc or a tap outside closes it; focus stays on the close button while open. */
export default function Legend({ open, onClose }: { open: boolean; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    close.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "Tab") {
        e.preventDefault(); /* the close button is the only control in the sheet */
        close.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legendTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sheet">
        <button className="close" ref={close} type="button" aria-label="Close" onClick={onClose}>
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2 2l8 8M10 2l-8 8" />
          </svg>
        </button>
        <h2 id="legendTitle">How to read it</h2>
        <div>
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
        <p className="foot-note">{LEGEND_NOTE}</p>
      </div>
    </div>
  );
}
