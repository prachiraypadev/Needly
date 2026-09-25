"use client";

import { useEffect, useState } from "react";

export const SCENE_READY_EVENT = "jod:scene-ready";

const MESSAGES = [
  "Knocking on neighbours' doors…",
  "Checking the trust boundary…",
  "Finding who has a spare drill…",
  "Jod-ing your community…",
];

/**
 * Preloader — two neighbours (dots) start apart, a parcel passes between
 * them and they tie into the Jod knot. It waits for the 3D scene to report
 * its first frame, so nobody sees a half-built courtyard.
 */
export function Preloader() {
  const [count, setCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const onReady = () => setReady(true);
    window.addEventListener(SCENE_READY_EVENT, onReady);
    // Never hold the page hostage: give up waiting after a few seconds.
    const failsafe = window.setTimeout(onReady, 4500);
    document.documentElement.classList.add("jod-loading");
    return () => {
      window.removeEventListener(SCENE_READY_EVENT, onReady);
      window.clearTimeout(failsafe);
      document.documentElement.classList.remove("jod-loading");
    };
  }, []);

  // Count up to 88 on its own; the last stretch waits for the scene.
  useEffect(() => {
    const cap = ready ? 100 : 88;
    if (count >= cap) return;
    const id = window.setTimeout(
      () => setCount((c) => Math.min(cap, c + (ready ? 4 : 1 + Math.floor(Math.random() * 3)))),
      ready ? 12 : 28
    );
    return () => window.clearTimeout(id);
  }, [count, ready]);

  useEffect(() => {
    if (count < 100) return;
    const leave = window.setTimeout(() => {
      setLeaving(true);
      document.documentElement.classList.remove("jod-loading");
    }, 250);
    const remove = window.setTimeout(() => setGone(true), 1400);
    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(remove);
    };
  }, [count]);

  if (gone) return null;

  return (
    <div className="jod-preloader" data-leaving={leaving} role="status" aria-live="polite">
      <div className="jod-preloader__panel jod-preloader__panel--top" />
      <div className="jod-preloader__panel jod-preloader__panel--bottom" />

      <div className="jod-preloader__content">
        <svg viewBox="0 0 220 90" className="jod-preloader__mark" aria-hidden="true">
          <path className="jod-preloader__rope" d="M30 45 C 70 5, 150 5, 190 45" />
          <circle className="jod-preloader__nb jod-preloader__nb--a" cx="30" cy="45" r="13" />
          <circle className="jod-preloader__nb jod-preloader__nb--b" cx="190" cy="45" r="13" />
          <rect className="jod-preloader__parcel" x="182" y="37" width="16" height="16" rx="4" />
        </svg>

        <div className="jod-preloader__word" aria-hidden="true">
          {"Jod".split("").map((ch, i) => (
            <span key={i} style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
              {ch}
            </span>
          ))}
        </div>

        <p className="jod-preloader__msg">{MESSAGES[Math.min(MESSAGES.length - 1, Math.floor(count / 26))]}</p>

        <div className="jod-preloader__bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${count / 100})` }} />
        </div>
        <span className="jod-preloader__count">{String(count).padStart(3, "0")}</span>
        <span className="sr-only">Loading Jod, {count}%</span>
      </div>
    </div>
  );
}
