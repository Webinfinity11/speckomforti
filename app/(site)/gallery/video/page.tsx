import type { Metadata } from "next";
import { GalleryGrid, type LightItem } from "@/components/client";
import { PageHero } from "@/components/ui";
import { getGallery, getPage, isVideoFile, youtubeId } from "@/lib/data";
import { GalleryTabs } from "../tabs";

export const metadata: Metadata = { title: "ვიდეო გალერეა" };

export default async function VideoGalleryPage() {
  const [page, items] = await Promise.all([getPage("gallery"), getGallery("video")]);
  const videos: LightItem[] = items.flatMap((v): LightItem[] => {
    if (isVideoFile(v.video_url)) return [{ src: v.src, thumb: v.src, caption: v.caption, video: v.video_url }];
    const id = youtubeId(v.video_url);
    return id ? [{ src: v.src, thumb: v.src || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, caption: v.caption, youtube: id }] : [];
  });
  return (
    <>
      <PageHero title={page.title} intro={page.intro} crumbs={[{ href: "/gallery", label: "გალერეა" }, { label: "ვიდეო გალერეა" }]} />
      <section className="section">
        <div className="container">
          <GalleryTabs active="video" count={videos.length} />
          {videos.length ? <GalleryGrid items={videos} /> : <div className="empty">ვიდეოები მალე დაემატება.</div>}
        </div>
      </section>
    </>
  );
}
