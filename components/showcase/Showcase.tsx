"use client";
/* Showcase page: the page is the source of truth; both frames follow it (ported from showcase_tail.html). */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./Showcase.module.css";
import Chapters from "./Chapters";
import DesktopFrame from "./DesktopFrame";
import PhoneFrame from "./PhoneFrame";
import YearWheel from "./YearWheel";
import { CH, LEG, type ShowState } from "./types";
import StatusGlyph from "../StatusGlyph";
import ThemeToggle, { type Theme } from "../ThemeToggle";
import { MFULL, STATES, ZONES } from "@/lib/data";
import { store } from "@/lib/appState";
import { DEFAULT_STATE, buckets, isState, isTab } from "@/lib/season";
import { LEGEND_NOTE, nowMonth, plural } from "@/lib/ui";

const CITY_KEY = "mandi.showcase.state";
const THEME_KEY = "mandi.showcase.theme";
const PH = { w: 414, h: 912 }, DK = { w: 1282, h: 864 };
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Same on the server and in the first browser render, so hydration matches. */
const SERVER: ShowState = { city: DEFAULT_STATE, month: 1, tab: "now", view: "main", item: null, theme: "light" };

/** The real starting state, read once in the browser. */
function initial(): ShowState {
  const c = store.get(CITY_KEY), t = store.get(THEME_KEY);
  return {
    city: isState(c) ? c : DEFAULT_STATE,
    month: nowMonth(),
    tab: "now",
    view: "main",
    item: null,
    theme: t === "dark" || t === "light" ? t : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  };
}
const frameSrc = (s: ShowState) =>
  "/?" + new URLSearchParams({ embed: "1", state: s.city, month: String(s.month), tab: s.tab, theme: s.theme }).toString();

const UpIcon = () => (
  <svg viewBox="0 0 14 14" aria-hidden="true">
    <path d="M7 12V2M3 6l4-4 4 4" />
  </svg>
);

type StateMsg = { type: "state" | "ready" | "theme"; theme?: string; city?: string; month?: number; tab?: string; view?: string; item?: string | null; seq?: number };

export default function Showcase() {
  /* first = the starting state, set once in the browser. Until then (static HTML) the dynamic bits stay empty. */
  const [first, setFirst] = useState<ShowState | null>(null);
  const ready = first !== null;
  const [S, setS] = useState<ShowState>(SERVER);
  const [swap, setSwap] = useState(0);
  const sRef = useRef(S);
  const phone = useRef<HTMLIFrameElement>(null), desk = useRef<HTMLIFrameElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const boxPhone = useRef<HTMLDivElement>(null), boxDesk = useRef<HTMLDivElement>(null);
  const devPhone = useRef<HTMLDivElement>(null), devDesk = useRef<HTMLDivElement>(null);
  const glow = useRef<SVGSVGElement>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const ack = useRef(new Map<HTMLIFrameElement, number>()); /* last change number seen from each frame */
  const now = ready ? nowMonth() : 0;

  useEffect(() => {
    const s = initial();
    sRef.current = s;
    setS(s);
    setFirst(s);
  }, []);

  /* ---------- frames ---------- */
  const frames = () => [phone.current, desk.current].filter((f): f is HTMLIFrameElement => !!f);
  const send = useCallback((f: HTMLIFrameElement) => {
    const s = sRef.current;
    try {
      f.contentWindow?.postMessage({ type: "set", city: s.city, month: s.month, tab: s.tab, view: s.view, item: s.item, theme: s.theme, ack: ack.current.get(f) || 0 }, "*");
    } catch {
      /* frame gone */
    }
  }, []);
  const sendAll = useCallback(
    (except?: HTMLIFrameElement) => frames().forEach((f) => f !== except && send(f)),
    [send],
  );
  /** Change the page state, then tell the frames (except the one the change came from). */
  const commit = useCallback(
    (patch: Partial<ShowState>, except?: HTMLIFrameElement) => {
      const prev = sRef.current;
      const next = { ...prev, ...patch };
      sRef.current = next;
      setS(next);
      if (next.month !== prev.month) setSwap((n) => n + 1);
      if (patch.city) store.set(CITY_KEY, next.city);
      sendAll(except);
    },
    [sendAll],
  );

  useEffect(() => {
    if (!ready) return;
    const fs = frames();
    const onLoad = (f: HTMLIFrameElement) => () => {
      ack.current.set(f, 0);
      send(f);
    };
    const offs = fs.map((f) => {
      const h = onLoad(f);
      f.addEventListener("load", h);
      return () => f.removeEventListener("load", h);
    });
    const onMsg = (e: MessageEvent) => {
      const f = fs.find((x) => x.contentWindow === e.source);
      if (!f) return;
      const d = e.data as StateMsg;
      if (!d || typeof d !== "object") return;
      if (d.type === "ready") return send(f);
      if (d.type === "theme") {
        /* the toggle inside a frame: the page switches, then tells both frames */
        if (d.theme === "light" || d.theme === "dark") {
          store.set(THEME_KEY, d.theme);
          commit({ theme: d.theme });
        }
        return;
      }
      if (d.type !== "state") return;
      if (typeof d.seq === "number") ack.current.set(f, d.seq);
      const cur = sRef.current;
      const view = d.view === "recipes" ? "recipes" : "main";
      commit(
        {
          city: isState(d.city) ? d.city : cur.city,
          month: Number(d.month) >= 1 && Number(d.month) <= 12 ? Number(d.month) : cur.month,
          tab: isTab(d.tab) ? d.tab : cur.tab,
          view,
          item: view === "recipes" ? (d.item ?? null) : null,
        },
        f,
      );
      store.set(CITY_KEY, sRef.current.city);
    };
    window.addEventListener("message", onMsg);
    return () => {
      offs.forEach((off) => off());
      window.removeEventListener("message", onMsg);
    };
  }, [ready, send, commit]);

  /* ---------- theme + list colour on <html> ---------- */
  useEffect(() => {
    if (ready) document.documentElement.dataset.theme = S.theme;
  }, [ready, S.theme]);
  useEffect(() => {
    document.documentElement.dataset.tab = S.tab;
  }, [S.tab]);

  /* ---------- device scaling (phone + bleeding desktop) ---------- */
  useIsoLayoutEffect(() => {
    const st = stage.current;
    if (!st) return;
    const fit = () => {
      const W = st.clientWidth;
      if (!W) return;
      let sp: number, sd: number, gap: number;
      if (window.innerWidth <= 760) {
        gap = 36;
        sp = Math.min(0.86, W / PH.w);
        sd = W / DK.w;
      } else {
        gap = Math.round(Math.max(28, Math.min(56, W * 0.035)));
        /* bleed: only the app's empty right margin (past x=1196 of 1282) may run off the screen edge */
        const room = document.documentElement.clientWidth - st.getBoundingClientRect().left - gap - 6;
        const H = Math.min(760, room / (1196 / DK.h + PH.w / PH.h));
        sp = H / PH.h;
        sd = H / DK.h;
      }
      st.style.setProperty("--gap", gap + "px");
      (
        [
          [devPhone.current, boxPhone.current, PH, sp],
          [devDesk.current, boxDesk.current, DK, sd],
        ] as const
      ).forEach(([dev, box, N, s]) => {
        if (!dev || !box) return;
        dev.style.transform = "scale(" + s + ")";
        box.style.width = Math.round(N.w * s) + "px";
        box.style.height = Math.round(N.h * s) + "px";
        (box.parentNode as HTMLElement).style.width = Math.round(N.w * s) + "px";
      });
    };
    const ro = new ResizeObserver(fit);
    ro.observe(st);
    fit();
    return () => ro.disconnect();
  }, []);

  /* ---------- motion that answers the user ---------- */
  useEffect(() => {
    const RM = window.matchMedia("(prefers-reduced-motion: reduce)");
    let ticking = false;
    const onScroll = () => {
      if (ticking || RM.matches) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 1400);
        if (glow.current) glow.current.style.transform = "translate3d(0," + (y * 0.28).toFixed(1) + "px,0)";
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const rv = [...document.querySelectorAll("." + styles.root + " .rv")];
    let io: IntersectionObserver | null = null;
    if (RM.matches || !("IntersectionObserver" in window)) rv.forEach((el) => el.classList.add("in"));
    else {
      io = new IntersectionObserver(
        (es) =>
          es.forEach((en) => {
            if (en.isIntersecting) {
              en.target.classList.add("in");
              io?.unobserve(en.target);
            }
          }),
        { rootMargin: "0px 0px -8% 0px" },
      );
      rv.forEach((el) => io?.observe(el));
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, []);

  const B = buckets(S.city, S.month);
  const scrollToStage = () => {
    const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    stage.current?.scrollIntoView({ behavior: RM ? "auto" : "smooth", block: "center" });
  };

  return (
    <div className={styles.root}>
      <div className="shell">
        <header className="top">
          <div className="top-in">
            <a className="mark" href="#top">
              <i />
              <span>Mandi Calendar</span>
            </a>
            <label className="sel">
              <span>Your state</span>
              <select
                aria-label="Your state"
                value={S.city}
                onChange={(e) => commit({ city: e.target.value, view: "main", item: null })}
              >
                {STATES.map(([n]) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <svg viewBox="0 0 10 10" aria-hidden="true">
                <path d="M2 3.6l3 3 3-3" />
              </svg>
            </label>
            <ThemeToggle className="ib theme" storageKey={THEME_KEY} onChange={(t: Theme) => commit({ theme: t })} />
            <button className="ib" type="button" aria-label="What the signs mean" onClick={() => dlg.current?.showModal?.()}>
              <b aria-hidden="true">?</b>
            </button>
          </div>
        </header>

        <main className="page" id="top">
          <section className="hero" aria-labelledby="heroTitle">
            <svg className="glow" ref={glow} viewBox="0 0 800 800" aria-hidden="true">
              <defs>
                <radialGradient id="sunG">
                  <stop offset="0" stopColor="var(--haldi)" stopOpacity=".55" />
                  <stop offset=".38" stopColor="var(--haldi)" stopOpacity=".16" />
                  <stop offset="1" stopColor="var(--haldi)" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle cx="400" cy="400" r="400" fill="url(#sunG)" style={{ fill: "url(#sunG)" }} />
            </svg>
            <div className="hero-top">
              <div>
                <p className="eyebrow">A season guide for Indian markets</p>
                <h1 className="stack" id="heroTitle">
                  <span>What’s</span>
                  <span>growing</span>
                  <span>
                    <em>near you.</em>
                  </span>
                </h1>
              </div>
              <div className="when">
                <p className="month" aria-live="polite">
                  <span className={swap ? "mw swap" : "mw"} key={swap}>
                    {ready ? MFULL[S.month - 1] : "\u00a0"}
                  </span>
                  <sup>{ready ? new Date().getFullYear() : ""}</sup>
                </p>
                <p className="count">
                  {ready && (
                    <>
                      <StatusGlyph k="solid" />
                      <span>
                        <b>{plural(B.here.length, "item", "items")}</b> in season · {S.city}
                        {ZONES[B.zone] !== S.city ? " · " + ZONES[B.zone] : ""}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <p className="lede">
              One app, shown on <b>a phone</b> and <b>a desktop</b>. Pick a state, a month or a list anywhere on this page. Both screens change together. Tap inside either screen and the other one follows.
            </p>

            <div className="stage" id="stage" ref={stage}>
              <PhoneFrame src={first ? frameSrc(first) : undefined} frameRef={phone} boxRef={boxPhone} devRef={devPhone} />
              <DesktopFrame src={first ? frameSrc(first) : undefined} frameRef={desk} boxRef={boxDesk} devRef={devDesk} />
            </div>
            <p className="stage-note">
              <svg viewBox="0 0 18 18" aria-hidden="true">
                <path d="M3 9h12M10.5 4.5L15 9l-4.5 4.5" />
              </svg>
              Both screens are the real app. Scroll, tap a card, open a recipe.
            </p>
          </section>

          <section className="sec" id="yearSec" aria-labelledby="yearTitle">
            <div className="rv">
              <p className="eyebrow">The year</p>
              <h2 id="yearTitle">
                Move through <em>the year.</em>
              </h2>
              <p className="sub">Drag around the ring, or tap a month. Both screens move with you.</p>
            </div>
            <div className="year rv">
              {ready ? (
                <YearWheel city={S.city} month={S.month} tab={S.tab} now={now} onMonth={(m) => commit({ month: m })} />
              ) : (
                <svg className="wheel" viewBox="0 0 440 440" aria-hidden="true" />
              )}
              <div>
                <ol className="steps">
                  <li>
                    <span>
                      <b>The list changes.</b> Some items come in, some go out.
                    </span>
                  </li>
                  <li>
                    <span>
                      <b>The counts change.</b> See the four lists below.
                    </span>
                  </li>
                  <li>
                    <span>
                      <b>The bars inside the ring</b> show how many items are on the open list, month by month, in <b>{S.city}</b>.
                    </span>
                  </li>
                  <li>
                    <span>
                      <b>The yellow tick</b> marks this month. Use it to plan ahead.
                    </span>
                  </li>
                </ol>
                <div className="key">
                  <span>
                    <i style={{ background: "var(--ink)" }} />
                    Picked month
                  </span>
                  <span>
                    <i style={{ background: "var(--haldi)" }} />
                    This month
                  </span>
                  <span>
                    <i style={{ background: "var(--accent)" }} />
                    Items on the open list
                  </span>
                </div>
                <a className="up" href="#stage">
                  <UpIcon />
                  See both screens
                </a>
              </div>
            </div>
          </section>

          <section className="sec" id="listSec" aria-labelledby="listTitle">
            <div className="rv">
              <p className="eyebrow">The lists</p>
              <h2 id="listTitle">
                Four lists. <em>One tap.</em>
              </h2>
              <p className="sub">Each list answers one question at the market. Tap a list and both screens open it. Tap an item to open its recipes.</p>
            </div>
            <Chapters
              B={B}
              tab={S.tab}
              month={S.month}
              ready={ready}
              onTab={(k) => {
                if (S.tab === k && S.view === "main") return;
                commit({ tab: k, view: "main", item: null });
              }}
              onItem={(n) => {
                commit({ view: "recipes", item: n });
                scrollToStage();
              }}
            />
          </section>

          <section className="sec" id="readSec" aria-labelledby="readTitle">
            <div className="rv">
              <p className="eyebrow">How to read it</p>
              <h2 id="readTitle">
                Shape first, <em>then colour.</em>
              </h2>
              <p className="sub">Every sign has its own shape and a word, so it still reads in black and white.</p>
            </div>
            <div className="signs rv">
              {LEG.map(([k, g, b, t], i) => (
                <div key={k} className={"sign st-" + k}>
                  <StatusGlyph k={g} />
                  <b>{b}</b>
                  <p>{t}</p>
                  <span className="demo">
                    <StatusGlyph k={g} />
                    {CH[i].chip}
                  </span>
                </div>
              ))}
            </div>
            <p className="zones rv">
              <b>Hills and plains differ.</b> Seasons go by climate zone, not by state lines. Ladakh, Kashmir and the Himachal and Uttarakhand hills each have their own calendar, often weeks apart from the plains below.
            </p>
          </section>

          <footer className="foot">
            <p>Seasons by climate zone. Compiled from horticulture board and state agriculture sources. Recipes open on YouTube.</p>
            <p className="ver">v1.0 · Oct 2026</p>
          </footer>
        </main>
      </div>

      <dialog ref={dlg} aria-labelledby="dlgTitle" onClick={(e) => e.target === e.currentTarget && dlg.current?.close()}>
        <div className="sheet">
          <button className="x" type="button" aria-label="Close" onClick={() => dlg.current?.close()}>
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          </button>
          <h3 id="dlgTitle">How to read it</h3>
          <div>
            {LEG.map(([k, g, b, t]) => (
              <div key={k} className={"lrow st-" + k}>
                <StatusGlyph k={g} />
                <div>
                  <b>{b}</b>
                  <span>{t}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="note">{LEGEND_NOTE}</p>
        </div>
      </dialog>
    </div>
  );
}
