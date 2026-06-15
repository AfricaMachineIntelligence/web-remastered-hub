import { ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";

import nailbar from "@/assets/nailbar-1.jpg";
import headspa from "@/assets/headspa-1.jpg";
import salon from "@/assets/salon-1.jpg";
import barber from "@/assets/barber-1.jpg";
import lash from "@/assets/lash-1.jpg";
import restaurant from "@/assets/restaurant-1.jpg";
import kidsSalon from "@/assets/kids-salon-1.jpg";
import kidsSpa from "@/assets/kids-spa-1.jpg";
import eshop from "@/assets/eshop-1.jpg";

type ServiceCard = {
  image: string;
  title: string;
  description: string;
  brand: "Palm Aura" | "Smoochie Kids" | "Food & Dining" | "e-Shop";
  filterGroup: "adult" | "kids" | "food" | "shop";
  focal?: string; // object-position override per card
};

// Ordered by popularity / business importance — most common everyday services first.
// First 8 fill the 2×4 default grid; remainder appears under "View more".
const allServices: ServiceCard[] = [
  { image: salon, title: "Salon", description: "Braids, blowouts, silk press, weaves, and expert styling.", brand: "Palm Aura", filterGroup: "adult", focal: "50% 35%" },
  { image: barber, title: "Barbershop", description: "Sharp fades, beard grooming, and classic men's cuts.", brand: "Palm Aura", filterGroup: "adult", focal: "55% 35%" },
  { image: nailbar, title: "Nail Bar", description: "Luxury manicures, pedicures, gel nails, and nail art.", brand: "Palm Aura", filterGroup: "adult", focal: "50% 65%" },
  { image: kidsSalon, title: "Kids Salon", description: "Fun kids haircuts, braids, and styling in a playful setting.", brand: "Smoochie Kids", filterGroup: "kids", focal: "50% 30%" },
  { image: kidsSpa, title: "Kids Spa", description: "Gentle facials, mini manis, pamper parties, and hydrotherapy.", brand: "Smoochie Kids", filterGroup: "kids", focal: "50% 40%" },
  { image: lash, title: "Lash Bar", description: "Classic to mega volume lash extensions and brow sculpting.", brand: "Palm Aura", filterGroup: "adult", focal: "50% 45%" },
  { image: headspa, title: "Head Spa", description: "Japanese head spa packages on our electric massage waterfall bed.", brand: "Palm Aura", filterGroup: "adult", focal: "50% 40%" },
  { image: restaurant, title: "Restaurant & Café", description: "Healthy meals, fresh smoothies, kids menus, and treats for the family.", brand: "Food & Dining", filterGroup: "food", focal: "50% 50%" },
  { image: eshop, title: "e-Shop", description: "Premium skincare, haircare, wellness products, and curated gift sets delivered to you.", brand: "e-Shop", filterGroup: "shop", focal: "50% 50%" },
];

type Filter = "all" | "adult" | "kids" | "food" | "shop";

const INITIAL_VISIBLE = 8;

export const ServiceCategories = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    if (filter === "all") return allServices;
    return allServices.filter((s) => s.filterGroup === filter);
  }, [filter]);

  const hasMore = filtered.length > INITIAL_VISIBLE;
  const visible = showAll || !hasMore ? filtered : filtered.slice(0, INITIAL_VISIBLE);
  const hiddenCount = filtered.length - INITIAL_VISIBLE;

  const handleFilterChange = (f: Filter) => {
    setFilter(f);
    setShowAll(false);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const value = (e as CustomEvent).detail as Filter;
      if (value) handleFilterChange(value);
    };
    window.addEventListener("services:set-filter", handler);
    return () => window.removeEventListener("services:set-filter", handler);
  }, []);

  const handleBookClick = (brand: string, title: string) => {
    setSelectedService(`${brand} ${title}`);
    setAuthOpen(true);
  };

  const filters: { label: string; value: Filter }[] = [
    { label: "All", value: "all" },
    { label: "Palm Aura", value: "adult" },
    { label: "Smoochie Kids", value: "kids" },
    { label: "Food & Dining", value: "food" },
    { label: "e-Shop", value: "shop" },
  ];

  return (
    <section
      id="services"
      className="pt-20 pb-10 md:pt-24 md:pb-12 px-6"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, rgba(250,245,239,0.5) 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-4 md:mb-6">
          <span
            className="inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-4 px-4 py-1.5 rounded-full"
            style={{ background: "rgba(180,120,60,0.1)", color: "#9a6830" }}
          >
            Our Services
          </span>
          <h2 className="font-serif text-[1.35rem] sm:text-[1.7rem] lg:text-[2rem] font-medium text-gray-900 mb-5 max-w-3xl mx-auto leading-[1.15] tracking-tight">
            Indulge in premium beauty, relaxation & dining{" "}
            <span
              className="italic"
              style={{
                background: "linear-gradient(135deg, #b47838 0%, #d4a574 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              for the whole family
            </span>
            {" "}— all in one place.
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-xl mx-auto mb-3">
            One destination. Endless ways to look, feel, and live well.
          </p>
        </div>

        {/* 2 rows × 4 columns from md up so all 8 cards fit in two rows */}
        <div className="grid gap-x-4 gap-y-10 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((s, idx) => {
            const comingSoon = s.brand === "Food & Dining" || s.brand === "e-Shop";
            return (
            <div key={`${filter}-${idx}`} className="min-w-0">
              <div
                className={`group relative rounded-3xl overflow-hidden transition-all h-full flex flex-col ${
                  comingSoon ? "" : "hover:shadow-xl hover:-translate-y-1"
                }`}
                style={{
                  background: "rgba(180,120,60,0.04)",
                  border: "1px solid rgba(180,120,60,0.08)",
                }}
                aria-disabled={comingSoon}
              >
                <div className="relative h-60 sm:h-64 lg:h-72 overflow-hidden bg-muted">
                  <img
                    src={s.image}
                    alt={`${s.brand} ${s.title}`}
                    loading="lazy"
                    width={800}
                    height={800}
                    className={`w-full h-full object-cover object-center transition-transform duration-500 ${
                      comingSoon ? "grayscale opacity-60" : "group-hover:scale-105"
                    }`}
                    style={{ objectPosition: s.focal ?? "50% 40%" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <span
                    className="absolute top-3 left-3 text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm"
                    style={{
                      background:
                        s.brand === "Smoochie Kids" ? "rgba(212,96,154,0.85)"
                        : s.brand === "Food & Dining" ? "rgba(139,90,43,0.85)"
                        : s.brand === "e-Shop" ? "rgba(120,100,70,0.85)"
                        : "rgba(180,120,60,0.85)",
                      color: "#fff",
                    }}
                  >
                    {s.brand}
                  </span>
                  {comingSoon && (
                    <span
                      className="absolute top-3 right-3 text-[11px] font-semibold px-3 py-1 rounded-full backdrop-blur-sm uppercase tracking-wider"
                      style={{
                        background: "rgba(255,255,255,0.92)",
                        color: "#9a6830",
                        border: "1px solid rgba(180,120,60,0.3)",
                      }}
                    >
                      Coming Soon
                    </span>
                  )}
                </div>

                <div className={`p-5 flex flex-col flex-1 ${comingSoon ? "opacity-70" : ""}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1.5">{s.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4 flex-1">{s.description}</p>

                  <div className="flex items-center justify-between gap-2">
                    {comingSoon ? (
                      <span className="text-sm font-medium" style={{ color: "#9a6830" }}>
                        Launching soon
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto hover:bg-transparent text-sm"
                        style={{ color: "#9a6830" }}
                        onClick={() => (window.location.href = "/pricing")}
                      >
                        View prices <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      disabled={comingSoon}
                      onClick={() => !comingSoon && handleBookClick(s.brand, s.title)}
                      className="font-semibold text-white hover:opacity-90 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: comingSoon ? "#bfa888" : "#b47838" }}
                    >
                      {comingSoon ? "Soon" : "Book"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* View more / less */}
        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowAll((s) => !s)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all hover:opacity-90"
              style={{ background: "rgba(180,120,60,0.1)", color: "#9a6830", border: "1px solid rgba(180,120,60,0.25)" }}
            >
              {showAll ? "Show less" : `View more (${hiddenCount})`}
              <ChevronDown className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`} />
            </button>
          </div>
        )}
      </div>

      <AuthGateModal open={authOpen} onOpenChange={setAuthOpen} serviceName={selectedService} />
    </section>
  );
};
