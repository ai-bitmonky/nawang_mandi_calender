import type { TabKey } from "@/lib/season";
import type { GlyphKey } from "@/lib/ui";
import type { Buckets } from "@/lib/season";

export type ShowState = {
  city: string;
  month: number;
  tab: TabKey;
  view: "main" | "recipes";
  item: string | null;
  theme: "light" | "dark";
};

export type Chapter = { k: TabKey; g: GlyphKey; t: string; tag: string; cap: string | null; chip: string };

export const CH: ReadonlyArray<Chapter> = [
  { k: "now", g: "solid", t: "In season", tag: "Peak. Cheapest and best.", cap: "At harvest the mandi is full, so prices fall. This is the best time to buy.", chip: "In season" },
  { k: "ending", g: "half", t: "Ending", tag: "Last month to buy it fresh.", cap: "After this month it comes from cold stores or far away. Buy now.", chip: "Last month" },
  { k: "next", g: "ring", t: "Next month", tag: "Arrives soon. Worth waiting for.", cap: "The first crates cost more. Wait a few weeks for the best price.", chip: "Next month" },
  { k: "around", g: "strike", t: "Not local", tag: "Grown elsewhere, trucked in. Pricier, less fresh.", cap: null, chip: "Not local" },
];

/** [chapter key, glyph, title, text] — the legend as worded on the showcase */
export const LEG: ReadonlyArray<readonly [TabKey, GlyphKey, string, string]> = [
  ["now", "solid", "In season", "Peak time. Cheapest and best. The first weeks say “Just arrived”: freshest, a little pricier."],
  ["ending", "half", "Last month", "Its season ends here. Buy it now."],
  ["next", "ring", "Next month", "Arrives soon. Worth waiting for."],
  ["around", "strike", "Not local", "Grown in other states and trucked in. Costs more, less fresh."],
];

export type { Buckets };
