import { AdminForm, Field } from "@/components/admin/Form";
import { SortableRows } from "@/components/admin/SortableRows";
import { createService, reorderServices } from "@/lib/admin-actions";
import { getServices } from "@/lib/data";

export default async function ServicesAdmin() {
  const services = await getServices();
  return (
    <>
      <div className="adm-head"><div><h1>სერვისები</h1><p>მთავარ გვერდზე ჩანს პირველი ორი სერვისი.</p></div></div>
      <div className="adm-card">
        <h2>სერვისები ({services.length})</h2>
        <SortableRows onReorder={reorderServices} rows={services.map((s) => ({ id: s.id, title: s.name, sub: s.short, image: s.cover, href: `/admin/services/${s.id}` }))} />
      </div>
      <AdminForm action={createService} submitLabel="სერვისის დამატება">
        <div className="adm-card">
          <h2>ახალი სერვისი</h2>
          <div className="adm-grid">
            <Field label="სახელი" name="name" required />
            <Field label="მოკლე ტექსტი" name="short" />
          </div>
        </div>
      </AdminForm>
    </>
  );
}
