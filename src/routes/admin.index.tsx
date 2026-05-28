import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ShoppingBag, Users, TrendingUp, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Overview" }] }),
  component: AdminOverview,
});

function AdminOverview() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const today = new Date(); today.setHours(0,0,0,0);
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const [bookingsToday, bookingsMonth, orders, topServices] = await Promise.all([
        (supabase as any).from("bookings").select("id, total_cents", { count: "exact" }).gte("scheduled_at", today.toISOString()).lt("scheduled_at", tomorrow.toISOString()),
        (supabase as any).from("bookings").select("total_cents").gte("created_at", monthStart.toISOString()),
        (supabase as any).from("orders").select("total_cents").gte("created_at", monthStart.toISOString()),
        (supabase as any).from("booking_items").select("service_id, services(name)").limit(500),
      ]);

      const revenue = (bookingsMonth.data || []).reduce((s: number, b: any) => s + (b.total_cents || 0), 0)
        + (orders.data || []).reduce((s: number, o: any) => s + (o.total_cents || 0), 0);

      const svcCounts: Record<string, { name: string; count: number }> = {};
      (topServices.data || []).forEach((bi: any) => {
        if (!bi.services?.name) return;
        svcCounts[bi.service_id] = svcCounts[bi.service_id] || { name: bi.services.name, count: 0 };
        svcCounts[bi.service_id].count++;
      });
      const top = Object.values(svcCounts).sort((a, b) => b.count - a.count).slice(0, 5);

      setStats({
        todayCount: bookingsToday.count || 0,
        monthBookings: (bookingsMonth.data || []).length,
        monthOrders: (orders.data || []).length,
        revenueCents: revenue,
        top,
      });
    })();
  }, []);

  if (!stats) return <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const kpis = [
    { label: "Today's bookings", value: stats.todayCount, icon: Calendar },
    { label: "Bookings this month", value: stats.monthBookings, icon: Users },
    { label: "Orders this month", value: stats.monthOrders, icon: ShoppingBag },
    { label: "Revenue this month", value: `R${(stats.revenueCents / 100).toFixed(2)}`, icon: TrendingUp },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <h1 className="text-3xl font-semibold mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                    <p className="text-2xl font-semibold mt-1">{k.value}</p>
                  </div>
                  <Icon className="h-8 w-8 text-muted-foreground/40" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card>
        <CardHeader><CardTitle>Top services</CardTitle></CardHeader>
        <CardContent>
          {stats.top.length === 0 ? (
            <p className="text-sm text-muted-foreground">No booking data yet.</p>
          ) : (
            <ul className="space-y-2">
              {stats.top.map((s: any, i: number) => (
                <li key={i} className="flex justify-between text-sm border-b last:border-0 py-2">
                  <span>{s.name}</span>
                  <span className="font-medium">{s.count} bookings</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
