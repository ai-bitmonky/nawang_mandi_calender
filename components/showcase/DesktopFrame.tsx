import type { Ref } from "react";

/** A browser window around the live app (1280 × 820). Scaled by DeviceStage. */
export default function DesktopFrame({ src, frameRef, boxRef, devRef }: { src: string | undefined; frameRef: Ref<HTMLIFrameElement>; boxRef: Ref<HTMLDivElement>; devRef: Ref<HTMLDivElement> }) {
  return (
    <figure className="dev dev-desk">
      <div className="dev-box" ref={boxRef}>
        <div className="device browser" ref={devRef}>
          <div className="chrome" aria-hidden="true">
            <span className="dots">
              <i />
              <i />
              <i />
            </span>
            <span className="url">
              <svg viewBox="0 0 11 11">
                <rect x="1.5" y="5" width="8" height="5.2" rx="1.2" />
                <path d="M3.3 5V3.6a2.2 2.2 0 0 1 4.4 0V5" />
              </svg>
              <b>mandi.calendar</b>
            </span>
            <span />
          </div>
          <iframe ref={frameRef} src={src} title="Mandi Calendar on a desktop" width={1280} height={820} />
        </div>
      </div>
      <figcaption className="cap">
        <b>02</b> Desktop <span>1280 × 820</span>
      </figcaption>
    </figure>
  );
}
