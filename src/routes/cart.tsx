import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useBookingCart } from "@/hooks/useBookingCart";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — Palm Aura" }] }),
  component: CartPage,
});

function CartPage() {
  const { user } = useAuth();
  const { items, removeFromCart, clearCart, totalPrice, finalPrice, discount } = useBookingCart();
  const [submitting, setSubmitting] = useState(false);

  const checkout = async () => {
    if (!user) { toast.error("Please sign in"); return; }
    if (items.length === 0) return;
    setSubmitting(true);
    try {
      // Combine into one booking using earliest scheduled_at and sum totals
      const sorted = [...items].sort((a, b) => {
        const da = new Date(a.date); const [ah, am] = a.time.split(":").map(Number); da.setHours(ah, am, 0, 0);
        const db = new Date(b.date); const [bh, bm] = b.time.split(":").map(Number); db.setHours(bh, bm, 0, 0);
        return da.getTime() - db.getTime();
      });
      const first = sorted[0];
      const scheduledAt = new Date(first.date);
      const [h, m] = first.time.split(":").map(Number);
      scheduledAt.setHours(h, m, 0, 0);
      const totalDuration = items.reduce((s, i) => s + i.duration, 0);
      const bookingNumber = "BK" + format(new Date(), "yyyyMMdd") + String(Math.floor(Math.random() * 10000)).padStart(4, "0");

      const { data: booking, error: bErr } = await (supabase as any).from("bookings").insert({
        booking_number: bookingNumber,
        guest_id: user.id,
        guest_name: user.user_metadata?.full_name || user.email,
        guest_email: user.email,
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: totalDuration,
        total_cents: finalPrice,
        status: "pending",
      }).select().single();
      if (bErr) throw bErr;

      const { error: iErr } = await (supabase as any).from("booking_items").insert(
        items.map((it) => ({
          booking_id: booking.id,
          service_id: it.serviceId,
          staff_id: it.staffId || null,
          price_cents: it.price,
        }))
      );
      if (iErr) throw iErr;

      toast.success(`Booking ${bookingNumber} confirmed!`);
      clearCart();
      setTimeout(() => { window.location.href = "/dashboard"; }, 600);
    } catch (e: any) {
      toast.error(e.message || "Could not create booking");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm"><Link to="/services"><ArrowLeft className="h-4 w-4 mr-1" /> Continue browsing</Link></Button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-3xl font-semibold mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Your Cart</h1>
        {items.length === 0 ? (
          <Card><CardContent className="py-12 text-center text-muted-foreground">
            Your cart is empty. <Link to="/services" className="underline">Browse services</Link>
          </CardContent></Card>
        ) : (
          <div className="space-y-4">
            {items.map((it, i) => {
              const dt = new Date(it.date); const [h, m] = it.time.split(":").map(Number); dt.setHours(h, m);
              return (
                <Card key={i}>
                  <CardContent className="py-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium">{it.serviceName}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(dt, "PPP 'at' p")} · {it.duration} min
                        {it.staffName && ` · ${it.staffName}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">R{(it.price / 100).toFixed(2)}</span>
                      <Button variant="ghost" size="icon" onClick={() => removeFromCart(i)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            <Card>
              <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>R{(totalPrice / 100).toFixed(2)}</span></div>
                {discount.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Package discount ({discount.percent}%)</span>
                    <span>− R{(discount.discountAmount / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t"><span>Total</span><span>R{(finalPrice / 100).toFixed(2)}</span></div>
                <Button onClick={checkout} disabled={submitting || !user} className="w-full mt-4 text-white hover:opacity-90" style={{ background: "#b47838" }}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {user ? "Confirm Booking" : "Sign in to checkout"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
