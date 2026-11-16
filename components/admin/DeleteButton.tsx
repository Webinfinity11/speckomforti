"use client";

import { useTransition } from "react";

export function DeleteButton({ action, label, confirmText }: { action: () => Promise<void>; label: string; confirmText: string }) {
  const [pending, start] = useTransition();
  return (
    <button type="button" className="adm-btn danger" disabled={pending}
      onClick={() => { if (confirm(confirmText)) start(() => action()); }}>
      {pending ? "იშლება..." : label}
    </button>
  );
}
