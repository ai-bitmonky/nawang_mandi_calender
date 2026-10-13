"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import A2HS from "./A2HS";
import Header from "./Header";
import Legend from "./Legend";
import LegendSheet from "./LegendSheet";
import MobileBar, { MobileBarFallback } from "./MobileBar";
import StateSheet from "./StateSheet";
import TabBar from "./TabBar";
import styles from "./App.module.css";
import m from "./Mobile.module.css";
import { DATA } from "@/lib/data";
import { homeHref, itemHref, type AppState } from "@/lib/appState";
import { currentSeq, postReady, postState } from "@/lib/embed";
import { buckets, isState, isTab, type TabKey } from "@/lib/season";
import { cx, nowMonth } from "@/lib/ui";
import { useAppState } from "@/lib/useAppState";
import { animatedNav, navCommitted, setEnter } from "@/lib/nav";
import { reducedMotion, useIsMobile } from "@/lib/useIsMobile";

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

/** Header + legend around the list and recipe pages. Also keeps the showcase frames in sync (embed=1).
    On phones (<=900px, CSS) the same tree becomes an app shell: top bar, one scrolling screen, tab bar. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const { state, item, embed, update, goHome, router } = useAppState();
  const isMobile = useIsMobile();
  const [legend, setLegend] = useState(false);
  const closeLegend = useCallback(() => setLegend(false), []);
  const [sheet, setSheet] = useState<"state" | "legend" | null>(null);
  const closeSheet = useCallback(() => setSheet(null), []);
  const now = nowMonth();
  const itemName = item ? item.n : null;
  const sig = sigOf(state, itemName);
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  /* a sheet only lives on phones: drop it if the window grows past the breakpoint */
  const openSheet = sheet && isMobile ? sheet : null;

  /* <meta name="theme-color"> follows a theme picked in the app (Auto: back to the light/dark pair) */
  useEffect(() => {
    const html = document.documentElement;
    const apply = () => {
      const t = html.dataset.theme;
      document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((el) => {
        const dark = t ? t === "dark" : (el.media || "").includes("dark");
        el.content = dark ? "#14120E" : "#F4EFE4";
      });
    };
    apply();
    const mo = new MutationObserver(apply);
    mo.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
  }, [itemName]);

  /* ---------- phone shell: large title collapse (IntersectionObserver on two sentinels) ---------- */
  const screen = item ? "item" : "home";
  useEffect(() => {
    const sc = scrollRef.current;
    const root = rootRef.current;
    if (!isMobile || !sc || !root) return;
    const bar = root.querySelector<HTMLElement>(".mbar");
    const barH = bar ? bar.offsetHeight : 0;
    const top = sc.querySelector(".lt-top");
    const end = sc.querySelector(".lt-end");
    const io = new IntersectionObserver(
      (ents) => {
        for (const e of ents) {
          const rootTop = e.rootBounds ? e.rootBounds.top : barH;
          const above = !e.isIntersecting && e.boundingClientRect.bottom <= rootTop + 1;
          root.toggleAttribute(e.target === top ? "data-scrolled" : "data-collapsed", above);
        }
      },
      { root: sc, rootMargin: -Math.max(0, barH - 2) + "px 0px 0px 0px", threshold: 0 },
    );
    if (top) io.observe(top);
    if (end) io.observe(end);
    else root.removeAttribute("data-collapsed");
    return () => io.disconnect();
  }, [isMobile, screen, itemName]);

  /* ---------- phone shell: scroll position per list, items open at the top ---------- */
  const pos = useRef<Record<string, number>>({});
  const viewKey = item ? "i:" + item.n : "h:" + state.tab;
  const keyRef = useRef(viewKey);
  useEffect(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    const onScroll = () => {
      pos.current[keyRef.current] = sc.scrollTop;
    };
    sc.addEventListener("scroll", onScroll, { passive: true });
    return () => sc.removeEventListener("scroll", onScroll);
  }, []);
  useLayoutEffect(() => {
    if (keyRef.current === viewKey) return;
    keyRef.current = viewKey;
    const sc = scrollRef.current;
    if (isMobile && sc) {
      sc.style.transform = "";
      sc.style.transition = "";
      sc.removeAttribute("data-swiping");
      sc.scrollTop = viewKey.startsWith("i:") ? 0 : pos.current[viewKey] || 0;
    }
    /* the new screen is in the DOM: let the view transition run, or play the CSS entrance */
    const enter = navCommitted();
    if (sc && enter && isMobile) {
      sc.dataset.enter = enter;
      window.setTimeout(() => sc.removeAttribute("data-enter"), 320);
    }
  }, [viewKey, isMobile]);

  /* ---------- phone: list -> item slides in, item -> list slides out (links marked data-nav) ---------- */
  const go = useCallback((href: string) => (embed ? router.replace(href) : router.push(href)), [embed, router]);
  useEffect(() => {
    const root = rootRef.current;
    if (!isMobile || !root) return;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[data-nav]") as HTMLAnchorElement | null;
      const href = a?.getAttribute("href");
      if (!a || !href || a.target) return;
      e.preventDefault(); /* Next's Link skips prevented clicks; its onClick (markUserOpen) still runs */
      animatedNav(a.dataset.nav === "pop" ? "pop" : "push", () => go(href));
    };
    root.addEventListener("click", onClick, true);
    return () => root.removeEventListener("click", onClick, true);
  }, [isMobile, go]);

  /* ---------- phone: swipe from the left edge on an item goes back (same as the Back button) ---------- */
  const backHref = homeHref(state, embed);
  const backRef = useRef(backHref);
  useEffect(() => {
    backRef.current = backHref;
  }, [backHref]);
  useEffect(() => {
    const sc = scrollRef.current;
    if (!isMobile || !itemName || !sc) return;
    let x0 = 0;
    let y0 = 0;
    let dx = 0;
    let phase: "idle" | "maybe" | "drag" = "idle";
    const ease = "transform .22s cubic-bezier(.2,.8,.2,1)";
    const start = (e: TouchEvent) => {
      const t = e.touches[0];
      phase = e.touches.length === 1 && t.clientX <= 24 ? "maybe" : "idle";
      x0 = t.clientX;
      y0 = t.clientY;
      dx = 0;
    };
    const move = (e: TouchEvent) => {
      if (phase === "idle") return;
      const t = e.touches[0];
      const mx = t.clientX - x0;
      const my = t.clientY - y0;
      if (phase === "maybe") {
        if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
        if (mx <= 0 || Math.abs(mx) <= Math.abs(my)) {
          phase = "idle";
          return;
        }
        phase = "drag";
        sc.style.transition = "none";
        sc.setAttribute("data-swiping", "");
      }
      e.preventDefault();
      dx = Math.max(0, mx);
      sc.style.transform = "translateX(" + dx + "px)";
    };
    const end = () => {
      if (phase !== "drag") {
        phase = "idle";
        return;
      }
      phase = "idle";
      sc.style.transition = reducedMotion() ? "none" : ease;
      if (dx > 80) {
        sc.style.transform = "translateX(100%)";
        window.setTimeout(
          () => {
            setEnter("fade");
            go(backRef.current);
          },
          reducedMotion() ? 0 : 200,
        );
      } else {
        sc.style.transform = "";
        window.setTimeout(() => sc.removeAttribute("data-swiping"), 220);
      }
    };
    sc.addEventListener("touchstart", start, { passive: true });
    sc.addEventListener("touchmove", move, { passive: false });
    sc.addEventListener("touchend", end);
    sc.addEventListener("touchcancel", end);
    return () => {
      sc.removeEventListener("touchstart", start);
      sc.removeEventListener("touchmove", move);
      sc.removeEventListener("touchend", end);
      sc.removeEventListener("touchcancel", end);
    };
  }, [isMobile, itemName, go]);

  /* cards rise in on the first load only; later list changes crossfade */
  useEffect(() => {
    const t = window.setTimeout(() => rootRef.current?.setAttribute("data-calm", ""), 1200);
    return () => window.clearTimeout(t);
  }, []);

  const counts = useMemo(() => {
    const B = buckets(state.city, state.month);
    return { now: B.here.length, ending: B.last.length, next: B.soon.length, around: B.away.length } as Record<TabKey, number>;
  }, [state.city, state.month]);

  /* ---------- header actions ---------- */
  const onCity = (city: string) => {
    if (item) goHome({ ...state, city });
    else update({ city });
  };
  const onHome = (e: React.MouseEvent) => {
    if (!item) {
      e.preventDefault();
      if (isMobile) scrollRef.current?.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
      else window.scrollTo(0, 0);
    }
  };
  const onTab = (k: TabKey) => {
    rootRef.current?.setAttribute("data-calm", "");
    const s = { ...state, tab: k };
    if (item) {
      animatedNav("pop", () => go(homeHref(s, embed)));
      return;
    }
    if (k === state.tab) {
      scrollRef.current?.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" });
      return;
    }
    animatedNav("tab", () => update({ tab: k }));
  };

  return (
    <div className={cx(styles.root, m.app)} ref={rootRef} data-screen={screen}>
      <div className="mshell" inert={!!openSheet}>
        <Header
          city={state.city}
          month={state.month}
          now={now}
          homeHref={homeHref(state, embed)}
          embed={embed}
          onCity={onCity}
          onMonth={(mo) => update({ month: mo })}
          onHome={onHome}
          onLegend={() => setLegend(true)}
        />
        <MobileBar
          screen={screen}
          city={state.city}
          month={state.month}
          now={now}
          tab={state.tab}
          itemName={itemName}
          homeHref={homeHref(state, embed)}
          embed={embed}
          onHome={onHome}
          onMonth={(mo) => update({ month: mo })}
          onStates={() => setSheet("state")}
          onHelp={() => setSheet("legend")}
        />
        <div className="scroller" ref={scrollRef}>
          <span className="lt-top" aria-hidden="true" />
          <main className="wrap">{children}</main>
        </div>
        <TabBar tab={state.tab} counts={counts} home={!item} onPick={onTab} />
        {isMobile && !embed ? <A2HS /> : null}
      </div>
      <Legend open={legend} onClose={closeLegend} />
      {openSheet === "state" ? <StateSheet city={state.city} embed={embed} onPick={onCity} onClosed={closeSheet} /> : null}
      {openSheet === "legend" ? <LegendSheet embed={embed} onClosed={closeSheet} /> : null}
    </div>
  );
}

/** Static HTML before the browser reads the URL: wordmark only, then the page. */
export function ShellFallback({ children }: { children: React.ReactNode }) {
  const screen = (usePathname() || "/").startsWith("/item/") ? "item" : "home";
  return (
    <div className={cx(styles.root, m.app)} data-screen={screen}>
      <div className="mshell">
        <header className="bar">
          <div className="bar-in">
            <Link className="mark" href="/">
              <i />
              <span>Mandi Calendar</span>
            </Link>
          </div>
        </header>
        <MobileBarFallback screen={screen} />
        <div className="scroller">
          <span className="lt-top" aria-hidden="true" />
          <main className="wrap">{children}</main>
        </div>
        <TabBar tab="now" counts={null} home={screen === "home"} onPick={() => {}} />
      </div>
    </div>
  );
}
