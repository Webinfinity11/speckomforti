import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminForm, Field, ImageInput, Toggle } from "@/components/admin/Form";
import { deleteCategory, updateCategory } from "@/lib/admin-actions";
import { getCategoryById, getProducts } from "@/lib/data";

export default async function CategoryEdit({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const c = await getCategoryById(id);
  if (!c) notFound();
  const products = await getProducts(id, { all: true });
  return (
    <>
      <div className="adm-head">
        <div><h1>{c.name}</h1><p><Link href="/admin/categories">← კატეგორიები</Link></p></div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link className="adm-btn ghost" href={`/admin/products?cat=${c.id}`}>პროდუქცია ({products.length})</Link>
          <a className="adm-btn ghost" href={`/products/${c.slug}`} target="_blank" rel="noopener">ნახვა ↗</a>
        </div>
      </div>
      <AdminForm action={updateCategory.bind(null, c.id)} extra={
        <DeleteButton action={deleteCategory.bind(null, c.id)} label="კატეგორიის წაშლა"
          confirmText={`წავშალოთ „${c.name}“? წაიშლება ${products.length} პროდუქტიც.`} />
      }>
        <div className="adm-card">
          <div className="adm-grid">
            <Field label="სახელი" name="name" defaultValue={c.name} required />
            <Field label="ბმული (slug)" name="slug" defaultValue={c.slug} hint="მხოლოდ ლათინური ასოები, ციფრები და -" />
            <Field label="ხატულა მენიუში" name="icon" defaultValue={c.icon} />
            <Field label="მოკლე აღწერა" name="intro" defaultValue={c.intro} textarea rows={3} full />
            <ImageInput label="ქავერის ფოტო" name="coverFile" current={c.cover} />
            <Toggle label="მთავარ გვერდზე გამოჩენა" name="onHome" defaultChecked={c.on_home} />
          </div>
        </div>
      </AdminForm>
    </>
  );
}
