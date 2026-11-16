import { PageHero, RichText } from "@/components/ui";
import { getPage, lines } from "@/lib/data";
import type { PageKey } from "@/lib/defaults";

// About / laboratory / tile care: dark band, optional facts strip, text with photo.
export async function TextPage({ k, crumbs }: { k: PageKey; crumbs?: { href?: string; label: string }[] }) {
  const page = await getPage(k);
  const stats = lines(page.stats).map((l) => l.split("|"));
  return (
    <>
      <PageHero title={page.title} intro={page.intro} crumbs={[...(crumbs ?? []), { label: page.title }]} />
      {stats.length > 0 && (
        <div className="trust">
          <div className="container trust-inner">
            {stats.map(([a, b], i) => <div className="trust-item" key={i}><div><strong>{a}</strong>{b && <small>{b}</small>}</div></div>)}
          </div>
        </div>
      )}
      <section className="section">
        <div className="container">
          {page.eyebrow && <div className="eyebrow" style={{ marginBottom: 22 }}>{page.eyebrow}</div>}
          {page.image ? (
            <div className="split">
              <RichText text={page.body} />
              <div className="split-media"><img src={page.image} alt={page.title} /></div>
            </div>
          ) : <RichText text={page.body} />}
        </div>
      </section>
    </>
  );
}
