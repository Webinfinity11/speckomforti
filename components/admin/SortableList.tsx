"use client";

import { useState } from "react";

// Minimal HTML5 drag-and-drop ordering; calls onReorder with the new id order.
export function useSortable<T extends { id: number }>(initial: T[], onReorder: (ids: number[]) => Promise<void> | void) {
  const [items, setItems] = useState(initial);
  const [dragId, setDragId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);

  const bind = (id: number) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => { setDragId(id); e.dataTransfer.effectAllowed = "move"; },
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); if (overId !== id) setOverId(id); },
    onDragLeave: () => setOverId((o) => (o === id ? null : o)),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      if (dragId === null || dragId === id) return reset();
      const next = [...items];
      const from = next.findIndex((x) => x.id === dragId), to = next.findIndex((x) => x.id === id);
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      setItems(next);
      reset();
      onReorder(next.map((x) => x.id));
    },
    onDragEnd: () => reset(),
  });
  const reset = () => { setDragId(null); setOverId(null); };
  const cls = (id: number) => `${dragId === id ? " dragging" : ""}${overId === id && dragId !== id ? " over" : ""}`;
  const move = (id: number, dir: -1 | 1) => {
    const i = items.findIndex((x) => x.id === id), j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
    onReorder(next.map((x) => x.id));
  };
  return { items, setItems, bind, cls, move };
}
