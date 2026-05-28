import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Clock } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Palm Aura" },
      { name: "description", content: "Browse spa, salon, barber, kids and dining services at Palm Aura." },
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

const CATEGORIES = ["all", "spa", "barber", "kids_salon", "restaurant"];

function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("all");

  useEffect(() => {
    (supabase as any).from("services").select("*").eq("is_active", true).order("name").then(({ data }: any) => {
      setServices(data || []);
      setLoading(false);
    });
  }, []);

  const filtered = cat === "all" ? services : services.filter((s) => s.category === cat);

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
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-4xl font-semibold mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Our Services</h1>
        <p className="text-muted-foreground mb-6">Pick a service, choose a time, add to your cart.</p>
        <Tabs value={cat} onValueChange={setCat} className="mb-6">
          <TabsList>
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c} value={c} className="capitalize">{c.replace("_", " ")}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <Card key={s.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{s.name}</CardTitle>
                    <Badge variant="secondary" className="capitalize">{s.category.replace("_", " ")}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {s.description && <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>}
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-4 w-4" /> {s.duration_minutes} min</span>
                    <span className="font-semibold">R{(s.price_cents / 100).toFixed(2)}</span>
                  </div>
                  <Button asChild className="w-full text-white hover:opacity-90" style={{ background: "#b47838" }}>
                    <Link to={`/booking/${s.id}`}>Book Now</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
