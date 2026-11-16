import Link from "next/link";

export function GalleryTabs({ active, count }: { active: "photo" | "video"; count: number }) {
  return (
    <div className="catalog-tools" style={{ marginTop: 0 }}>
      <div className="filters">
        <Link href="/gallery" className={`filter${active === "photo" ? " active" : ""}`}>ფოტო გალერეა</Link>
        <Link href="/gallery/video" className={`filter${active === "video" ? " active" : ""}`}>ვიდეო გალერეა</Link>
      </div>
      <span className="count">{count} {active === "photo" ? "ფოტო" : "ვიდეო"}</span>
    </div>
  );
}
