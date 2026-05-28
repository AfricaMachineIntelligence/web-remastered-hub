import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBookingCart } from "@/hooks/useBookingCart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Loader2, CalendarIcon, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/booking/$serviceId")({
  head: () => ({ meta: [{ title: "Book a service — Palm Aura" }] }),
  component: BookingDetailPage,
});

type Service = { id: string; name: string; category: string; duration_minutes: number; price_cents: number; description: string | null };
type Staff = { id: string; name: string; specialty: string | null };

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

function BookingDetailPage() {
  const { serviceId } = useParams({ from: "/booking/$serviceId" });
  const { user } = useAuth();
  const { addToCart } = useBookingCart();
  const [service, setService] = useState<Service | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [busySlots, setBusySlots] = useState<Set<string>>(new Set());
  const [staffId, setStaffId] = useState<string>("any");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      (supabase as any).from("services").select("*").eq("id", serviceId).single(),
      (supabase as any).from("staff").select("id, name, specialty").eq("is_active", true).order("name"),
    ]).then(([svc, st]: any) => {
      setService(svc.data);
      setStaff(st.data || []);
      setLoading(false);
    });
  }, [serviceId]);

  useEffect(() => {
    if (!date) return;
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);
    let q = (supabase as any).from("bookings").select("scheduled_at, booking_items!inner(staff_id)").gte("scheduled_at", start.toISOString()).lte("scheduled_at", end.toISOString()).neq("status", "cancelled");
    q.then(({ data }: any) => {
      const busy = new Set<string>();
      (data || []).forEach((b: any) => {
        if (staffId !== "any") {
          const matches = (b.booking_items || []).some((bi: any) => bi.staff_id === staffId);
          if (!matches) return;
        }
        const t = format(new Date(b.scheduled_at), "HH:mm");
        busy.add(t);
      });
      setBusySlots(busy);
    });
  }, [date, staffId]);

  const canAdd = useMemo(() => !!date && !!time && !!service, [date, time, service]);

  const handleAdd = () => {
    if (!user) { toast.error("Please sign in first"); return; }
    if (!canAdd || !service || !date) return;
    const picked = staff.find((s) => s.id === staffId);
    addToCart({
      serviceId: service.id,
      serviceName: service.name,
      staffId: staffId === "any" ? undefined : staffId,
      staffName: picked?.name,
      date,
      time,
      duration: service.duration_minutes,
      price: service.price_cents,
      isRestaurant: service.category === "restaurant",
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!service) return <div className="min-h-screen flex items-center justify-center">Service not found</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm"><Link to="/services"><ArrowLeft className="h-4 w-4 mr-1" /> Services</Link></Button>
          <Button asChild variant="outline" size="sm"><Link to="/cart">Cart</Link></Button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{service.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{service.duration_minutes} min · R{(service.price_cents / 100).toFixed(2)}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Staff</label>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant={staffId === "any" ? "default" : "outline"} size="sm" onClick={() => setStaffId("any")}>Any available</Button>
                {staff.map((s) => (
                  <Button key={s.id} type="button" variant={staffId === s.id ? "default" : "outline"} size="sm" onClick={() => setStaffId(s.id)}>
                    {s.name}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-[260px] justify-start text-left", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={date} onSelect={(d) => { setDate(d); setTime(""); }} disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            {date && (
              <div>
                <label className="text-sm font-medium mb-2 block">Time</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {TIME_SLOTS.map((t) => {
                    const busy = busySlots.has(t);
                    return (
                      <Button key={t} type="button" variant={time === t ? "default" : "outline"} size="sm" disabled={busy} onClick={() => setTime(t)}>
                        {t}{busy && " ✕"}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
            <Button onClick={handleAdd} disabled={!canAdd} className="w-full text-white hover:opacity-90" style={{ background: "#b47838" }}>
              Add to cart
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
