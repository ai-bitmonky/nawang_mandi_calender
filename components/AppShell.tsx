"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./Header";
import Legend from "./Legend";
import styles from "./App.module.css";
import { DATA } from "@/lib/data";
import { homeHref, itemHref, type AppState } from "@/lib/appState";
import { currentSeq, postReady, postState } from "@/lib/embed";
import { isState, isTab } from "@/lib/season";
import { nowMonth } from "@/lib/ui";
import { useAppState } from "@/lib/useAppState";

type SetMsg = {
  type: "set";
  city?: string;
  month?: number;
  tab?: string;
  view?: string;
  item?: string | null;
  theme?: string;
  ack?: number;
};

const sigOf = (s: AppState, item: string | null) => [s.city, s.month, s.tab, item ? "recipes" : "main", item || ""].join("|");

/** Header + legend around the list and recipe pages. Also keeps the showcase frames in sync (embed=1). */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { state, item, embed, update, goHome, router } = useAppState();
  const [legend, setLegend] = useState(false);
  const closeLegend = useCallback(() => setLegend(false), []);
  const now = nowMonth();
  const itemName = item ? item.n : null;
  const sig = sigOf(state, itemName);

  /* list colour follows the open list */
  useEffect(() => {
    document.documentElement.dataset.tab = state.tab;
  }, [state.tab]);

  /* ---------- sync with the showcase page ---------- */
  const lastSig = useRef(sig); /* last state the page knows about (sent by us, or set by it) */
  useEffect(() => {
    if (!embed || sig === lastSig.current) return;
    lastSig.current = sig;
    postState({ city: state.city, month: state.month, tab: state.tab, view: itemName ? "recipes" : "main", item: itemName });
  }, [embed, sig, state.city, state.month, state.tab, itemName]);

  const live = useRef({ state, itemName });
  live.current = { state, itemName };
  useEffect(() => {
    if (!embed) return;
    const apply = (d: SetMsg) => {
      if (d.theme === "light" || d.theme === "dark") {
        if (document.documentElement.dataset.theme !== d.theme) document.documentElement.dataset.theme = d.theme;
      }
      if (typeof d.ack === "number" && d.ack < currentSeq()) return; /* page has not seen our latest change yet */
      const cur = live.current;
      const s: AppState = {
        city: isState(d.city) ? d.city : cur.state.city,
        month: Number(d.month) >= 1 && Number(d.month) <= 12 ? Number(d.month) : cur.state.month,
        tab: isTab(d.tab) ? d.tab : cur.state.tab,
      };
      let it = cur.itemName;
      if (d.view) it = d.view === "recipes" && d.item && DATA.some((x) => x.n === d.item) ? d.item : null;
      const next = sigOf(s, it);
      if (next === sigOf(cur.state, cur.itemName)) return;
      lastSig.current = next;
      if (it !== cur.itemName) router.replace(it ? itemHref(it, s, true) : homeHref(s, true));
      else update(s);
    };
    const onMsg = (e: MessageEvent) => {
      if (e.source !== window.parent) return;
      const d = e.data as SetMsg;
      if (!d || typeof d !== "object" || d.type !== "set") return;
      apply(d);
    };
    window.addEventListener("message", onMsg);
    postReady();
    return () => window.removeEventListener("message", onMsg);
  }, [embed, router, update]);

  /* ---------- header actions ---------- */
  const onCity = (city: string) => {
    if (item) goHome({ ...state, city });
    else update({ city });
  };
  const onHome = (e: React.MouseEvent) => {
    if (!item) {
      e.preventDefault();
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className={styles.root}>
      <Header
        city={state.city}
        month={state.month}
        now={now}
        homeHref={homeHref(state, embed)}
        embed={embed}
        onCity={onCity}
        onMonth={(m) => update({ month: m })}
        onHome={onHome}
        onLegend={() => setLegend(true)}
      />
      <main className="wrap">{children}</main>
      <Legend open={legend} onClose={closeLegend} />
    </div>
  );
}

/** Static HTML before the browser reads the URL: wordmark only, then the page. */
export function ShellFallback({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.root}>
      <header className="bar">
        <div className="bar-in">
          <Link className="mark" href="/">
            <i />
            <span>Mandi Calendar</span>
          </Link>
        </div>
      </header>
      <main className="wrap">{children}</main>
    </div>
  );
}

