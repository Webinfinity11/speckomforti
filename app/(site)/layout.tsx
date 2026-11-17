import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import "../site.css";
import "../pages.css";

export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site">
      <Header />
      <main>{children}</main>
      <Footer />
      <ScrollReveal />
    </div>
  );
}
