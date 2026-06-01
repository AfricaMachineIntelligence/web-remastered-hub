import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Search, Mail, Phone, User } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({ meta: [{ title: "Customers — Admin" }] }),
  component: AdminCustomers,
});

function AdminCustomers() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [bookingStats, setBookingStats] = useState<Record<string, { count: number; total: number; last: string | null }>>({});
  const [orderStats, setOrderStats] = useState<Record<string, { count: number; total: number }>>({});
  const [loyalty, setLoyalty] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [detail, setDetail] = useState<{ bookings: any[]; orders: any[]; family: any[] } | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: profs }, { data: bks }, { data: ords }, { data: loy }] = await Promise.all([
        (supabase as any).from("profiles").select("*").order("created_at", { ascending: false }).limit(500),
        (supabase as any).from("bookings").select("guest_id, total_cents, scheduled_at").limit(2000),
        (supabase as any).from("orders").select("customer_id, total_cents").limit(2000),
        (supabase as any).from("loyalty_accounts").select("*").limit(2000),
      ]);
      const bs: Record<string, { count: number; total: number; last: string | null }> = {};
      (bks || []).forEach((b: any) => {
        if (!b.guest_id) return;
        const e = bs[b.guest_id] = bs[b.guest_id] || { count: 0, total: 0, last: null };
        e.count++; e.total += b.total_cents || 0;
        if (!e.last || b.scheduled_at > e.last) e.last = b.scheduled_at;
      });
      const os: Record<string, { count: number; total: number }> = {};
      (ords || []).forEach((o: any) => {
        if (!o.customer_id) return;
        const e = os[o.customer_id] = os[o.customer_id] || { count: 0, total: 0 };
        e.count++; e.total += o.total_cents || 0;
      });
      const loyMap: Record<string, any> = {};
      (loy || []).forEach((l: any) => { loyMap[l.user_id] = l; });
      setProfiles(profs || []); setBookingStats(bs); setOrderStats(os); setLoyalty(loyMap);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return profiles;
    return profiles.filter((p) =>
      (p.full_name || "").toLowerCase().includes(term) ||
      (p.email || "").toLowerCase().includes(term) ||
      (p.phone || "").toLowerCase().includes(term),
    );
  }, [profiles, q]);

  const openDetail = async (p: any) => {
    setSelected(p); setDetail(null);
    const [{ data: bks }, { data: ords }, { data: fam }] = await Promise.all([
      (supabase as any).from("bookings").select("*, booking_items(*, services(name))").eq("guest_id", p.id).order("scheduled_at", { ascending: false }).limit(50),
      (supabase as any).from("orders").select("*, order_items(*, products(name))").eq("customer_id", p.id).order("created_at", { ascending: false }).limit(50),
      (supabase as any).from("family_members").select("*").eq("primary_account_id", p.id),
    ]);
    setDetail({ bookings: bks || [], orders: ords || [], family: fam || [] });
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Customers</h1>
        <div className="relative w-full max-w-xs">
          <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search name, email, phone" value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
        </div>
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> :
        filtered.length === 0 ? <p className="text-muted-foreground">No customers.</p> :
        <div className="space-y-2">
          {filtered.map((p) => {
            const bs = bookingStats[p.id] || { count: 0, total: 0, last: null };
            const os = orderStats[p.id] || { count: 0, total: 0 };
            const lifetime = bs.total + os.total;
            const l = loyalty[p.id];
            return (
              <Card key={p.id} className="cursor-pointer hover:bg-accent/30 transition-colors" onClick={() => openDetail(p)}>
                <CardContent className="py-3 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center"><User className="h-5 w-5 text-muted-foreground" /></div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{p.full_name || "Unnamed"}</span>
                        {l?.tier && <Badge variant="outline" className="capitalize">{l.tier}</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap mt-0.5">
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{p.email}</span>
                        {p.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{p.phone}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center"><div className="text-xs text-muted-foreground">Bookings</div><div className="font-medium tabular-nums">{bs.count}</div></div>
                    <div className="text-center"><div className="text-xs text-muted-foreground">Orders</div><div className="font-medium tabular-nums">{os.count}</div></div>
                    <div className="text-center"><div className="text-xs text-muted-foreground">Lifetime</div><div className="font-medium tabular-nums">R{(lifetime / 100).toFixed(0)}</div></div>
                    <div className="text-center"><div className="text-xs text-muted-foreground">Last visit</div><div className="font-medium text-xs">{bs.last ? format(new Date(bs.last), "PP") : "—"}</div></div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      }
      <Dialog open={!!selected} onOpenChange={(v) => { if (!v) { setSelected(null); setDetail(null); } }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.full_name || "Customer"}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground space-y-1">
                <div>{selected.email}</div>
                {selected.phone && <div>{selected.phone}</div>}
                <div className="text-xs">Joined {format(new Date(selected.created_at), "PP")}</div>
              </div>
              {!detail ? <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin" /></div> : (
                <>
                  {detail.family.length > 0 && (
                    <Section title={`Family (${detail.family.length})`}>
                      {detail.family.map((f) => <div key={f.id} className="text-sm py-1">{f.full_name} {f.relationship && <span className="text-muted-foreground">· {f.relationship}</span>}</div>)}
                    </Section>
                  )}
                  <Section title={`Bookings (${detail.bookings.length})`}>
                    {detail.bookings.length === 0 ? <p className="text-sm text-muted-foreground">None yet.</p> : detail.bookings.slice(0, 10).map((b: any) => (
                      <div key={b.id} className="text-sm border-b last:border-0 py-2 flex justify-between gap-2">
                        <div>
                          <div className="font-medium">{(b.booking_items || []).map((bi: any) => bi.services?.name).filter(Boolean).join(" · ") || b.booking_number}</div>
                          <div className="text-xs text-muted-foreground">{format(new Date(b.scheduled_at), "PPp")} · <span className="capitalize">{b.status?.replace("_", " ")}</span></div>
                        </div>
                        <div className="font-medium tabular-nums">R{(b.total_cents / 100).toFixed(2)}</div>
                      </div>
                    ))}
                  </Section>
                  <Section title={`Orders (${detail.orders.length})`}>
                    {detail.orders.length === 0 ? <p className="text-sm text-muted-foreground">None yet.</p> : detail.orders.slice(0, 10).map((o: any) => (
                      <div key={o.id} className="text-sm border-b last:border-0 py-2 flex justify-between gap-2">
                        <div>
                          <div className="font-medium">{(o.order_items || []).map((i: any) => `${i.products?.name} ×${i.quantity}`).join(", ") || o.order_number}</div>
                          <div className="text-xs text-muted-foreground">{format(new Date(o.created_at), "PPp")} · <span className="capitalize">{o.status}</span></div>
                        </div>
                        <div className="font-medium tabular-nums">R{(o.total_cents / 100).toFixed(2)}</div>
                      </div>
                    ))}
                  </Section>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">{title}</h3>
      <div>{children}</div>
    </div>
  );
}
