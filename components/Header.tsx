import { getCategories, getServices, getSite } from "@/lib/data";
import { NavClient } from "./NavClient";

export async function Header() {
  const [site, categories, services] = await Promise.all([getSite(), getCategories(), getServices()]);
  return (
    <NavClient
      brandName={site.brandName}
      phone={site.phone}
      categories={categories.map((c) => ({ href: `/products/${c.slug}`, label: c.name }))}
      services={services.map((s) => ({ href: `/services/${s.slug}`, label: s.name }))}
    />
  );
}
