import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Catalog } from "@/components/Catalog";
import { getCategory } from "@/lib/data";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await getCategory((await params).category);
  return c ? { title: c.name, description: c.intro || undefined } : {};
}

export default async function CategoryPage({ params }: Props) {
  const c = await getCategory((await params).category);
  if (!c) notFound();
  return <Catalog active={c} />;
}
