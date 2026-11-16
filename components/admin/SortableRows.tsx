"use client";

import Link from "next/link";
import { useSortable } from "./SortableList";

export type Row = { id: number; title: string; sub?: string; image?: string; href: string; badge?: string };

// Draggable list of rows (categories, products, services) with up/down buttons for touch screens.
export function SortableRows({ rows, onReorder, empty = "ჩანაწერები ჯერ არ არის." }: { rows: Row[]; onReorder: (ids: number[]) => Promise<void>; empty?: string }) {
  const { items, bind, cls, move } = useSortable(rows, onReorder);
  if (!items.length) return <p style={{ color: "#6b6f78" }}>{empty}</p>;
  return (
    <div className="adm-list">
      {items.map((r) => (
        <div key={r.id} className={`adm-row${cls(r.id)}`} {...bind(r.id)}>
          <span className="adm-handle" title="გადაათრიეთ">⠿</span>
          <span className="arrows">
            <button type="button" onClick={() => move(r.id, -1)} aria-label="ზემოთ">▲</button>
            <button type="button" onClick={() => move(r.id, 1)} aria-label="ქვემოთ">▼</button>
          </span>
          {r.image !== undefined && (r.image ? <img className="thumb" src={r.image} alt="" /> : <span className="thumb" />)}
          <div className="name"><b>{r.title}</b>{r.sub && <small>{r.sub}</small>}</div>
          {r.badge && <span className="adm-badge">{r.badge}</span>}
          <Link className="adm-btn ghost" href={r.href}>რედაქტირება</Link>
        </div>
      ))}
    </div>
  );
}
