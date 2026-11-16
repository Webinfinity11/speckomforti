import Link from "next/link";
import { PageHero } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <PageHero title="გვერდი ვერ მოიძებნა" intro="შესაძლოა გვერდი წაიშალა ან მისამართი არასწორია." crumbs={[{ label: "404" }]} />
      <section className="section"><div className="container"><div className="empty">
        <Link className="solid-btn" href="/">მთავარ გვერდზე დაბრუნება</Link>
      </div></div></section>
    </>
  );
}
