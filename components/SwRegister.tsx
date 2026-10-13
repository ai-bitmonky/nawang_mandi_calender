"use client";
import { useEffect } from "react";
import { isEmbed } from "@/lib/embed";

/** Registers /sw.js in production builds only (never inside the showcase frames). */
export default function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator) || isEmbed()) return;
    const go = () => navigator.serviceWorker.register("/sw.js").catch(() => {});
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
  }, []);
  return null;
}
