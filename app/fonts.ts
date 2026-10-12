import localFont from "next/font/local";

/* Self-hosted copies of the Google fonts (SIL OFL 1.1, licences in app/fonts/).
   Local files keep the build offline-safe and avoid a runtime call to Google. */
export const fraunces = localFont({
  src: [
    { path: "./fonts/Fraunces-opsz-normal.woff2", style: "normal", weight: "100 900" },
    { path: "./fonts/Fraunces-opsz-italic.woff2", style: "italic", weight: "100 900" },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const hanken = localFont({
  src: [
    { path: "./fonts/HankenGrotesk-400.woff2", style: "normal", weight: "400" },
    { path: "./fonts/HankenGrotesk-500.woff2", style: "normal", weight: "500" },
    { path: "./fonts/HankenGrotesk-600.woff2", style: "normal", weight: "600" },
    { path: "./fonts/HankenGrotesk-700.woff2", style: "normal", weight: "700" },
  ],
  variable: "--font-body",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

export const tiro = localFont({
  src: [{ path: "./fonts/TiroDevanagariHindi-400.woff2", style: "normal", weight: "400" }],
  variable: "--font-hindi",
  display: "swap",
  fallback: ["Noto Sans Devanagari", "serif"],
});
