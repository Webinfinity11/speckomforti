"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/admin-actions";

type Item = { href: string; label: string; exact?: boolean; badge?: boolean };
const groups: { title: string; items: Item[] }[] = [
  { title: "", items: [{ href: "/admin", label: "მთავარი", exact: true }, { href: "/admin/messages", label: "შეტყობინებები", badge: true }] },
  { title: "კატალოგი", items: [{ href: "/admin/products", label: "პროდუქცია" }, { href: "/admin/categories", label: "კატეგორიები" }, { href: "/admin/services", label: "სერვისები" }] },
  { title: "კონტენტი", items: [{ href: "/admin/home", label: "მთავარი გვერდი" }, { href: "/admin/pages", label: "გვერდები" }, { href: "/admin/gallery", label: "გალერეა" }, { href: "/admin/news", label: "სიახლეები" }] },
  { title: "პარამეტრები", items: [{ href: "/admin/site", label: "კონტაქტი და SEO" }] },
];

export function AdminNav({ unread }: { unread: number }) {
  const path = usePathname();
  return (
    <aside className="adm-side">
      <div className="adm-brand"><img src="/img/logo_yellow.svg" alt="" />ადმინ პანელი</div>
      {groups.map((g, gi) => (
        <div className="adm-group" key={gi}>
          {g.title && <div className="adm-group-title">{g.title}</div>}
          {g.items.map((i) => {
            const active = i.exact ? path === i.href : path.startsWith(i.href);
            return (
              <Link key={i.href} href={i.href} className={active ? "is-active" : undefined}>
                {i.label}
                {i.badge && unread > 0 && <span className="adm-badge on" style={{ marginLeft: "auto" }}>{unread}</span>}
              </Link>
            );
          })}
        </div>
      ))}
      <div className="adm-spacer" />
      <a href="/" target="_blank" rel="noopener">საიტის ნახვა ↗</a>
      <form action={logout}><button type="submit">გასვლა</button></form>
    </aside>
  );
}
