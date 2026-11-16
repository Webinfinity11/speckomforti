import { AdminForm, Field, ImageInput, Toggle } from "@/components/admin/Form";
import { SortableRows } from "@/components/admin/SortableRows";
import { createCategory, reorderCategories } from "@/lib/admin-actions";
import { getCategories, getProducts } from "@/lib/data";

export default async function CategoriesAdmin() {
  const [categories, products] = await Promise.all([getCategories(), getProducts(undefined, { all: true })]);
  return (
    <>
      <div className="adm-head"><div><h1>კატეგორიები</h1><p>თანმიმდევრობა იგივეა მენიუში და მთავარი გვერდის სლაიდერში.</p></div></div>
      <div className="adm-card">
        <h2>კატეგორიები ({categories.length})</h2>
        <SortableRows
          onReorder={reorderCategories}
          rows={categories.map((c) => ({
            id: c.id, title: c.name, sub: `/products/${c.slug}`, image: c.cover, href: `/admin/categories/${c.id}`,
            badge: `${products.filter((p) => p.category_id === c.id).length} პროდუქტი${c.on_home ? " · მთავარზე" : ""}`,
          }))}
        />
      </div>
      <AdminForm action={createCategory} submitLabel="კატეგორიის დამატება">
        <div className="adm-card">
          <h2>ახალი კატეგორია</h2>
          <div className="adm-grid">
            <Field label="სახელი" name="name" required />
            <Field label="ხატულა მენიუში" name="icon" defaultValue="▦" hint="ერთი სიმბოლო, მაგ. ▧ ▱ ▤ ▥ ▰ ▦" />
            <Field label="მოკლე აღწერა" name="intro" textarea rows={2} full />
            <ImageInput label="ქავერის ფოტო" name="coverFile" />
            <Toggle label="მთავარ გვერდზე გამოჩენა" name="onHome" />
          </div>
        </div>
      </AdminForm>
    </>
  );
}
