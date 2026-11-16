import type { Metadata } from "next";
import { TextPage } from "@/components/TextPage";

export const metadata: Metadata = { title: "ლაბორატორია" };
export default function LabPage() { return <TextPage k="lab" crumbs={[{ label: "ინფო" }]} />; }
