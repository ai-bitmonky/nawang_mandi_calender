"use client";
import { useEffect, useRef, useState } from "react";
import { store } from "@/lib/appState";

const KEY = "mandi.a2hs";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
type Mode = "install" | "ios" | "other";

/** "Add Mandi to your home screen": a small bar above the tab bar, on phones, until it is closed once.
    Android Chrome gets a real Install button (beforeinstallprompt); iOS Safari gets the Share how-to.
    AppShell never renders it in the showcase frames or on desktop; it hides itself in the installed app. */
export default function A2HS() {
  const [mode, setMode] = useState<Mode | null>(null);
  const evt = useRef<InstallEvent | null>(null);

  useEffect(() => {
    if (store.get(KEY)) return;
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      evt.current = e as InstallEvent;
      setMode("install");
    };
    const onInstalled = () => {
      store.set(KEY, "installed");
      setMode(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    /* give Chrome a moment to offer the install prompt before falling back to the how-to line */
    const t = window.setTimeout(() => setMode((m) => m || (ios ? "ios" : "other")), 2500);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!mode) return null;
  const close = () => {
    store.set(KEY, "closed");
    setMode(null);
  };
  const install = async () => {
    const e = evt.current;
    if (!e) return;
    evt.current = null;
    await e.prompt();
    const { outcome } = await e.userChoice;
    if (outcome === "accepted") store.set(KEY, "installed");
    setMode(null);
  };

  return (
    <div className="a2hs" role="region" aria-label="Install the app">
      <i aria-hidden="true" />
      <p>
        <b>Add Mandi to your home screen</b>
        {mode === "ios" ? "Tap Share, then Add to Home Screen." : mode === "install" ? "It opens like an app, even offline." : "Open the browser menu, then Add to Home screen."}
      </p>
      {mode === "install" ? (
        <button type="button" className="a2hs-go" onClick={install}>
          Install
        </button>
      ) : null}
      <button type="button" className="a2hs-x" aria-label="Close" onClick={close}>
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 2l8 8M10 2l-8 8" />
        </svg>
      </button>
    </div>
  );
}
