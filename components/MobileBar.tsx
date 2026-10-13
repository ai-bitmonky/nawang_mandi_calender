"use client";
import Link from "next/link";
import MonthStrip from "./MonthStrip";
import { MN } from "@/lib/data";
import type { TabKey } from "@/lib/season";
import { TABS } from "@/lib/ui";

const Chevron = () => (
  <svg viewBox="0 0 10 10" aria-hidden="true">
    <path d="M2 3.6l3 3 3-3" />
  </svg>
);

/** Phone top bar. Home: wordmark, small title that appears once the big title scrolls away, state pill, "?",
    and the month strip under it. Item: back chevron with the list name, item name in the middle. Hidden on desktop. */
export default function MobileBar({
  screen,
  city,
  month,
  now,
  tab,
  itemName,
  homeHref,
  embed,
  onHome,
  onMonth,
  onStates,
  onHelp,
}: {
  screen: "home" | "item";
  city: string;
  month: number;
  now: number;
  tab: TabKey;
  itemName: string | null;
  homeHref: string;
  embed: boolean;
  onHome: (e: React.MouseEvent) => void;
  onMonth: (m: number) => void;
  onStates: () => void;
  onHelp: () => void;
}) {
  const T = TABS.find((t) => t.k === tab) || TABS[0];
  if (screen === "item") {
    return (
      <header className="mbar">
        <div className="mrow is-item">
          <Link key="back" className="mback" href={homeHref} replace={embed} data-nav="pop" aria-label={"Back to " + T.label}>
            <svg viewBox="0 0 12 20" aria-hidden="true">
              <path d="M10 2L2 10l8 8" />
            </svg>
            <span>{T.label}</span>
          </Link>
          <span className="mtitle" aria-hidden="true">
            {itemName}
          </span>
          <span className="mside" />
        </div>
      </header>
    );
  }
  return (
    <header className="mbar">
      <div className="mrow">
        <Link key="mark" className="mmark" href={homeHref} replace={embed} onClick={onHome}>
          <i />
          <span>Mandi</span>
        </Link>
        <span className="mtitle" aria-hidden="true">
          {T.label} · {MN[month - 1]}
        </span>
        <div className="mact">
          <button type="button" className="mpill" aria-haspopup="dialog" aria-label={"Your state: " + city + ". Change it"} onClick={onStates}>
            <span>{city}</span>
            <Chevron />
          </button>
          <button type="button" className="mbtn" aria-haspopup="dialog" aria-label="What the labels mean, and appearance" onClick={onHelp}>
            ?
          </button>
        </div>
      </div>
      <MonthStrip month={month} now={now} onPick={onMonth} />
    </header>
  );
}

/** Static HTML version (before the browser reads the URL): wordmark only, same height as the real bar. */
export function MobileBarFallback({ screen }: { screen: "home" | "item" }) {
  return (
    <header className="mbar">
      <div className={screen === "item" ? "mrow is-item" : "mrow"}>
        {screen === "item" ? (
          <Link className="mback" href="/" aria-label="Back">
            <svg viewBox="0 0 12 20" aria-hidden="true">
              <path d="M10 2L2 10l8 8" />
            </svg>
            <span>Back</span>
          </Link>
        ) : (
          <Link className="mmark" href="/">
            <i />
            <span>Mandi</span>
          </Link>
        )}
      </div>
      {screen === "home" ? <div className="months" aria-hidden="true" /> : null}
    </header>
  );
}
