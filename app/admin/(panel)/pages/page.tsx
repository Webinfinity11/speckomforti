import Link from "next/link";
import { AdminForm, Field, ImageInput } from "@/components/admin/Form";
import { saveSettings } from "@/lib/admin-actions";
import { getPage } from "@/lib/data";
import { defaultPages, type PageKey } from "@/lib/defaults";

const TABS: { k: PageKey; label: string; url: string; body?: boolean; stats?: boolean }[] = [
  { k: "about", label: "ჩვენს შესახებ", url: "/about", body: true, stats: true },
  { k: "lab", label: "ლაბორატორია", url: "/laboratory", body: true, stats: true },
  { k: "care", label: "ფილების მოვლა", url: "/tile-care", body: true, stats: true },
  { k: "products", label: "პროდუქცია (ბანერი)", url: "/products" },
  { k: "services", label: "სერვისები (ბანერი)", url: "/services" },
  { k: "gallery", label: "გალერეა (ბანერი)", url: "/gallery" },
  { k: "news", label: "სიახლეები (ბანერი)", url: "/news" },
  { k: "contact", label: "კონტაქტი (ბანერი)", url: "/contact" },
];

export default async function PagesEditor({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  const tab = TABS.find((t) => t.k === p) ?? TABS[0];
  const page = await getPage(tab.k);
  return (
    <>
      <div className="adm-head">
        <div><h1>გვერდები</h1><p>ტექსტები და ფოტოები შიდა გვერდებისთვის.</p></div>
        <a className="adm-btn ghost" href={tab.url} target="_blank" rel="noopener">გვერდის ნახვა ↗</a>
      </div>
      <nav className="adm-tabs">
        {TABS.map((t) => <Link key={t.k} href={`/admin/pages?p=${t.k}`} className={t.k === tab.k ? "is-active" : undefined}>{t.label}</Link>)}
      </nav>
      <AdminForm action={saveSettings} key={tab.k}>
        <input type="hidden" name="_key" value={`page_${tab.k}`} />
        <div className="adm-card">
          <h2>{tab.label}</h2>
          <div className="adm-grid">
            <Field label="სათაური" name="title" defaultValue={page.title} />
            <Field label="ზედა წარწერა" name="eyebrow" defaultValue={page.eyebrow} />
            <Field label="მოკლე ტექსტი (ბანერზე)" name="intro" defaultValue={page.intro} textarea rows={2} full />
            {tab.body && (
              <Field label="ძირითადი ტექსტი" name="body" defaultValue={page.body} textarea rows={14} full
                hint="ცარიელი ხაზი = ახალი აბზაცი · „## “ ხაზის დასაწყისში = ქვესათაური · „- “ = სიის პუნქტი" />
            )}
            {tab.stats && (
              <Field label="ციფრები / უპირატესობები (მუქი ზოლი)" name="stats" defaultValue={page.stats} textarea rows={3} full
                hint="თითო ხაზზე: დიდი ტექსტი|პატარა ტექსტი, მაგ. 15+|წლიანი გამოცდილება. ცარიელი — ზოლი არ გამოჩნდება." />
            )}
            <ImageInput label="ფოტო" name="imageFile" current={page.image} fallback={defaultPages[tab.k].image} />
          </div>
        </div>
      </AdminForm>
    </>
  );
}
