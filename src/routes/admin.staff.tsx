import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/staff")({
  head: () => ({ meta: [{ title: "Staff — Admin" }] }),
  component: AdminStaff,
});

function AdminStaff() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", specialty: "", commission_rate: 0, is_active: true });

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("staff")
      .select("id, name, specialty, is_active, user_id, created_at, updated_at")
      .order("name");
    const { data: fin } = await (supabase as any).rpc("get_staff_financials");
    const finMap = new Map<string, any>((fin || []).map((f: any) => [f.id, f]));
    setItems((data || []).map((s: any) => ({ ...s, ...(finMap.get(s.id) || {}) })));
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: "", specialty: "", commission_rate: 0, is_active: true }); setOpen(true); };
  const openEdit = (s: any) => { setEditing(s); setForm({ name: s.name, specialty: s.specialty || "", commission_rate: s.commission_rate || 0, is_active: s.is_active }); setOpen(true); };


  const save = async () => {
    const payload = { ...form, commission_rate: Number(form.commission_rate) };
    const { error } = editing
      ? await (supabase as any).from("staff").update(payload).eq("id", editing.id)
      : await (supabase as any).from("staff").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); load();
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Staff</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> New staff</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit staff" : "New staff"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Specialty</Label><Input value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} /></div>
              <div><Label>Commission %</Label><Input type="number" value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: Number(e.target.value) })} /></div>
              <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /></div>
              <Button onClick={save} className="w-full">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> :
        <div className="space-y-2">
          {items.map((s) => (
            <Card key={s.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{s.name}</span>
                    {!s.is_active && <Badge variant="destructive">inactive</Badge>}
                  </div>
                  {s.specialty && <div className="text-sm text-muted-foreground">{s.specialty}</div>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </div>
  );
}
