import Link from "next/link";
import { AdminForm } from "@/components/admin/Form";
import { PostFields } from "@/components/admin/PostFields";
import { createPost } from "@/lib/admin-actions";

export default function NewPost() {
  return (
    <>
      <div className="adm-head"><div><h1>ახალი სიახლე</h1><p><Link href="/admin/news">← სიახლეები</Link></p></div></div>
      <AdminForm action={createPost}><PostFields /></AdminForm>
    </>
  );
}
