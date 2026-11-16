import { createReadStream } from "fs";
import { readFile, stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import { UPLOAD_DIR } from "@/lib/uploads";

const TYPES: Record<string, string> = { webp: "image/webp", mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime" };
const CACHE = "public, max-age=31536000, immutable";

// Serves uploaded images and videos. Videos support Range requests (needed for seeking and for Safari/iOS playback).
export async function GET(req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const m = name.match(/^[a-z0-9-]+\.(webp|mp4|webm|mov)$/i);
  if (!m) return new Response("Not found", { status: 404 });
  const type = TYPES[m[1].toLowerCase()];
  const file = path.join(UPLOAD_DIR, name);
  try {
    if (type.startsWith("image/")) {
      const buf = await readFile(file);
      return new Response(new Uint8Array(buf), { headers: { "Content-Type": type, "Cache-Control": CACHE } });
    }
    const { size } = await stat(file);
    const range = req.headers.get("range")?.match(/bytes=(\d*)-(\d*)/);
    if (range) {
      let start = range[1] ? Number(range[1]) : size - Number(range[2]);
      let end = range[1] && range[2] ? Number(range[2]) : size - 1;
      if (!range[1]) end = size - 1;
      start = Math.max(0, start); end = Math.min(end, size - 1);
      if (start > end || start >= size) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
      const stream = Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream;
      return new Response(stream, {
        status: 206,
        headers: { "Content-Type": type, "Content-Length": String(end - start + 1), "Content-Range": `bytes ${start}-${end}/${size}`, "Accept-Ranges": "bytes", "Cache-Control": CACHE },
      });
    }
    const stream = Readable.toWeb(createReadStream(file)) as ReadableStream;
    return new Response(stream, { headers: { "Content-Type": type, "Content-Length": String(size), "Accept-Ranges": "bytes", "Cache-Control": CACHE } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
