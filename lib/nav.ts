/* Screen transitions on phones: push (list -> item), pop (item -> list), tab (crossfade between lists).
   Uses the View Transitions API when the browser has it; otherwise the new screen plays a CSS entrance
   on mount (AppShell reads it with navCommitted). Desktop never calls this. */
import { reducedMotion } from "./useIsMobile";

export type NavKind = "push" | "pop" | "tab";
type Enter = NavKind | "fade";

let resolveNav: (() => void) | null = null;
let enter: Enter | null = null;

export function animatedNav(kind: NavKind, go: () => void) {
  const html = document.documentElement;
  const k: Enter = reducedMotion() ? "fade" : kind;
  if (typeof document.startViewTransition !== "function") {
    enter = k;
    go();
    return;
  }
  resolveNav?.();
  html.dataset.nav = k;
  const vt = document.startViewTransition(
    () =>
      new Promise<void>((res) => {
        const t = window.setTimeout(() => {
          resolveNav = null;
          res();
        }, 900);
        resolveNav = () => {
          window.clearTimeout(t);
          resolveNav = null;
          res();
        };
        go();
      }),
  );
  vt.ready.catch(() => {});
  vt.updateCallbackDone.catch(() => {});
  vt.finished.finally(() => {
    if (html.dataset.nav === k) delete html.dataset.nav;
  });
}

/** Called once the new screen is in the DOM. Returns the CSS entrance to play when there was no view transition. */
export function navCommitted(): Enter | null {
  resolveNav?.();
  const e = enter;
  enter = null;
  return e;
}

/** A screen change that already animated by hand (swipe back): just fade the new one in. */
export function setEnter(e: Enter) {
  enter = e;
}
