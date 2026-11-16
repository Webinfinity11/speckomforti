"use client";

import { useRef, useState } from "react";
import { deleteGalleryItem, reorderGallery, updateBannerFocus, updateGalleryCaption, uploadGalleryPhoto } from "@/lib/admin-actions";
import { useSortable } from "./SortableList";

type Item = { id: number; src: string; caption: string; thumb?: string; video?: string; focus?: string };

export function GalleryManager({ kind, items: initial }: { kind: "photo" | "video" | "banner"; items: Item[] }) {
  const { items, setItems, bind, cls } = useSortable(initial, (ids) => reorderGallery(ids));
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
      fd.append("kind", kind);
      const res = await uploadGalleryPhoto(fd);
      if ("image" in res && res.image) { const img = res.image; setItems((prev) => [...prev, { ...img, caption: "" }]); }
      else errors.push(`${f.name}: ${"error" in res ? res.error : ""}`);
    }
    setBusy(false);
    setProgress(errors.length ? `შეცდომა: ${errors.join("; ")}` : `✓ ატვირთულია ${list.length} ფოტო`);
    if (input.current) input.current.value = "";
  }

  async function remove(id: number) {
    if (!confirm(kind === "video" ? "წავშალოთ ეს ვიდეო?" : "წავშალოთ ეს ფოტო?")) return;
    setItems((prev) => prev.filter((x) => x.id !== id));
    await deleteGalleryItem(id);
  }

  return (
    <div className="adm-card">
      <h2>{kind === "banner" ? "ბანერები" : kind === "photo" ? "ფოტოები" : "ვიდეოები"} ({items.length})</h2>
      {kind !== "video" && (
        <>
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
        </>
      )}
      {items.length ? (
        <div className={`adm-photos${kind === "banner" ? " wide" : ""}`}>
          {items.map((it, i) => (
            <div key={it.id}>
              <div className={`adm-photo${cls(it.id)}`} {...bind(it.id)}>
                {it.thumb || it.src ? <img src={it.thumb || it.src} alt="" loading="lazy" /> : it.video && <video src={it.video + "#t=0.5"} preload="metadata" muted playsInline />}
                <span className="num">{i + 1}</span>
                <button type="button" className="del" onClick={() => remove(it.id)} aria-label="წაშლა">×</button>
              </div>
              <input
                className="adm-caption" defaultValue={it.caption} placeholder={kind === "banner" ? "ბმული (არასავალდებულო), მაგ. /products" : "წარწერა (არასავალდებულო)"}
                onBlur={(e) => { if (e.target.value !== it.caption) { it.caption = e.target.value; updateGalleryCaption(it.id, e.target.value); } }}
              />
              {kind === "banner" && (
                <select className="adm-caption" defaultValue={it.focus || "center"} onChange={(e) => updateBannerFocus(it.id, e.target.value)} aria-label="რომელი ნაწილი ჩანდეს">
                  <option value="left">ჩანდეს მარცხენა ნაწილი</option>
                  <option value="center">ჩანდეს ცენტრი</option>
                  <option value="right">ჩანდეს მარჯვენა ნაწილი</option>
                </select>
              )}
            </div>
          ))}
        </div>
      ) : <p style={{ color: "#6b6f78" }}>{kind === "video" ? "ვიდეოები ჯერ არ არის." : "ფოტოები ჯერ არ არის."}</p>}
      <p style={{ color: "#8a8e96", fontSize: 12.5, marginTop: 14 }}>თანმიმდევრობის შესაცვლელად გადაათრიეთ. წარწერა ინახება ველიდან გასვლისას.</p>
    </div>
  );
}
