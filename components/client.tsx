"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { sendMessage, type ActionState } from "@/lib/admin-actions";

const Arrow = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>
);

/* ---------- homepage carousel (same behaviour as the design's main.js) ---------- */

export function ProductCarousel({ title, children, count }: { title: string; children: React.ReactNode; count: number }) {
  const track = useRef<HTMLDivElement>(null);
  const pos = useRef(0);
  const slide = useCallback((want: number) => {
    const el = track.current;
    const card = el?.querySelector<HTMLElement>(".shop-card");
    if (!el || !card) return;
    const visible = innerWidth <= 800 ? 2 : innerWidth <= 1150 ? 3 : 4;
    pos.current = Math.min(Math.max(want, 0), Math.max(0, count - visible));
    const gap = parseFloat(getComputedStyle(el).gap) || 18;
    el.style.transform = `translateX(-${pos.current * (card.getBoundingClientRect().width + gap)}px)`;
  }, [count]);
  useEffect(() => {
    const onResize = () => slide(pos.current);
    addEventListener("resize", onResize);
    return () => removeEventListener("resize", onResize);
  }, [slide]);
  return (
    <>
      <div className="section-heading">
        <div><h2>{title}</h2></div>
        <div className="carousel-control">
          <button className="circle-btn" aria-label="წინა" onClick={() => slide(pos.current - 1)}>‹</button>
          <button className="circle-btn" aria-label="შემდეგი" onClick={() => slide(pos.current + 1)}>›</button>
        </div>
      </div>
      <div className="carousel-viewport"><div className="carousel-track" ref={track}>{children}</div></div>
    </>
  );
}

/* ---------- lightbox: photos, uploaded videos and YouTube ---------- */

export type LightItem = { src: string; caption: string; youtube?: string | null; video?: string; thumb?: string };

function Lightbox({ items, index, onClose, onMove }: { items: LightItem[]; index: number; onClose: () => void; onMove: (d: number) => void }) {
  const item = items[index];
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onMove(1);
      if (e.key === "ArrowLeft") onMove(-1);
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [onClose, onMove]);
  if (!item) return null;
  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="გალერეა" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {items.length > 1 && <button className="lightbox-nav prev" aria-label="წინა" onClick={() => onMove(-1)}>‹</button>}
      <div className="lightbox-panel">
        <button className="lightbox-close" aria-label="დახურვა" onClick={onClose}>×</button>
        {item.video
          ? <video key={item.video} src={item.video} controls autoPlay playsInline />
          : item.youtube
          ? <iframe src={`https://www.youtube-nocookie.com/embed/${item.youtube}?autoplay=1&rel=0`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen title={item.caption || "ვიდეო"} />
          : <img src={item.src} alt={item.caption} />}
        {item.caption && <p className="lightbox-caption">{item.caption}</p>}
      </div>
      {items.length > 1 && <button className="lightbox-nav next" aria-label="შემდეგი" onClick={() => onMove(1)}>›</button>}
    </div>
  );
}

function useLightbox(count: number) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const move = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + count) % count)), [count]);
  return { open, setOpen, close, move };
}

export function GalleryGrid({ items }: { items: LightItem[] }) {
  const lb = useLightbox(items.length);
  return (
    <>
      <div className="photo-grid">
        {items.map((it, i) => (
          <button key={i} className="gallery-tile" onClick={() => lb.setOpen(i)}>
            {it.thumb || it.src
              ? <img src={it.thumb || it.src} alt={it.caption} loading="lazy" />
              : it.video && <video src={`${it.video}#t=0.5`} preload="metadata" muted playsInline />}
            {(it.youtube || it.video) && <span className="play-mark">VIDEO</span>}
            {it.caption && <div className="gallery-caption">{it.caption}</div>}
          </button>
        ))}
      </div>
      {lb.open !== null && <Lightbox items={items} index={lb.open} onClose={lb.close} onMove={lb.move} />}
    </>
  );
}

/* ---------- product photos ---------- */

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const lb = useLightbox(images.length);
  const list = images.length ? images : ["/img/logo_yellow.svg"];
  return (
    <div className="detail-gallery">
      <button className="detail-gallery-main" onClick={() => images.length && lb.setOpen(active)} aria-label="სურათის გადიდება">
        <img src={list[active]} alt={name} />
      </button>
      {list.length > 1 && (
        <div className="thumbs">
          {list.map((src, i) => (
            <button key={src + i} className={`thumb${i === active ? " active" : ""}`} onClick={() => setActive(i)} aria-label={`${name} ფოტო ${i + 1}`}>
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
      {lb.open !== null && <Lightbox items={images.map((src) => ({ src, caption: name }))} index={lb.open} onClose={lb.close} onMove={lb.move} />}
    </div>
  );
}

/* ---------- forms: contact page form and the inquiry modal both save to /admin/messages ---------- */

function FormFields({ subject, withEmail }: { subject: string; withEmail?: boolean }) {
  return (
    <>
      <input type="hidden" name="subject" value={subject} />
      <label className="hp" aria-hidden="true">Website<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
      <div className="form-two">
        <label>სახელი *<input name="name" required autoComplete="name" placeholder="თქვენი სახელი" /></label>
        <label>ტელეფონი *<input name="phone" type="tel" autoComplete="tel" placeholder="საკონტაქტო ნომერი" /></label>
      </div>
      {withEmail && <label>ელფოსტა<input name="email" type="email" autoComplete="email" /></label>}
      <label>დეტალები<textarea name="body" rows={4} placeholder="რაოდენობა, ზომა ან სხვა ინფორმაცია" /></label>
    </>
  );
}

function useSend() {
  const [state, action, pending] = useActionState<ActionState, FormData>(sendMessage, {});
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) form.current?.reset(); }, [state]);
  return { state, action, pending, form };
}

export function ContactForm({ title = "მოგვწერეთ", text, subject = "" }: { title?: string; text?: string; subject?: string }) {
  const { state, action, pending, form } = useSend();
  return (
    <form className="form-box" action={action} ref={form} id="inquiry">
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      <FormFields subject={subject} withEmail />
      <button className="solid-btn" disabled={pending}>{pending ? "იგზავნება..." : "გაგზავნა"} <Arrow /></button>
      {state.error && <div className="form-status err">{state.error}</div>}
      {state.ok && <div className="form-status ok">✓ {state.message}</div>}
    </form>
  );
}

export function InquiryButton({ subject, label, className = "solid-btn" }: { subject: string; label: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const { state, action, pending, form } = useSend();
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open]);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>{label} <Arrow /></button>
      {open && (
        <div className="modal open" role="dialog" aria-modal="true" aria-label="მოთხოვნის გაგზავნა" onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
          <form className="modal-panel" action={action} ref={form}>
            <button className="close-modal" type="button" aria-label="დახურვა" onClick={() => setOpen(false)}>×</button>
            <h3>მოთხოვნის გაგზავნა</h3>
            <p>შეავსეთ ინფორმაცია და ჩვენ მალე დაგიკავშირდებით.</p>
            <label>პროდუქტი / სერვისი<input value={subject} readOnly /></label>
            <FormFields subject={subject} />
            <button className="solid-btn" disabled={pending}>{pending ? "იგზავნება..." : "მოთხოვნის გაგზავნა"}</button>
            {state.error && <p className="form-status err">{state.error}</p>}
            {state.ok && <p className="form-status ok">✓ {state.message}</p>}
          </form>
        </div>
      )}
    </>
  );
}
