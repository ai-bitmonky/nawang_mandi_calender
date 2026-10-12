"use client";
import { useEffect, useRef } from "react";
import { MFULL, MN } from "@/lib/data";
import { cx } from "@/lib/ui";

/** Twelve month pills. On a narrow screen the picked month scrolls to the middle. */
export default function MonthStrip({ month, now, onPick }: { month: number; now: number; onPick: (m: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  useEffect(() => {
    const ms = ref.current;
    const b = ms?.children[month - 1] as HTMLElement | undefined;
    const smooth = !first.current;
    first.current = false;
    if (!ms || !b || ms.scrollWidth <= ms.clientWidth) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const left = b.offsetLeft - ms.clientWidth / 2 + b.offsetWidth / 2;
    if (smooth) ms.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
    else requestAnimationFrame(() => ms.scrollTo({ left, behavior: "auto" }));
  }, [month]);
  return (
    <div className="months" ref={ref} role="group" aria-label="Month">
      {MN.map((m, i) => (
        <button
          key={m}
          type="button"
          className={cx(i + 1 === now && "is-now") || undefined}
          title={i + 1 === now ? "This month" : undefined}
          aria-label={MFULL[i]}
          aria-pressed={i + 1 === month}
          onClick={() => i + 1 !== month && onPick(i + 1)}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
