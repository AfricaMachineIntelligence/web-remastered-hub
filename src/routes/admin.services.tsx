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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/services")({
  head: () => ({ meta: [{ title: "Services — Admin" }] }),
  component: AdminServices,
});

const CATS = ["spa", "barber", "kids_salon", "restaurant", "salon", "nail_bar", "lash_bar", "head_spa", "kids_spa"];

function AdminServices() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", category: "spa", duration_minutes: 60, price_cents: 0, description: "", is_active: true });

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from("services").select("*").order("category").order("name");
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: "", category: "spa", duration_minutes: 60, price_cents: 0, description: "", is_active: true }); setOpen(true); };
  const openEdit = (s: any) => { setEditing(s); setForm({ name: s.name, category: s.category, duration_minutes: s.duration_minutes, price_cents: s.price_cents, description: s.description || "", is_active: s.is_active }); setOpen(true); };

  const save = async () => {
    const payload = { ...form, price_cents: Number(form.price_cents), duration_minutes: Number(form.duration_minutes) };
    const { error } = editing
      ? await (supabase as any).from("services").update(payload).eq("id", editing.id)
      : await (supabase as any).from("services").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false);
    load();
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Services</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> New service</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit service" : "New service"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c} className="capitalize">{c.replace("_", " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Duration (min)</Label><Input type="number" value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })} /></div>
                <div><Label>Price (cents)</Label><Input type="number" value={form.price_cents} onChange={(e) => setForm({ ...form, price_cents: Number(e.target.value) })} /></div>
              </div>
              <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
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
                    <Badge variant="secondary" className="capitalize">{s.category.replace("_", " ")}</Badge>
                    {!s.is_active && <Badge variant="destructive">inactive</Badge>}
                  </div>
                  <div className="text-sm text-muted-foreground">{s.duration_minutes} min · R{(s.price_cents / 100).toFixed(2)}</div>
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
