/* Pure season logic, ported 1:1 from the prototype (data.js + app_template.html). */
import { DATA, MFULL, REACH, STATES, SUPPLY, ZONES, type Item, type Range, type ZoneKey } from "./data";

export type Status = "peak" | "new" | "last" | "soon";
export type Kind = Status | "away" | "off";
export type TabKey = "now" | "ending" | "next" | "around";
export type Row = { it: Item; st: Status };
export type AwayRow = { it: Item; from: ZoneKey[] };
export type Buckets = { zone: ZoneKey; here: Row[]; soon: Row[]; last: Row[]; away: AwayRow[] };

export const DEFAULT_STATE = "Punjab";

export const zoneOf = (n: string): ZoneKey => (STATES.find((c) => c[0] === n) || [, "N" as ZoneKey])[1];
export const isState = (n: unknown): n is string => typeof n === "string" && STATES.some((s) => s[0] === n);
export const inRange = (m: number, [s, e]: Range): boolean => (s <= e ? m >= s && m <= e : m >= s || m <= e);
export const prev = (m: number): number => (m === 1 ? 12 : m - 1);

export function statusOf(it: Item, z: ZoneKey, m: number): Status | null {
  const r = it.z[z];
  if (!r) return null;
  const [s, e] = r;
  if (m === e) return "last";
  if (m === s) return "new";
  if (inRange(m, r)) return "peak";
  if (m === prev(s)) return "soon";
  return null;
}

export const yt = (q: string): string =>
  "https://www.youtube.com/results?search_query=" + encodeURIComponent("how to make " + q);

export const slug = (n: string): string =>
  n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const bySlug = (s: string): Item | undefined => DATA.find((d) => slug(d.n) === s);

/** One place that sorts items for a state and month. */
export function buckets(city: string, m: number): Buckets {
  const zone = zoneOf(city);
  const rows = DATA.map((it) => ({ it, st: statusOf(it, zone, m) })).filter((x): x is Row => !!x.st);
  const here = rows.filter((r) => r.st !== "soon");
  const soon = rows.filter((r) => r.st === "soon");
  const last = here.filter((r) => r.st === "last");
  const localNames = new Set(here.map((r) => r.it.n));
  const away = DATA.filter((it) => !localNames.has(it.n))
    .map((it) => {
      const reach = REACH[it.n];
      const from =
        reach && !reach.includes(zone)
          ? []
          : (SUPPLY[it.n] || []).filter((k) => {
              const r = it.z[k];
              return k !== zone && !!r && inRange(m, r);
            });
      return { it, from };
    })
    .filter((x) => x.from.length)
    .sort((a, b) => a.it.n.localeCompare(b.it.n));
  return { zone, here, soon, last, away };
}

export const listOf = (B: Buckets, k: TabKey) => ({ now: B.here, ending: B.last, next: B.soon, around: B.away })[k];

export const zoneList = (ks: ReadonlyArray<ZoneKey>): string => ks.map((k) => ZONES[k]).join(", ");

export function monthsIn(r: Range): Set<number> {
  const s = new Set<number>();
  for (let m = 1; m <= 12; m++) if (inRange(m, r)) s.add(m);
  return s;
}

export const rangeText = (r: Range): string =>
  r[0] === r[1] ? MFULL[r[0] - 1] : MFULL[r[0] - 1] + " to " + MFULL[r[1] - 1];

export type Season = { set: Set<number>; local: true; r: Range } | { set: Set<number>; local: false; src: ZoneKey[] };

export function seasonOf(it: Item, zone: ZoneKey): Season {
  const own = it.z[zone];
  if (own) return { set: monthsIn(own), local: true, r: own };
  const sup = SUPPLY[it.n];
  const keys = sup && sup.length ? [...sup] : (Object.keys(it.z) as ZoneKey[]);
  const src = keys.filter((k) => it.z[k]);
  const set = new Set<number>();
  src.forEach((k) => monthsIn(it.z[k] as Range).forEach((m) => set.add(m)));
  return { set, local: false, src };
}

/** Status of one item for a state + month, including "away" (shipped in) and "off". */
export function kindOf(it: Item, city: string, month: number): { kind: Kind; from: ZoneKey[] } {
  const B = buckets(city, month);
  const st = statusOf(it, B.zone, month);
  const aw = B.away.find((a) => a.it.n === it.n);
  return { kind: st ? st : aw ? "away" : "off", from: aw ? aw.from : [] };
}

export const TAB_KEYS: TabKey[] = ["now", "ending", "next", "around"];
export const isTab = (t: unknown): t is TabKey => typeof t === "string" && (TAB_KEYS as string[]).includes(t);
