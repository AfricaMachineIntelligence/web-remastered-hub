import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Clock, Sparkles, Scissors, Baby, UtensilsCrossed, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Palm Aura" },
      { name: "description", content: "Browse spa, salon, barber, kids and dining services at Palm Aura. Book online in minutes." },
      { property: "og:title", content: "Services — Palm Aura" },
      { property: "og:description", content: "Spa, barber, kids salon and restaurant services with online booking." },
    ],
  }),
  component: ServicesPage,
});

type Service = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
};

const CATEGORY_META: Record<string, { label: string; blurb: string; icon: any; accent: string }> = {
  spa: {
    label: "Spa & Wellness",
    blurb: "Restorative massages, facials and body treatments delivered by certified therapists.",
    icon: Sparkles,
    accent: "#b47838",
  },
  barber: {
    label: "Barber",
    blurb: "Precision cuts, hot-towel shaves and beard grooming in a relaxed lounge setting.",
    icon: Scissors,
    accent: "#2f3e46",
  },
  kids_salon: {
    label: "Kids Salon",
    blurb: "A playful, gentle experience — first cuts, braids, nail art and party packages.",
    icon: Baby,
    accent: "#e9a3b8",
  },
  restaurant: {
    label: "Restaurant",
    blurb: "Reserve your seat for lunch, dinner or a private dining experience.",
    icon: UtensilsCrossed,
    accent: "#7a4b2a",
  },
};

const ORDER = ["spa", "barber", "kids_salon", "restaurant"];

function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<string>("all");

  useEffect(() => {
    (supabase as any)
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("name")
      .then(({ data }: any) => {
        setServices(data || []);
        setLoading(false);
      });
  }, []);

  const grouped = useMemo(() => {
    const g: Record<string, Service[]> = {};
    for (const s of services) (g[s.category] ||= []).push(s);
    return g;
  }, [services]);

  const visibleCats = cat === "all" ? ORDER.filter((c) => grouped[c]?.length) : [cat];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
          <Link to="/" className="text-2xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Palm Aura
          </Link>
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link to="/cart">Cart</Link></Button>
            <Button asChild variant="ghost"><Link to="/dashboard">Account</Link></Button>
            <Button asChild className="text-white" style={{ background: "#b47838" }}>
              <Link to="/book">Book now</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="border-b bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <h1 className="text-4xl md:text-5xl font-semibold mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Our Services
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            From restorative spa rituals to sharp barber work, kids cuts and signature dining — every service is bookable online in under a minute.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10 space-y-12">
        <Tabs value={cat} onValueChange={setCat}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {ORDER.map((c) => (
              <TabsTrigger key={c} value={c}>{CATEGORY_META[c].label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          visibleCats.map((c) => {
            const meta = CATEGORY_META[c];
            const Icon = meta.icon;
            const items = grouped[c] || [];
            if (!items.length) return null;
            return (
              <section key={c} className="scroll-mt-24" id={c}>
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white shrink-0" style={{ background: meta.accent }}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{meta.label}</h2>
                    <p className="text-muted-foreground">{meta.blurb}</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((s) => (
                    <Card key={s.id} className="flex flex-col hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg leading-snug">{s.name}</CardTitle>
                          <Badge variant="secondary" className="shrink-0 capitalize">{meta.label.split(" ")[0]}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col gap-4">
                        <p className="text-sm text-muted-foreground min-h-[40px]">
                          {s.description || "A signature Palm Aura experience tailored to you."}
                        </p>
                        <div className="flex items-center justify-between text-sm border-t pt-3">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" /> {s.duration_minutes} min
                          </span>
                          <span className="font-semibold text-base">
                            {s.price_cents === 0 ? "Free" : `R${(s.price_cents / 100).toFixed(2)}`}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-auto">
                          <Button asChild className="flex-1 text-white hover:opacity-90" style={{ background: meta.accent }}>
                            <Link to="/book">Book now <ArrowRight className="ml-1 h-4 w-4" /></Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })
        )}

        <section className="rounded-2xl border bg-muted/40 p-8 text-center">
          <h3 className="text-2xl font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Booking multiple services?
          </h3>
          <p className="text-muted-foreground mb-4 max-w-xl mx-auto">
            Bundle 2 or more services in one visit and unlock automatic package discounts (up to 20% off).
          </p>
          <Button asChild size="lg" className="text-white" style={{ background: "#b47838" }}>
            <Link to="/book">Start your booking</Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
