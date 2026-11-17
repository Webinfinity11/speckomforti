import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InquiryButton, ProductGallery } from "@/components/client";
import { PageHero, ProductCard, RichText } from "@/components/ui";
import { getCategories, getCategory, getImages, getProduct, getProducts, getSite, tel } from "@/lib/data";

type Props = { params: Promise<{ category: string; product: string }> };

async function load(params: Props["params"]) {
  const { category, product } = await params;
  const c = await getCategory(category);
  const p = c ? await getProduct(c.id, product) : null;
  return c && p ? { c, p } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await load(params);
  return r ? { title: r.p.name, description: r.p.short || r.c.intro || undefined, openGraph: r.p.cover ? { images: [r.p.cover] } : undefined } : {};
}

export default async function ProductPage({ params }: Props) {
  const r = await load(params);
  if (!r) notFound();
  const { c, p } = r;
  const [images, siblings, all, categories, site] = await Promise.all([getImages("product", p.id), getProducts(c.id), getProducts(), getCategories(), getSite()]);
  const catById = new Map(categories.map((x) => [x.id, x]));
  // "other products": same category first, then the rest
  const related = [...siblings, ...all.filter((x) => x.category_id !== c.id)].filter((x) => x.id !== p.id).slice(0, 4);

  return (
    <>
      <PageHero compact crumbs={[{ href: "/products", label: "პროდუქცია" }, { href: `/products/${c.slug}`, label: c.name }, { label: p.name }]} />
      <section className="detail-main">
        <div className="container">
          <div className="detail-layout">
            <ProductGallery images={images.map((i) => i.src)} name={p.name} />
            <div className="detail-info">
              <span className="eyebrow">SK / {c.name}</span>
              <h1>{p.name}</h1>
              {(p.short || c.intro) && <p className="intro">{p.short || c.intro}</p>}
              <h3>პროდუქტის ინფორმაცია</h3>
              <div className="specs">
                <div className="spec-row"><span>კატეგორია</span><strong><Link href={`/products/${c.slug}`}>{c.name}</Link></strong></div>
                {p.specs.map((s, i) => <div className="spec-row" key={i}><span>{s.label}</span><strong>{s.value}</strong></div>)}
                {!p.specs.length && <div className="spec-row"><span>ზომები და ფერები</span><strong>დაზუსტდება მოთხოვნით</strong></div>}
                <div className="spec-row"><span>ფასი</span><strong>{p.price || "მოთხოვნით"}</strong></div>
              </div>
              <div className="detail-actions">
                <InquiryButton subject={`პროდუქტი: ${p.name}`} label="შეკითხვის გაგზავნა" />
                {site.phone
                  ? <a className="outline-btn" href={tel(site.phone)}>☎ {site.phone}</a>
                  : <Link className="outline-btn" href="/products">კატალოგში დაბრუნება</Link>}
              </div>
            </div>
          </div>

          <div className="product-tabs">
            <h2>დამატებითი ინფორმაცია</h2>
            <div className="faq">
              <details open>
                <summary>პროდუქტის შესახებ</summary>
                {p.description ? <RichText text={p.description} /> : <p>{p.short || c.intro || "დეტალური ინფორმაციისთვის დაგვიკავშირდით."}</p>}
              </details>
              <details>
                <summary>ზომები და ტექნიკური მონაცემები</summary>
                {p.specs.length
                  ? <p>{p.specs.map((s) => `${s.label}: ${s.value}`).join(" · ")}</p>
                  : <p>ტექნიკური მახასიათებლები, ხელმისაწვდომი ზომები და ფერები დაზუსტდება მოთხოვნით.</p>}
              </details>
              <details>
                <summary>მიწოდება და შეკვეთა</summary>
                <p>{site.deliveryText}</p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section muted-section">
          <div className="container">
            <div className="section-heading">
              <div><div className="eyebrow">SK / კოლექცია</div><h2>სხვა პროდუქტები</h2></div>
              <Link href="/products" className="text-link">ყველა პროდუქტი ↗</Link>
            </div>
            <div className="product-grid">
              {related.map((x) => {
                const xc = catById.get(x.category_id);
                return xc ? <ProductCard key={x.id} href={`/products/${xc.slug}/${x.slug}`} product={x} category={xc.name} /> : null;
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
