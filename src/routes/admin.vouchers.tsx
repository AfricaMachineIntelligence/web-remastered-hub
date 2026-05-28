import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/vouchers")({
  head: () => ({ meta: [{ title: "Vouchers — Admin" }] }),
  component: AdminVouchers,
});

function AdminVouchers() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase as any).from("vouchers").select("*").order("created_at", { ascending: false }).limit(100).then(({ data }: any) => {
      setItems(data || []); setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <h1 className="text-3xl font-semibold mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Vouchers</h1>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> :
        items.length === 0 ? <p className="text-muted-foreground">No vouchers yet.</p> :
        <div className="space-y-2">
          {items.map((v) => (
            <Card key={v.id}>
              <CardContent className="py-3 flex items-center justify-between">
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
      }
    </div>
  );
}
