import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, Heart } from "lucide-react";

export const HeroSection = () => {
  const scrollToServices = () => {
    document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-16"
      style={{
        background:
          "linear-gradient(135deg, #faf5ef 0%, #f5ede3 40%, #faf0e6 70%, #fef9f3 100%)",
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl" style={{ background: "rgba(180,120,60,0.08)" }} />
      <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl" style={{ background: "rgba(180,120,60,0.06)" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl" style={{ background: "rgba(180,120,60,0.04)" }} />

      <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm backdrop-blur-sm"
          style={{ background: "rgba(180,120,60,0.1)", color: "#9a6830" }}
        >
          <Sparkles className="h-4 w-4" />
          Spa • Salon • Kids Spa • Restaurant
        </div>

        <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 md:text-7xl">
          Your Family's
          <span className="block" style={{ color: "#b47838" }}>
            Wellness Destination
          </span>
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 md:text-2xl">
          Indulge in premium beauty, wellness, and dining experiences for the
          whole family — all in one place.
        </p>

        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            asChild
            className="font-semibold text-white text-lg px-8 py-6 hover:opacity-90"
            style={{ background: "#b47838" }}
          >
            <Link to="/book">Book Now</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={scrollToServices}
            className="text-lg px-8 py-6 hover:bg-orange-50/50"
            style={{ borderColor: "rgba(180,120,60,0.35)", color: "#9a6830" }}
          >
            Explore Services
          </Button>
        </div>


        <p className="mt-6 text-sm text-gray-500 flex items-center justify-center gap-1">
          <Heart className="h-3 w-3" style={{ color: "#b47838" }} />
          Browse services and prices freely. Booking requires an account.
        </p>
      </div>
    </section>
  );
};
