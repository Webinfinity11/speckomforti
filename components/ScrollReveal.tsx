"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// One scroll animation for the whole site: blocks fade up into place as they enter the viewport,
// cards in a row follow each other with a small delay.
const SELECTOR = [
  ".section-heading", ".trust-item", ".category-card", ".shop-card", ".service-card", ".gallery-tile",
  ".stat-line > *", ".cta-inner > *", ".footer-grid > div", ".split > *", ".contact-grid > *", ".news-card", ".prose",
].join(",");

export function ScrollReveal() {
  const path = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR)).filter((el) => !el.classList.contains("rv"));
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("rv-in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    for (const el of els) {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) continue; // already on screen: leave as is, no flash
      const sibs = el.parentElement ? Array.from(el.parentElement.children).filter((c) => c.matches(SELECTOR)) : [];
      const k = Math.max(0, sibs.indexOf(el));
      el.style.transitionDelay = `${Math.min(k, 5) * 90}ms`;
      el.classList.add("rv");
      io.observe(el);
    }
    return () => io.disconnect();
  }, [path]);
  return null;
}
