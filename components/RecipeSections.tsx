import { R, REGION, type Item, type Recipe, type ZoneKey } from "@/lib/data";
import { yt } from "@/lib/season";
import { plural } from "@/lib/ui";

function Section({ title, rows, emptyText }: { title: string; rows: ReadonlyArray<Recipe>; emptyText: string }) {
  if (!rows.length && !emptyText) return null;
  return (
    <section className="rsec">
      <div className="rsec-head">
        <h2>{title}</h2>
        <span>{rows.length ? plural(rows.length, "dish", "dishes") : ""}</span>
      </div>
      {!rows.length ? (
        <p className="rempty">{emptyText}</p>
      ) : (
        <div className="rlist">
          {rows.map(([name, desc]) => (
            <a key={name} className="rrow" href={yt(name)} target="_blank" rel="noopener noreferrer" aria-label={name + ": " + desc + ". Opens YouTube."}>
              <span className="rt">
                <span className="rn">{name}</span>
                <span className="rd">{desc}</span>
              </span>
              <span className="ra" aria-hidden="true">
                <svg viewBox="0 0 10 10">
                  <path d="M1 0l9 5-9 5z" />
                </svg>
              </span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

/** Dishes split three ways: from the user's region, rest of India, around the world. */
export default function RecipeSections({ it, zone }: { it: Item; zone: ZoneKey }) {
  const all = R[it.n] || [];
  const tagsOf = (r: Recipe) => r[2].split(" ");
  const local = all.filter((r) => tagsOf(r).includes(zone));
  const indian = all.filter((r) => !tagsOf(r).includes(zone) && r[2] !== "INT");
  const world = all.filter((r) => r[2] === "INT");
  return (
    <>
      <Section title={"From " + REGION[zone]} rows={local} emptyText="No local dish on file yet. Try one from the rest of India below." />
      <Section title="Rest of India" rows={indian} emptyText="" />
      <Section title="Around the world" rows={world} emptyText="" />
    </>
  );
}
