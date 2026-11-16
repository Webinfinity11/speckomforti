import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminForm, Field, ImageInput } from "@/components/admin/Form";
import { ImageManager } from "@/components/admin/ImageManager";
import { deleteService, updateService } from "@/lib/admin-actions";
import { getImages, getServiceById } from "@/lib/data";

export default async function ServiceEdit({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const s = await getServiceById(id);
  if (!s) notFound();
  const images = await getImages("service", id);
  return (
    <>
      <div className="adm-head">
        <div><h1>{s.name}</h1><p><Link href="/admin/services">← სერვისები</Link></p></div>
        <a className="adm-btn ghost" href={`/services/${s.slug}`} target="_blank" rel="noopener">ნახვა ↗</a>
      </div>
      <AdminForm action={updateService.bind(null, s.id)} extra={
        <DeleteButton action={deleteService.bind(null, s.id)} label="სერვისის წაშლა" confirmText={`წავშალოთ „${s.name}“?`} />
      }>
        <div className="adm-card">
          <div className="adm-grid">
            <Field label="სახელი" name="name" defaultValue={s.name} required />
            <Field label="ბმული (slug)" name="slug" defaultValue={s.slug} />
            <Field label="მოკლე ტექსტი (ბარათზე)" name="short" defaultValue={s.short} full />
            <Field label="აღწერა" name="description" defaultValue={s.description} textarea rows={10} full
              hint="ცარიელი ხაზი = ახალი აბზაცი · „## “ = ქვესათაური · „- “ = სიის პუნქტი" />
            <ImageInput label="ქავერის ფოტო (ბარათი და ბანერი)" name="coverFile" current={s.cover} />
          </div>
        </div>
      </AdminForm>
      <ImageManager owner="service" ownerId={s.id} images={images} title="სამუშაოების ფოტოები" />
    </>
  );
}
