/* The app's state lives in the URL: /?state=Punjab&month=10&tab=now (also on /item/[slug]). */
import { DATA, type Item } from "./data";
import { DEFAULT_STATE, bySlug, isState, isTab, slug, type TabKey } from "./season";
import { nowMonth } from "./ui";

export type AppState = { city: string; month: number; tab: TabKey };
type Params = { get(name: string): string | null };

export function readState(sp: Params | null | undefined, fallbackCity?: string | null): AppState {
  const q = sp?.get("state");
  const c = isState(q) ? q : fallbackCity;
  const m = Number(sp?.get("month"));
  const t = sp?.get("tab");
  return {
    city: isState(c) ? c : DEFAULT_STATE,
    month: Number.isInteger(m) && m >= 1 && m <= 12 ? m : nowMonth(),
    tab: isTab(t) ? t : "now",
  };
}

export function query(s: AppState, embed = false): string {
  const q = new URLSearchParams({ state: s.city, month: String(s.month), tab: s.tab });
  if (embed) q.set("embed", "1");
  return "?" + q.toString();
}

export const homeHref = (s: AppState, embed = false) => "/" + query(s, embed);
export const itemHref = (it: Item | string, s: AppState, embed = false) =>
  "/item/" + slug(typeof it === "string" ? it : it.n) + query(s, embed);

export function itemFromPath(pathname: string | null | undefined): Item | undefined {
  if (!pathname || !pathname.startsWith("/item/")) return undefined;
  return bySlug(decodeURIComponent(pathname.slice(6).replace(/\/$/, "")));
}

export const isItemName = (n: unknown): n is string => typeof n === "string" && DATA.some((d) => d.n === n);

/* Last chosen state, remembered per browser (never inside the showcase frames). */
export const STATE_KEY = "mandi.state";
export const THEME_KEY = "mandi.theme";
export const store = {
  get(k: string): string | null {
    try {
      return window.localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k: string, v: string) {
    try {
      window.localStorage.setItem(k, v);
    } catch {
      /* private mode: ignore */
    }
  },
  del(k: string) {
    try {
      window.localStorage.removeItem(k);
    } catch {
      /* private mode: ignore */
    }
  },
};
