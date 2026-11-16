import type { Metadata } from "next";
import { Catalog } from "@/components/Catalog";

export const metadata: Metadata = { title: "პროდუქციის კატალოგი" };

export default function ProductsPage() {
  return <Catalog />;
}
