"use client";
import ItemCard from "./ItemCard";
import Tabs from "./Tabs";
import { MFULL, ZONES, type Item, type ZoneKey } from "@/lib/data";
import { itemHref } from "@/lib/appState";
import { buckets, type Row, type Status, type TabKey } from "@/lib/season";
import { TABS, nowMonth, plural } from "@/lib/ui";
import { useAppState } from "@/lib/useAppState";
import { markUserOpen } from "@/lib/userOpen";

const ORDER: Record<string, number> = { last: 0, new: 1, peak: 2 };
const WORD: Record<TabKey, string> = { now: "in season", ending: "ending", next: "coming next month", around: "brought in" };

/** Shown in the static HTML until the browser reads the URL. */
export function MainFallback() {
  return (
    <section>
      <div className="lede">
        <p className="kicker">&nbsp;</p>
        <h1>
          <span>In season</span>
          <em>near you.</em>
        </h1>
        <p className="sub">What is growing near you, month by month, for every state in India.</p>
      </div>
    </section>
  );
}

/** The list view. Rendered in the browser (it reads the URL); MainFallback is the static HTML. */
export default function MainView() {
  const { state, embed, update } = useAppState();
  const { city, month, tab } = state;
  const now = nowMonth();
  const { zone, here, soon, last, away } = buckets(city, month);
  const T = TABS.find((t) => t.k === tab) || TABS[0];
  const N: Record<TabKey, number> = { now: here.length, ending: last.length, next: soon.length, around: away.length };
  const href = (it: Item) => itemHref(it, state, embed);
  const card = (it: Item, st: Status | "away", i: number, from?: ReadonlyArray<ZoneKey>) => (
    <ItemCard key={it.n} it={it} st={st} i={i} from={from} zone={zone} month={month} now={now} href={href(it)} replace={embed} onOpen={markUserOpen} />
  );
  const sorted = (rows: Row[]) => rows.slice().sort((a, b) => ORDER[a.st] - ORDER[b.st] || a.it.n.localeCompare(b.it.n));
  const flat = (rows: Row[], st?: Status) => (
    <div className="grid">{rows.slice().sort((a, b) => a.it.n.localeCompare(b.it.n)).map((r, i) => card(r.it, st || r.st, i))}</div>
  );
  const group = (title: string, rows: Row[], start: number) => (
    <section className="group">
      <div className="group-head">
        <h2>{title}</h2>
        <span>{plural(rows.length, "item", "items")}</span>
      </div>
      <div className="grid">{sorted(rows).map((r, j) => card(r.it, r.st, start + j))}</div>
    </section>
  );

  const pickTab = (k: TabKey) => {
    update({ tab: k });
    const lists = document.getElementById("lists");
    if (!lists) return;
    const top = lists.getBoundingClientRect().top + window.scrollY - 120;
    if (window.scrollY > top) window.scrollTo(0, Math.max(0, top));
  };

  const fruit = here.filter((r) => r.it.t === "fruit");
  const veg = here.filter((r) => r.it.t === "veg");

  return (
    <section>
      <div className="lede">
        <p className="kicker">{ZONES[zone] === city ? city : city + " · " + ZONES[zone]}</p>
        <h1>
          <span>{T.h[0]}</span>
          <em>{T.h[1]}</em>
        </h1>
        <span className="lt-end" aria-hidden="true" />
        <p className="sub">
          {tab === "now" && !here.length ? (
            "Between seasons in " + city + " this month."
          ) : (
            <>
              <b>{plural(N[tab], "item", "items")}</b> {WORD[tab]} · {MFULL[month - 1]} · {city}
            </>
          )}
        </p>
      </div>
      <Tabs tab={tab} counts={N} onPick={pickTab} />
      <div id="lists" role="tabpanel" aria-labelledby={"tab-" + tab} key={city + month + tab}>
        {tab === "now" && (
          <>
            {fruit.length ? group("Fruit", fruit, 0) : null}
            {veg.length ? group("Vegetables", veg, fruit.length) : null}
            {!here.length && <p className="empty">Nothing is growing here right now. See Not local for what other states send.</p>}
          </>
        )}
        {tab === "ending" &&
          (last.length ? (
            <>
              <p className="intro">Last month to buy these fresh.</p>
              {flat(last)}
            </>
          ) : (
            <p className="empty">Nothing ends this month.</p>
          ))}
        {tab === "next" &&
          (soon.length ? (
            <>
              <p className="intro">Arriving in {MFULL[month % 12]}. Worth the wait.</p>
              {flat(soon, "soon")}
            </>
          ) : (
            <p className="empty">Nothing new arrives next month.</p>
          ))}
        {tab === "around" &&
          (away.length ? (
            <>
              <p className="intro">
                {zone === "LA" && [12, 1, 2, 3, 4].includes(month)
                  ? "Flown in or from storage while the roads are closed. Expensive."
                  : "Grown in other states and trucked here. Pricier, less fresh."}
              </p>
              <div className="grid">{away.map(({ it, from }, i) => card(it, "away", i, from))}</div>
            </>
          ) : (
            <p className="empty">Nothing is being shipped in right now.</p>
          ))}
      </div>
    </section>
  );
}
