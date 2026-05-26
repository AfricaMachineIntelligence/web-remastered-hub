import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Tag, Gift, Crown } from "lucide-react";

const tiers = [
  {
    count: "2 services",
    discount: "10% OFF",
    Icon: Tag,
  },
  {
    count: "3 services",
    discount: "15% OFF",
    Icon: Gift,
    popular: true,
  },
  {
    count: "4 services",
    discount: "20% OFF",
    Icon: Crown,
  },
];

export const FeaturedPackages = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="packages" className="py-12 md:py-16 lg:py-20 px-6 bg-white">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-6 md:mb-8">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-3 text-xs font-semibold uppercase tracking-wider"
            style={{ background: "rgba(180,120,60,0.12)", color: "#b47838" }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Build Your Own
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            Build Your Own Beauty Package
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Book multiple services in one day and enjoy exclusive savings.
          </p>
        </div>

        {/* Discount tiers */}
        <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-3 mb-6 md:mb-8">
          {tiers.map(({ count, discount, Icon, popular }, idx) => (
            <div
              key={idx}
              className="relative rounded-3xl bg-white p-5 md:p-6 flex flex-col items-center text-center transition-all hover:shadow-xl hover:-translate-y-1"
              style={{
                border: popular
                  ? "2px solid #b47838"
                  : "1.5px solid rgba(180,120,60,0.18)",
                boxShadow: popular
                  ? "0 12px 40px rgba(180,120,60,0.18)"
                  : "0 2px 12px rgba(180,120,60,0.06)",
              }}
            >
              {popular && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-semibold text-white shadow-md whitespace-nowrap"
                  style={{ background: "#b47838" }}
                >
                  Most Popular
                </div>
              )}

              {/* Icon */}
              <div
                className="mb-3 md:mb-4 inline-flex rounded-2xl p-3 text-white"
                style={{ background: "#b47838" }}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Book {count}
              </h3>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
                You save
              </p>

              {/* Discount */}
              <div
                className="text-4xl md:text-5xl font-extrabold leading-none"
                style={{ color: "#b47838" }}
              >
                {discount}
              </div>
            </div>
          ))}
        </div>

        {/* Description */}
        <div
          className="rounded-3xl p-5 md:p-6 lg:p-8 text-center"
          style={{ background: "rgba(180,120,60,0.06)" }}
        >
          <p className="text-sm md:text-base lg:text-lg text-gray-700 mb-2">
            Planning a full self-care day? Combine your favourites like{" "}
            <span className="font-semibold" style={{ color: "#b47838" }}>
              Headspa, Hair, Nails, Lashes & Barber
            </span>{" "}
            all in one visit 💆🏽‍♀️💅🏽✨
          </p>
          <p className="text-xs md:text-sm lg:text-base text-gray-600 mb-4 md:mb-5">
            Simply select your preferred services and create your own package.
          </p>
          <Button
            size="lg"
            onClick={handleStart}
            className="font-semibold text-white hover:opacity-90"
            style={{ background: "#b47838" }}
          >
            Start Building Your Package
          </Button>
        </div>
      </div>
    </section>
  );
};
