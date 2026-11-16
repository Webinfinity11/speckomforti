import Link from "next/link";
import { getCategories, getHome, getServices, getSite, lines, tel } from "@/lib/data";
import { Arrow } from "./ui";

// CTA band + footer, as in the design's shellFooter().
export async function Footer() {
  const [site, home, categories, services] = await Promise.all([getSite(), getHome(), getCategories(), getServices()]);
  const socials = [["Facebook", site.facebook], ["Instagram", site.instagram], ["YouTube", site.youtube], ["TikTok", site.tiktok]].filter(([, u]) => u);
  return (
    <>
      <section id="contact" className="cta">
        <div className="container">
          <div className="eyebrow">კონტაქტი / SK</div>
          <h2>{home.ctaTitle}</h2>
          <p>{home.ctaText}</p>
          <Link className="white-btn" href="/contact">{home.ctaButton} <Arrow /></Link>
        </div>
      </section>
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Link className="logo" href="/"><img src="/img/logo_yellow.svg" alt={site.brandName} /></Link>
              <p>{site.footerText}</p>
              {site.phone && <a href={tel(site.phone)}>{site.phone}</a>}
              {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
              {lines(site.address).map((l) => <a key={l} href="/contact">{l}</a>)}
            </div>
            <div>
              <strong>პროდუქცია</strong>
              <Link href="/products">ყველა პროდუქტი</Link>
              {categories.slice(0, 5).map((c) => <Link key={c.id} href={`/products/${c.slug}`}>{c.name}</Link>)}
            </div>
            <div>
              <strong>სერვისები</strong>
              {services.map((s) => <Link key={s.id} href={`/services/${s.slug}`}>{s.name}</Link>)}
              <Link href="/gallery">გალერეა</Link>
              {socials.map(([n, u]) => <a key={n} href={u} target="_blank" rel="noopener">{n}</a>)}
            </div>
            <div>
              <strong>ინფორმაცია</strong>
              <Link href="/news">სიახლეები</Link>
              <Link href="/laboratory">ლაბორატორია</Link>
              <Link href="/tile-care">ფილების მოვლა</Link>
              <Link href="/about">ჩვენს შესახებ</Link>
              <Link href="/contact">კონტაქტი</Link>
            </div>
          </div>
          <div className="copyright"><span>© {new Date().getFullYear()} SK. ყველა უფლება დაცულია.</span><span>{site.topRight}</span></div>
        </div>
      </footer>
    </>
  );
}
