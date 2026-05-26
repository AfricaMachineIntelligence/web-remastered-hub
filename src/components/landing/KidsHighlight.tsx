import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthGateModal } from "./AuthGateModal";
import kidsHydro1 from "@/assets/kids-hydro-1.jpg";
import kidsHydro2 from "@/assets/kids-hydro-2.jpg";
import kidsSpa1 from "@/assets/kids-spa-1.jpg";
import kidsSpa2 from "@/assets/kids-spa-2.jpg";
import { Sparkles, Heart, Star, Droplets } from "lucide-react";

const kidsImages = [
  { src: kidsHydro1, alt: "Baby enjoying hydrotherapy float" },
  { src: kidsHydro2, alt: "Kid birthday celebration at spa" },
  { src: kidsSpa1, alt: "Baby massage treatment" },
  { src: kidsSpa2, alt: "Sisters enjoying spa day" },
];

const kidsFeatures = [
  { icon: Sparkles, text: "Mini manicures & pedicures" },
  { icon: Heart, text: "Gentle facials" },
  { icon: Star, text: "Pamper party experiences" },
  { icon: Droplets, text: "Baby hydrotherapy sessions" },
];

export const KidsHighlight = () => {
  const [authOpen, setAuthOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Pink accent colors only appear on interaction
  const accentColor = isActive ? "#d4609a" : "#b47838";
  const accentBg = isActive ? "rgba(212,96,154,0.1)" : "rgba(180,120,60,0.1)";
  const accentBgLight = isActive ? "rgba(212,96,154,0.06)" : "rgba(180,120,60,0.06)";
  const accentBorder = isActive ? "rgba(212,96,154,0.12)" : "rgba(180,120,60,0.12)";
  const accentText = isActive ? "#c04d87" : "#9a6830";
  const overlayColor = isActive
    ? "bg-gradient-to-t from-pink-900/20 to-transparent"
    : "bg-gradient-to-t from-amber-900/20 to-transparent";

  return (
    <section
      id="kids"
      className="py-24 px-6 overflow-hidden transition-colors duration-500"
      style={{
        background: isActive
          ? "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 40%, #fdf2f8 70%, #fff1f8 100%)"
          : "linear-gradient(135deg, #faf5ef 0%, #f5ede3 40%, #faf0e6 70%, #fef9f3 100%)",
      }}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onClick={() => setIsActive(true)}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Text Content */}
          <div className="order-2 lg:order-1">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium mb-6 transition-colors duration-500"
              style={{ background: accentBg, color: accentText }}
            >
              <Star className="h-4 w-4" />
              Smoochie Kids Spa
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Kids Spa,
              <span
                className="block transition-colors duration-500"
                style={{ color: accentColor }}
              >
                but make it magical
              </span>
            </h2>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Give your little ones the royal treatment they deserve. From
              soothing hydrotherapy floats for babies to fabulous pamper parties
              for kids — create memories that sparkle.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {kidsFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-500"
                  style={{
                    background: accentBgLight,
                    border: `1px solid ${accentBorder}`,
                  }}
                >
                  <div
                    className="rounded-full p-2 transition-colors duration-500"
                    style={{ background: accentBg }}
                  >
                    <feature.icon
                      className="h-4 w-4 transition-colors duration-500"
                      style={{ color: accentColor }}
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
                className="font-semibold text-white hover:opacity-90 transition-colors duration-500"
                style={{ background: accentColor }}
                onClick={() =>
                  document
                    .querySelector("#pricing")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore Kids Spa
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="hover:bg-orange-50/50 transition-colors duration-500"
                style={{
                  borderColor: isActive
                    ? "rgba(212,96,154,0.35)"
                    : "rgba(180,120,60,0.35)",
                  color: accentText,
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
              {kidsImages.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative overflow-hidden rounded-3xl shadow-lg transition-transform hover:scale-105 ${
                    idx === 0 ? "row-span-2" : ""
                  }`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className={`w-full object-cover ${
                      idx === 0 ? "h-full min-h-[400px]" : "h-48 md:h-56"
                    }`}
                  />
                  <div className={`absolute inset-0 ${overlayColor} transition-colors duration-500`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AuthGateModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        serviceName="Kids Spa Experience"
      />
    </section>
  );
};
