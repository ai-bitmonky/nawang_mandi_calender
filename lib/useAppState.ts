"use client";
/* One hook for the app's state. The URL is the source of truth (?state&month&tab, plus the /item/<slug> path).
   Small changes are written with history.replaceState, which Next keeps in sync with useSearchParams,
   so picking a month or a list never refetches anything. */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { STATE_KEY, homeHref, itemFromPath, query, readState, store, type AppState } from "./appState";
import { isEmbed } from "./embed";

export function useAppState() {
  const sp = useSearchParams();
  const pathname = usePathname() || "/";
  const router = useRouter();
  const embed = isEmbed();
  const state = readState(sp, embed ? null : store.get(STATE_KEY));
  const item = itemFromPath(pathname);

  /** Write a new state into the URL (same page, no scroll, no fetch). */
  const update = useCallback(
    (next: Partial<AppState>) => {
      const cur = readState(new URLSearchParams(window.location.search), embed ? null : store.get(STATE_KEY));
      const s = { ...cur, ...next };
      window.history.replaceState(null, "", window.location.pathname + query(s, embed));
      if (!embed && next.city) store.set(STATE_KEY, next.city);
      return s;
    },
    [embed],
  );

  /** Go to the list view. Inside the showcase frames this never adds history entries. */
  const goHome = useCallback(
    (s: AppState) => {
      if (!embed) store.set(STATE_KEY, s.city);
      router.replace(homeHref(s, embed));
    },
    [embed, router],
  );

  return { state, item, pathname, embed, update, goHome, router };
}
