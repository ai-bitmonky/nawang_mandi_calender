/* Sync with the showcase page when the app runs inside its frames (/?embed=1&…).
   seq counts local changes; the page echoes the last seq it saw as "ack", so stale updates are skipped. */
export type View = "main" | "recipes";
export type SyncState = { city: string; month: number; tab: string; view: View; item: string | null };

let seq = 0;
let embed: boolean | null = null;

export function isEmbed(): boolean {
  if (typeof window === "undefined") return false;
  if (embed === null) {
    let framed = false;
    try {
      framed = window.parent !== window;
    } catch {
      framed = true;
    }
    embed = framed && new URLSearchParams(window.location.search).get("embed") === "1";
  }
  return embed;
}

export const currentSeq = () => seq;

export function postState(s: SyncState) {
  if (!isEmbed()) return;
  seq++;
  window.parent.postMessage({ type: "state", ...s, seq }, "*");
}

export function postReady() {
  if (isEmbed()) window.parent.postMessage({ type: "ready" }, "*");
}

/** The theme toggle inside a frame asks the page to switch, so both frames follow. */
export function postTheme(theme: "light" | "dark") {
  if (isEmbed()) window.parent.postMessage({ type: "theme", theme }, "*");
}
