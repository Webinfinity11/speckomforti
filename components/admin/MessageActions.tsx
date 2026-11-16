"use client";

import { useTransition } from "react";
import { deleteMessage, markMessage } from "@/lib/admin-actions";

export function MessageActions({ id, read }: { id: number; read: boolean }) {
  const [pending, start] = useTransition();
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <button className="adm-btn ghost" disabled={pending} onClick={() => start(() => markMessage(id, !read))}>
        {read ? "წაუკითხავად მონიშვნა" : "✓ წაკითხულად მონიშვნა"}
      </button>
      <button className="adm-btn danger" disabled={pending} onClick={() => { if (confirm("წავშალოთ შეტყობინება?")) start(() => deleteMessage(id)); }}>
        წაშლა
      </button>
    </div>
  );
}
