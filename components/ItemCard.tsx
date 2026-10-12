"use client";
import Link from "next/link";
import type { CSSProperties } from "react";
import Art from "./Art";
import NameBits from "./NameBits";
import SeasonStrip from "./SeasonStrip";
import StatusGlyph from "./StatusGlyph";
import type { Item, ZoneKey } from "@/lib/data";
import { rangeText, seasonOf, zoneList, type Kind } from "@/lib/season";
import { ST } from "@/lib/ui";

/** One item: art, status chip (shape + word), names, "From …" when shipped in, and its 12-month strip. */
export default function ItemCard({
  it,
  st,
  i,
  from,
  zone,
  month,
  now,
  href,
  replace = false,
  onOpen,
}: {
  it: Item;
  st: Kind;
  i: number;
  from?: ReadonlyArray<ZoneKey>;
  zone: ZoneKey;
  month: number;
  now: number;
  href: string;
  replace?: boolean;
  onOpen: () => void;
}) {
  const s = seasonOf(it, zone);
  const [label, g] = ST[st];
  return (
    <Link
      href={href}
      replace={replace}
      className={"card st-" + st}
      style={{ "--d": Math.min(i, 16) * 40 + "ms" } as CSSProperties}
      onClick={onOpen}
    >
      <Art it={it} as="span" />
      <span className="chip">
        <StatusGlyph k={g} />
        {label}
      </span>
      <span className="cb">
        <span className="nm">{it.n}</span>
        <NameBits it={it} />
        {from && from.length ? <span className="from">From {zoneList(from)}</span> : null}
        <SeasonStrip it={it} zone={zone} month={month} now={now} />
        <span className="vh">{(s.local ? "Season here: " + rangeText(s.r) : "Not grown here") + ". Open recipes."}</span>
      </span>
    </Link>
  );
}
