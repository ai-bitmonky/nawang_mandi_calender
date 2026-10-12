# Mandi Calendar

What is growing near you, month by month, for every state in India.

Pick a state and a month. The app sorts 69 fruits and vegetables into four lists:

- **In season**: at its peak, cheapest and best. The first weeks say *Just arrived*.
- **Ending**: last month to buy it fresh.
- **Next month**: arrives soon, worth waiting for.
- **Not local**: grown in other states and trucked in. Pricier, less fresh.

Tap any item for its season strip and dishes from your region, the rest of India and the world. Each dish opens a YouTube search for how to make it.

## Pages

| Route | What it is |
| --- | --- |
| `/` | The app. State lives in the URL: `/?state=Punjab&month=10&tab=now` (`tab` is `now`, `ending`, `next` or `around`). With no `state`, the last state you picked is used, otherwise Punjab. With no `month`, the current month in India. |
| `/item/[slug]` | Recipe page for one item, for example `/item/mango?state=Kerala&month=4`. All 69 are pre-rendered. |
| `/showcase` | Presentation page: the live app in a phone frame and a desktop frame, kept in sync, plus the year wheel and the four lists. |

## Run it

Requires Node 20 or newer (`.nvmrc` pins 22).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # serve the build
npm run lint
```

## Deploy on Vercel

Import the repository in Vercel. No settings or environment variables are needed: the framework preset is detected and every page is static.

Optional: set `NEXT_PUBLIC_SITE_URL` (for example `https://mandi.example.com`) so social preview links use your own domain. Without it, Vercel's production URL is used.

## How it is built

- Next.js 15 (App Router), React 19, strict TypeScript. No UI libraries and no Tailwind.
- Plain CSS: `app/globals.css` holds the colour tokens (light and dark, WCAG AA) and base rules. `components/App.module.css` and `components/showcase/Showcase.module.css` hold the app and showcase styles, ported from the prototype.
- Fonts: Fraunces, Hanken Grotesk and Tiro Devanagari Hindi, self-hosted through `next/font/local` from `app/fonts/` (SIL Open Font License, licence files alongside). The build makes no network calls.
- Illustrations are inline SVG silhouettes (`components/Art.tsx`), coloured per item.
- Theme: follows the system by default. The sun/moon button saves a choice in `localStorage` (`mandi.theme`). A small inline script applies it before first paint.
- Showcase sync: the frames load `/?embed=1&…`. Each change inside a frame is posted to the page with a sequence number; the page echoes the last number it saw (`ack`), so stale updates are skipped. The page is the source of truth and also drives the theme of both frames.

```
app/
  (app)/layout.tsx         header, legend and frame sync around the app pages
  (app)/page.tsx           /
  (app)/item/[slug]/       /item/[slug]
  showcase/page.tsx        /showcase
  layout.tsx, globals.css, fonts.ts, fonts/
  icon.svg, manifest.ts, opengraph-image.tsx
components/                Header, MonthStrip, Tabs, ItemCard, Art, StatusGlyph, Legend, ThemeToggle, RecipeSections, …
components/showcase/       Showcase, PhoneFrame, DesktopFrame, YearWheel, Chapters
lib/data.ts                generated data (do not edit by hand)
lib/season.ts              season rules: zoneOf, inRange, prev, statusOf, buckets, yt, slug
data/source-data.js        source data (from the prototype)
scripts/gen-data.mjs       turns data/source-data.js into lib/data.ts
```

## Data

Seasons are kept per climate zone, not per state, because hills and plains in one state can be weeks apart. There are eight zones: North plains, Ladakh, Kashmir, Himachal & Uttarakhand hills, West & Central, South, East plains and Northeast. Each state maps to one zone.

- **Seasons**: compiled from National Horticulture Board and state agriculture department sources.
- **Not local**: an item counts as shipped in only from zones holding a leading producer that trucks it out (NHB, APEDA, MoSPI state data, 2021–23). Some items only reach nearby zones.
- **Dishes**: tagged by region. Videos are YouTube searches, not fixed links.

### Status rules

For an item with season `[start, end]` in your zone (it may wrap the year, for example October to February):

- the end month → **Last month**
- the start month → **Just arrived**
- any month in between → **In season**
- the month before the start → **Next month**

The *In season* list puts Last month first, then Just arrived, then In season, each by name.

### Change the data

1. Edit `data/source-data.js`.
2. Run `npm run gen-data`. This rewrites `lib/data.ts`.
3. Commit both files.
