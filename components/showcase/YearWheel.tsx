"use client";
import { useRef, useState } from "react";
import { MFULL, MN, ZONES } from "@/lib/data";
import { buckets, listOf, type TabKey } from "@/lib/season";
import { cx } from "@/lib/ui";
import { CH } from "./types";

const C = 220, RO = 214, RI = 166;
const pt = (r: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180;
  return [C + r * Math.sin(a), C - r * Math.cos(a)];
};
const f1 = (n: number) => n.toFixed(2);
function arc(r1: number, r2: number, a1: number, a2: number) {
  const [x1, y1] = pt(r2, a1), [x2, y2] = pt(r2, a2), [x3, y3] = pt(r1, a2), [x4, y4] = pt(r1, a1);
  return "M" + f1(x1) + " " + f1(y1) + "A" + r2 + " " + r2 + " 0 0 1 " + f1(x2) + " " + f1(y2) + "L" + f1(x3) + " " + f1(y3) + "A" + r1 + " " + r1 + " 0 0 0 " + f1(x4) + " " + f1(y4) + "Z";
}

/** The year as a ring: tap or drag to pick a month; bars show how many items are on the open list each month. */
export default function YearWheel({ city, month, tab, now, onMonth }: { city: string; month: number; tab: TabKey; now: number; onMonth: (m: number) => void }) {
  const ref = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState(false);
  const setMonth = (m: number) => {
    m = ((m - 1 + 12) % 12) + 1;
    if (m !== month) onMonth(m);
  };
  const monthAt = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect(), k = 440 / r.width;
    const dx = (e.clientX - r.left) * k - C, dy = (e.clientY - r.top) * k - C;
    if (Math.hypot(dx, dy) < 92) return 0;
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    if (deg < 0) deg += 360;
    return (Math.round(deg / 30) % 12) + 1;
  };

  const counts: number[] = [];
  for (let m = 1; m <= 12; m++) counts.push(listOf(buckets(city, m), tab).length);
  const max = Math.max(1, ...counts);
  const B = buckets(city, month), n = listOf(B, tab).length, ch = CH.find((c) => c.k === tab) || CH[0];
  const [t1, t2] = [pt(RO + 2, now * 30 - 30), pt(RO + 13, now * 30 - 30)];

  return (
    <svg
      ref={ref}
      className={cx("wheel", drag && "drag")}
      viewBox="0 0 440 440"
      role="slider"
      tabIndex={0}
      aria-label="Month"
      aria-valuemin={1}
      aria-valuemax={12}
      aria-valuenow={month}
      aria-valuetext={MFULL[month - 1] + ", " + n + " items " + ch.t.toLowerCase()}
      onPointerDown={(e) => {
        const m = monthAt(e);
        if (!m) return;
        setDrag(true);
        try {
          ref.current?.setPointerCapture(e.pointerId);
        } catch {
          /* older browsers */
        }
        setMonth(m);
        e.preventDefault();
      }}
      onPointerMove={(e) => {
        if (!drag) return;
        const m = monthAt(e);
        if (m) setMonth(m);
      }}
      onPointerUp={() => setDrag(false)}
      onPointerCancel={() => setDrag(false)}
      onKeyDown={(e) => {
        const d = ({ ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 3, PageDown: -3 } as Record<string, number>)[e.key];
        if (d) {
          setMonth(month + d);
          e.preventDefault();
        } else if (e.key === "Home") {
          setMonth(1);
          e.preventDefault();
        } else if (e.key === "End") {
          setMonth(12);
          e.preventDefault();
        }
      }}
    >
      <circle className="ring-focus" cx="220" cy="220" r={RO + 3} />
      {MN.map((m, i) => {
        const a = i * 30, [tx, ty] = pt((RO + RI) / 2, a);
        return (
          <g key={m} className={cx("seg", i + 1 === now && "now", i + 1 === month && "on")}>
            <path d={arc(RI, RO, a - 15, a + 15)} style={{ touchAction: "none" }} />
            <text x={f1(tx)} y={f1(ty)}>
              {m.toUpperCase()}
            </text>
          </g>
        );
      })}
      <line className="tick" x1={f1(t1[0])} y1={f1(t1[1])} x2={f1(t2[0])} y2={f1(t2[1])} />
      <g>
        {counts.map((c, i) => {
          const a = i * 30, on = i + 1 === month, len = 3 + (42 * c) / max, [x, y] = pt(154, a);
          return (
            <g key={i}>
              <path className={cx("bar", on && "on")} d={arc(98, 98 + len, a - 8, a + 8)} />
              <text className={cx("bar-n", on && "on")} x={f1(x)} y={f1(y)}>
                {c}
              </text>
            </g>
          );
        })}
      </g>
      <text className="wc-z" x="220" y="184">
        {ZONES[B.zone]}
      </text>
      <text className="wc-m" x="220" y="230">
        {MFULL[month - 1]}
      </text>
      <text className="wc-s" x="220" y="258">
        {n + " · " + ch.t.toLowerCase()}
      </text>
    </svg>
  );
}
