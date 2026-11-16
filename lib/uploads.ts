import "server-only";
import { randomBytes } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

// Uploaded images live in UPLOAD_DIR (Railway volume: /data/uploads) and are served by app/uploads/[name]/route.ts.
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), ".data", "uploads");
const MAX_BYTES = 25 * 1024 * 1024;

export async function saveImage(file: File, opts: { width: number; quality?: number; keepAlpha?: boolean }) {
  if (!file || typeof file.arrayBuffer !== "function") throw new Error("ფაილი არ არის არჩეული");
  if (file.size > MAX_BYTES) throw new Error("ფაილი ძალიან დიდია (მაქს. 25MB)");
  if (!/^image\//.test(file.type)) throw new Error("მხოლოდ სურათის ატვირთვაა შესაძლებელი");
  const input = Buffer.from(await file.arrayBuffer());
  const out = await sharp(input)
    .rotate()
    .resize({ width: opts.width, height: opts.width, fit: "inside", withoutEnlargement: true })
    .webp({ quality: opts.quality ?? 76, alphaQuality: 88, effort: 5, smartSubsample: true })
    .toBuffer();
  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${Date.now().toString(36)}-${randomBytes(5).toString("hex")}.webp`;
  await writeFile(path.join(UPLOAD_DIR, name), out);
  return `/uploads/${name}`;
}

// Removes a file we uploaded earlier (image or video). Bundled /img/* files are left alone.
export async function removeUpload(src: string | null | undefined) {
  if (!src || !src.startsWith("/uploads/")) return;
  const name = path.basename(src);
  try { await unlink(path.join(UPLOAD_DIR, name)); } catch {}
}
