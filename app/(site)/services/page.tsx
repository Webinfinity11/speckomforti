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
            {services.map((s) => (
              <Link className="service-card" href={`/services/${s.slug}`} key={s.id}>
                  <img src={s.cover || "/img/installation.webp"} alt={s.name} loading="lazy" />
                  <div className="service-content">
                    <h3>{s.name}</h3>
                    <p>{s.short}</p>
                    <span className="svc-more">დეტალურად <span aria-hidden>↗</span></span>
                  </div>
                </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
