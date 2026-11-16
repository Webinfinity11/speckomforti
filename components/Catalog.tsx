import Link from "next/link";
import { PageHero, ProductCard } from "@/components/ui";
import { getCategories, getPage, getProducts, type Category } from "@/lib/data";

// Catalog page from the design (catalog.html): filters by category + product grid.
// Used for /products (all) and /products/[category] (one category selected).
export async function Catalog({ active }: { active?: Category }) {
  const [page, categories, products] = await Promise.all([getPage("products"), getCategories(), getProducts(active?.id)]);
  const catById = new Map(categories.map((c) => [c.id, c]));
  return (
    <>
      <PageHero
        title={active ? active.name : page.title}
        intro={active ? active.intro || page.intro : page.intro}
        crumbs={active ? [{ href: "/products", label: "პროდუქცია" }, { label: active.name }] : [{ label: "პროდუქცია" }]}
      />
      <section className="section">
        <div className="container">
          <div className="section-heading"><div><div className="eyebrow">კატალოგი / SK</div><h2>{active ? active.name : "ყველა პროდუქტი"}</h2></div></div>
          <div className="catalog-tools">
            <div className="filters">
              <Link className={`filter${!active ? " active" : ""}`} href="/products">ყველა</Link>
              {categories.map((c) => <Link key={c.id} className={`filter${active?.id === c.id ? " active" : ""}`} href={`/products/${c.slug}`}>{c.name}</Link>)}
            </div>
            <span className="count">{products.length} პროდუქტი</span>
          </div>
          {products.length ? (
            <div className="product-grid">
              {products.map((p) => {
                const c = catById.get(p.category_id);
                return c ? <ProductCard key={p.id} href={`/products/${c.slug}/${p.slug}`} image={p.cover} title={p.name} meta={`SK / ${c.name}`} /> : null;
              })}
            </div>
          ) : <div className="empty">ამ კატეგორიაში პროდუქცია მალე დაემატება.</div>}
        </div>
      </section>
    </>
  );
}
