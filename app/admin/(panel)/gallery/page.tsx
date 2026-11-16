import Link from "next/link";
import { AdminForm, Field, ImageInput } from "@/components/admin/Form";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { VideoUpload } from "@/components/admin/VideoUpload";
import { addVideo } from "@/lib/admin-actions";
import { getGallery, isVideoFile, youtubeId } from "@/lib/data";

export default async function GalleryAdmin({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const kind = (await searchParams).t === "video" ? "video" : "photo";
  const items = await getGallery(kind);
  return (
    <>
      <div className="adm-head"><div><h1>გალერეა</h1><p>ფოტო და ვიდეო გალერეა.</p></div></div>
      <nav className="adm-tabs">
        <Link href="/admin/gallery" className={kind === "photo" ? "is-active" : undefined}>ფოტოები</Link>
        <Link href="/admin/gallery?t=video" className={kind === "video" ? "is-active" : undefined}>ვიდეოები</Link>
      </nav>
      {kind === "video" && (
        <>
          <VideoUpload />
          <div className="adm-or">ან</div>
          <AdminForm action={addVideo} submitLabel="YouTube ვიდეოს დამატება" key="add-video">
            <div className="adm-card">
              <h2>YouTube ვიდეო</h2>
              <div className="adm-grid">
                <Field label="YouTube ბმული" name="videoUrl" required hint="მაგ. https://www.youtube.com/watch?v=..." />
                <Field label="წარწერა" name="caption" />
                <ImageInput label="ქავერი (არასავალდებულო — თუ არ აირჩევთ, გამოჩნდება YouTube-ის სურათი)" name="coverFile" />
              </div>
            </div>
          </AdminForm>
        </>
      )}
      <GalleryManager
        key={kind + items.map((i) => i.id).join(",")}
        kind={kind}
        items={items.map((i) => {
          const file = isVideoFile(i.video_url);
          const yt = file ? null : youtubeId(i.video_url);
          return { id: i.id, src: i.src, caption: i.caption, thumb: i.src || (yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : ""), video: file ? i.video_url : undefined };
        })}
      />
    </>
  );
}
