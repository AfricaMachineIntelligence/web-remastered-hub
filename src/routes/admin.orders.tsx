import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — Admin" }] }),
  component: AdminOrders,
});

function AdminOrders() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (supabase as any).from("orders").select("*, order_items(*, products(name))").order("created_at", { ascending: false }).limit(100).then(({ data }: any) => {
      setItems(data || []); setLoading(false);
    });
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <h1 className="text-3xl font-semibold mb-6" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Orders</h1>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> :
        items.length === 0 ? <p className="text-muted-foreground">No orders yet.</p> :
        <div className="space-y-3">
          {items.map((o) => (
            <Card key={o.id}>
              <CardContent className="py-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{o.order_number}</span>
                      <Badge variant="secondary" className="capitalize">{o.status}</Badge>
                    </div>
                    <div className="font-medium mt-1">{o.customer_name}</div>
                    <div className="text-xs text-muted-foreground">{format(new Date(o.created_at), "PPp")}</div>
                  </div>
                  <div className="text-lg font-semibold">R{(o.total_cents / 100).toFixed(2)}</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {(o.order_items || []).map((i: any) => `${i.products?.name} ×${i.quantity}`).join(", ")}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </div>
  );
}
