import Link from "next/link";
import { AdminForm } from "@/components/admin/Form";
import { ProductFields } from "@/components/admin/ProductFields";
import { createProduct } from "@/lib/admin-actions";
import { getCategories } from "@/lib/data";

export default async function NewProduct({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const categories = await getCategories();
  const catId = Number((await searchParams).cat) || undefined;
  return (
    <>
      <div className="adm-head"><div><h1>ახალი პროდუქტი</h1><p><Link href="/admin/products">← პროდუქცია</Link> · ფოტოებს დაამატებთ შენახვის შემდეგ.</p></div></div>
      <AdminForm action={createProduct} submitLabel="შენახვა და ფოტოების დამატება">
        <ProductFields categories={categories} catId={catId} />
      </AdminForm>
    </>
  );
}
