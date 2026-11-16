import Link from "next/link";
import { HeroSlider } from "@/components/BannerCarousel";
import { ProductCarousel } from "@/components/client";
import { CategoryCard, ProductCard, SectionHeading } from "@/components/ui";
import { getCategories, getGallery, getHome, getProducts, getServices } from "@/lib/data";

const trustIcons = [
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m12 2 8 4v6c0 5-3 8-8 10-5-2-8-5-8-10V6l8-4Z" /><path d="m8 12 3 3 5-6" /></svg>,
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" /></svg>,
  <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 5h13v12H1zM14 9h4l4 4v4h-8z" /><circle cx="5" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></svg>,
];

// Last word of the hero title in the logo colour.
function GoldLastWord({ text }: { text: string }) {
  const m = text.trim().match(/^([\s\S]*\s)(\S+)$/);
  return m ? <>{m[1]}<span className="gold-text">{m[2]}</span></> : <>{text}</>;
}

export default async function HomePage() {
  const [home, categories, products, services, banners] = await Promise.all([getHome(), getCategories(), getProducts(), getServices(), getGallery("banner")]);
  const homeCats = categories.filter((c) => c.on_home).length ? categories.filter((c) => c.on_home) : categories.slice(0, 4);
  const catById = new Map(categories.map((c) => [c.id, c]));
  const trust = [[home.benefit1Title, home.benefit1Text], [home.benefit2Title, home.benefit2Text], [home.benefit3Title, home.benefit3Text]];
  const info = [
    { href: "/news", eyebrow: "01 / ინფორმაცია", title: "სიახლეები", text: home.info1Text },
    { href: "/laboratory", eyebrow: "02 / ხარისხი", title: "ლაბორატორია", text: home.info2Text },
    { href: "/tile-care", eyebrow: "03 / რჩევები", title: "ფილების მოვლა", text: home.info3Text },
  ];

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-copy">
            <span className="eyebrow">{home.eyebrow}</span>
            <h1><GoldLastWord text={home.heroTitle} /></h1>
            <p>{home.heroText}</p>
            <div className="actions">
              <Link className="gold-btn" href="/products">{home.heroButton} <span>↗</span></Link>
              <Link className="outline-btn" style={{ color: "#fff", borderColor: "#888" }} href="#services">{home.heroButton2} <span>↗</span></Link>
            </div>
          </div>
          {banners.length ? (
            <HeroSlider label={home.heroLabel} slides={banners.map((b, k) => ({ src: b.src, link: b.caption, focus: b.video_url, alt: `SK სამშენებლო მასალები — ${k + 1}` }))} />
          ) : (
            <div className="hero-photo">
              <img src={home.heroImage} alt="SK სამშენებლო მასალები" />
              {home.heroLabel && <div className="hero-photo-label">{home.heroLabel}</div>}
            </div>
          )}
        </div>
      </section>

      <div className="trust">
        <div className="container trust-inner">
          {trust.map(([t, s], i) => <div className="trust-item" key={i}>{trustIcons[i]}<div><strong>{t}</strong><small>{s}</small></div></div>)}
        </div>
      </div>

      <section id="categories" className="section">
        <div className="container">
          <SectionHeading eyebrow="SK / კატეგორიები" title={home.categoriesTitle}><Link className="text-link" href="/products">მთელი კატალოგი ↗</Link></SectionHeading>
          <div className="category-grid">
            {homeCats.map((c) => <CategoryCard key={c.id} href={`/products/${c.slug}`} image={c.cover} name={c.name} />)}
          </div>
        </div>
      </section>

      <section id="about" className="muted-section">
        <div className="container stat-line">
          <h3>{home.statTitle}</h3>
          <p>{home.statText1}</p>
          <p>{home.statText2}</p>
        </div>
      </section>

      {products.length > 0 && (
        <section id="products" className="section muted-section">
          <div className="container">
            <ProductCarousel eyebrow="SK / კოლექცია" title={home.productsTitle} count={products.length}>
              {products.map((p) => {
                const c = catById.get(p.category_id);
                return c ? <ProductCard key={p.id} href={`/products/${c.slug}/${p.slug}`} image={p.cover} title={p.name} meta={`SK / ${c.name}`} /> : null;
              })}
            </ProductCarousel>
          </div>
        </section>
      )}

      {services.length > 0 && (
        <section className="section services" id="services">
          <div className="container">
            <SectionHeading eyebrow="SK / მომსახურება" title={home.servicesTitle}><p>{home.servicesText}</p></SectionHeading>
            <div className="service-grid">
              {services.map((s, i) => (
                <article className="service-card" key={s.id}>
                  {s.cover ? <img src={s.cover} alt={s.name} loading="lazy" /> : <div />}
                  <div className="service-content">
                    <div className="eyebrow">{String(i + 1).padStart(2, "0")} / სერვისი</div>
                    <h3>{s.name}</h3>
                    <p>{s.short}</p>
                    <Link className="white-btn" href={`/services/${s.slug}`}>დეტალები ↗</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section" id="gallery">
        <div className="container">
          <SectionHeading eyebrow="SK / პროექტები" title={home.galleryTitle}><p>{home.galleryText}</p></SectionHeading>
          <div className="gallery-layout">
            <Link className="gallery-tile" href="/gallery"><img src={home.galleryPhotoCover} alt="ფოტო გალერეა" loading="lazy" /><div className="gallery-caption">ფოტო გალერეა ↗</div></Link>
            <Link className="gallery-tile" href="/products"><img src={home.galleryMiddleCover} alt="პროდუქციის დეტალები" loading="lazy" /><div className="gallery-caption">პროდუქციის დეტალები ↗</div></Link>
            <Link className="gallery-tile" href="/gallery/video"><img src={home.galleryVideoCover} alt="ვიდეო გალერეა" loading="lazy" /><div className="gallery-caption">ვიდეო გალერეა ↗</div></Link>
          </div>
        </div>
      </section>

      <section className="info-band" id="info">
        <div className="container info-grid">
          {info.map((x) => (
            <Link className="info-card" href={x.href} key={x.href}>
              <span className="eyebrow">{x.eyebrow}</span>
              <strong>{x.title}</strong>
              <p>{x.text}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
