import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, ProductCard } from "@/components/ui";
import { getCategories, searchProducts } from "@/lib/data";

export const metadata: Metadata = { title: "ძიება", robots: { index: false } };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim();
  const [hits, categories] = await Promise.all([searchProducts(q), getCategories()]);
  return (
    <>
      <PageHero title={q ? `ძიება: „${q}“` : "ძიება"} crumbs={[{ label: "ძიება" }]} />
      <section className="section">
        <div className="container">
          <form className="search-page-form" action="/search">
            <input name="q" defaultValue={q} placeholder="მოძებნეთ პროდუქცია..." aria-label="ძიება" autoFocus={!q} />
            <button className="solid-btn">ძიება</button>
          </form>
          <div className="catalog-tools">
            <div className="filters">
              {categories.map((c) => <Link key={c.id} className="filter" href={`/products/${c.slug}`}>{c.name}</Link>)}
            </div>
            {q && <span className="count">{hits.length} პროდუქტი</span>}
          </div>
          {q.length < 2
            ? <div className="empty">შეიყვანეთ მინიმუმ 2 სიმბოლო.</div>
            : hits.length
              ? <div className="product-grid">{hits.map((p) => <ProductCard key={p.id} href={`/products/${p.category_slug}/${p.slug}`} product={p} category={p.category_name} />)}</div>
              : <div className="empty">„{q}“ — ვერაფერი მოიძებნა. სცადეთ სხვა სიტყვა ან აირჩიეთ კატეგორია.</div>}
        </div>
      </section>
    </>
  );
}
