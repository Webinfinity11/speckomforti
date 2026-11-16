import "server-only";
import { cache } from "react";
import { db } from "./db";
import { defaultHome, defaultPages, defaultSite, type HomeContent, type PageContent, type PageKey, type SiteContent } from "./defaults";

export type Category = { id: number; slug: string; name: string; icon: string; intro: string; cover: string; position: number; on_home: boolean };
export type Spec = { label: string; value: string };
export type Product = {
  id: number; category_id: number; slug: string; name: string; short: string; description: string; price: string;
  specs: Spec[]; published: boolean; position: number; cover: string;
};
export type Img = { id: number; src: string; position: number };
export type Service = { id: number; slug: string; name: string; short: string; description: string; cover: string; position: number };
export type GalleryItem = { id: number; kind: "photo" | "video" | "banner"; src: string; video_url: string; caption: string; position: number };
export type Post = { id: number; slug: string; title: string; excerpt: string; body: string; cover: string; published: boolean; published_at: string };
export type Message = { id: number; name: string; phone: string; email: string; subject: string; body: string; is_read: boolean; created_at: string };

async function getSetting<T extends object>(key: string, fallback: T): Promise<T> {
  const q = await db();
  const [row] = await q<{ value: T }>(`SELECT value FROM settings WHERE key = $1`, [key]);
  return { ...fallback, ...(row?.value ?? {}) };
}
export const getSite = cache(() => getSetting<SiteContent>("site", defaultSite));
export const getHome = () => getSetting<HomeContent>("home", defaultHome);
export const getPage = (k: PageKey) => getSetting<PageContent>(`page_${k}`, defaultPages[k]);

export async function saveSetting(key: string, value: object) {
  const q = await db();
  await q(`INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`, [key, JSON.stringify(value)]);
}

/* ---------- categories & products ---------- */

export const getCategories = cache(async () => (await db())<Category>(`SELECT * FROM categories ORDER BY position, id`));

export async function getCategory(slug: string) {
  const [c] = await (await db())<Category>(`SELECT * FROM categories WHERE slug = $1`, [slug]);
  return c ?? null;
}
export async function getCategoryById(id: number) {
  const [c] = await (await db())<Category>(`SELECT * FROM categories WHERE id = $1`, [id]);
  return c ?? null;
}

const PRODUCT_COLS = `p.*, coalesce((SELECT src FROM images i WHERE i.owner = 'product' AND i.owner_id = p.id ORDER BY position, id LIMIT 1), '') AS cover`;

export async function getProducts(categoryId?: number, opts: { all?: boolean } = {}) {
  const q = await db();
  const where = [categoryId ? `p.category_id = $1` : `true`, opts.all ? `true` : `p.published`].join(" AND ");
  return q<Product>(`SELECT ${PRODUCT_COLS} FROM products p WHERE ${where} ORDER BY p.position, p.id`, categoryId ? [categoryId] : []);
}

export async function getProduct(categoryId: number, slug: string) {
  const [p] = await (await db())<Product>(`SELECT ${PRODUCT_COLS} FROM products p WHERE p.category_id = $1 AND p.slug = $2 AND p.published`, [categoryId, slug]);
  return p ?? null;
}
export async function getProductById(id: number) {
  const [p] = await (await db())<Product>(`SELECT ${PRODUCT_COLS} FROM products p WHERE p.id = $1`, [id]);
  return p ?? null;
}

export async function getImages(owner: "product" | "service", ownerId: number) {
  return (await db())<Img>(`SELECT id, src, position FROM images WHERE owner = $1 AND owner_id = $2 ORDER BY position, id`, [owner, ownerId]);
}

export async function getProductCounts(): Promise<Record<number, number>> {
  const rows = await (await db())<{ category_id: number; n: number }>(`SELECT category_id, count(*)::int AS n FROM products WHERE published GROUP BY category_id`);
  return Object.fromEntries(rows.map((r) => [r.category_id, r.n]));
}

// Search by product name, short text or category name (case-insensitive). Used by the header search and /search.
export type SearchHit = Product & { category_slug: string; category_name: string };

export async function searchProducts(term: string, limit = 50): Promise<SearchHit[]> {
  const t = term.trim().slice(0, 80);
  if (t.length < 2) return [];
  const like = "%" + t.replace(/[%_\\]/g, (m) => "\\" + m) + "%";
  return (await db())<SearchHit>(
    `SELECT ${PRODUCT_COLS}, c.slug AS category_slug, c.name AS category_name
     FROM products p JOIN categories c ON c.id = p.category_id
     WHERE p.published AND (p.name ILIKE $1 OR p.short ILIKE $1 OR p.description ILIKE $1 OR c.name ILIKE $1)
     ORDER BY (p.name ILIKE $1) DESC, c.position, p.position, p.id LIMIT $2`,
    [like, limit]
  );
}

/* ---------- services ---------- */

export const getServices = cache(async () => (await db())<Service>(`SELECT * FROM services ORDER BY position, id`));
export async function getService(slug: string) {
  const [s] = await (await db())<Service>(`SELECT * FROM services WHERE slug = $1`, [slug]);
  return s ?? null;
}
export async function getServiceById(id: number) {
  const [s] = await (await db())<Service>(`SELECT * FROM services WHERE id = $1`, [id]);
  return s ?? null;
}

/* ---------- gallery ---------- */

export async function getGallery(kind?: "photo" | "video" | "banner") {
  const q = await db();
  return kind
    ? q<GalleryItem>(`SELECT * FROM gallery WHERE kind = $1 ORDER BY position, id`, [kind])
    : q<GalleryItem>(`SELECT * FROM gallery ORDER BY position, id`);
}

/* ---------- news ---------- */

const POST_COLS = `id, slug, title, excerpt, body, cover, published, to_char(published_at, 'YYYY-MM-DD') AS published_at`;
export async function getPosts(opts: { all?: boolean } = {}) {
  return (await db())<Post>(`SELECT ${POST_COLS} FROM posts ${opts.all ? "" : "WHERE published"} ORDER BY published_at DESC, id DESC`);
}
export async function getPost(slug: string) {
  const [p] = await (await db())<Post>(`SELECT ${POST_COLS} FROM posts WHERE slug = $1 AND published`, [slug]);
  return p ?? null;
}
export async function getPostById(id: number) {
  const [p] = await (await db())<Post>(`SELECT ${POST_COLS} FROM posts WHERE id = $1`, [id]);
  return p ?? null;
}

/* ---------- messages ---------- */

export async function getMessages() {
  return (await db())<Message>(`SELECT * FROM messages ORDER BY created_at DESC LIMIT 500`);
}
export async function getUnreadCount() {
  const [{ n }] = await (await db())<{ n: number }>(`SELECT count(*)::int AS n FROM messages WHERE NOT is_read`);
  return n;
}

/* ---------- helpers ---------- */

export const tel = (p: string) => "tel:" + p.replace(/[^\d+]/g, "");
export const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

const MONTHS = ["იანვარი", "თებერვალი", "მარტი", "აპრილი", "მაისი", "ივნისი", "ივლისი", "აგვისტო", "სექტემბერი", "ოქტომბერი", "ნოემბერი", "დეკემბერი"];
export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return y ? `${d} ${MONTHS[m - 1]}, ${y}` : "";
}

export const isVideoFile = (url: string) => /^\/uploads\/[a-z0-9-]+\.(mp4|webm|mov)$/i.test(url);

export function youtubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/);
  return m?.[1] ?? null;
}
