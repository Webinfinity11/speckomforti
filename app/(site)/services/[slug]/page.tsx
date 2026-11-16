import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GalleryGrid, InquiryButton } from "@/components/client";
import { PageHero, RichText, SectionHeading } from "@/components/ui";
import { getImages, getService, getServices } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getService((await params).slug);
  return s ? { title: s.name, description: s.short || undefined } : {};
}

export default async function ServicePage({ params }: Props) {
  const s = await getService((await params).slug);
  if (!s) notFound();
  const [images, all] = await Promise.all([getImages("service", s.id), getServices()]);
  const others = all.filter((x) => x.id !== s.id);
  const photos = images.filter((i) => i.src !== s.cover);
  return (
    <>
      <PageHero title={s.name} intro={s.short} crumbs={[{ href: "/services", label: "სერვისები" }, { label: s.name }]} />
      <section className="detail-main">
        <div className="container">
          <div className="detail-layout">
            <div className="detail-gallery-main" style={{ cursor: "default" }}>{s.cover && <img src={s.cover} alt={s.name} />}</div>
            <div className="detail-info">
              <span className="eyebrow">SK / სერვისი</span>
              <h1>{s.name}</h1>
              <RichText text={s.description} />
              <div className="detail-actions" style={{ marginTop: 26 }}>
                <InquiryButton subject={`სერვისი: ${s.name}`} label="დაგვიკავშირდით" />
                {others.map((o) => <Link key={o.id} className="outline-btn" href={`/services/${o.slug}`}>{o.name} ↗</Link>)}
              </div>
            </div>
          </div>
        </div>
      </section>
      {photos.length > 0 && (
        <section className="section muted-section">
          <div className="container">
            <SectionHeading eyebrow="SK / პროექტები" title="შესრულებული სამუშაოები" />
            <GalleryGrid items={photos.map((i) => ({ src: i.src, caption: "" }))} />
          </div>
        </section>
      )}
    </>
  );
}
