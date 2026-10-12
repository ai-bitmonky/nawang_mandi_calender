import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { MFULL } from "@/lib/data";
import { nowMonth } from "@/lib/ui";

export const alt = "Mandi Calendar: what is growing near you this month";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
/* Rebuilt at most once a day, so the month stays current. */
export const revalidate = 86400;

export default async function Image() {
  const dir = path.join(process.cwd(), "app", "fonts");
  const [regular, italic] = await Promise.all([
    readFile(path.join(dir, "Fraunces-og-300.woff")),
    readFile(path.join(dir, "Fraunces-og-300-italic.woff")),
  ]);
  const month = MFULL[nowMonth() - 1];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#F4EFE4",
          backgroundImage: "radial-gradient(circle at 88% 0%, rgba(226,161,27,.38), rgba(226,161,27,0) 55%)",
          color: "#1D1A15",
          fontFamily: "Fraunces",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 34 }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, background: "#E2A11B", boxShadow: "0 0 0 8px rgba(226,161,27,.24)" }} />
          Mandi Calendar
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 190, lineHeight: 0.9, letterSpacing: -8 }}>{month}</div>
          <div style={{ fontSize: 76, fontStyle: "italic", color: "#2F6B3A", marginTop: 18, letterSpacing: -2 }}>What’s growing near you.</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: regular, style: "normal", weight: 300 },
        { name: "Fraunces", data: italic, style: "italic", weight: 300 },
      ],
    },
  );
}
