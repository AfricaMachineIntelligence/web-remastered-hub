import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Calendar, ShoppingBag, Ticket, Sparkles, Clock, TrendingUp } from "lucide-react";
import { format, isFuture, isPast } from "date-fns";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Palm Aura" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading, signOut, roles } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user && typeof window !== "undefined") {
      window.location.href = "/auth";
    }
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [b, o, v] = await Promise.all([
        (supabase as any)
          .from("bookings")
          .select("*, booking_items(*, services(name, category))")
          .eq("guest_id", user.id)
          .order("scheduled_at", { ascending: false })
          .limit(50),
        (supabase as any)
          .from("orders")
          .select("*, order_items(*, products(name))")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
        (supabase as any)
          .from("vouchers")
          .select("*")
          .or(`purchaser_id.eq.${user.id},recipient_email.eq.${user.email}`)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      setBookings(b.data || []);
      setOrders(o.data || []);
      setVouchers(v.data || []);
      setDataLoading(false);
    })();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const upcoming = bookings.filter((b) => isFuture(new Date(b.scheduled_at)) && !["cancelled", "no_show"].includes(b.status));
  const past = bookings.filter((b) => isPast(new Date(b.scheduled_at)) || ["completed", "cancelled", "no_show"].includes(b.status));
  const totalSpent = bookings.reduce((s, b) => s + (b.total_cents || 0), 0) + orders.reduce((s, o) => s + (o.total_cents || 0), 0);
  const activeVouchers = vouchers.filter((v) => v.status === "active");
  const voucherBalance = activeVouchers.reduce((s, v) => s + (v.balance_cents || 0), 0);
  const isStaff = roles.some((r) => ["admin", "manager", "owner", "frontdesk", "provider"].includes(r));

  const kpis = [
    { label: "Upcoming bookings", value: upcoming.length, icon: Calendar },
    { label: "Total visits", value: past.filter((b) => b.status === "completed").length, icon: Sparkles },
    { label: "Voucher balance", value: `R${(voucherBalance / 100).toFixed(2)}`, icon: Ticket },
    { label: "Lifetime spend", value: `R${(totalSpent / 100).toFixed(2)}`, icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{user.email} · {roles.join(", ") || "guest"}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button asChild><Link to="/book">Book a service</Link></Button>
            {isStaff && <Button asChild variant="outline"><Link to="/admin">Admin console</Link></Button>}
            <Button asChild variant="outline"><Link to="/">Home</Link></Button>
            <Button variant="ghost" onClick={signOut}>Sign out</Button>
          </div>
        </div>

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

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-6">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {dataLoading ? <LoadingBlock /> : upcoming.length === 0 ? (
              <EmptyState
                icon={Calendar}
                title="No upcoming bookings"
                description="Reserve your next visit and we'll save your favourite slot."
                cta={<Button asChild><Link to="/book">Book now</Link></Button>}
              />
            ) : (
              <div className="space-y-3">{upcoming.map((b) => <BookingRow key={b.id} booking={b} />)}</div>
            )}
          </TabsContent>

          <TabsContent value="history">
            {dataLoading ? <LoadingBlock /> : past.length === 0 ? (
              <EmptyState icon={Clock} title="No past bookings yet" description="Your completed visits will show up here." />
            ) : (
              <div className="space-y-3">{past.map((b) => <BookingRow key={b.id} booking={b} />)}</div>
            )}
          </TabsContent>

          <TabsContent value="orders">
            {dataLoading ? <LoadingBlock /> : orders.length === 0 ? (
              <EmptyState icon={ShoppingBag} title="No orders yet" description="Retail and gift purchases will appear here." />
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <Card key={o.id}>
                    <CardContent className="py-4 flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{o.order_number}</span>
                          <Badge variant="secondary" className="capitalize">{o.status}</Badge>
                        </div>
                        <div className="text-sm mt-1">{(o.order_items || []).map((i: any) => `${i.products?.name} ×${i.quantity}`).join(", ") || "—"}</div>
                        <div className="text-xs text-muted-foreground mt-1">{format(new Date(o.created_at), "PPp")}</div>
                      </div>
                      <div className="text-lg font-semibold">R{(o.total_cents / 100).toFixed(2)}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="vouchers">
            {dataLoading ? <LoadingBlock /> : vouchers.length === 0 ? (
              <EmptyState icon={Ticket} title="No vouchers" description="Buy or redeem a gift voucher to see it here." />
            ) : (
              <div className="space-y-2">
                {vouchers.map((v) => (
                  <Card key={v.id}>
                    <CardContent className="py-3 flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{v.code}</span>
                          <Badge variant="secondary" className="capitalize">{v.status}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Expires {format(new Date(v.valid_until), "PP")}
                          {v.recipient_email && ` · ${v.recipient_email}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">R{(v.balance_cents / 100).toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">of R{(v.value_cents / 100).toFixed(2)}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BookingRow({ booking }: { booking: any }) {
  const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    confirmed: "default",
    pending: "secondary",
    completed: "outline",
    cancelled: "destructive",
    no_show: "destructive",
    in_progress: "default",
  };
  const services = (booking.booking_items || []).map((bi: any) => bi.services?.name).filter(Boolean);
  return (
    <Card>
      <CardContent className="py-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">{booking.booking_number}</span>
            <Badge variant={statusVariant[booking.status] || "secondary"} className="capitalize">
              {booking.status?.replace("_", " ")}
            </Badge>
          </div>
          <div className="font-medium mt-1">{services.join(" · ") || "Booking"}</div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(booking.scheduled_at), "EEE, PPP 'at' p")} · {booking.duration_minutes} min
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold">R{(booking.total_cents / 100).toFixed(2)}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon: Icon, title, description, cta }: { icon: any; title: string; description: string; cta?: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="py-12 flex flex-col items-center text-center gap-3">
        <Icon className="h-10 w-10 text-muted-foreground/40" />
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        {cta}
      </CardContent>
    </Card>
  );
}

function LoadingBlock() {
  return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
}
