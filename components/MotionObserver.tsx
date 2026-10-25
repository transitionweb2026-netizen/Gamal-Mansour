"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Enables reveal-on-scroll. Elements with the `reveal` class stay fully visible unless this
 * script runs and the visitor allows motion — so content never depends on JavaScript.
 */
export function MotionObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      root.classList.remove("js-motion");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-shown", "");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    const pending = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not([data-shown])"));
    // Anything already on screen is shown immediately so it never flashes hidden.
    const vh = window.innerHeight;
    for (const el of pending) {
      const rect = el.getBoundingClientRect();
      if (rect.top < vh * 0.92 && rect.bottom > 0) el.setAttribute("data-shown", "");
      else observer.observe(el);
    }
    root.classList.add("js-motion");

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
