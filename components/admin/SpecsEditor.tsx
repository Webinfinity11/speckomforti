"use client";

import { useState } from "react";
import type { Spec } from "@/lib/data";

export function SpecsEditor({ initial }: { initial: Spec[] }) {
  const [rows, setRows] = useState<(Spec & { k: number })[]>(() => (initial.length ? initial : [{ label: "", value: "" }]).map((s, k) => ({ ...s, k })));
  const add = () => setRows((r) => [...r, { label: "", value: "", k: Date.now() }]);
  return (
    <div className="adm-field full">
      <span>მახასიათებლები</span>
      <div className="adm-specs">
        {rows.map((r) => (
          <div className="row" key={r.k}>
            <input name="specLabel" defaultValue={r.label} placeholder="მაგ. ზომა" />
            <input name="specValue" defaultValue={r.value} placeholder="მაგ. 20×10×6 სმ" />
            <button type="button" className="adm-btn danger" onClick={() => setRows((x) => x.filter((y) => y.k !== r.k))} aria-label="წაშლა">×</button>
          </div>
        ))}
      </div>
      <div><button type="button" className="adm-btn ghost" onClick={add} style={{ marginTop: 8 }}>+ მახასიათებლის დამატება</button></div>
      <small>ცარიელი სტრიქონები არ შეინახება.</small>
    </div>
  );
}
