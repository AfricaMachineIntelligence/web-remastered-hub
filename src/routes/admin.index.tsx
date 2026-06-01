import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ShoppingBag, Users, TrendingUp, Loader2, AlertTriangle, Clock, Package } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Overview" }] }),
  component: AdminOverview,
});

function AdminOverview() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const now = new Date();
      const today = new Date(); today.setHours(0,0,0,0);
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
      const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate()-7);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      const [bookingsToday, bookingsMonth, bookingsWeek, pendingBookings, upcomingBookings, recentBookings, orders, topServices, lowStock, customerCount] = await Promise.all([
        (supabase as any).from("bookings").select("id, total_cents", { count: "exact" }).gte("scheduled_at", today.toISOString()).lt("scheduled_at", tomorrow.toISOString()),
        (supabase as any).from("bookings").select("total_cents").gte("created_at", monthStart.toISOString()),
        (supabase as any).from("bookings").select("total_cents").gte("created_at", weekAgo.toISOString()),
        (supabase as any).from("bookings").select("id", { count: "exact", head: true }).eq("status", "pending"),
        (supabase as any).from("bookings").select("*, booking_items(services(name))").gte("scheduled_at", now.toISOString()).in("status", ["pending", "confirmed"]).order("scheduled_at", { ascending: true }).limit(6),
        (supabase as any).from("bookings").select("*, booking_items(services(name))").order("created_at", { ascending: false }).limit(6),
        (supabase as any).from("orders").select("total_cents").gte("created_at", monthStart.toISOString()),
        (supabase as any).from("booking_items").select("service_id, services(name)").limit(500),
        (supabase as any).from("products").select("id, name, stock_quantity").eq("is_active", true).lte("stock_quantity", 5).order("stock_quantity", { ascending: true }).limit(6),
        (supabase as any).from("profiles").select("id", { count: "exact", head: true }),
      ]);

      const revenueMonth = (bookingsMonth.data || []).reduce((s: number, b: any) => s + (b.total_cents || 0), 0)
        + (orders.data || []).reduce((s: number, o: any) => s + (o.total_cents || 0), 0);
      const revenueWeek = (bookingsWeek.data || []).reduce((s: number, b: any) => s + (b.total_cents || 0), 0);

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
        pendingCount: pendingBookings.count || 0,
        customerCount: customerCount.count || 0,
        revenueMonthCents: revenueMonth,
        revenueWeekCents: revenueWeek,
        upcoming: upcomingBookings.data || [],
        recent: recentBookings.data || [],
        lowStock: lowStock.data || [],
        top,
      });
    })();
  }, []);

  if (!stats) return <div className="p-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  const kpis = [
    { label: "Today's bookings", value: stats.todayCount, icon: Calendar, accent: "text-blue-600" },
    { label: "Pending approvals", value: stats.pendingCount, icon: Clock, accent: "text-amber-600" },
    { label: "Revenue (7d)", value: `R${(stats.revenueWeekCents / 100).toFixed(0)}`, icon: TrendingUp, accent: "text-emerald-600" },
    { label: "Revenue (month)", value: `R${(stats.revenueMonthCents / 100).toFixed(0)}`, icon: ShoppingBag, accent: "text-emerald-600" },
    { label: "Customers", value: stats.customerCount, icon: Users, accent: "text-violet-600" },
    { label: "Bookings (month)", value: stats.monthBookings, icon: Calendar, accent: "text-blue-600" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h1 className="text-3xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Overview</h1>
        <Button asChild variant="outline" size="sm"><Link to="/admin/bookings">All bookings</Link></Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-8">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label}>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{k.label}</p>
                    <p className="text-xl font-semibold mt-1 tabular-nums">{k.value}</p>
                  </div>
                  <Icon className={`h-6 w-6 ${k.accent} opacity-50`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center justify-between">Upcoming bookings <Link to="/admin/bookings" className="text-xs font-normal text-muted-foreground hover:text-foreground">View all →</Link></CardTitle></CardHeader>
          <CardContent>
            {stats.upcoming.length === 0 ? <p className="text-sm text-muted-foreground py-4">Nothing scheduled.</p> : (
              <ul className="space-y-2">
                {stats.upcoming.map((b: any) => (
                  <li key={b.id} className="flex justify-between items-start text-sm border-b last:border-0 py-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2"><span className="font-medium truncate">{b.guest_name}</span><Badge variant="secondary" className="capitalize text-[10px]">{b.status?.replace("_", " ")}</Badge></div>
                      <div className="text-xs text-muted-foreground">{format(new Date(b.scheduled_at), "EEE PP 'at' p")} · {(b.booking_items || []).map((bi: any) => bi.services?.name).filter(Boolean).join(", ")}</div>
                    </div>
                    <div className="font-medium tabular-nums text-sm">R{(b.total_cents / 100).toFixed(0)}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-lg">Recent activity</CardTitle></CardHeader>
          <CardContent>
            {stats.recent.length === 0 ? <p className="text-sm text-muted-foreground py-4">No bookings yet.</p> : (
              <ul className="space-y-2">
                {stats.recent.map((b: any) => (
                  <li key={b.id} className="flex justify-between items-start text-sm border-b last:border-0 py-2">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{b.guest_name}</div>
                      <div className="text-xs text-muted-foreground">Created {format(new Date(b.created_at), "PP p")}</div>
                    </div>
                    <Badge variant="outline" className="capitalize text-[10px]">{b.status?.replace("_", " ")}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-lg">Top services</CardTitle></CardHeader>
          <CardContent>
            {stats.top.length === 0 ? <p className="text-sm text-muted-foreground">No booking data yet.</p> : (
              <ul className="space-y-2">
                {stats.top.map((s: any, i: number) => (
                  <li key={i} className="flex justify-between text-sm border-b last:border-0 py-2">
                    <span>{s.name}</span>
                    <span className="font-medium tabular-nums">{s.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" />Low stock</CardTitle></CardHeader>
          <CardContent>
            {stats.lowStock.length === 0 ? <p className="text-sm text-muted-foreground py-4 flex items-center gap-2"><Package className="h-4 w-4" />All products well-stocked.</p> : (
              <ul className="space-y-2">
                {stats.lowStock.map((p: any) => (
                  <li key={p.id} className="flex justify-between text-sm border-b last:border-0 py-2">
                    <span>{p.name}</span>
                    <Badge variant={p.stock_quantity === 0 ? "destructive" : "outline"}>{p.stock_quantity} left</Badge>
                  </li>
                ))}
              </ul>
            )}
            <Button asChild variant="link" size="sm" className="px-0 mt-2"><Link to="/admin/products">Manage products →</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
