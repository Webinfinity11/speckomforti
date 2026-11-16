import Link from "next/link";
import { getCategories, getGallery, getPosts, getProducts, getServices, getUnreadCount } from "@/lib/data";

export default async function Dashboard() {
  const [products, categories, services, gallery, posts, unread] = await Promise.all([
    getProducts(undefined, { all: true }), getCategories(), getServices(), getGallery(), getPosts({ all: true }), getUnreadCount(),
  ]);
  const cards = [
    { href: "/admin/messages", title: "შეტყობინებები", text: unread ? `${unread} წაუკითხავი` : "ახალი შეტყობინება არ არის" },
    { href: "/admin/products", title: "პროდუქცია", text: `${products.length} პროდუქტი` },
    { href: "/admin/categories", title: "კატეგორიები", text: `${categories.length} კატეგორია` },
    { href: "/admin/services", title: "სერვისები", text: `${services.length} სერვისი` },
    { href: "/admin/gallery", title: "გალერეა", text: `${gallery.filter((g) => g.kind === "photo").length} ფოტო · ${gallery.filter((g) => g.kind === "video").length} ვიდეო` },
    { href: "/admin/news", title: "სიახლეები", text: `${posts.length} სიახლე` },
    { href: "/admin/home", title: "მთავარი გვერდი", text: "ბანერი, უპირატესობები, ტექსტები" },
    { href: "/admin/pages", title: "გვერდები", text: "ჩვენს შესახებ, ლაბორატორია, ფილების მოვლა..." },
    { href: "/admin/site", title: "კონტაქტი და SEO", text: "ტელეფონი, ელფოსტა, სოც. ქსელები, რუკა" },
  ];
  return (
    <>
      <div className="adm-head">
        <div><h1>ადმინ პანელი</h1><p>მართეთ საიტის ყველა გვერდი და პროდუქცია.</p></div>
        <Link className="adm-btn" href="/admin/products/new">+ ახალი პროდუქტი</Link>
      </div>
      <div className="adm-dash">
        {cards.map((c) => <Link key={c.href} href={c.href}><b>{c.title}</b><span>{c.text}</span></Link>)}
      </div>
    </>
  );
}
