import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { getUnreadCount } from "@/lib/data";
import "../admin.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "ადმინ პანელი | SK", robots: { index: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const unread = await getUnreadCount();
  return (
    <div className="adm">
      <AdminNav unread={unread} />
      <main className="adm-main">{children}</main>
    </div>
  );
}
