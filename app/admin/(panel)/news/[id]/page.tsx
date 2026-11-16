import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminForm } from "@/components/admin/Form";
import { PostFields } from "@/components/admin/PostFields";
import { deletePost, updatePost } from "@/lib/admin-actions";
import { getPostById } from "@/lib/data";

export default async function PostEdit({ params }: { params: Promise<{ id: string }> }) {
  const p = await getPostById(Number((await params).id));
  if (!p) notFound();
  return (
    <>
      <div className="adm-head">
        <div><h1>{p.title}</h1><p><Link href="/admin/news">← სიახლეები</Link></p></div>
        {p.published && <a className="adm-btn ghost" href={`/news/${p.slug}`} target="_blank" rel="noopener">ნახვა ↗</a>}
      </div>
      <AdminForm action={updatePost.bind(null, p.id)} extra={
        <DeleteButton action={deletePost.bind(null, p.id)} label="წაშლა" confirmText={`წავშალოთ „${p.title}“?`} />
      }>
        <PostFields p={p} />
      </AdminForm>
    </>
  );
}
