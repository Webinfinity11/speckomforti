"use server";

import { timingSafeEqual } from "crypto";
import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "./db";
import { getHome, getPage, getSite, saveSetting, youtubeId } from "./data";
import { defaultHome, defaultPages, defaultSite, type PageKey } from "./defaults";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions, verifySessionToken } from "./session";
import { removeUpload, saveImage } from "./uploads";

export type ActionState = { ok?: boolean; error?: string; message?: string };

async function requireAdmin() {
  const jar = await cookies();
  if (!(await verifySessionToken(jar.get(SESSION_COOKIE)?.value))) throw new Error("ავტორიზაცია საჭიროა");
}

const refresh = () => revalidatePath("/", "layout");
const fail = (e: unknown): ActionState => ({ error: (e as Error).message || "შეცდომა" });

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
const fileOf = (fd: FormData, key: string) => {
  const f = fd.get(key);
  return f instanceof File && f.size > 0 ? f : null;
};
const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").replace(/\r\n/g, "\n").trim();
const bool = (fd: FormData, key: string) => fd.getAll(key).pop() === "1";

const KA: Record<string, string> = {
  ა: "a", ბ: "b", გ: "g", დ: "d", ე: "e", ვ: "v", ზ: "z", თ: "t", ი: "i", კ: "k", ლ: "l", მ: "m", ნ: "n", ო: "o", პ: "p", ჟ: "zh",
  რ: "r", ს: "s", ტ: "t", უ: "u", ფ: "p", ქ: "k", ღ: "gh", ყ: "q", შ: "sh", ჩ: "ch", ც: "ts", ძ: "dz", წ: "ts", ჭ: "ch", ხ: "kh", ჯ: "j", ჰ: "h",
};
function slugify(s: string, fallback = "item") {
  return [...s.toLowerCase()].map((ch) => KA[ch] ?? ch).join("")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70) || fallback;
}
async function uniqueSlug(table: string, base: string, exceptId = 0, scope?: { col: string; val: number }) {
  const q = await db();
  let slug = base, i = 2;
  const extra = scope ? ` AND ${scope.col} = $3` : "";
  const params = (s: string) => (scope ? [s, exceptId, scope.val] : [s, exceptId]);
  while ((await q(`SELECT 1 FROM ${table} WHERE slug = $1 AND id <> $2${extra}`, params(slug))).length) slug = `${base}-${i++}`;
  return slug;
}
async function nextPos(table: string, where = "true", params: unknown[] = []) {
  const [{ pos }] = await (await db())<{ pos: number }>(`SELECT coalesce(max(position), -1) + 1 AS pos FROM ${table} WHERE ${where}`, params);
  return pos;
}
async function reorder(table: string, ids: number[]) {
  const q = await db();
  for (const [i, id] of ids.entries()) await q(`UPDATE ${table} SET position = $1 WHERE id = $2`, [i, id]);
}
function parseSpecs(fd: FormData) {
  const labels = fd.getAll("specLabel").map(String), values = fd.getAll("specValue").map(String);
  return labels.map((label, i) => ({ label: label.trim(), value: (values[i] ?? "").trim() })).filter((s) => s.label || s.value);
}

/* ---------- auth ---------- */

export async function login(_: ActionState, fd: FormData): Promise<ActionState> {
  const user = process.env.ADMIN_USERNAME, pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) return { error: "ADMIN_USERNAME / ADMIN_PASSWORD არ არის მითითებული სერვერზე" };
  if (!safeEqual(str(fd, "username"), user) || !safeEqual(String(fd.get("password") ?? ""), pass)) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: "მომხმარებელი ან პაროლი არასწორია" };
  }
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await createSessionToken(user), sessionCookieOptions);
  redirect("/admin");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

/* ---------- settings (site, home, text pages) ---------- */

const IMAGE_FIELDS: Record<string, { width: number; quality?: number }> = {
  heroImage: { width: 2200, quality: 80 },
  galleryPhotoCover: { width: 1200 },
  galleryVideoCover: { width: 1200 },
  galleryMiddleCover: { width: 1200 },
  image: { width: 1800, quality: 80 },
};

// One action for every settings form. The hidden "_key" picks the record: site | home | page_<name>.
export async function saveSettings(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const key = str(fd, "_key");
    let defaults: Record<string, string>, current: Record<string, string>;
    if (key === "site") { defaults = defaultSite; current = await getSite(); }
    else if (key === "home") { defaults = defaultHome; current = await getHome(); }
    else if (key.startsWith("page_") && key.slice(5) in defaultPages) {
      const k = key.slice(5) as PageKey;
      defaults = defaultPages[k]; current = await getPage(k);
    } else return { error: "უცნობი ფორმა" };

    const next = { ...current };
    for (const k of Object.keys(defaults)) {
      const spec = IMAGE_FIELDS[k];
      const file = spec ? fileOf(fd, `${k}File`) : null;
      if (spec && file) { next[k] = await saveImage(file, spec); await removeUpload(current[k]); }
      else if (spec && fd.get(`${k}Clear`) === "on") { await removeUpload(current[k]); next[k] = defaults[k]; }
      else if (!spec && fd.has(k)) next[k] = str(fd, k);
    }
    await saveSetting(key, next);
    refresh();
    return { ok: true, message: "შენახულია" };
  } catch (e) { return fail(e); }
}

/* ---------- categories ---------- */

async function categoryFields(fd: FormData, id = 0) {
  const name = str(fd, "name");
  if (!name) throw new Error("მიუთითეთ სახელი");
  return { name, slug: await uniqueSlug("categories", slugify(str(fd, "slug") || name, "category"), id), icon: str(fd, "icon") || "▦", intro: str(fd, "intro"), onHome: bool(fd, "onHome") };
}

export async function createCategory(_: ActionState, fd: FormData): Promise<ActionState> {
  let id: number;
  try {
    await requireAdmin();
    const f = await categoryFields(fd);
    const coverFile = fileOf(fd, "coverFile");
    const cover = coverFile ? await saveImage(coverFile, { width: 1000, quality: 84 }) : "";
    const [row] = await (await db())<{ id: number }>(
      `INSERT INTO categories (slug, name, icon, intro, cover, position, on_home) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [f.slug, f.name, f.icon, f.intro, cover, await nextPos("categories"), f.onHome]
    );
    id = row.id;
    refresh();
  } catch (e) { return fail(e); }
  redirect(`/admin/categories/${id}`);
}

export async function updateCategory(id: number, _: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const q = await db();
    const [cur] = await q<{ cover: string }>(`SELECT cover FROM categories WHERE id = $1`, [id]);
    if (!cur) return { error: "კატეგორია ვერ მოიძებნა" };
    const f = await categoryFields(fd, id);
    let cover = cur.cover;
    const coverFile = fileOf(fd, "coverFile");
    if (coverFile) { cover = await saveImage(coverFile, { width: 1000, quality: 84 }); await removeUpload(cur.cover); }
    await q(`UPDATE categories SET name=$1, slug=$2, icon=$3, intro=$4, cover=$5, on_home=$6 WHERE id=$7`, [f.name, f.slug, f.icon, f.intro, cover, f.onHome, id]);
    refresh();
    return { ok: true, message: "შენახულია" };
  } catch (e) { return fail(e); }
}

export async function deleteCategory(id: number) {
  await requireAdmin();
  const q = await db();
  const products = await q<{ id: number }>(`SELECT id FROM products WHERE category_id = $1`, [id]);
  for (const p of products) await deleteOwnerImages("product", p.id);
  const [cat] = await q<{ cover: string }>(`DELETE FROM categories WHERE id = $1 RETURNING cover`, [id]);
  await removeUpload(cat?.cover);
  refresh();
  redirect("/admin/categories");
}

export async function setHomeCategories(ids: number[]) {
  await requireAdmin();
  const q = await db();
  await q(`UPDATE categories SET on_home = (id = ANY($1::int[]))`, [ids]);
  refresh();
}

export async function reorderCategories(ids: number[]) {
  await requireAdmin();
  await reorder("categories", ids);
  refresh();
}

/* ---------- products ---------- */

async function productFields(fd: FormData, id = 0) {
  const name = str(fd, "name");
  if (!name) throw new Error("მიუთითეთ პროდუქციის სახელი");
  const categoryId = Number(fd.get("categoryId"));
  if (!categoryId) throw new Error("აირჩიეთ კატეგორია");
  const slug = await uniqueSlug("products", slugify(str(fd, "slug") || name, "product"), id, { col: "category_id", val: categoryId });
  return { name, categoryId, slug, short: str(fd, "short"), description: str(fd, "description"), price: str(fd, "price"), specs: JSON.stringify(parseSpecs(fd)), published: bool(fd, "published") };
}

export async function createProduct(_: ActionState, fd: FormData): Promise<ActionState> {
  let id: number;
  try {
    await requireAdmin();
    const f = await productFields(fd);
    const [row] = await (await db())<{ id: number }>(
      `INSERT INTO products (category_id, slug, name, short, description, price, specs, published, position) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [f.categoryId, f.slug, f.name, f.short, f.description, f.price, f.specs, f.published, await nextPos("products", "category_id = $1", [f.categoryId])]
    );
    id = row.id;
    refresh();
  } catch (e) { return fail(e); }
  redirect(`/admin/products/${id}`);
}

export async function updateProduct(id: number, _: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const f = await productFields(fd, id);
    await (await db())(
      `UPDATE products SET category_id=$1, slug=$2, name=$3, short=$4, description=$5, price=$6, specs=$7, published=$8 WHERE id=$9`,
      [f.categoryId, f.slug, f.name, f.short, f.description, f.price, f.specs, f.published, id]
    );
    refresh();
    return { ok: true, message: "შენახულია" };
  } catch (e) { return fail(e); }
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  await deleteOwnerImages("product", id);
  await (await db())(`DELETE FROM products WHERE id = $1`, [id]);
  refresh();
  redirect("/admin/products");
}

export async function reorderProducts(ids: number[]) {
  await requireAdmin();
  await reorder("products", ids);
  refresh();
}

/* ---------- services ---------- */

export async function createService(_: ActionState, fd: FormData): Promise<ActionState> {
  let id: number;
  try {
    await requireAdmin();
    const name = str(fd, "name");
    if (!name) return { error: "მიუთითეთ სახელი" };
    const slug = await uniqueSlug("services", slugify(str(fd, "slug") || name, "service"));
    const [row] = await (await db())<{ id: number }>(
      `INSERT INTO services (slug, name, short, description, position) VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [slug, name, str(fd, "short"), str(fd, "description"), await nextPos("services")]
    );
    id = row.id;
    refresh();
  } catch (e) { return fail(e); }
  redirect(`/admin/services/${id}`);
}

export async function updateService(id: number, _: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const q = await db();
    const [cur] = await q<{ cover: string }>(`SELECT cover FROM services WHERE id = $1`, [id]);
    if (!cur) return { error: "სერვისი ვერ მოიძებნა" };
    const name = str(fd, "name");
    if (!name) return { error: "მიუთითეთ სახელი" };
    const slug = await uniqueSlug("services", slugify(str(fd, "slug") || name, "service"), id);
    let cover = cur.cover;
    const coverFile = fileOf(fd, "coverFile");
    if (coverFile) { cover = await saveImage(coverFile, { width: 1200 }); await removeUpload(cur.cover); }
    await q(`UPDATE services SET name=$1, slug=$2, short=$3, description=$4, cover=$5 WHERE id=$6`, [name, slug, str(fd, "short"), str(fd, "description"), cover, id]);
    refresh();
    return { ok: true, message: "შენახულია" };
  } catch (e) { return fail(e); }
}

export async function deleteService(id: number) {
  await requireAdmin();
  await deleteOwnerImages("service", id);
  const [s] = await (await db())<{ cover: string }>(`DELETE FROM services WHERE id = $1 RETURNING cover`, [id]);
  await removeUpload(s?.cover);
  refresh();
  redirect("/admin/services");
}

export async function reorderServices(ids: number[]) {
  await requireAdmin();
  await reorder("services", ids);
  refresh();
}

/* ---------- product / service photos ---------- */

type Owner = "product" | "service";

async function deleteOwnerImages(owner: Owner, ownerId: number) {
  const rows = await (await db())<{ src: string }>(`DELETE FROM images WHERE owner = $1 AND owner_id = $2 RETURNING src`, [owner, ownerId]);
  await Promise.all(rows.map((r) => removeUpload(r.src)));
}

export async function uploadOwnerImage(owner: Owner, ownerId: number, fd: FormData) {
  try {
    await requireAdmin();
    const file = fileOf(fd, "file");
    if (!file) return { error: "ფაილი არ არის არჩეული" };
    const src = await saveImage(file, { width: 1600 });
    const [img] = await (await db())<{ id: number; src: string }>(
      `INSERT INTO images (owner, owner_id, src, position) VALUES ($1,$2,$3,$4) RETURNING id, src`,
      [owner, ownerId, src, await nextPos("images", "owner = $1 AND owner_id = $2", [owner, ownerId])]
    );
    refresh();
    return { image: img };
  } catch (e) { return fail(e); }
}

export async function deleteImage(id: number) {
  await requireAdmin();
  const [row] = await (await db())<{ src: string }>(`DELETE FROM images WHERE id = $1 RETURNING src`, [id]);
  await removeUpload(row?.src);
  refresh();
}

export async function reorderImages(ids: number[]) {
  await requireAdmin();
  await reorder("images", ids);
  refresh();
}

/* ---------- gallery ---------- */

export async function uploadGalleryPhoto(fd: FormData) {
  try {
    await requireAdmin();
    const file = fileOf(fd, "file");
    if (!file) return { error: "ფაილი არ არის არჩეული" };
    const kind = fd.get("kind") === "banner" ? "banner" : "photo";
    const src = await saveImage(file, kind === "banner" ? { width: 2400, quality: 84 } : { width: 1800 });
    const [img] = await (await db())<{ id: number; src: string }>(
      `INSERT INTO gallery (kind, src, position) VALUES ($1,$2,$3) RETURNING id, src`, [kind, src, await nextPos("gallery", "kind = $1", [kind])]
    );
    refresh();
    return { image: img };
  } catch (e) { return fail(e); }
}

export async function addVideo(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const url = str(fd, "videoUrl");
    if (!youtubeId(url)) return { error: "მიუთითეთ YouTube ვიდეოს ბმული" };
    const coverFile = fileOf(fd, "coverFile");
    const src = coverFile ? await saveImage(coverFile, { width: 1200 }) : "";
    await (await db())(`INSERT INTO gallery (kind, src, video_url, caption, position) VALUES ('video',$1,$2,$3,$4)`, [src, url, str(fd, "caption"), await nextPos("gallery", "kind = 'video'")]);
    refresh();
    return { ok: true, message: "ვიდეო დაემატა" };
  } catch (e) { return fail(e); }
}

export async function updateGalleryCaption(id: number, caption: string) {
  await requireAdmin();
  await (await db())(`UPDATE gallery SET caption = $1 WHERE id = $2`, [caption.trim(), id]);
  refresh();
}

// Banners: which part stays visible when the banner fills the hero box (stored in the unused video_url column).
export async function updateBannerFocus(id: number, focus: string) {
  await requireAdmin();
  if (!["left", "center", "right"].includes(focus)) return;
  await (await db())(`UPDATE gallery SET video_url = $1 WHERE id = $2 AND kind = 'banner'`, [focus, id]);
  refresh();
}

export async function deleteGalleryItem(id: number) {
  await requireAdmin();
  const [row] = await (await db())<{ src: string; video_url: string }>(`DELETE FROM gallery WHERE id = $1 RETURNING src, video_url`, [id]);
  await removeUpload(row?.src);
  await removeUpload(row?.video_url);
  refresh();
}

export async function reorderGallery(ids: number[]) {
  await requireAdmin();
  await reorder("gallery", ids);
  refresh();
}

/* ---------- news ---------- */

async function postFields(fd: FormData, id = 0) {
  const title = str(fd, "title");
  if (!title) throw new Error("მიუთითეთ სათაური");
  const date = str(fd, "publishedAt");
  return {
    title, slug: await uniqueSlug("posts", slugify(str(fd, "slug") || title, "post"), id),
    excerpt: str(fd, "excerpt"), body: str(fd, "body"), published: bool(fd, "published"),
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10),
  };
}

export async function createPost(_: ActionState, fd: FormData): Promise<ActionState> {
  let id: number;
  try {
    await requireAdmin();
    const f = await postFields(fd);
    const coverFile = fileOf(fd, "coverFile");
    const cover = coverFile ? await saveImage(coverFile, { width: 1600 }) : "";
    const [row] = await (await db())<{ id: number }>(
      `INSERT INTO posts (slug, title, excerpt, body, cover, published, published_at) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [f.slug, f.title, f.excerpt, f.body, cover, f.published, f.date]
    );
    id = row.id;
    refresh();
  } catch (e) { return fail(e); }
  redirect(`/admin/news/${id}`);
}

export async function updatePost(id: number, _: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requireAdmin();
    const q = await db();
    const [cur] = await q<{ cover: string }>(`SELECT cover FROM posts WHERE id = $1`, [id]);
    if (!cur) return { error: "სიახლე ვერ მოიძებნა" };
    const f = await postFields(fd, id);
    let cover = cur.cover;
    const coverFile = fileOf(fd, "coverFile");
    if (coverFile) { cover = await saveImage(coverFile, { width: 1600 }); await removeUpload(cur.cover); }
    await q(`UPDATE posts SET slug=$1, title=$2, excerpt=$3, body=$4, cover=$5, published=$6, published_at=$7 WHERE id=$8`,
      [f.slug, f.title, f.excerpt, f.body, cover, f.published, f.date, id]);
    refresh();
    return { ok: true, message: "შენახულია" };
  } catch (e) { return fail(e); }
}

export async function deletePost(id: number) {
  await requireAdmin();
  const [p] = await (await db())<{ cover: string }>(`DELETE FROM posts WHERE id = $1 RETURNING cover`, [id]);
  await removeUpload(p?.cover);
  refresh();
  redirect("/admin/news");
}

/* ---------- contact form ---------- */

const g = globalThis as unknown as { __skRate?: Map<string, number[]> };
function rateLimited(ip: string) {
  const map = (g.__skRate ??= new Map<string, number[]>());
  const now = Date.now(), recent = (map.get(ip) ?? []).filter((t: number) => now - t < 3600_000);
  recent.push(now);
  map.set(ip, recent);
  return recent.length > 8;
}

export async function sendMessage(_: ActionState, fd: FormData): Promise<ActionState> {
  try {
    if (str(fd, "website")) return { ok: true, message: "შეტყობინება გაიგზავნა" }; // honeypot
    const name = str(fd, "name").slice(0, 120), phone = str(fd, "phone").slice(0, 40), email = str(fd, "email").slice(0, 120);
    const body = str(fd, "body").slice(0, 4000), subject = str(fd, "subject").slice(0, 200);
    if (!name) return { error: "მიუთითეთ სახელი" };
    if (!phone && !email) return { error: "მიუთითეთ ტელეფონი ან ელფოსტა" };
    const h = await headers();
    const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
    if (rateLimited(ip)) return { error: "ძალიან ბევრი მოთხოვნა. სცადეთ მოგვიანებით." };
    await (await db())(`INSERT INTO messages (name, phone, email, subject, body) VALUES ($1,$2,$3,$4,$5)`, [name, phone, email, subject, body]);
    revalidatePath("/admin", "layout");
    return { ok: true, message: "შეტყობინება გაიგზავნა. მალე დაგიკავშირდებით." };
  } catch (e) { return fail(e); }
}

export async function markMessage(id: number, read: boolean) {
  await requireAdmin();
  await (await db())(`UPDATE messages SET is_read = $1 WHERE id = $2`, [read, id]);
  revalidatePath("/admin", "layout");
}

export async function deleteMessage(id: number) {
  await requireAdmin();
  await (await db())(`DELETE FROM messages WHERE id = $1`, [id]);
  revalidatePath("/admin", "layout");
}
