"use client";
import { useCallback, useEffect, useRef } from "react";
import { reducedMotion } from "@/lib/useIsMobile";

export type CloseSheet = (after?: () => void) => void;

/** Phone bottom sheet. Slides up; closes on a scrim tap, a drag down on the handle (> 80px), Esc, "Done",
    or the system Back (it adds one history entry while open, never inside the showcase frames).
    `after` runs once the sheet is gone and that history entry is popped, so URL updates land on the right entry. */
export default function Sheet({
  title,
  labelId,
  embed,
  onClosed,
  top,
  footer,
  children,
}: {
  title: string;
  labelId: string;
  embed: boolean;
  onClosed: () => void;
  top?: React.ReactNode;
  footer?: React.ReactNode;
  children: (close: CloseSheet) => React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);
  const closing = useRef(false);
  const done = useRef(false);
  const after = useRef<(() => void) | undefined>(undefined);
  const closedCb = useRef(onClosed);
  useEffect(() => {
    closedCb.current = onClosed;
  }, [onClosed]);

  /* slide out from wherever the panel is (it may be mid-drag), then unmount */
  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    const reduce = reducedMotion();
    const p = panel.current;
    const s = scrim.current;
    if (p) {
      p.style.transition = reduce ? "none" : "transform .22s cubic-bezier(.4,0,1,1)";
      p.style.transform = "translateY(100%)";
    }
    if (s) {
      s.style.transition = reduce ? "none" : "opacity .22s";
      s.style.opacity = "0";
    }
    window.setTimeout(
      () => {
        closedCb.current();
        const a = after.current;
        after.current = undefined;
        if (a) window.setTimeout(a, 0);
      },
      reduce ? 0 : 220,
    );
  }, []);

  const close: CloseSheet = useCallback(
    (then) => {
      if (closing.current) return;
      closing.current = true;
      after.current = then;
      if (pushed.current) {
        pushed.current = false;
        window.history.back(); /* popstate below finishes the close */
      } else finish();
    },
    [finish],
  );

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    panel.current?.focus({ preventScroll: true });
    if (!embed) {
      const st = window.history.state as Record<string, unknown> | null;
      if (!st || !st.mandiSheet) window.history.pushState({ ...(st || {}), mandiSheet: 1 }, "");
      pushed.current = true;
    }
    const onPop = () => {
      const st = window.history.state as Record<string, unknown> | null;
      if (st && st.mandiSheet) return; /* still on a sheet entry */
      pushed.current = false;
      closing.current = true;
      finish();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener("popstate", onPop);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("popstate", onPop);
      document.removeEventListener("keydown", onKey);
      opener?.focus?.({ preventScroll: true });
    };
  }, [embed, close, finish]);

  /* drag the handle down to close */
  const drag = useRef<{ y0: number; dy: number } | null>(null);
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest("button,input,a")) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { y0: e.clientY, dy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    if (panel.current) panel.current.style.transition = "none";
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || !panel.current) return;
    d.dy = Math.max(0, e.clientY - d.y0);
    panel.current.style.transform = d.dy ? "translateY(" + d.dy + "px)" : "";
    if (scrim.current) scrim.current.style.opacity = String(Math.max(0.2, 1 - d.dy / 500));
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.dy > 80) {
      close();
      return;
    }
    const p = panel.current;
    if (p) {
      p.style.transition = "transform .22s cubic-bezier(.2,.8,.2,1)";
      p.style.transform = "";
    }
    if (scrim.current) scrim.current.style.opacity = "";
  };

  return (
    <div className="msheet">
      <div className="msheet-scrim" ref={scrim} aria-hidden="true" onClick={() => close()} />
      <div className="msheet-panel" ref={panel} role="dialog" aria-modal="true" aria-labelledby={labelId} tabIndex={-1}>
        <div className="msheet-head" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
          <span className="msheet-grab" aria-hidden="true" />
          <h2 id={labelId}>{title}</h2>
          <button type="button" className="msheet-done" onClick={() => close()}>
            Done
          </button>
        </div>
        {top ? <div className="msheet-top">{top}</div> : null}
        <div className="msheet-body">{children(close)}</div>
        {footer ? <div className="msheet-foot">{footer}</div> : null}
      </div>
    </div>
  );
}
