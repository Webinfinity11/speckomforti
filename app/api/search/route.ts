import { searchProducts } from "@/lib/data";

// Live suggestions for the header search box.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const hits = await searchProducts(q, 6);
  return Response.json(
    hits.map((p) => ({ name: p.name, category: p.category_name, image: p.cover, href: `/products/${p.category_slug}/${p.slug}` })),
    { headers: { "Cache-Control": "no-store" } }
  );
}
