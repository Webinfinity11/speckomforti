import { ABOUT_BODY, ABOUT_STATS, CARE_BODY, LAB_BODY, LAB_STATS } from "./content-ka";

// Default texts (taken from the homepage design). Admin edits are stored in the settings table and override these.

export const defaultSite = {
  brandName: "სპეცკომფორტი",
  brandTagline: "სამშენებლო მასალები",
  phone: "+995 (32) 2 110 310",
  phone2: "",
  email: "info@speckomforti.ge",
  address: "ა. ბელიაშვილის ქ. N197, თბილისი\nმცხეთის რაიონი, სოფ. წეროვანი",
  hours: "",
  facebook: "",
  instagram: "",
  youtube: "",
  tiktok: "",
  mapEmbed: "",
  footerText: "ქვაფენილი, სამშენებლო ბლოკები, დეკორატიული ელემენტები და მომსახურება თქვენი სივრცისთვის.",
  topLeft: "SK · სამშენებლო მასალები და მომსახურება",
  topRight: "ხარისხი ყველა დეტალში",
  deliveryText: "ტრანსპორტირების და შეკვეთის დეტალების გასარკვევად გამოგვიგზავნეთ მოთხოვნა ან დაგვიკავშირდით.",
  seoTitle: "სპეცკომფორტი (SK) — სამშენებლო მასალები და მომსახურება",
  seoDescription: "SK — ქვაფენილი, ბორდიური, ბეტონისა და პემზის ბლოკები, მოპირკეთება და ტრანსპორტირება.",
};

export const defaultHome = {
  eyebrow: "SK / სამშენებლო მასალები",
  heroTitle: "ფორმა. ხარისხი. გამძლეობა.",
  heroText: "ქვაფენილი, ბორდიური, ფასადის და სამშენებლო ბლოკები თქვენი სახლისა და სივრცის სრულყოფისთვის.",
  heroImage: "/img/10.jpg",
  heroLabel: "",
  heroButton: "პროდუქციის ნახვა",
  heroButton2: "ჩვენი სერვისები",
  benefit1Title: "გამძლე მასალები",
  benefit1Text: "ყოველდღიური გამოყენებისთვის",
  benefit2Title: "ფართო არჩევანი",
  benefit2Text: "მასალები სხვადასხვა პროექტისთვის",
  benefit3Title: "ტრანსპორტირება",
  benefit3Text: "მიტანის სერვისი",
  categoriesTitle: "პროდუქციის კატეგორიები",
  statTitle: "მასალები, რომლებიც თქვენს სივრცეს გამორჩეულ იერს აძლევს.",
  statText1: "აირჩიეთ პროდუქცია ეზოს, ფასადის, ღობისა და სამშენებლო სამუშაოებისთვის.",
  statText2: "გაეცანით სხვადასხვა მასალას და დაგეგმეთ თქვენი შემდეგი პროექტი.",
  productsTitle: "ჩვენი პროდუქცია",
  servicesTitle: "ჩვენი სერვისები",
  servicesText: "მხოლოდ მასალები არა — მომსახურება პროექტის განხორციელებისთვის.",
  galleryTitle: "გალერეა",
  galleryText: "პროდუქცია დეტალებში და სივრცეები რეალურ გამოყენებაში.",
  galleryPhotoCover: "/img/product-1.webp",
  galleryMiddleCover: "/img/14.jpg",
  galleryVideoCover: "/img/product-4.webp",
  info1Text: "კომპანიის სიახლეებისა და ახალი პროდუქციისთვის განკუთვნილი განყოფილება.",
  info2Text: "მასალების ხარისხსა და ტესტირებასთან დაკავშირებული ინფორმაცია.",
  info3Text: "რეკომენდაციები ფილებისა და ქვაფენილის მოვლის შესახებ.",
  ctaTitle: "გეგმავთ ახალ პროექტს?",
  ctaText: "გაეცანით ჩვენს პროდუქციას და შეარჩიეთ თქვენთვის სასურველი სამშენებლო მასალა. შეკვეთისთვის შეგიძლიათ მოამზადოთ მოთხოვნა.",
  ctaButton: "მოთხოვნის მომზადება",
};

// Inner text pages. Body format: blank line = new paragraph, "## " = heading, "- " = list item.
export type PageContent = { eyebrow: string; title: string; intro: string; body: string; image: string; stats: string };

export const defaultPages: Record<"about" | "lab" | "care" | "contact" | "products" | "services" | "gallery" | "news", PageContent> = {
  about: {
    eyebrow: "SK / ჩვენს შესახებ",
    title: "ჩვენს შესახებ",
    intro: "„სპეცკომფორტი“ — სამშენებლო და მოსაპირკეთებელი მასალების მწარმოებელი 2015 წლიდან.",
    body: ABOUT_BODY,
    image: "/img/product-3.webp",
    stats: ABOUT_STATS,
  },
  lab: {
    eyebrow: "SK / ხარისხი",
    title: "ლაბორატორია",
    intro: "ხარისხის კონტროლი ISO და EN საერთაშორისო სტანდარტების შესაბამისად.",
    body: LAB_BODY,
    image: "/img/specc.jpg",
    stats: LAB_STATS,
  },
  care: {
    eyebrow: "SK / რჩევები",
    title: "ფილების მოვლა",
    intro: "ვიბროდაწნეხილი ფილების მოვლის წესები მათი ხანგრძლივი და ლამაზი ვიზუალის შენარჩუნებისთვის.",
    body: CARE_BODY,
    image: "/img/product-1.webp",
    stats: "",
  },
  contact: { eyebrow: "SK • კონტაქტი", title: "კონტაქტი", intro: "დაგვიკავშირდით ნებისმიერ კითხვაზე — დაგეხმარებით პროდუქციის შერჩევაში.", body: "", image: "", stats: "" },
  products: { eyebrow: "SK • პროდუქცია", title: "პროდუქციის კატალოგი", intro: "აღმოაჩინეთ SK-ის პროდუქციის კატეგორიები და შეარჩიეთ მასალები თქვენი პროექტისთვის.", body: "", image: "/img/hero-materials.webp", stats: "" },
  services: { eyebrow: "SK • სერვისები", title: "სერვისები", intro: "პროფესიონალური მოპირკეთება და მიწოდება მთელი საქართველოს მასშტაბით.", body: "", image: "/img/installation.webp", stats: "" },
  gallery: { eyebrow: "SK • გალერეა", title: "გალერეა", intro: "ჩვენი პროდუქცია და შესრულებული სამუშაოები.", body: "", image: "/img/product-3.webp", stats: "" },
  news: { eyebrow: "ინფო", title: "სიახლეები", intro: "კომპანიის სიახლეები და განახლებები.", body: "", image: "", stats: "" },
};

export type SiteContent = typeof defaultSite;
export type HomeContent = typeof defaultHome;
export type PageKey = keyof typeof defaultPages;
