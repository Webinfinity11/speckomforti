import { Field, Toggle } from "./Form";
import { SpecsEditor } from "./SpecsEditor";
import type { Category, Product } from "@/lib/data";

export function ProductFields({ p, categories, catId }: { p?: Product; categories: Category[]; catId?: number }) {
  return (
    <div className="adm-card">
      <div className="adm-grid">
        <Field label="სახელი" name="name" defaultValue={p?.name} required />
        <label className="adm-field">
          <span>კატეგორია</span>
          <select name="categoryId" defaultValue={p?.category_id ?? catId} required>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <Field label="ფასი" name="price" defaultValue={p?.price} hint="მაგ. 25 ₾ / მ² — ცარიელი: „შეთანხმებით“" />
        {p && <Field label="ბმული (slug)" name="slug" defaultValue={p.slug} hint="მხოლოდ ლათინური ასოები, ციფრები და -" />}
        <Field label="მოკლე აღწერა" name="short" defaultValue={p?.short} textarea rows={2} full />
        <SpecsEditor initial={p?.specs ?? []} />
        <Field label="სრული აღწერა" name="description" defaultValue={p?.description} textarea rows={8} full
          hint="ცარიელი ხაზი = ახალი აბზაცი · „## “ = ქვესათაური · „- “ = სიის პუნქტი" />
        <Toggle label="საიტზე გამოჩენა" name="published" defaultChecked={p ? p.published : true} />
      </div>
    </div>
  );
}
