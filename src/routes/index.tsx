import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Search, Sparkles, ShoppingBag, UtensilsCrossed, Gift } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

type Category = "All" | "Palm Aura" | "Smoochie Kids" | "Food & Dining" | "e-Shop";

interface Service {
  name: string;
  brand: "Palm Aura" | "Smoochie Kids" | "Food & Dining";
  category: Category;
  description: string;
  image: string;
  comingSoon?: boolean;
}

const services: Service[] = [
  { name: "Salon", brand: "Palm Aura", category: "Palm Aura", description: "Braids, blowouts, silk press, weaves, and expert styling.", image: "/images/services/salon-1-CPlEhaY3.jpg" },
  { name: "Barbershop", brand: "Palm Aura", category: "Palm Aura", description: "Sharp fades, beard grooming, and classic men's cuts.", image: "/images/services/barber-1-CFKmot4u.jpg" },
  { name: "Nail Bar", brand: "Palm Aura", category: "Palm Aura", description: "Luxury manicures, pedicures, gel nails, and nail art.", image: "/images/services/nailbar-1-BVHdWYZH.jpg" },
  { name: "Kids Salon", brand: "Smoochie Kids", category: "Smoochie Kids", description: "Fun kids haircuts, braids, and styling in a playful setting.", image: "/images/services/kids-salon-1-BDurJ8Uj.jpg" },
  { name: "Kids Spa", brand: "Smoochie Kids", category: "Smoochie Kids", description: "Gentle facials, mini manis, pamper parties, and hydrotherapy.", image: "/images/services/kids-spa-1-BjtOGQGV.jpg" },
  { name: "Lash Bar", brand: "Palm Aura", category: "Palm Aura", description: "Classic to mega volume lash extensions and brow sculpting.", image: "/images/services/lash-1-BK2Fkms7.jpg" },
  { name: "Head Spa", brand: "Palm Aura", category: "Palm Aura", description: "Japanese head spa packages on our electric massage waterfall bed.", image: "/images/services/headspa-1-Dpwg8n9O.jpg" },
  { name: "Restaurant & Café", brand: "Food & Dining", category: "Food & Dining", description: "Healthy meals, fresh smoothies, kids menus, and treats for the family.", image: "/images/services/restaurant-1-CXEhgo_D.jpg", comingSoon: true },
];

const categories: { label: Category; icon?: typeof Sparkles }[] = [
  { label: "All" },
  { label: "Palm Aura", icon: Sparkles },
  { label: "Smoochie Kids", icon: Sparkles },
  { label: "Food & Dining", icon: UtensilsCrossed },
  { label: "e-Shop", icon: ShoppingBag },
];

function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[color:var(--cream)]/85 border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        <a href="/" className="font-brand text-3xl text-[color:var(--bronze)] leading-none">Palm Aura</a>
        <nav className="hidden lg:flex items-center gap-1">
          {categories.map((c) => (
            <a key={c.label} href="#services" className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-[color:var(--bronze)] rounded-full transition-colors">
              {c.label}
            </a>
          ))}
          <a href="#gallery" className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-[color:var(--bronze)] rounded-full transition-colors">Gallery</a>
        </nav>
        <div className="flex items-center gap-2">
          <button className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm text-muted-foreground hover:border-[color:var(--clay)] transition-colors">
            <Search className="w-4 h-4" /> Search & book
          </button>
          <a href="#" className="hidden sm:inline-block text-sm font-medium text-foreground/80 hover:text-[color:var(--bronze)] px-3 py-2">Log In</a>
          <a href="#" className="inline-flex items-center px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">Sign Up</a>
        </div>
      </div>
    </header>
  );
}

function ServiceCard({ s }: { s: Service }) {
  return (
    <article className="group bg-card rounded-3xl overflow-hidden border border-border/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img src={s.image} alt={`${s.brand} ${s.name}`} loading="lazy" className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${s.comingSoon ? "grayscale" : ""}`} />
        <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-[color:var(--clay)] text-white text-xs font-medium tracking-wide">{s.brand}</span>
        {s.comingSoon && (
          <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/95 text-foreground text-[10px] font-bold tracking-widest uppercase">Coming Soon</span>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <h3 className="font-serif text-2xl font-semibold text-foreground">{s.name}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">{s.description}</p>
        <div className="mt-5 flex items-center justify-between">
          <a href="#" className="inline-flex items-center gap-1 text-sm font-medium text-[color:var(--bronze)] hover:gap-2 transition-all">
            {s.comingSoon ? "Launching soon" : "View prices"} <ArrowRight className="w-4 h-4" />
          </a>
          {!s.comingSoon ? (
            <a href="#" className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity">Book</a>
          ) : (
            <span className="px-4 py-2 rounded-full bg-muted text-muted-foreground text-sm font-medium">Soon</span>
          )}
        </div>
      </div>
    </article>
  );
}

function ServicesSection() {
  const [active, setActive] = useState<Category>("All");
  const filtered = active === "All" ? services : services.filter((s) => s.category === active);

  return (
    <section id="services" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-card border border-border text-xs font-bold tracking-[0.2em] text-[color:var(--bronze)] uppercase">Our Services</span>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl text-foreground leading-[1.1]">
            Indulge in premium beauty, relaxation & dining{" "}
            <em className="text-[color:var(--clay)] not-italic font-serif italic">for the whole family</em>{" "}
            — all in one place.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground">One destination. Endless ways to look, feel, and live well.</p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {categories.map((c) => (
            <button
              key={c.label}
              onClick={() => setActive(c.label)}
              className={`px-5 py-2 rounded-full text-sm font-medium border transition-all ${
                active === c.label
                  ? "bg-[color:var(--clay)] text-white border-[color:var(--clay)] shadow-sm"
                  : "bg-card text-foreground/70 border-border hover:border-[color:var(--clay)]"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((s) => <ServiceCard key={s.name} s={s} />)}
        </div>
      </div>
    </section>
  );
}

function PackagesSection() {
  const packages = [
    { count: 2, discount: "10% OFF", popular: false },
    { count: 3, discount: "15% OFF", popular: true },
    { count: 4, discount: "20% OFF", popular: false },
  ];
  return (
    <section className="py-20 sm:py-24 bg-[color:var(--secondary)]/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-card border border-border text-xs font-bold tracking-[0.2em] text-[color:var(--bronze)] uppercase">Build Your Own</span>
          <h2 className="mt-6 font-serif text-4xl sm:text-5xl text-foreground">Build Your Own Beauty Package</h2>
          <p className="mt-4 text-muted-foreground text-lg">Book multiple services in one day and enjoy exclusive savings.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((p) => (
            <div key={p.count} className={`relative rounded-3xl p-8 bg-card border-2 transition-all ${p.popular ? "border-[color:var(--clay)] shadow-lg md:-translate-y-2" : "border-border"}`}>
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[color:var(--clay)] text-white text-xs font-bold tracking-wider uppercase">Most Popular</span>
              )}
              <h3 className="font-serif text-2xl text-foreground">Book {p.count} services</h3>
              <p className="mt-2 text-sm text-muted-foreground">You save</p>
              <p className="mt-3 font-serif text-5xl font-semibold text-[color:var(--bronze)]">{p.discount}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 max-w-2xl mx-auto text-center">
          <p className="text-muted-foreground leading-relaxed">
            Planning a full self-care day? Combine your favourites like Headspa, Hair, Nails, Lashes & Barber all in one visit. Simply select your preferred services and create your own package.
          </p>
          <a href="#" className="mt-6 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity shadow-md">
            Start Building Your Package <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function VoucherSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[color:var(--clay)] to-[color:var(--bronze)] p-10 sm:p-16 text-white relative overflow-hidden">
          <Gift className="absolute -top-8 -right-8 w-64 h-64 text-white/10" strokeWidth={1} />
          <div className="relative max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-xs font-bold tracking-[0.2em] uppercase">The Gift of Wellness</span>
            <h2 className="mt-5 font-serif text-4xl sm:text-5xl leading-tight">Buy a Voucher for Friends & Family</h2>
            <p className="mt-5 text-white/90 text-lg leading-relaxed">
              Birthdays, anniversaries, or just because — gift a Palm Aura experience. Redeemable across all our services from spa and salon to kids and dining.
            </p>
            <a href="/buy-voucher" className="mt-8 inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-[color:var(--bronze)] font-semibold hover:bg-white/95 transition-colors">
              Buy a Gift Voucher <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: 1, t: "Browse Services & Prices", d: "Explore our adult wellness, kids spa, packages, and restaurant offerings — all with transparent pricing." },
    { n: 2, t: "Create Your Account", d: "Sign up in seconds. Add family members to book for the whole family in one session." },
    { n: 3, t: "Book & Pay Together", d: "Add multiple services, assign to family members, and checkout with one payment, one invoice." },
  ];
  return (
    <section className="py-20 sm:py-24 bg-[color:var(--secondary)]/60">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-serif text-4xl sm:text-5xl text-foreground">How Signing Up Works</h2>
          <p className="mt-4 text-muted-foreground text-lg">Simple family booking in three easy steps</p>
        </div>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.n} className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-[color:var(--clay)] text-white font-serif text-2xl font-semibold flex items-center justify-center shadow-md">
                {s.n}
              </div>
              <h3 className="mt-6 font-serif text-2xl text-foreground">{s.t}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-[color:var(--cream)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-brand text-2xl text-[color:var(--bronze)]">Palm Aura</span>
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Palm Aura. Beauty, wellness & dining for the whole family.</p>
      </div>
    </footer>
  );
}

function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <ServicesSection />
        <PackagesSection />
        <VoucherSection />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
