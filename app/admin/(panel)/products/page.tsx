import Link from "next/link";
import { SortableRows } from "@/components/admin/SortableRows";
import { reorderProducts } from "@/lib/admin-actions";
import { getCategories, getProducts } from "@/lib/data";

export default async function ProductsAdmin({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const categories = await getCategories();
  const catId = Number((await searchParams).cat) || categories[0]?.id;
  const cat = categories.find((c) => c.id === catId);
  const products = cat ? await getProducts(cat.id, { all: true }) : [];
  return (
    <>
      <div className="adm-head">
        <div><h1>პროდუქცია</h1><p>აირჩიეთ კატეგორია. თანმიმდევრობის შესაცვლელად გადაათრიეთ.</p></div>
        <Link className="adm-btn" href={`/admin/products/new${cat ? `?cat=${cat.id}` : ""}`}>+ ახალი პროდუქტი</Link>
      </div>
      {categories.length ? (
        <>
          <nav className="adm-tabs">
            {categories.map((c) => <Link key={c.id} href={`/admin/products?cat=${c.id}`} className={c.id === cat?.id ? "is-active" : undefined}>{c.name}</Link>)}
          </nav>
          <div className="adm-card">
            <h2>{cat?.name} ({products.length})</h2>
            <SortableRows
              key={cat?.id}
              onReorder={reorderProducts}
              empty="ამ კატეგორიაში პროდუქტი ჯერ არ არის."
              rows={products.map((p) => ({
                id: p.id, title: p.name, sub: p.price || "ფასი: შეთანხმებით", image: p.cover, href: `/admin/products/${p.id}`,
                badge: p.published ? undefined : "დამალული",
              }))}
            />
          </div>
        </>
      ) : <div className="adm-note">ჯერ დაამატეთ კატეგორია: <Link href="/admin/categories">კატეგორიები</Link></div>}
    </>
  );
}
