"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Slide = { src: string; link: string; alt: string; focus?: string };

// Slides inside the hero's right photo area (same box as the single hero photo). The box has the banners' proportions,
// so each banner fills it whole; slides cross-fade. Arrows, dots, autoplay, swipe.
export function HeroSlider({ slides, label, interval = 6000 }: { slides: Slide[]; label?: string; interval?: number }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = slides.length;
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);

  useEffect(() => {
    if (n < 2 || paused) return;
    const t = setInterval(() => go(1), interval);
    return () => clearInterval(t);
  }, [n, paused, go, interval, i]);

  return (
    <div
      className="hero-photo hero-slider"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; setPaused(true); }}
      onTouchEnd={(e) => {
        const start = touchX.current; touchX.current = null; setPaused(false);
        if (start === null) return;
        const dx = e.changedTouches[0].clientX - start;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
      }}
    >
      {slides.map((s, k) => {
                const pos = s.focus === "left" || s.focus === "right" ? s.focus : "center";
        const img = <img src={s.src} alt={s.alt} loading={k === 0 ? "eager" : "lazy"} draggable={false} style={{ objectPosition: `${pos} center` }} />;
        return (
          <div className={`hero-slide${k === i ? " active" : ""}`} key={s.src + k} aria-hidden={k !== i}>
            {s.link ? <a href={s.link} tabIndex={k === i ? 0 : -1}>{img}</a> : img}
          </div>
        );
      })}
      {label && <div className="hero-photo-label">{label}</div>}
      {n > 1 && (
        <>
          <button className="banner-arrow prev" aria-label="წინა" onClick={() => go(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m15 5-7 7 7 7" /></svg>
          </button>
          <button className="banner-arrow next" aria-label="შემდეგი" onClick={() => go(1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m9 5 7 7-7 7" /></svg>
          </button>
          <div className="banner-dots">
            {slides.map((_, k) => <button key={k} className={k === i ? "active" : undefined} aria-label={`სლაიდი ${k + 1}`} onClick={() => setI(k)} />)}
          </div>
        </>
      )}
    </div>
  );
}
