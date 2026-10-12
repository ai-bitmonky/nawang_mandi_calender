"use client";
import Link from "next/link";
import MonthStrip from "./MonthStrip";
import ThemeToggle from "./ThemeToggle";
import { STATES } from "@/lib/data";
import { THEME_KEY } from "@/lib/appState";
import { postTheme } from "@/lib/embed";

export default function Header({
  city,
  month,
  now,
  homeHref,
  embed,
  onCity,
  onMonth,
  onHome,
  onLegend,
}: {
  city: string;
  month: number;
  now: number;
  homeHref: string;
  embed: boolean;
  onCity: (c: string) => void;
  onMonth: (m: number) => void;
  onHome: (e: React.MouseEvent) => void;
  onLegend: () => void;
}) {
  return (
    <header className="bar">
      <div className="bar-in">
        <Link className="mark" href={homeHref} replace={embed} scroll onClick={onHome}>
          <i />
          <span>Mandi Calendar</span>
        </Link>
        <MonthStrip month={month} now={now} onPick={onMonth} />
        <label className="sel">
          <span className="vh">Your state</span>
          <select value={city} onChange={(e) => onCity(e.target.value)}>
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
        <div className="tools">
          <ThemeToggle storageKey={embed ? null : THEME_KEY} onChange={embed ? postTheme : undefined} />
          <button className="info" type="button" aria-label="What the labels mean" onClick={onLegend}>
            ?
          </button>
        </div>
      </div>
    </header>
  );
}
