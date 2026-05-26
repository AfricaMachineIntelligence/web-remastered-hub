import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthGateModal } from "./AuthGateModal";
import restaurant1 from "@/assets/restaurant-1.jpg";
import restaurant2 from "@/assets/restaurant-2.jpg";
import restaurant3 from "@/assets/restaurant-3.jpg";
import { UtensilsCrossed, Coffee, Salad, GlassWater } from "lucide-react";

const restaurantImages = [
  { src: restaurant1, alt: "Family enjoying a meal together at Palm Aura restaurant" },
  { src: restaurant2, alt: "Healthy breakfast bowl with fresh fruit and smoothie" },
  { src: restaurant3, alt: "Colourful fresh smoothies and juices at the bar" },
];

const restaurantFeatures = [
  { icon: Coffee, text: "Breakfast, lunch & dinner" },
  { icon: Salad, text: "Healthy, wholesome meals" },
  { icon: GlassWater, text: "Fresh smoothies & juices" },
  { icon: UtensilsCrossed, text: "Pre-order with your booking" },
];

export const RestaurantHighlight = () => {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <section
      id="restaurant"
      className="py-24 px-6 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #faf5ef 0%, #f5ede3 40%, #faf0e6 70%, #fef9f3 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Image Gallery */}
          <div className="order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="row-span-2 relative overflow-hidden rounded-3xl shadow-lg transition-transform hover:scale-105">
                <img
                  src={restaurantImages[0].src}
                  alt={restaurantImages[0].alt}
                  className="w-full h-full min-h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent" />
              </div>
              {restaurantImages.slice(1).map((img, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden rounded-3xl shadow-lg transition-transform hover:scale-105"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-48 md:h-56 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent" />
                </div>
              ))}
            </div>
          </div>

          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium mb-6" style={{ background: "rgba(180,120,60,0.1)", color: "#9a6830" }}>
              <UtensilsCrossed className="h-4 w-4" />
              Palm Aura Kitchen
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Dine Well,
              <span className="block" style={{ color: "#b47838" }}>Feel Good</span>
            </h2>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Complete your wellness experience with nourishing meals for the whole family.
              From power-packed breakfasts to soulful dinners and vibrant smoothies — 
              enjoy a menu crafted to fuel your glow, inside and out.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {restaurantFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{ background: "rgba(180,120,60,0.06)", border: "1px solid rgba(180,120,60,0.12)" }}
                >
                  <div className="rounded-full p-2" style={{ background: "rgba(180,120,60,0.1)" }}>
                    <feature.icon className="h-4 w-4" style={{ color: "#b47838" }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="font-semibold text-white hover:opacity-90"
                style={{ background: "#b47838" }}
                onClick={() => document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" })}
              >
                View Menu
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="hover:bg-orange-50/50"
                style={{ borderColor: "rgba(180,120,60,0.35)", color: "#9a6830" }}
                onClick={() => setAuthOpen(true)}
              >
                Reserve a Table
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AuthGateModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        serviceName="Restaurant Experience"
      />
    </section>
  );
};
