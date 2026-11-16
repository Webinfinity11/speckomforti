import type { Metadata, Viewport } from "next";
import { Noto_Sans_Georgian } from "next/font/google";
import { getSite } from "@/lib/data";

const noto = Noto_Sans_Georgian({ subsets: ["georgian", "latin"], weight: ["400", "500", "600", "700", "800", "900"], display: "swap" });

// Every page reads the database; never prerender at build time (Railway has no DB access during build).
export const dynamic = "force-dynamic";

export const viewport: Viewport = { themeColor: "#171717" };

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: { default: site.seoTitle, template: `%s | ${site.brandName}` },
    description: site.seoDescription,
    icons: { icon: "/img/logo_yellow.svg" },
    metadataBase: process.env.SITE_URL ? new URL(process.env.SITE_URL) : undefined,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka">
      <body className={noto.className}>{children}</body>
    </html>
  );
}
