import { Field, ImageInput, Toggle } from "./Form";
import type { Post } from "@/lib/data";

export function PostFields({ p }: { p?: Post }) {
  return (
    <div className="adm-card">
      <div className="adm-grid">
        <Field label="სათაური" name="title" defaultValue={p?.title} required full />
        <Field label="თარიღი" name="publishedAt" type="date" defaultValue={p?.published_at ?? new Date().toISOString().slice(0, 10)} />
        {p && <Field label="ბმული (slug)" name="slug" defaultValue={p.slug} />}
        <Field label="მოკლე ტექსტი (ბარათზე)" name="excerpt" defaultValue={p?.excerpt} textarea rows={2} full />
        <Field label="ტექსტი" name="body" defaultValue={p?.body} textarea rows={14} full
          hint="ცარიელი ხაზი = ახალი აბზაცი · „## “ = ქვესათაური · „- “ = სიის პუნქტი" />
        <ImageInput label="ფოტო" name="coverFile" current={p?.cover} />
        <Toggle label="გამოქვეყნებული" name="published" defaultChecked={p ? p.published : true} />
      </div>
    </div>
  );
}
