"use client";
import { useSyncExternalStore } from "react";

/* Phones and portrait tablets get the native-feel shell. Layout is switched in CSS (same breakpoint);
   this hook only gates behaviour (sheets, gestures, screen transitions). False on the server and while hydrating. */
export const MOBILE_QUERY = "(max-width: 900px)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(MOBILE_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}

export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
