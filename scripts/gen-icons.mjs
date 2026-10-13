/* App icons for the PWA manifest and iOS, rendered from app/icon.svg with sharp.
   Writes public/icons/*.png (committed). Runs before `next build`; skips work when the PNGs are newer
   than the SVG, and skips quietly if sharp is not installed (the committed PNGs are used as they are). */
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "app", "icon.svg");
const out = join(root, "public", "icons");
const svg = readFileSync(src, "utf8");

/* full-bleed square: iOS and Android round the corners themselves */
const square = svg.replace(/\srx="[^"]*"/, "");
/* maskable: art inside the 80% safe circle */
const maskable = square.replace(/(<circle[\s\S]*<\/svg>)/, (m) => `<g transform="translate(32 32) scale(.78) translate(-32 -32)">${m.replace("</svg>", "")}</g></svg>`);

const jobs = [
  ["icon-192.png", svg, 192],
  ["icon-512.png", svg, 512],
  ["icon-maskable-512.png", maskable, 512],
  ["apple-touch-icon.png", square, 180],
];

const srcTime = statSync(src).mtimeMs;
const stale = jobs.filter(([f]) => !existsSync(join(out, f)) || statSync(join(out, f)).mtimeMs < srcTime);
if (!stale.length) process.exit(0);

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.warn("gen-icons: sharp is not installed; keeping the committed icons.");
  process.exit(0);
}
mkdirSync(out, { recursive: true });
for (const [file, markup, size] of stale) {
  await sharp(Buffer.from(markup), { density: Math.ceil((72 * size) / 64) })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(join(out, file));
  console.log("gen-icons: wrote public/icons/" + file);
}
