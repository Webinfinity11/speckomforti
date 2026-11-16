"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { ActionState } from "@/lib/admin-actions";

type Action = (state: ActionState, fd: FormData) => Promise<ActionState>;

// Form with save button + status line, bound to a server action.
export function AdminForm({ action, children, submitLabel = "შენახვა", extra }: { action: Action; children: React.ReactNode; submitLabel?: string; extra?: React.ReactNode }) {
  const [state, run, pending] = useActionState<ActionState, FormData>(action, {});
  const [shown, setShown] = useState<ActionState>({});
  useEffect(() => {
    setShown(state);
    if (state.ok) { const t = setTimeout(() => setShown({}), 3500); return () => clearTimeout(t); }
  }, [state]);
  return (
    <form action={run}>
      {children}
      <div className="adm-actions">
        <button className="adm-btn" disabled={pending}>{pending ? "ინახება..." : submitLabel}</button>
        {extra}
        {shown.error && <span className="adm-status err">{shown.error}</span>}
        {shown.ok && <span className="adm-status ok">✓ {shown.message}</span>}
      </div>
    </form>
  );
}

export function Field({ label, name, defaultValue, hint, textarea, rows, full, type = "text", required }: {
  label: string; name: string; defaultValue?: string; hint?: string; textarea?: boolean; rows?: number; full?: boolean; type?: string; required?: boolean;
}) {
  return (
    <label className={`adm-field${full ? " full" : ""}`}>
      <span>{label}</span>
      {textarea
        ? <textarea name={name} defaultValue={defaultValue} rows={rows ?? 4} required={required} />
        : <input type={type} name={name} defaultValue={defaultValue} required={required} />}
      {hint && <small>{hint}</small>}
    </label>
  );
}

// File input with live preview of the current / newly chosen image.
export function ImageInput({ label, name, current, square, hint, fallback }: { label: string; name: string; current?: string; square?: boolean; hint?: string; fallback?: string }) {
  const [preview, setPreview] = useState(current || fallback || "");
  const [cleared, setCleared] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { setPreview(current || fallback || ""); setCleared(false); }, [current, fallback]);
  return (
    <div className="adm-field full">
      <span>{label}</span>
      <div className="adm-image">
        <div className={`prev${square ? " square" : ""}`} style={preview ? { backgroundImage: `url("${preview}")` } : undefined}>{!preview && "სურათი არ არის"}</div>
        <label className="adm-btn ghost">
          სურათის არჩევა
          <input ref={ref} type="file" name={name} accept="image/*" onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) { setPreview(URL.createObjectURL(f)); setCleared(false); }
          }} />
        </label>
        {fallback !== undefined && current && (
          <label className="adm-check">
            <input type="checkbox" name={name.replace(/File$/, "Clear")} checked={cleared} onChange={(e) => {
              setCleared(e.target.checked);
              setPreview(e.target.checked ? fallback || "" : current);
              if (ref.current) ref.current.value = "";
            }} />
            საწყისი ფოტოს დაბრუნება
          </label>
        )}
      </div>
      {hint && <small>{hint}</small>}
    </div>
  );
}

// On/off switch stored as "1" / "". The hidden input makes "off" get submitted too.
export function Toggle({ label, name, defaultChecked, hint }: { label: string; name: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <div className="adm-field">
      <input type="hidden" name={name} value="" />
      <label className="adm-check">
        <input type="checkbox" name={name} value="1" defaultChecked={defaultChecked} />
        {label}
      </label>
      {hint && <small>{hint}</small>}
    </div>
  );
}
