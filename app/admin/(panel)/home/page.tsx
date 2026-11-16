import { AdminForm, Field, ImageInput } from "@/components/admin/Form";
import { saveSettings } from "@/lib/admin-actions";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { HomeCategoriesPicker } from "@/components/admin/HomeCategoriesPicker";
import { getCategories, getGallery, getHome } from "@/lib/data";
import { defaultHome } from "@/lib/defaults";

export default async function HomeEditor() {
  const [h, banners, categories] = await Promise.all([getHome(), getGallery("banner"), getCategories()]);
  return (
    <>
      <div className="adm-head"><div><h1>მთავარი გვერდი</h1><p>კატეგორიები, პროდუქციის სლაიდერი და სერვისები ავტომატურად ივსება კატალოგიდან.</p></div></div>
      <GalleryManager key={"banner" + banners.map((b) => b.id).join(",")} kind="banner" items={banners.map((b) => ({ id: b.id, src: b.src, caption: b.caption, focus: b.video_url }))} />
      <p style={{ color: "#8a8e96", fontSize: 12.5, margin: "-6px 0 22px" }}>ბანერები ტრიალებს მთავარი ბანერის მარჯვენა ნაწილში (ფოტოს ადგილას). თუ ბანერი არ არის — ჩანს ქვემოთ არჩეული ფოტო. ბანერი ავსებს მთელ მარჯვენა ბლოკს, ამიტომ გვერდები ოდნავ იჭრება — აირჩიეთ, რომელი ნაწილი ჩანდეს (თუ ტექსტი მარცხნივაა — „მარცხენა ნაწილი“). ბმული — სად გადავიდეს დაჭერისას (არასავალდებულო).</p>
      <HomeCategoriesPicker categories={categories} />
      <AdminForm action={saveSettings}>
        <input type="hidden" name="_key" value="home" />
        <div className="adm-card">
          <h2>მთავარი ბანერი</h2>
          <div className="adm-grid">
            <Field label="ზედა წარწერა" name="eyebrow" defaultValue={h.eyebrow} />
            <Field label="სათაური" name="heroTitle" defaultValue={h.heroTitle} />
            <Field label="ტექსტი" name="heroText" defaultValue={h.heroText} textarea rows={3} full />
            <Field label="ღილაკი 1 (კატალოგი)" name="heroButton" defaultValue={h.heroButton} />
            <Field label="ღილაკი 2 (სერვისები)" name="heroButton2" defaultValue={h.heroButton2} />
            <Field label="ფოტოზე წარწერა" name="heroLabel" defaultValue={h.heroLabel} hint="ცარიელი — არ გამოჩნდება" />
            <ImageInput label="ფოტო (მარჯვნივ, თუ ბანერები არ არის)" name="heroImageFile" current={h.heroImage} fallback={defaultHome.heroImage} />
          </div>
        </div>
        <div className="adm-card">
          <h2>უპირატესობები (ბანერის ქვეშ)</h2>
          <div className="adm-grid">
            {([1, 2, 3] as const).map((n) => {
              const t = `benefit${n}Title` as const, s = `benefit${n}Text` as const;
              return [<Field key={t} label={`${n}. სათაური`} name={t} defaultValue={h[t]} />, <Field key={s} label={`${n}. ტექსტი`} name={s} defaultValue={h[s]} />];
            })}
          </div>
        </div>
        <div className="adm-card">
          <h2>სექციების სათაურები და ტექსტები</h2>
          <div className="adm-grid">
            <Field label="კატეგორიების სათაური" name="categoriesTitle" defaultValue={h.categoriesTitle} />
            <Field label="პროდუქციის სლაიდერის სათაური" name="productsTitle" defaultValue={h.productsTitle} />
            <Field label="ზოლი: სათაური" name="statTitle" defaultValue={h.statTitle} full />
            <Field label="ზოლი: ტექსტი 1" name="statText1" defaultValue={h.statText1} textarea rows={2} />
            <Field label="ზოლი: ტექსტი 2" name="statText2" defaultValue={h.statText2} textarea rows={2} />
            <Field label="სერვისების სათაური" name="servicesTitle" defaultValue={h.servicesTitle} />
            <Field label="სერვისების ტექსტი" name="servicesText" defaultValue={h.servicesText} />
          </div>
        </div>
        <div className="adm-card">
          <h2>გალერეა</h2>
          <div className="adm-grid">
            <Field label="სათაური" name="galleryTitle" defaultValue={h.galleryTitle} />
            <Field label="ტექსტი" name="galleryText" defaultValue={h.galleryText} />
            <ImageInput label="ფოტო გალერეის ფოტო" name="galleryPhotoCoverFile" current={h.galleryPhotoCover} fallback={defaultHome.galleryPhotoCover} />
            <ImageInput label="„პროდუქციის დეტალები“ ფოტო" name="galleryMiddleCoverFile" current={h.galleryMiddleCover} fallback={defaultHome.galleryMiddleCover} />
            <ImageInput label="ვიდეო გალერეის ფოტო" name="galleryVideoCoverFile" current={h.galleryVideoCover} fallback={defaultHome.galleryVideoCover} />
          </div>
        </div>
        <div className="adm-card">
          <h2>ინფო ბლოკები და ქვედა ზოლი</h2>
          <div className="adm-grid">
            <Field label="სიახლეები — ტექსტი" name="info1Text" defaultValue={h.info1Text} textarea rows={2} />
            <Field label="ლაბორატორია — ტექსტი" name="info2Text" defaultValue={h.info2Text} textarea rows={2} />
            <Field label="ფილების მოვლა — ტექსტი" name="info3Text" defaultValue={h.info3Text} textarea rows={2} />
            <Field label="ქვედა ზოლის ღილაკი" name="ctaButton" defaultValue={h.ctaButton} />
            <Field label="ქვედა ზოლის სათაური (ყველა გვერდზე)" name="ctaTitle" defaultValue={h.ctaTitle} full />
            <Field label="ქვედა ზოლის ტექსტი" name="ctaText" defaultValue={h.ctaText} textarea rows={2} full />
          </div>
        </div>
      </AdminForm>
    </>
  );
}
