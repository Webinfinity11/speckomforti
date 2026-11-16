"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

// Uploads video files straight to /api/admin/video with a progress bar (XHR gives upload progress, fetch does not).
export function VideoUpload() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [pct, setPct] = useState<number | null>(null);
  const [msg, setMsg] = useState("");
  const [dropOn, setDropOn] = useState(false);

  function send(file: File) {
    return new Promise<string | null>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `/api/admin/video?caption=${encodeURIComponent(caption)}`);
      xhr.setRequestHeader("Content-Type", file.type || "video/mp4");
      xhr.upload.onprogress = (e) => e.lengthComputable && setPct(Math.round((e.loaded / e.total) * 100));
      xhr.onload = () => {
        let err: string | null = null;
        try { const r = JSON.parse(xhr.responseText); if (xhr.status >= 300) err = r.error || "შეცდომა"; } catch { if (xhr.status >= 300) err = `შეცდომა ${xhr.status}`; }
        resolve(err);
      };
      xhr.onerror = () => resolve("კავშირის შეცდომა");
      xhr.send(file);
    });
  }

  async function upload(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => /^video\/(mp4|webm|quicktime)$/.test(f.type) || /\.(mp4|webm|mov)$/i.test(f.name));
    if (!list.length) { setMsg("აირჩიეთ MP4, WebM ან MOV ფაილი"); return; }
    const errors: string[] = [];
    for (const [i, f] of list.entries()) {
      setMsg(`იტვირთება ${i + 1} / ${list.length}: ${f.name}`);
      setPct(0);
      const err = await send(f.type ? f : new File([f], f.name, { type: f.name.toLowerCase().endsWith(".mov") ? "video/quicktime" : f.name.toLowerCase().endsWith(".webm") ? "video/webm" : "video/mp4" }));
      if (err) errors.push(`${f.name}: ${err}`);
    }
    setPct(null);
    setMsg(errors.length ? `შეცდომა: ${errors.join("; ")}` : `✓ ატვირთულია ${list.length} ვიდეო`);
    setCaption("");
    if (input.current) input.current.value = "";
    router.refresh();
  }

  const busy = pct !== null;
  return (
    <div className="adm-card">
      <h2>ვიდეო ფაილის ატვირთვა</h2>
      <div className="adm-grid" style={{ marginBottom: 14 }}>
        <label className="adm-field full"><span>წარწერა (არასავალდებულო)</span><input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} disabled={busy} /></label>
      </div>
      <div
        className={`adm-drop${dropOn ? " on" : ""}`}
        onClick={() => !busy && input.current?.click()}
        onDragOver={(e) => { if (e.dataTransfer.types.includes("Files")) { e.preventDefault(); setDropOn(true); } }}
        onDragLeave={() => setDropOn(false)}
        onDrop={(e) => { if (e.dataTransfer.files.length && !busy) { e.preventDefault(); setDropOn(false); upload(e.dataTransfer.files); } }}
      >
        <b>{busy ? `იტვირთება... ${pct}%` : "აირჩიეთ ვიდეო"}</b> ან გადმოათრიეთ აქ · MP4 / MOV / WebM, მაქს. 500MB
        <input ref={input} type="file" accept="video/mp4,video/webm,video/quicktime,.mov" multiple hidden onChange={(e) => e.target.files && upload(e.target.files)} />
      </div>
      {busy && <div className="adm-bar"><i style={{ width: `${pct}%` }} /></div>}
      {msg && <div className="adm-progress">{msg}</div>}
    </div>
  );
}
