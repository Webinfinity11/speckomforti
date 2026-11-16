import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminForm } from "@/components/admin/Form";
import { ImageManager } from "@/components/admin/ImageManager";
import { ProductFields } from "@/components/admin/ProductFields";
import { deleteProduct, updateProduct } from "@/lib/admin-actions";
import { getCategories, getImages, getProductById } from "@/lib/data";

export default async function ProductEdit({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const p = await getProductById(id);
  if (!p) notFound();
  const [categories, images] = await Promise.all([getCategories(), getImages("product", id)]);
  const cat = categories.find((c) => c.id === p.category_id);
  return (
    <>
      <div className="adm-head">
        <div><h1>{p.name}</h1><p><Link href={`/admin/products?cat=${p.category_id}`}>← {cat?.name ?? "პროდუქცია"}</Link></p></div>
        {cat && p.published && <a className="adm-btn ghost" href={`/products/${cat.slug}/${p.slug}`} target="_blank" rel="noopener">ნახვა საიტზე ↗</a>}
      </div>
      <ImageManager owner="product" ownerId={p.id} images={images} />
      <AdminForm action={updateProduct.bind(null, p.id)} extra={
        <DeleteButton action={deleteProduct.bind(null, p.id)} label="პროდუქტის წაშლა" confirmText={`წავშალოთ „${p.name}“?`} />
      }>
        <ProductFields p={p} categories={categories} />
      </AdminForm>
    </>
  );
}
