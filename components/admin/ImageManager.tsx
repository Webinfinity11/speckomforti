"use client";

import { useRef, useState } from "react";
import { deleteImage, reorderImages, uploadOwnerImage } from "@/lib/admin-actions";
import { useSortable } from "./SortableList";

type Img = { id: number; src: string };

// Photos of a product / service: multi-upload, drag to reorder (first = cover), delete.
export function ImageManager({ owner, ownerId, images, title = "ფოტოები" }: { owner: "product" | "service"; ownerId: number; images: Img[]; title?: string }) {
  const { items, setItems, bind, cls } = useSortable(images, (ids) => reorderImages(ids));
  const [progress, setProgress] = useState("");
  const [busy, setBusy] = useState(false);
  const [dropOn, setDropOn] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function upload(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setBusy(true);
    const errors: string[] = [];
    for (const [i, f] of list.entries()) {
      setProgress(`იტვირთება ${i + 1} / ${list.length}...`);
      const fd = new FormData();
      fd.append("file", f);
      const res = await uploadOwnerImage(owner, ownerId, fd);
      if ("image" in res && res.image) { const img = res.image; setItems((prev) => [...prev, img]); }
      else errors.push(`${f.name}: ${"error" in res ? res.error : ""}`);
    }
    setBusy(false);
    setProgress(errors.length ? `შეცდომა: ${errors.join("; ")}` : `✓ ატვირთულია ${list.length} ფოტო`);
    if (input.current) input.current.value = "";
  }

  async function remove(id: number) {
    if (!confirm("წავშალოთ ეს ფოტო?")) return;
    setItems((prev) => prev.filter((x) => x.id !== id));
    await deleteImage(id);
  }

  return (
    <div className="adm-card">
      <h2>{title} ({items.length})</h2>
      <div
        className={`adm-drop${dropOn ? " on" : ""}`}
        onClick={() => !busy && input.current?.click()}
        onDragOver={(e) => { if (e.dataTransfer.types.includes("Files")) { e.preventDefault(); setDropOn(true); } }}
        onDragLeave={() => setDropOn(false)}
        onDrop={(e) => { if (e.dataTransfer.files.length) { e.preventDefault(); setDropOn(false); upload(e.dataTransfer.files); } }}
      >
        <b>{busy ? "იტვირთება..." : "აირჩიეთ ფოტოები"}</b> ან გადმოათრიეთ აქ · შეგიძლიათ რამდენიმე ერთად
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} />
      </div>
      {progress && <div className="adm-progress">{progress}</div>}
      {items.length ? (
        <div className="adm-photos">
          {items.map((img, i) => (
            <div key={img.id} className={`adm-photo${cls(img.id)}`} {...bind(img.id)}>
              <img src={img.src} alt="" loading="lazy" />
              <span className="num">{i === 0 ? "მთავარი" : i + 1}</span>
              <button type="button" className="del" onClick={() => remove(img.id)} aria-label="წაშლა">×</button>
            </div>
          ))}
        </div>
      ) : <p style={{ color: "#6b6f78" }}>ფოტოები ჯერ არ არის ატვირთული.</p>}
      <p style={{ color: "#8a8e96", fontSize: 12.5, marginTop: 14 }}>თანმიმდევრობის შესაცვლელად გადაათრიეთ ფოტო. პირველი ფოტო მთავარია (ბარათზე ჩანს).</p>
    </div>
  );
}
