import type { GlyphKey } from "@/lib/ui";

/** Shape-first status sign: solid = in season, half = last month, ring = next month, strike = not local. */
export default function StatusGlyph({ k, className = "g" }: { k: GlyphKey; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 10 10" aria-hidden="true">
      {k === "solid" && <circle cx="5" cy="5" r="4.2" fill="currentColor" />}
      {k === "half" && (
        <>
          <circle cx="5" cy="5" r="3.9" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M5 1.1a3.9 3.9 0 0 0 0 7.8z" fill="currentColor" />
        </>
      )}
      {k === "ring" && <circle cx="5" cy="5" r="3.7" fill="none" stroke="currentColor" strokeWidth="1.6" />}
      {k === "strike" && (
        <>
          <circle cx="5" cy="5" r="3.7" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M1.4 8.6L8.6 1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}
