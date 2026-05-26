import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export const FinalCTA = () => {
  return (
    <section
      className="py-24 px-6"
      style={{
        background:
          "linear-gradient(135deg, hsl(25,19%,15%) 0%, hsl(20,35%,30%) 100%)",
      }}
    >
      <div className="mx-auto max-w-4xl text-center">
        <div
          className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
          style={{ background: "rgba(255,255,255,0.1)", color: "#d4a853" }}
        >
          <Sparkles className="h-4 w-4" />
          Your wellness journey awaits
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready for Your Palm Aura Day?
        </h2>

        <p className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.8)" }}>
          Book wellness experiences for yourself and your family. One account,
          one checkout, endless relaxation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            asChild
            className="text-lg px-8 py-6 font-semibold"
            style={{ background: "#b47838", color: "#fff" }}
          >
            <Link to="/auth?mode=signup">Sign Up to Book</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6"
            style={{
              borderColor: "rgba(255,255,255,0.25)",
              color: "#fff",
              background: "transparent",
            }}
            onClick={() =>
              document
                .querySelector("#services")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Explore Services
          </Button>
        </div>
      </div>
    </section>
  );
};
