import type { CSSProperties } from "react";
import { SHAPES, type Item } from "@/lib/data";

/** The item's silhouette: shape markup from the data, coloured through --a / --b. */
export default function Art({ it, className = "art", as: Tag = "div" }: { it: Item; className?: string; as?: "div" | "span" }) {
  const style = { "--a": it.c, "--b": it.c2 || "#ffffff" } as CSSProperties;
  return (
    <Tag className={className} style={style}>
      <svg
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: SHAPES[it.s] || SHAPES.round }}
      />
    </Tag>
  );
}
