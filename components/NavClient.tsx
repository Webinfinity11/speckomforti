"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HeaderSearch } from "./HeaderSearch";

type Item = { href: string; label: string };
type Menu = { key: string; label: string; base: string[]; items: Item[] };

export function NavClient({ brandName, topLeft, topRight, categories, services }: { brandName: string; topLeft: string; topRight: string; categories: Item[]; services: Item[] }) {
  const path = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

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
      {(topLeft || topRight) && (
        <div className="topline"><div className="container"><div>{topLeft}</div><span>{topRight}</span></div></div>
      )}
      <header className="header" id="top">
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
          <div className="head-actions"><Link className="outline-btn" href="/products">კატალოგი</Link></div>
          <button className="menu-toggle" aria-label="მენიუს გახსნა" aria-controls="nav" aria-expanded={mobileOpen} onClick={() => setMobileOpen((o) => !o)}>
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </header>
    </>
  );
}
