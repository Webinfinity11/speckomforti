"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HeaderSearch } from "./HeaderSearch";

type Item = { href: string; label: string };
type Menu = { key: string; label: string; base: string[]; items: Item[] };

export function NavClient({ brandName, phone, categories, services }: { brandName: string; phone: string; categories: Item[]; services: Item[] }) {
  const path = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const home = path === "/";

  // home: header floats transparent over the hero banner, turns solid white once the page scrolls
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 30);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // close menus on navigation
  useEffect(() => { setMobileOpen(false); setOpen(null); }, [path]);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (!(e.target as Element).closest?.(".nav-drop")) setOpen(null); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const menus: Menu[] = [
    { key: "products", label: "პროდუქცია", base: ["/products"], items: [{ href: "/products", label: "ყველა პროდუქტი" }, ...categories] },
    { key: "services", label: "სერვისები", base: ["/services"], items: services },
    { key: "gallery", label: "გალერეა", base: ["/gallery"], items: [{ href: "/gallery", label: "ფოტო გალერეა" }, { href: "/gallery/video", label: "ვიდეო გალერეა" }] },
    { key: "info", label: "ინფო", base: ["/news", "/laboratory", "/tile-care"], items: [{ href: "/news", label: "სიახლეები" }, { href: "/laboratory", label: "ლაბორატორია" }, { href: "/tile-care", label: "ფილების მოვლა" }] },
  ];
  const isIn = (base: string[]) => base.some((b) => path === b || path.startsWith(b + "/"));

  return (
    <>
      <header className={`header${home ? " header-home" : ""}${home && !scrolled && !mobileOpen ? " header-over" : ""}${scrolled ? " header-scrolled" : ""}`} id="top">
        <div className="container header-inner">
          <Link className="logo" href="/" aria-label={`${brandName} მთავარი`}>
            <img src="/img/logo_yellow.svg" alt={brandName} />
          </Link>
          <nav className={`nav${mobileOpen ? " mobile-open" : ""}`} id="nav">
            {menus.map((m) => (
              <div key={m.key} className={`nav-drop${open === m.key ? " open" : ""}${isIn(m.base) ? " active" : ""}`}>
                <button type="button" aria-expanded={open === m.key} onClick={(e) => { e.stopPropagation(); setOpen((o) => (o === m.key ? null : m.key)); }}>
                  {m.label}
                </button>
                <div className="dropdown">
                  {m.items.map((i) => <Link key={i.href} href={i.href}>{i.label}</Link>)}
                </div>
              </div>
            ))}
            <Link href="/about" className={isIn(["/about"]) ? "active" : undefined}>ჩვენს შესახებ</Link>
            <Link href="/contact" className={isIn(["/contact"]) ? "active" : undefined}>კონტაქტი</Link>
          </nav>
          <HeaderSearch />
          <div className="head-actions">
            {phone && (
              <a className="head-phone" href={`tel:${phone.replace(/[^+d]/g, "")}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>
                <span>{phone}</span>
              </a>
            )}
            <Link className="gold-btn" href="/products">კატალოგი</Link>
          </div>
          <button className="menu-toggle" aria-label="მენიუს გახსნა" aria-controls="nav" aria-expanded={mobileOpen} onClick={() => setMobileOpen((o) => !o)}>
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>
    </>
  );
}
