"use client";

import { useEffect } from "react";
import Lenis from "lenis";

let lenis: Lenis | null = null;

/** Scroll to an absolute Y position, through Lenis when it's running. */
export function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { duration: 1.6 });
  else window.scrollTo({ top: y, behavior: "smooth" });
}

/**
 * Buttery inertial scrolling for the marketing page. The 3D story is
 * scrubbed by scroll position, so smoothing the scroll smooths the film.
 * Skipped entirely for visitors who prefer reduced motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({ lerp: 0.085, anchors: { offset: -64 }, autoRaf: true });
    lenis = instance;

    return () => {
      instance.destroy();
      if (lenis === instance) lenis = null;
    };
  }, []);

  return null;
}
