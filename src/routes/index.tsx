import { createFileRoute } from "@tanstack/react-router";
import { LandingNav } from "@/components/landing/LandingNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { ServiceCategories } from "@/components/landing/ServiceCategories";
import { FeaturedPackages } from "@/components/landing/FeaturedPackages";
import { VoucherCTA } from "@/components/landing/VoucherCTA";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingFooter } from "@/components/landing/LandingFooter";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <LandingNav />
      <HeroSection />
      <ServiceCategories />
      <FeaturedPackages />
      <VoucherCTA />
      <HowItWorks />
      <LandingFooter />
    </div>
  );
}
