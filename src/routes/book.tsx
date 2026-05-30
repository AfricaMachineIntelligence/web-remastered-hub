import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Loader2, CalendarIcon, ArrowLeft, ArrowRight, Check, Clock, Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBookingCart } from "@/hooks/useBookingCart";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export const Route = createFileRoute("/book")({
  head: () => ({
    meta: [
      { title: "Book your visit — Palm Aura" },
      { name: "description", content: "Pick a date, choose services, assign staff, and confirm in one place." },
    ],
  }),
  component: BookWizard,
});

type Service = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
};
type Staff = { id: string; name: string; specialty: string | null };
type FamilyMember = { id: string; full_name: string; relationship: string | null };

type DraftItem = {
  uid: string;
  service: Service;
  time: string;
  staffId: string; // "any" or id
  familyMemberId: string; // "self" or id
};

const TIME_SLOTS = ["09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00"];
const CATEGORIES = ["all", "spa", "barber", "kids_salon", "restaurant"];
const STEPS = ["Date", "Services", "Staff & Time", "Confirm"] as const;

function BookWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToCart, clearCart } = useBookingCart();

  const [step, setStep] = useState(0);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [busy, setBusy] = useState<Record<string, Set<string>>>({}); // staffId -> busy times; "any" = union
  const [cat, setCat] = useState("all");
  const [draft, setDraft] = useState<DraftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Initial load
  useEffect(() => {
    Promise.all([
      (supabase as any).from("services").select("*").eq("is_active", true).order("category").order("name"),
      (supabase as any).from("staff").select("id, name, specialty").eq("is_active", true).order("name"),
      user ? (supabase as any).from("family_members").select("id, full_name, relationship").eq("primary_account_id", user.id).order("full_name") : Promise.resolve({ data: [] }),
    ]).then(([svc, st, fm]: any) => {
      setServices(svc.data || []);
      setStaff(st.data || []);
      setFamily(fm.data || []);
      setLoading(false);
    });
  }, [user]);

  // Load busy slots when date changes
  useEffect(() => {
    if (!date) return;
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end = new Date(date); end.setHours(23, 59, 59, 999);
    (supabase as any)
      .from("bookings")
      .select("scheduled_at, booking_items(staff_id)")
      .gte("scheduled_at", start.toISOString())
      .lte("scheduled_at", end.toISOString())
      .neq("status", "cancelled")
      .then(({ data }: any) => {
        const map: Record<string, Set<string>> = { any: new Set() };
        (data || []).forEach((b: any) => {
          const t = format(new Date(b.scheduled_at), "HH:mm");
          (b.booking_items || []).forEach((bi: any) => {
            if (!bi.staff_id) return;
            if (!map[bi.staff_id]) map[bi.staff_id] = new Set();
            map[bi.staff_id].add(t);
          });
        });
        setBusy(map);
      });
  }, [date]);

  const filteredServices = useMemo(
    () => (cat === "all" ? services : services.filter((s) => s.category === cat)),
    [services, cat]
  );

  const subtotal = draft.reduce((s, d) => s + d.service.price_cents, 0);
  const eligibleCount = draft.filter((d) => d.service.category !== "restaurant").length;
  const discountPercent = eligibleCount >= 4 ? 20 : eligibleCount >= 3 ? 15 : eligibleCount >= 2 ? 10 : 0;
  const eligibleSubtotal = draft.filter((d) => d.service.category !== "restaurant").reduce((s, d) => s + d.service.price_cents, 0);
  const discountAmount = Math.round((eligibleSubtotal * discountPercent) / 100);
  const total = subtotal - discountAmount;

  const addService = (s: Service) => {
    setDraft((prev) => [...prev, { uid: crypto.randomUUID(), service: s, time: "", staffId: "any", familyMemberId: "self" }]);
    toast.success(`${s.name} added`);
  };
  const removeDraft = (uid: string) => setDraft((prev) => prev.filter((d) => d.uid !== uid));
  const updateDraft = (uid: string, patch: Partial<DraftItem>) =>
    setDraft((prev) => prev.map((d) => (d.uid === uid ? { ...d, ...patch } : d)));

  const slotBusyFor = (staffId: string, t: string) => {
    if (staffId === "any") {
      // Busy only if ALL staff busy at that time (rare). Approximate: busy if every active staff has it busy.
      return staff.every((s) => busy[s.id]?.has(t));
    }
    return busy[staffId]?.has(t) ?? false;
  };

  const canNext = useMemo(() => {
    if (step === 0) return !!date;
    if (step === 1) return draft.length > 0;
    if (step === 2) return draft.every((d) => d.time && d.staffId);
    return true;
  }, [step, date, draft]);

  const confirm = async () => {
    if (!user) { toast.error("Please sign in first"); navigate({ to: "/auth" as any }); return; }
    if (!date || draft.length === 0) return;
    setSubmitting(true);
    try {
      const sorted = [...draft].sort((a, b) => a.time.localeCompare(b.time));
      const first = sorted[0];
      const scheduledAt = new Date(date);
      const [h, m] = first.time.split(":").map(Number);
      scheduledAt.setHours(h, m, 0, 0);
      const totalDuration = draft.reduce((s, d) => s + d.service.duration_minutes, 0);
      const bookingNumber = "BK" + format(new Date(), "yyyyMMdd") + String(Math.floor(Math.random() * 10000)).padStart(4, "0");

      // Group by family member (one booking per recipient)
      const groups = new Map<string, DraftItem[]>();
      draft.forEach((d) => {
        const k = d.familyMemberId;
        if (!groups.has(k)) groups.set(k, []);
        groups.get(k)!.push(d);
      });

      let createdMain: any = null;
      for (const [fmId, items] of groups.entries()) {
        const groupSorted = [...items].sort((a, b) => a.time.localeCompare(b.time));
        const firstItem = groupSorted[0];
        const sched = new Date(date);
        const [hh, mm] = firstItem.time.split(":").map(Number);
        sched.setHours(hh, mm, 0, 0);
        const dur = items.reduce((s, d) => s + d.service.duration_minutes, 0);
        const groupSubtotal = items.reduce((s, d) => s + d.service.price_cents, 0);
        // proportional discount share
        const eligSub = items.filter((d) => d.service.category !== "restaurant").reduce((s, d) => s + d.service.price_cents, 0);
        const groupDiscount = Math.round((eligSub * discountPercent) / 100);

        const groupBookingNumber = "BK" + format(new Date(), "yyyyMMdd") + String(Math.floor(Math.random() * 10000)).padStart(4, "0");
        const { data: booking, error: bErr } = await (supabase as any).from("bookings").insert({
          booking_number: groupBookingNumber,
          guest_id: user.id,
          guest_name: user.user_metadata?.full_name || user.email,
          guest_email: user.email,
          scheduled_at: sched.toISOString(),
          duration_minutes: dur,
          total_cents: groupSubtotal - groupDiscount,
          status: "pending",
          family_member_id: fmId === "self" ? null : fmId,
        }).select().single();
        if (bErr) throw bErr;
        if (!createdMain) createdMain = booking;

        const { error: iErr } = await (supabase as any).from("booking_items").insert(
          items.map((it) => ({
            booking_id: booking.id,
            service_id: it.service.id,
            staff_id: it.staffId === "any" ? null : it.staffId,
            price_cents: it.service.price_cents,
          }))
        );
        if (iErr) throw iErr;
      }

      toast.success(`Booking ${createdMain?.booking_number || bookingNumber} confirmed!`);
      clearCart();
      setTimeout(() => navigate({ to: "/dashboard" as any }), 700);
    } catch (e: any) {
      toast.error(e.message || "Could not create booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 z-20 bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm"><Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> Home</Link></Button>
          <h1 className="text-xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Book your visit</h1>
          <div className="w-20" />
        </div>
        {/* Stepper */}
        <div className="mx-auto max-w-5xl px-4 pb-4">
          <ol className="flex items-center gap-2 sm:gap-4">
            {STEPS.map((label, i) => {
              const active = i === step;
              const done = i < step;
              return (
                <li key={label} className="flex items-center gap-2 flex-1">
                  <div className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
                    done ? "bg-primary text-primary-foreground" : active ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                  )}>
                    {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <span className={cn("text-xs sm:text-sm font-medium hidden sm:inline", active ? "text-foreground" : "text-muted-foreground")}>{label}</span>
                  {i < STEPS.length - 1 && <div className={cn("h-px flex-1", done ? "bg-primary" : "bg-border")} />}
                </li>
              );
            })}
          </ol>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* STEP 0: DATE */}
          {step === 0 && (
            <Card>
              <CardHeader><CardTitle>When would you like to come in?</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => setDate(d)}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className="p-3 pointer-events-auto rounded-md border"
                  />
                  {date && (
                    <p className="mt-4 text-sm text-muted-foreground">Selected: <span className="font-medium text-foreground">{format(date, "EEEE, PPP")}</span></p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 1: SERVICES */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Choose your services</CardTitle>
                <p className="text-sm text-muted-foreground">Add 2+ services for an automatic package discount.</p>
              </CardHeader>
              <CardContent>
                <Tabs value={cat} onValueChange={setCat} className="mb-4">
                  <TabsList className="flex-wrap h-auto">
                    {CATEGORIES.map((c) => (
                      <TabsTrigger key={c} value={c} className="capitalize">{c.replace("_", " ")}</TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredServices.map((s) => (
                    <div key={s.id} className="border rounded-lg p-4 flex flex-col gap-2 hover:border-foreground/30 transition">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium leading-tight">{s.name}</h3>
                        <Badge variant="secondary" className="capitalize shrink-0">{s.category.replace("_", " ")}</Badge>
                      </div>
                      {s.description && <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>}
                      <div className="flex items-center justify-between mt-auto pt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {s.duration_minutes} min · R{(s.price_cents / 100).toFixed(0)}</span>
                        <Button size="sm" variant="outline" onClick={() => addService(s)}><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 2: STAFF & TIME */}
          {step === 2 && (
            <div className="space-y-4">
              {draft.map((d) => (
                <Card key={d.uid}>
                  <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
                    <div>
                      <CardTitle className="text-base">{d.service.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{d.service.duration_minutes} min · R{(d.service.price_cents / 100).toFixed(2)}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeDraft(d.uid)}><Trash2 className="h-4 w-4" /></Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label className="text-xs">Staff</Label>
                        <Select value={d.staffId} onValueChange={(v) => updateDraft(d.uid, { staffId: v, time: "" })}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any available</SelectItem>
                            {staff.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}{s.specialty ? ` · ${s.specialty}` : ""}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs flex items-center gap-1"><Users className="h-3 w-3" /> For</Label>
                        <Select value={d.familyMemberId} onValueChange={(v) => updateDraft(d.uid, { familyMemberId: v })}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="self">Myself</SelectItem>
                            {family.map((f) => (<SelectItem key={f.id} value={f.id}>{f.full_name}{f.relationship ? ` (${f.relationship})` : ""}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs mb-2 block">Time</Label>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {TIME_SLOTS.map((t) => {
                          const isBusy = slotBusyFor(d.staffId, t);
                          return (
                            <Button key={t} type="button" size="sm" variant={d.time === t ? "default" : "outline"} disabled={isBusy} onClick={() => updateDraft(d.uid, { time: t })}>
                              {t}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {family.length === 0 && (
                <p className="text-xs text-muted-foreground text-center">Tip: add family members from your account to book on their behalf.</p>
              )}
            </div>
          )}

          {/* STEP 3: CONFIRM */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Review & confirm</CardTitle>
                <p className="text-sm text-muted-foreground">{date && format(date, "EEEE, PPP")}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {draft.sort((a, b) => a.time.localeCompare(b.time)).map((d) => {
                  const fm = family.find((f) => f.id === d.familyMemberId);
                  const st = staff.find((s) => s.id === d.staffId);
                  return (
                    <div key={d.uid} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <div className="font-medium">{d.service.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {d.time} · {d.service.duration_minutes} min · {st?.name || "Any staff"} · For {fm?.full_name || "myself"}
                        </div>
                      </div>
                      <span className="font-semibold">R{(d.service.price_cents / 100).toFixed(2)}</span>
                    </div>
                  );
                })}
                {!user && (
                  <div className="rounded-md border border-dashed p-4 text-sm text-center">
                    <Link to="/auth" className="underline font-medium">Sign in</Link> to confirm your booking.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Nav buttons */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext} className="text-white" style={{ background: "#b47838" }}>
                Continue <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={confirm} disabled={submitting || !user} className="text-white" style={{ background: "#b47838" }}>
                {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Confirm booking
              </Button>
            )}
          </div>
        </div>

        {/* Sticky summary */}
        <aside className="lg:sticky lg:top-32 h-fit">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </div>
              <Separator />
              {draft.length === 0 ? (
                <p className="text-muted-foreground text-xs">No services yet.</p>
              ) : (
                <ul className="space-y-2">
                  {draft.map((d) => (
                    <li key={d.uid} className="flex justify-between gap-2">
                      <span className="truncate">{d.service.name}{d.time ? ` · ${d.time}` : ""}</span>
                      <span className="shrink-0">R{(d.service.price_cents / 100).toFixed(0)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Separator />
              <div className="flex justify-between"><span>Subtotal</span><span>R{(subtotal / 100).toFixed(2)}</span></div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600"><span>Package −{discountPercent}%</span><span>−R{(discountAmount / 100).toFixed(2)}</span></div>
              )}
              {discountPercent < 20 && eligibleCount >= 1 && (
                <p className="text-xs text-muted-foreground">
                  Add {eligibleCount < 2 ? 2 - eligibleCount : eligibleCount < 3 ? 1 : 1} more service{eligibleCount < 2 ? "s" : ""} for {eligibleCount < 2 ? "10" : eligibleCount < 3 ? "15" : "20"}% off
                </p>
              )}
              <div className="flex justify-between font-semibold text-base pt-1"><span>Total</span><span>R{(total / 100).toFixed(2)}</span></div>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}
