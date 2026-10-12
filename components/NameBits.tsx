import { HINDI, type Item } from "@/lib/data";

/** Hindi name, then the Hinglish name when it differs from the English one. */
export default function NameBits({ it }: { it: Item }) {
  return (
    <span className="hi">
      <span lang="hi">{HINDI[it.n] || ""}</span>
      {it.l && it.l !== it.n ? " · " + it.l : ""}
    </span>
  );
}
