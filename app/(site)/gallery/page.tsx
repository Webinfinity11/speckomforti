import type { Metadata } from "next";
import { GalleryGrid } from "@/components/client";
import { PageHero } from "@/components/ui";
import { getGallery, getPage } from "@/lib/data";
import { GalleryTabs } from "./tabs";

export const metadata: Metadata = { title: "ფოტო გალერეა" };

export default async function GalleryPage() {
  const [page, items] = await Promise.all([getPage("gallery"), getGallery("photo")]);
  return (
    <>
      <PageHero title={page.title} intro={page.intro} crumbs={[{ label: "ფოტო გალერეა" }]} />
      <section className="section">
        <div className="container">
          <GalleryTabs active="photo" count={items.length} />
          {items.length ? <GalleryGrid items={items.map((i) => ({ src: i.src, caption: i.caption }))} /> : <div className="empty">ფოტოები მალე დაემატება.</div>}
        </div>
      </section>
    </>
  );
}
