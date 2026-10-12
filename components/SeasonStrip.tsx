import { MN, type Item, type ZoneKey } from "@/lib/data";
import { seasonOf } from "@/lib/season";
import { cx } from "@/lib/ui";

/** 12 little boxes: filled = in season, ringed = the picked month, dot (big strip) = this month. */
export default function SeasonStrip({
  it,
  zone,
  month,
  now,
  big = false,
}: {
  it: Item;
  zone: ZoneKey;
  month: number | null;
  now: number;
  big?: boolean;
}) {
  const s = seasonOf(it, zone);
  return (
    <span className={big ? "ybig" : "yr"} aria-hidden="true">
      {MN.map((m, i) => (
        <i key={m} className={cx(s.set.has(i + 1) && "on", i + 1 === month && "sel", i + 1 === now && "now") || undefined}>
          {big ? m[0] : null}
        </i>
      ))}
    </span>
  );
}
