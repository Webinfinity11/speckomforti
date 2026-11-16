"use client";

import { useState, useTransition } from "react";
import { setHomeCategories } from "@/lib/admin-actions";

type Cat = { id: number; name: string; cover: string; on_home: boolean };

// Tick the categories that appear in the "პროდუქციის კატეგორიები" block on the home page. Saves on every click.
export function HomeCategoriesPicker({ categories }: { categories: Cat[] }) {
  const [picked, setPicked] = useState<number[]>(categories.filter((c) => c.on_home).map((c) => c.id));
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);

  function toggle(id: number) {
    const next = picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id];
    setPicked(next);
    setSaved(false);
    start(async () => { await setHomeCategories(next); setSaved(true); });
  }

  return (
    <div className="adm-card">
      <h2>მთავარ გვერდზე გამოსაჩენი კატეგორიები ({picked.length})</h2>
      <div className="adm-pick">
        {categories.map((c) => (
          <label key={c.id} className={`adm-pick-item${picked.includes(c.id) ? " on" : ""}`}>
            <input type="checkbox" checked={picked.includes(c.id)} onChange={() => toggle(c.id)} />
            {c.cover ? <img src={c.cover} alt="" /> : <span className="ph" />}
            <b>{c.name}</b>
          </label>
        ))}
      </div>
      <p style={{ color: "#8a8e96", fontSize: 12.5, margin: "12px 0 0" }}>
        {pending ? "ინახება..." : saved ? "✓ შენახულია" : "მონიშნეთ კატეგორიები — ინახება ავტომატურად."} რიგითობა იგივეა, რაც „კატეგორიებში“. თუ არცერთი არ არის მონიშნული, ჩანს პირველი 4.
      </p>
    </div>
  );
}
