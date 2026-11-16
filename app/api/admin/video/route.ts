import { randomBytes } from "crypto";
import { createWriteStream } from "fs";
import { mkdir, unlink } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";
import { UPLOAD_DIR } from "@/lib/uploads";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_BYTES = 500 * 1024 * 1024;
const TYPES: Record<string, string> = { "video/mp4": "mp4", "video/webm": "webm", "video/quicktime": "mov" };

// Raw video upload (request body = the file), streamed to disk so large files don't sit in memory.
// Query: ?caption=...  The middleware already guards /api/admin, this re-checks the session.
export async function POST(req: Request) {
  const jar = await cookies();
  if (!(await verifySessionToken(jar.get(SESSION_COOKIE)?.value))) return Response.json({ error: "ავტორიზაცია საჭიროა" }, { status: 401 });

  const type = (req.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  const ext = TYPES[type];
  if (!ext) return Response.json({ error: "მხოლოდ MP4, WebM ან MOV ვიდეო" }, { status: 400 });
  const size = Number(req.headers.get("content-length") || 0);
  if (size > MAX_BYTES) return Response.json({ error: "ვიდეო ძალიან დიდია (მაქს. 500MB)" }, { status: 413 });
  if (!req.body) return Response.json({ error: "ფაილი ცარიელია" }, { status: 400 });

  await mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${Date.now().toString(36)}-${randomBytes(5).toString("hex")}.${ext}`;
  const file = path.join(UPLOAD_DIR, name);
  let written = 0;
  try {
    const body = Readable.fromWeb(req.body as import("stream/web").ReadableStream);
    body.on("data", (c: Buffer) => { written += c.length; if (written > MAX_BYTES) body.destroy(new Error("ვიდეო ძალიან დიდია (მაქს. 500MB)")); });
    await pipeline(body, createWriteStream(file));
  } catch (e) {
    await unlink(file).catch(() => {});
    return Response.json({ error: (e as Error).message || "ატვირთვა ვერ მოხერხდა" }, { status: 500 });
  }

  const caption = (new URL(req.url).searchParams.get("caption") || "").trim().slice(0, 300);
  const q = await db();
  const [{ pos }] = await q<{ pos: number }>(`SELECT coalesce(max(position), -1) + 1 AS pos FROM gallery WHERE kind = 'video'`);
  const [item] = await q<{ id: number }>(
    `INSERT INTO gallery (kind, src, video_url, caption, position) VALUES ('video', '', $1, $2, $3) RETURNING id`,
    [`/uploads/${name}`, caption, pos]
  );
  revalidatePath("/", "layout");
  return Response.json({ id: item.id, video: `/uploads/${name}` });
}
