import type { Metadata } from "next";
import { ContactForm } from "@/components/client";
import { PageHero } from "@/components/ui";
import { getPage, getSite, lines, tel } from "@/lib/data";

export const metadata: Metadata = { title: "კონტაქტი" };

// Accepts either a full <iframe ...> snippet from Google Maps or just its src URL.
function mapSrc(v: string) {
  const m = v.match(/src="([^"]+)"/);
  const url = (m ? m[1] : v).trim();
  return /^https:\/\/(www\.)?google\.[a-z.]+\/maps\//.test(url) ? url : "";
}

export default async function ContactPage() {
  const [page, site] = await Promise.all([getPage("contact"), getSite()]);
  const socials = [["Facebook", site.facebook], ["Instagram", site.instagram], ["YouTube", site.youtube], ["TikTok", site.tiktok]].filter(([, u]) => u);
  const map = mapSrc(site.mapEmbed);
  const address = lines(site.address);
  return (
    <>
      <PageHero title={page.title} intro={page.intro} crumbs={[{ label: page.title }]} />
      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div>
              <div className="eyebrow">SK / კონტაქტი</div>
              <h3 style={{ fontSize: 24, letterSpacing: "-.04em", margin: "12px 0 0" }}>საკონტაქტო ინფორმაცია</h3>
              <div className="specs">
                {address.map((a, i) => <div className="spec-row" key={a}><span>{i === 0 ? "მისამართი" : ""}</span><strong>{a}</strong></div>)}
                {site.phone && <div className="spec-row"><span>ტელეფონი</span><strong><a href={tel(site.phone)}>{site.phone}</a></strong></div>}
                {site.phone2 && <div className="spec-row"><span>მობილური</span><strong><a href={tel(site.phone2)}>{site.phone2}</a></strong></div>}
                {site.email && <div className="spec-row"><span>ელ.ფოსტა</span><strong><a href={`mailto:${site.email}`}>{site.email}</a></strong></div>}
                {site.hours && <div className="spec-row"><span>სამუშაო საათები</span><strong>{site.hours}</strong></div>}
              </div>
              {socials.length > 0 && <div className="socials">{socials.map(([n, u]) => <a key={n} className="outline-btn" href={u} target="_blank" rel="noopener">{n}</a>)}</div>}
            </div>
            <ContactForm title="მოგვწერეთ" text="შეავსეთ ფორმა და ჩვენ მალე დაგიკავშირდებით." />
          </div>
          {map && <div className="map"><iframe src={map} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="რუკა" /></div>}
        </div>
      </section>
    </>
  );
}
