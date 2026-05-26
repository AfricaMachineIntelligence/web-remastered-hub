import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthGateModal } from "./AuthGateModal";
import barber1 from "@/assets/barber-1.jpg";
import barber2 from "@/assets/barber-2.jpg";
import barber3 from "@/assets/barber-3.jpg";
import { Scissors, Zap, Crown, Paintbrush } from "lucide-react";

const barberImages = [
  { src: barber1, alt: "Professional barbershop haircut in progress" },
  { src: barber2, alt: "Clean fade haircut result" },
  { src: barber3, alt: "Barber at work with precision tools" },
];

const barberFeatures = [
  { icon: Scissors, text: "Precision haircuts & fades" },
  { icon: Crown, text: "Beard grooming & shaping" },
  { icon: Paintbrush, text: "Colour, bleach & dye" },
  { icon: Zap, text: "Kids cuts under 7 yrs" },
];

export const BarberHighlight = () => {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <section
      id="barber"
      className="py-24 px-6 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #f5ede3 0%, #faf5ef 40%, #f5ede3 70%, #fef9f3 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Image Gallery */}
          <div className="order-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="row-span-2 relative overflow-hidden rounded-3xl shadow-lg transition-transform hover:scale-105">
                <img
                  src={barberImages[0].src}
                  alt={barberImages[0].alt}
                  className="w-full h-full min-h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent" />
              </div>
              {barberImages.slice(1).map((img, idx) => (
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
          <div className="order-2">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium mb-6"
              style={{ background: "rgba(180,120,60,0.1)", color: "#9a6830" }}
            >
              <Scissors className="h-4 w-4" />
              OMGCUTZ Barbershop
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Fresh Cuts,
              <span className="block" style={{ color: "#b47838" }}>
                Sharp Style
              </span>
            </h2>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Step into OMGCUTZ for precision cuts, clean fades, and expert
              beard grooming. From classic chiskops to bold colour
              transformations — look your sharpest every time.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {barberFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{
                    background: "rgba(180,120,60,0.06)",
                    border: "1px solid rgba(180,120,60,0.12)",
                  }}
                >
                  <div
                    className="rounded-full p-2"
                    style={{ background: "rgba(180,120,60,0.1)" }}
                  >
                    <feature.icon
                      className="h-4 w-4"
                      style={{ color: "#b47838" }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="font-semibold text-white hover:opacity-90"
                style={{ background: "#b47838" }}
                onClick={() =>
                  document
                    .querySelector("#pricing")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                View Barber Prices
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="hover:bg-orange-50/50"
                style={{
                  borderColor: "rgba(180,120,60,0.35)",
                  color: "#9a6830",
                }}
                onClick={() => setAuthOpen(true)}
              >
                Sign Up to Book
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AuthGateModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        serviceName="Barbershop Experience"
      />
    </section>
  );
};
