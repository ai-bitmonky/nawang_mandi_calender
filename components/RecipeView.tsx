"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import Art from "./Art";
import NameBits from "./NameBits";
import RecipeSections from "./RecipeSections";
import SeasonStrip from "./SeasonStrip";
import StatusGlyph from "./StatusGlyph";
import { MFULL, ZONES, type Item, type ZoneKey } from "@/lib/data";
import { homeHref } from "@/lib/appState";
import { bySlug, kindOf, rangeText, seasonOf, zoneList, zoneOf, type Kind } from "@/lib/season";
import { ST, nowMonth } from "@/lib/ui";
import { useAppState } from "@/lib/useAppState";
import { takeUserOpen } from "@/lib/userOpen";

const BackIcon = () => (
  <svg viewBox="0 0 14 14" aria-hidden="true">
    <path d="M8.5 3L4.5 7l4 4" />
  </svg>
);

/** The recipe page layout. Without a state (static HTML) it shows the names, art and dishes only. */
function Layout({
  it,
  zone,
  back,
  season,
}: {
  it: Item;
  zone: ZoneKey;
  back: React.ReactNode;
  season: React.ReactNode;
}) {
  return (
    <section>
      {back}
      <div className="rlay">
        <aside className="rside">
          <Art it={it} className="rhero" />
          <h1 className="rtitle">{it.n}</h1>
          <p className="rhi">
            <NameBits it={it} />
          </p>
          {season}
        </aside>
        <div>
          <div>
            <RecipeSections it={it} zone={zone} />
          </div>
          <p className="rnote">Tap a dish to watch how it is made on YouTube.</p>
        </div>
      </div>
    </section>
  );
}

export function RecipeFallback({ slug }: { slug: string }) {
  const it = bySlug(slug);
  if (!it) return null;
  return (
    <Layout
      it={it}
      zone={zoneOf("")}
      back={
        <Link className="back" href="/">
          <BackIcon />
          Back
        </Link>
      }
      season={null}
    />
  );
}

export default function RecipeView({ slug }: { slug: string }) {
  const { state, embed } = useAppState();
  const it = bySlug(slug);
  const backRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (takeUserOpen()) backRef.current?.focus({ preventScroll: true });
  }, [slug]);
  if (!it) return null;

  const { city, month } = state;
  const zone = zoneOf(city);
  const { kind, from } = kindOf(it, city, month);
  const line: Record<Kind, string> = {
    peak: "In season in " + city + " now.",
    new: "Just arrived in " + city + ". Freshest now.",
    last: "Last month to buy it fresh in " + city + ".",
    soon: "Arrives in " + city + " in " + MFULL[month % 12] + ".",
    away: "Shipped in from " + zoneList(from) + ".",
    off: "Not in season in " + city + " in " + MFULL[month - 1] + ".",
  };
  const s = seasonOf(it, zone);

  return (
    <Layout
      it={it}
      zone={zone}
      back={
        <Link className="back" href={homeHref(state, embed)} replace={embed} ref={backRef}>
          <BackIcon />
          Back
        </Link>
      }
      season={
        <>
          <p className={"rline st-" + kind}>
            <StatusGlyph k={ST[kind][1]} />
            <span>{line[kind]}</span>
          </p>
          <div className={"st-" + kind}>
            <SeasonStrip it={it} zone={zone} month={month} now={nowMonth()} big />
          </div>
          <p className="ycap">
            {s.local
              ? "Season in " + ZONES[zone] + ": " + rangeText(s.r) + ". Dark box: the month you picked."
              : "Not grown in " + ZONES[zone] + ". Filled months show the season where it is grown."}
          </p>
        </>
      }
    />
  );
}
