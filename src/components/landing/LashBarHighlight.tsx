import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthGateModal } from "./AuthGateModal";
import lash1 from "@/assets/lash-1.jpg";
import lash2 from "@/assets/lash-2.jpg";
import lash3 from "@/assets/lash-3.jpg";
import { Eye, Feather, Sparkles, Heart } from "lucide-react";

const lashImages = [
  { src: lash1, alt: "Beautiful wispy lash extensions on client" },
  { src: lash2, alt: "Gorgeous volume lash set with glam look" },
  { src: lash3, alt: "Mega volume lash extensions close-up" },
];

const lashFeatures = [
  { icon: Eye, text: "Classic to Mega Volume" },
  { icon: Feather, text: "Wispy & natural options" },
  { icon: Sparkles, text: "Professional lash techs" },
  { icon: Heart, text: "Refills from R150" },
];

export const LashBarHighlight = () => {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <section
      id="lashes"
      className="py-24 px-6 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #faf5ef 0%, #f5ede3 40%, #faf0e6 70%, #fef9f3 100%)",
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium mb-6"
              style={{ background: "rgba(180,120,60,0.1)", color: "#9a6830" }}
            >
              <Eye className="h-4 w-4" />
              Palm Aura Lash Bar
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Lashes that
              <span className="block" style={{ color: "#b47838" }}>
                speak for you
              </span>
            </h2>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              From subtle classics to show-stopping mega volume — our lash
              artists craft the perfect set for every mood, every moment. Wake up
              flawless, every single day.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {lashFeatures.map((feature, idx) => (
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
                View Lash Prices
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

          {/* Image Gallery */}
          <div className="order-1 lg:order-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="row-span-2 relative overflow-hidden rounded-3xl shadow-lg transition-transform hover:scale-105">
                <img
                  src={lashImages[0].src}
                  alt={lashImages[0].alt}
                  className="w-full h-full min-h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent" />
              </div>
              {lashImages.slice(1).map((img, idx) => (
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
        </div>
      </div>

      <AuthGateModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        serviceName="Lash Bar Experience"
      />
    </section>
  );
};
