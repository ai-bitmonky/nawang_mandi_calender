import type { Metadata, Viewport } from "next";
import { fraunces, hanken, tiro } from "./fonts";
import "./globals.css";

const site = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? "https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: "Mandi Calendar", template: "%s · Mandi Calendar" },
  description: "What is growing near you, month by month, for every state in India.",
  applicationName: "Mandi Calendar",
  openGraph: { type: "website", siteName: "Mandi Calendar", locale: "en_IN" },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4EFE4" },
    { media: "(prefers-color-scheme: dark)", color: "#14120E" },
  ],
};

/* Runs before paint so a saved theme never flashes. Embedded frames get ?theme= from the showcase. */
const THEME_SCRIPT = `(function(){try{var q=new URLSearchParams(location.search),t=q.get("theme");
if(t!=="light"&&t!=="dark"){t=localStorage.getItem(location.pathname.indexOf("/showcase")===0?"mandi.showcase.theme":"mandi.theme");}
if(t==="light"||t==="dark")document.documentElement.dataset.theme=t;}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${hanken.variable} ${tiro.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
