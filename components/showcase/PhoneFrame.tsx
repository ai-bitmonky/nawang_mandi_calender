import type { Ref } from "react";

/** A phone bezel around the live app (390 × 844). Scaled by DeviceStage. */
export default function PhoneFrame({ src, frameRef, boxRef, devRef }: { src: string | undefined; frameRef: Ref<HTMLIFrameElement>; boxRef: Ref<HTMLDivElement>; devRef: Ref<HTMLDivElement> }) {
  return (
    <figure className="dev dev-phone">
      <div className="dev-box" ref={boxRef}>
        <div className="device phone" ref={devRef}>
          <div className="glass">
            <div className="sbar" aria-hidden="true">
              <span>9:41</span>
              <span className="ic">
                <svg viewBox="0 0 18 12">
                  <rect x="0" y="8" width="3" height="4" rx="1" />
                  <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
                  <rect x="10" y="3" width="3" height="9" rx="1" />
                  <rect x="15" y="0" width="3" height="12" rx="1" />
                </svg>
                <svg viewBox="0 0 16 12">
                  <path d="M8 2.2c2.4 0 4.6.9 6.3 2.5l1.2-1.3C13.5 1.5 10.9.4 8 .4S2.5 1.5.5 3.4l1.2 1.3C3.4 3.1 5.6 2.2 8 2.2zm0 3.6c1.4 0 2.7.5 3.7 1.4l1.2-1.3A7.3 7.3 0 0 0 8 4a7.3 7.3 0 0 0-4.9 1.9l1.2 1.3c1-.9 2.3-1.4 3.7-1.4zM8 9.3l2.1-2.2A3 3 0 0 0 8 7.6a3 3 0 0 0-2.1.5z" />
                </svg>
                <svg viewBox="0 0 27 12">
                  <rect x=".5" y=".5" width="23" height="11" rx="3.2" fill="none" stroke="currentColor" opacity=".45" />
                  <rect x="2" y="2" width="18" height="8" rx="2" />
                  <path d="M25 4v4c.8-.3 1.4-1.1 1.4-2S25.8 4.3 25 4z" opacity=".45" />
                </svg>
              </span>
            </div>
            <iframe ref={frameRef} src={src} title="Mandi Calendar on a phone" width={390} height={844} />
            <span className="island" aria-hidden="true" />
            <span className="homebar" aria-hidden="true" />
          </div>
        </div>
      </div>
      <figcaption className="cap">
        <b>01</b> Phone <span>390 × 844</span>
      </figcaption>
    </figure>
  );
}
