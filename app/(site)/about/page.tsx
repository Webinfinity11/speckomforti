import type { Metadata } from "next";
import { TextPage } from "@/components/TextPage";

export const metadata: Metadata = { title: "ჩვენს შესახებ" };
export default function AboutPage() { return <TextPage k="about" />; }
