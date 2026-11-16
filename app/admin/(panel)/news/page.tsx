import Link from "next/link";
import { formatDate, getPosts } from "@/lib/data";

export default async function NewsAdmin() {
  const posts = await getPosts({ all: true });
  return (
    <>
      <div className="adm-head">
        <div><h1>სიახლეები</h1><p>{posts.length} სიახლე</p></div>
        <Link className="adm-btn" href="/admin/news/new">+ ახალი სიახლე</Link>
      </div>
      {posts.length ? (
        <div className="adm-list">
          {posts.map((p) => (
            <div key={p.id} className="adm-row">
              {p.cover ? <img className="thumb" src={p.cover} alt="" /> : <span className="thumb" />}
              <div className="name"><b>{p.title}</b><small>{formatDate(p.published_at)}</small></div>
              {!p.published && <span className="adm-badge">დამალული</span>}
              <Link className="adm-btn ghost" href={`/admin/news/${p.id}`}>რედაქტირება</Link>
            </div>
          ))}
        </div>
      ) : <div className="adm-card"><p style={{ margin: 0, color: "#6b6f78" }}>სიახლეები ჯერ არ არის.</p></div>}
    </>
  );
}
