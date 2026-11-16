import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui";
import { getPage, getServices } from "@/lib/data";

export const metadata: Metadata = { title: "სერვისები" };

export default async function ServicesPage() {
  const [page, services] = await Promise.all([getPage("services"), getServices()]);
  return (
    <>
      <PageHero title={page.title} intro={page.intro} crumbs={[{ label: page.title }]} />
      <section className="section services">
        <div className="container">
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
    </>
  );
}
