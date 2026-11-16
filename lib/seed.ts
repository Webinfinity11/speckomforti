import { SERVICE_FINISHING, SERVICE_TRANSPORT } from "./content-ka";
import type { Q } from "./db";

// First-run content, built from the homepage design. Everything is editable in /admin.
const CATEGORIES = [
  { slug: "kvafenili", name: "ქვაფენილი", icon: "▧", cover: "/img/cats/kvafenili.webp", intro: "სხვადასხვა ფორმისა და ფაქტურის ქვაფენილი ეზოსა და გარე სივრცეებისთვის." },
  { slug: "bordiuri", name: "ბორდიური", icon: "▱", cover: "/img/cats/bordiuri.webp", intro: "ბორდიურები ბილიკების, ეზოებისა და გზის მონაკვეთების მოსაწყობად." },
  { slug: "betonis-bloki", name: "ბეტონის ბლოკი", icon: "▦", cover: "/img/cats/betonis-bloki.webp", intro: "ბეტონის სამშენებლო ბლოკები." },
  { slug: "pemzis-bloki", name: "პემზის ბლოკი", icon: "▦", cover: "/img/cats/pemzis-bloki.webp", intro: "პემზის სამშენებლო ბლოკები." },
  { slug: "fasadis-bloki", name: "ფასადის ბლოკი", icon: "▤", cover: "/img/cats/fasadi-sveti-kudi.webp", intro: "ფასადის მოპირკეთებისთვის განკუთვნილი ბლოკები." },
  { slug: "svetis-bloki", name: "სვეტის ბლოკი", icon: "▥", cover: "/img/cats/fasadi-sveti-kudi.webp", intro: "დეკორატიული და ფუნქციური სვეტის ბლოკები." },
  { slug: "kudi", name: "ქუდი", icon: "▰", cover: "/img/cats/fasadi-sveti-kudi.webp", intro: "ღობისა და სვეტის დასრულების ელემენტები." },
];

type P = { cat: string; slug: string; name: string; short: string; specs: [string, string][]; images: string[] };
const PRODUCTS: P[] = [
  { cat: "kvafenili", slug: "agura", name: "ქვაფენილი „აგური“", short: "მართკუთხა ქვაფენილი რამდენიმე ფერში.", specs: [["სიგანე", "14 სმ"], ["სისქე", "10 / 14 / 17 / 24 სმ"]], images: ["/img/10.jpg", "/img/product-1.webp"] },
  { cat: "bordiuri", slug: "bordiuri-100x20x8", name: "ბორდიური 100×20×8", short: "ბეტონის ბორდიური ტროტუარისთვის.", specs: [["სიგრძე", "100 სმ"], ["სიმაღლე", "20 სმ"], ["სისქე", "8 სმ"]], images: ["/img/32.jpg", "/img/product-2.webp"] },
  { cat: "bordiuri", slug: "bordiuri-80x20x10", name: "ბორდიური 80×20×10", short: "ბეტონის ბორდიური მომრგვალებული კიდით.", specs: [["სიგრძე", "80 სმ"], ["სიმაღლე", "20 სმ"], ["სისქე", "10 სმ"]], images: ["/img/69.jpg"] },
  { cat: "fasadis-bloki", slug: "modeli-1", name: "ფასადის ბლოკი — მოდელი 1", short: "", specs: [], images: ["/img/product-3.webp"] },
  { cat: "svetis-bloki", slug: "modeli-1", name: "სვეტის ბლოკი — მოდელი 1", short: "", specs: [], images: ["/img/product-4.webp"] },
  { cat: "kudi", slug: "modeli-1", name: "ქუდი — მოდელი 1", short: "", specs: [], images: ["/img/14.jpg"] },
  { cat: "betonis-bloki", slug: "modeli-1", name: "ბეტონის ბლოკი — მოდელი 1", short: "", specs: [], images: ["/img/product-5.webp"] },
  { cat: "pemzis-bloki", slug: "modeli-1", name: "პემზის ბლოკი — მოდელი 1", short: "", specs: [], images: ["/img/specc.jpg"] },
];

const SERVICES = [
  { slug: "mopirketeba", name: "მოპირკეთების სამუშაოები", short: "პროფესიონალური მოპირკეთება და კეთილმოწყობა", cover: "/img/installation.webp", description: SERVICE_FINISHING },
  { slug: "transportireba", name: "ტრანსპორტირება", short: "პროდუქციის მიწოდება მთელი საქართველოს მასშტაბით", cover: "/img/transport.webp", description: SERVICE_TRANSPORT },
];

const GALLERY = ["/img/installation.webp", "/img/product-1.webp", "/img/product-2.webp", "/img/product-3.webp", "/img/product-4.webp", "/img/product-5.webp", "/img/14.jpg", "/img/transport.webp"];

const BANNERS = ["/img/banners/banner-1.webp", "/img/banners/banner-2.webp", "/img/banners/banner-3.webp"];

// Home banners are added once (also on databases created before banners existed); deleting them later sticks.
async function seedBanners(q: Q) {
  // banners 2 and 3 have their headline on the left: show that part when the banner fills the hero box (once)
  if (!(await q(`SELECT 1 FROM settings WHERE key = 'seed_banner_focus'`)).length) {
    await q(`UPDATE gallery SET video_url = 'left' WHERE kind = 'banner' AND video_url = '' AND src IN ('/img/banners/banner-2.webp', '/img/banners/banner-3.webp')`);
    await q(`INSERT INTO settings (key, value) VALUES ('seed_banner_focus', 'true') ON CONFLICT DO NOTHING`);
  }
  if ((await q(`SELECT 1 FROM settings WHERE key = 'seed_banners'`)).length) return;
  for (const [i, src] of BANNERS.entries()) await q(`INSERT INTO gallery (kind, src, video_url, position) VALUES ('banner',$1,$2,$3)`, [src, i === 0 ? "" : "left", i]);
  await q(`INSERT INTO settings (key, value) VALUES ('seed_banners', 'true') ON CONFLICT DO NOTHING`);
}

export async function seedIfEmpty(q: Q) {
  await seedBanners(q);
  const [{ n }] = await q<{ n: number }>(`SELECT count(*)::int AS n FROM categories`);
  if (n > 0) return;
  const catId: Record<string, number> = {};
  for (const [i, c] of CATEGORIES.entries()) {
    const [row] = await q<{ id: number }>(
      `INSERT INTO categories (slug, name, icon, intro, cover, position, on_home) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [c.slug, c.name, c.icon, c.intro, c.cover, i, i < 4]
    );
    catId[c.slug] = row.id;
  }
  for (const [i, p] of PRODUCTS.entries()) {
    const [row] = await q<{ id: number }>(
      `INSERT INTO products (category_id, slug, name, short, specs, position) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [catId[p.cat], p.slug, p.name, p.short, JSON.stringify(p.specs.map(([label, value]) => ({ label, value }))), i]
    );
    for (const [j, src] of p.images.entries()) await q(`INSERT INTO images (owner, owner_id, src, position) VALUES ('product',$1,$2,$3)`, [row.id, src, j]);
  }
  for (const [i, s] of SERVICES.entries()) {
    const [row] = await q<{ id: number }>(
      `INSERT INTO services (slug, name, short, description, cover, position) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [s.slug, s.name, s.short, s.description, s.cover, i]
    );
    await q(`INSERT INTO images (owner, owner_id, src, position) VALUES ('service',$1,$2,0)`, [row.id, s.cover]);
  }
  for (const [i, src] of GALLERY.entries()) await q(`INSERT INTO gallery (kind, src, position) VALUES ('photo',$1,$2)`, [src, i]);
}
