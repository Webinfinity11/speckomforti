import type { Metadata } from "next";
import { TextPage } from "@/components/TextPage";

export const metadata: Metadata = { title: "ფილების მოვლა" };
export default function CarePage() { return <TextPage k="care" crumbs={[{ label: "ინფო" }]} />; }
