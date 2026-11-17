import Link from "next/link";
import { Fragment } from "react";
import type { Product } from "@/lib/data";

export type Crumb = { href?: string; label: string };

export const Arrow = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>
);

// Dark band with breadcrumbs, as on the design's catalog/product pages.
export function PageHero({ title, intro, crumbs, compact }: { title?: string; intro?: string; crumbs: Crumb[]; compact?: boolean }) {
  return (
    <section className={`page-hero${compact ? " compact" : ""}`}>
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/">მთავარი</Link>
          {crumbs.map((c, i) => (
            <Fragment key={i}>
              {" "}<span>/</span>
              {c.href ? <Link href={c.href}>{c.label}</Link> : c.label}
            </Fragment>
          ))}
        </div>
        {title && <h1>{title}</h1>}
        {intro && <p>{intro}</p>}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="section-heading">
      <div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h2>{title}</h2></div>
      {children}
    </div>
  );
}

// Plain-text content from the admin: blank line = paragraph, "## " = heading, "- " = list.
export function RichText({ text }: { text: string }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  if (!blocks.length) return null;
  return (
    <div className="prose">
      {blocks.map((b, i) => {
        const rows = b.split("\n");
        if (rows[0].startsWith("## ")) {
          const rest = rows.slice(1).join("\n").trim();
          return <Fragment key={i}><h2>{rows[0].slice(3)}</h2>{rest && <RichBlock text={rest} />}</Fragment>;
        }
        return <RichBlock key={i} text={b} />;
      })}
    </div>
  );
}

function RichBlock({ text }: { text: string }) {
  const rows = text.split("\n");
  if (rows.every((r) => /^[-•]\s/.test(r.trim()))) return <ul>{rows.map((r, j) => <li key={j}>{r.trim().slice(2)}</li>)}</ul>;
  return <p>{rows.map((r, j) => <Fragment key={j}>{j > 0 && <br />}{r}</Fragment>)}</p>;
}

// Shop-style product card: whole product on a white square, category, name, price or "on request", button.
export function ProductCard({ href, product, category }: { href: string; product: Product; category: string }) {
  return (
    <Link className="shop-card" href={href}>
      <div className="shop-image">
        <img src={product.cover || "/img/logo_yellow.svg"} alt={product.name} loading="lazy" className={product.cover ? undefined : "ph"} />
      </div>
      <div className="shop-body">
        <small>{category}</small>
        <strong>{product.name}</strong>
        <div className="shop-foot">
          <span className="shop-price">{product.price || "ფასი მოთხოვნით"}</span>
          <span className="shop-btn">დეტალურად <Arrow /></span>
        </div>
      </div>
    </Link>
  );
}

export function CategoryCard({ href, image, name }: { href: string; image: string; name: string }) {
  return (
    <Link className="category-card" href={href}>
      <div className="category-image"><img src={image || "/img/logo_yellow.svg"} alt={name} loading="lazy" /></div>
      <div className="category-text"><strong>{name}</strong><Arrow /></div>
    </Link>
  );
}
