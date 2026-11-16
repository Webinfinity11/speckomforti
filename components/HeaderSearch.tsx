"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Hit = { name: string; category: string; image: string; href: string };

const Icon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="20" height="20"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);

// Search button in the header; opens a bar under the header with live product suggestions.
export function HeaderSearch() {
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => { if (open) input.current?.focus(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [open]);

  // debounced live suggestions
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setHits(null); return; }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        .then((r) => r.json()).then(setHits).catch(() => {});
    }, 220);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);

  return (
    <>
      <button type="button" className="search-toggle" aria-label="ძიება" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        {open ? <span style={{ fontSize: 22, lineHeight: 1 }}>×</span> : <Icon />}
      </button>
      {open && (
        <div className="search-bar">
          <div className="container">
            <form role="search" onSubmit={(e) => { e.preventDefault(); if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`); }}>
              <Icon />
              <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="მოძებნეთ პროდუქცია..." aria-label="პროდუქციის ძიება" />
              <button className="solid-btn" type="submit">ძიება</button>
            </form>
            {hits && (
              <div className="search-results">
                {hits.length ? (
                  <>
                    {hits.map((h) => (
                      <Link key={h.href} href={h.href} className="search-hit">
                        <span className="ph">{h.image && <img src={h.image} alt="" />}</span>
                        <span><strong>{h.name}</strong><small>{h.category}</small></span>
                      </Link>
                    ))}
                    <Link className="search-all" href={`/search?q=${encodeURIComponent(q.trim())}`}>ყველა შედეგი ↗</Link>
                  </>
                ) : <div className="search-empty">ვერაფერი მოიძებნა</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
