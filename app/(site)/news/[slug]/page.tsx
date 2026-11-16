import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero, RichText } from "@/components/ui";
import { formatDate, getPost } from "@/lib/data";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost((await params).slug);
  return p ? { title: p.title, description: p.excerpt || undefined, openGraph: p.cover ? { images: [p.cover] } : undefined } : {};
}

export default async function PostPage({ params }: Props) {
  const p = await getPost((await params).slug);
  if (!p) notFound();
  return (
    <>
      <PageHero title={p.title} intro={formatDate(p.published_at)} crumbs={[{ href: "/news", label: "სიახლეები" }, { label: p.title }]} />
      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          {p.cover && <div className="post-cover"><img src={p.cover} alt={p.title} /></div>}
          {p.excerpt && <p className="prose" style={{ fontWeight: 700, color: "#111" }}>{p.excerpt}</p>}
          <RichText text={p.body} />
          <div style={{ marginTop: 34 }}><Link className="outline-btn" href="/news">← ყველა სიახლე</Link></div>
        </div>
      </section>
    </>
  );
}
