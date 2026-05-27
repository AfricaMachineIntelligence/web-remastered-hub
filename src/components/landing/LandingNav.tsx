import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, ChevronDown, Eye, Scissors, Sparkles, Utensils, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { NavServiceSearch } from "./NavServiceSearch";
import { useAuth } from "@/hooks/useAuth";

const brandFilters: { label: string; value: "all" | "adult" | "kids" | "food" | "shop" }[] = [
  { label: "All", value: "all" },
  { label: "Palm Aura", value: "adult" },
  { label: "Smoochie Kids", value: "kids" },
  { label: "Food & Dining", value: "food" },
  { label: "e-Shop", value: "shop" },
];

const galleryLinks: { label: string; href: string; Icon: typeof Eye }[] = [
  { label: "Lash Bar", href: "#lashes", Icon: Eye },
  { label: "Barbershop", href: "#barber", Icon: Scissors },
  { label: "Kids Spa", href: "#kids", Icon: Sparkles },
  { label: "Restaurant", href: "#restaurant", Icon: Utensils },
];

type BrandValue = "all" | "adult" | "kids" | "food" | "shop";

export const LandingNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeBrand, setActiveBrand] = useState<BrandValue>("all");
  const navigate = useNavigate();

  const selectBrand = (value: BrandValue) => {
    setActiveBrand(value);
    if (window.location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("services:set-filter", { detail: value }));
        document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" });
      }, 60);
    } else {
      window.dispatchEvent(new CustomEvent("services:set-filter", { detail: value }));
      document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const v = (e as CustomEvent).detail as BrandValue;
      if (v) setActiveBrand(v);
    };
    window.addEventListener("services:filter-changed", handler);
    return () => window.removeEventListener("services:filter-changed", handler);
  }, []);

  const goToGallery = (hash: string) => {
    navigate(`/gallery${hash}`);
    setMobileOpen(false);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{
        background: "rgba(250,245,239,0.95)",
        borderBottom: "1px solid rgba(180,120,60,0.12)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setActiveBrand("all")}
          >
            <span className="font-brand text-4xl leading-none" style={{ color: "#b47838" }}>
              Palm Aura
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 rounded-full p-1" style={{ background: "rgba(180,120,60,0.08)" }}>
            {brandFilters.map((b) => {
              const active = activeBrand === b.value;
              return (
                <button
                  key={b.value}
                  onClick={() => selectBrand(b.value)}
                  className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                  style={{
                    background: active ? "#b47838" : "transparent",
                    color: active ? "#fff" : "#9a6830",
                  }}
                >
                  {b.label}
                </button>
              );
            })}
          </div>

          {/* Gallery dropdown */}
          <div className="hidden lg:flex">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                  style={{ color: "#9a6830" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#b47838")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#9a6830")}
                >
                  Gallery <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-52">
                {galleryLinks.map(({ label, href, Icon }) => (
                  <DropdownMenuItem
                    key={href}
                    onClick={() => goToGallery(href)}
                    className="cursor-pointer gap-2"
                  >
                    <Icon className="h-4 w-4" style={{ color: "#b47838" }} />
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search + Auth */}
          <div className="hidden lg:flex items-center gap-3">
            <NavServiceSearch />
            <Button variant="ghost" asChild>
              <Link to="/auth?mode=login">Log In</Link>
            </Button>
            <Button
              asChild
              className="font-semibold text-white hover:opacity-90"
              style={{ background: "#b47838" }}
            >
              <Link to="/auth?mode=signup">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-72 p-0 flex flex-col h-full max-h-screen"
            >
              {/* Scrollable menu area */}
              <div
                className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 pt-10 pb-4"
                style={{ WebkitOverflowScrolling: "touch", scrollbarGutter: "stable" }}
              >
                <div className="flex flex-col gap-4">
                  {brandFilters.map((b) => (
                    <button
                      key={b.value}
                      onClick={() => selectBrand(b.value)}
                      className="text-left text-lg font-medium text-foreground transition-colors py-2"
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#b47838")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                    >
                      {b.label}
                    </button>
                  ))}
                  <hr className="my-2" />
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9a6830" }}>Gallery</p>
                  {galleryLinks.map(({ label, href, Icon }) => (
                    <button
                      key={href}
                      onClick={() => goToGallery(href)}
                      className="flex items-center gap-2 text-left text-base font-medium text-foreground py-1"
                    >
                      <Icon className="h-4 w-4" style={{ color: "#b47838" }} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sticky CTA footer — always visible */}
              <div
                className="shrink-0 border-t bg-background/95 backdrop-blur px-6 py-4 flex flex-col gap-2"
                style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
              >
                <Button variant="outline" asChild>
                  <Link to="/auth?mode=login">Log In</Link>
                </Button>
                <Button
                  asChild
                  className="font-semibold text-white hover:opacity-90"
                  style={{ background: "#b47838" }}
                >
                  <Link to="/auth?mode=signup">Sign Up</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
