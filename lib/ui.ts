/* Labels, copy and small helpers shared by the app and the showcase (ported from the prototype). */
import type { Kind, TabKey } from "./season";

export type GlyphKey = "solid" | "half" | "ring" | "strike";

export const ST: Record<Kind, readonly [string, GlyphKey]> = {
  peak: ["In season", "solid"],
  new: ["Just arrived", "solid"],
  last: ["Last month", "half"],
  soon: ["Next month", "ring"],
  away: ["Not local", "strike"],
  off: ["Out of season", "strike"],
};

export const TABS: ReadonlyArray<{ k: TabKey; label: string; g: GlyphKey; h: readonly [string, string] }> = [
  { k: "now", label: "In season", g: "solid", h: ["In season", "near you."] },
  { k: "ending", label: "Ending", g: "half", h: ["Ending", "this month."] },
  { k: "next", label: "Next month", g: "ring", h: ["Coming", "next month."] },
  { k: "around", label: "Not local", g: "strike", h: ["Brought in", "from far."] },
];

/** [status class, glyph, title, text] */
export const LEGEND: ReadonlyArray<readonly [string, GlyphKey, string, string]> = [
  ["peak", "solid", "In season", "Peak time. Cheapest and best. The first weeks say “Just arrived”: freshest, a little pricier."],
  ["last", "half", "Last month", "Its season ends here. Buy it now."],
  ["soon", "ring", "Next month", "Arrives soon. Worth waiting for."],
  ["away", "strike", "Not local", "Grown in other states and trucked in. Costs more, less fresh."],
];

export const LEGEND_NOTE = "Seasons go by climate zone, so hills and plains in one state can differ by a few weeks.";

/** This month in India. Same answer on the server and in the browser, so the first render matches. */
export function nowMonth(d: Date = new Date()): number {
  try {
    return Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Kolkata", month: "numeric" }).format(d));
  } catch {
    return d.getMonth() + 1;
  }
}

export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");
export const plural = (n: number, one: string, many: string) => n + (n === 1 ? " " + one : " " + many);
