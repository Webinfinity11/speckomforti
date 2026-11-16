import { AdminForm, Field } from "@/components/admin/Form";
import { saveSettings } from "@/lib/admin-actions";
import { getSite } from "@/lib/data";

export default async function SiteEditor() {
  const s = await getSite();
  return (
    <>
      <div className="adm-head"><div><h1>კონტაქტი და SEO</h1><p>ეს მონაცემები ჩანს ფუტერში, კონტაქტის გვერდზე და პროდუქტის გვერდზე.</p></div></div>
      <AdminForm action={saveSettings}>
        <input type="hidden" name="_key" value="site" />
        <div className="adm-card">
          <h2>კომპანია</h2>
          <div className="adm-grid">
            <Field label="კომპანიის სახელი" name="brandName" defaultValue={s.brandName} hint="ჩანს ბრაუზერის ჩანართში და Google-ში" />
            <Field label="ფუტერის ტექსტი" name="footerText" defaultValue={s.footerText} />
            <Field label="ზედა შავი ზოლი — მარცხნივ" name="topLeft" defaultValue={s.topLeft} hint="ორივე ცარიელი — ზოლი არ გამოჩნდება" />
            <Field label="ზედა შავი ზოლი — მარჯვნივ" name="topRight" defaultValue={s.topRight} />
          </div>
        </div>
        <div className="adm-card">
          <h2>საკონტაქტო ინფორმაცია</h2>
          <div className="adm-grid">
            <Field label="ტელეფონი" name="phone" defaultValue={s.phone} />
            <Field label="მობილური" name="phone2" defaultValue={s.phone2} />
            <Field label="ელფოსტა" name="email" defaultValue={s.email} type="email" />
            <Field label="სამუშაო საათები" name="hours" defaultValue={s.hours} hint="მაგ. ორშ–შაბ 09:00–18:00" />
            <Field label="მისამართი" name="address" defaultValue={s.address} textarea rows={2} full hint="რამდენიმე მისამართი — თითო ხაზზე" />
            <Field label="Google Maps (Embed)" name="mapEmbed" defaultValue={s.mapEmbed} textarea rows={3} full
              hint="Google Maps → გაზიარება → რუკის ჩასმა → დააკოპირეთ HTML და ჩასვით აქ." />
            <Field label="მიწოდება და შეკვეთა (პროდუქტის გვერდზე)" name="deliveryText" defaultValue={s.deliveryText} textarea rows={2} full />
          </div>
        </div>
        <div className="adm-card">
          <h2>სოციალური ქსელები</h2>
          <div className="adm-grid">
            <Field label="Facebook" name="facebook" defaultValue={s.facebook} />
            <Field label="Instagram" name="instagram" defaultValue={s.instagram} />
            <Field label="YouTube" name="youtube" defaultValue={s.youtube} />
            <Field label="TikTok" name="tiktok" defaultValue={s.tiktok} />
          </div>
        </div>
        <div className="adm-card">
          <h2>SEO</h2>
          <div className="adm-grid">
            <Field label="საიტის სათაური (Google)" name="seoTitle" defaultValue={s.seoTitle} full />
            <Field label="აღწერა (Google)" name="seoDescription" defaultValue={s.seoDescription} textarea rows={2} full />
          </div>
        </div>
      </AdminForm>
    </>
  );
}
