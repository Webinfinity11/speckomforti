import type { Metadata } from "next";
import Link from "next/link";
import { Arrow, PageHero } from "@/components/ui";
import { formatDate, getPage, getPosts } from "@/lib/data";

export const metadata: Metadata = { title: "სიახლეები" };

export default async function NewsPage() {
  const [page, posts] = await Promise.all([getPage("news"), getPosts()]);
  return (
    <>
      <PageHero title={page.title} intro={page.intro} crumbs={[{ label: page.title }]} />
      <section className="section">
        <div className="container">
          {posts.length ? (
            <div className="product-grid">
              {posts.map((p) => (
                <Link key={p.id} href={`/news/${p.slug}`} className="product-card news-card">
                  {p.cover
                    ? <div className="product-image"><img src={p.cover} alt={p.title} loading="lazy" /></div>
                    : <div className="product-image none"><img src="/img/logo_yellow.svg" alt="" /></div>}
                  <div className="product-meta">
                    <small>{formatDate(p.published_at)}</small>
                    <strong>{p.title}</strong>
                    {p.excerpt && <p>{p.excerpt}</p>}
                    <div className="product-footer"><span>ვრცლად</span><Arrow /></div>
                  </div>
                </Link>
              ))}
            </div>
          ) : <div className="empty">სიახლეები მალე დაემატება.</div>}
        </div>
      </section>
    </>
  );
}
