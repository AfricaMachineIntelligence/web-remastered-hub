import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({
  head: () => ({ meta: [{ title: "Products — Admin" }] }),
  component: AdminProducts,
});

const CATS = ["skincare", "haircare", "wellness", "tools", "gift_sets", "breakfast", "lunch", "dinner", "beverages", "desserts"];

function AdminProducts() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ name: "", category: "skincare", price_cents: 0, stock_quantity: 0, description: "", image_url: "", is_active: true });
  const [editCell, setEditCell] = useState<{ id: string; field: "price" | "stock"; value: string } | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from("products").select("*").order("category").order("name");
    setItems(data || []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ name: "", category: "skincare", price_cents: 0, stock_quantity: 0, description: "", image_url: "", is_active: true }); setOpen(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ name: p.name, category: p.category, price_cents: p.price_cents, stock_quantity: p.stock_quantity, description: p.description || "", image_url: p.image_url || "", is_active: p.is_active }); setOpen(true); };

  const save = async () => {
    const payload = { ...form, price_cents: Number(form.price_cents), stock_quantity: Number(form.stock_quantity) };
    const { error } = editing
      ? await (supabase as any).from("products").update(payload).eq("id", editing.id)
      : await (supabase as any).from("products").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved"); setOpen(false); load();
  };

  const saveCell = async () => {
    if (!editCell) return;
    const num = Number(editCell.value);
    if (Number.isNaN(num) || num < 0) return toast.error("Invalid number");
    const field = editCell.field === "price" ? "price_cents" : "stock_quantity";
    const val = editCell.field === "price" ? Math.round(num * 100) : Math.round(num);
    const { error } = await (supabase as any).from("products").update({ [field]: val }).eq("id", editCell.id);
    if (error) return toast.error(error.message);
    toast.success("Updated"); setEditCell(null); load();
  };

  const toggleActive = async (p: any) => {
    const { error } = await (supabase as any).from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    if (error) return toast.error(error.message);
    load();
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.category === filter);

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-3xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Products</h1>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATS.map((c) => <SelectItem key={c} value={c} className="capitalize">{c.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button onClick={openNew}><Plus className="h-4 w-4 mr-1" /> New product</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATS.map((c) => <SelectItem key={c} value={c} className="capitalize">{c.replace("_", " ")}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Price (Rand)</Label><Input type="number" step="0.01" value={form.price_cents / 100} onChange={(e) => setForm({ ...form, price_cents: Math.round(Number(e.target.value) * 100) })} /></div>
                  <div><Label>Stock</Label><Input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })} /></div>
                </div>
                <div><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
                <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="flex items-center justify-between"><Label>Active</Label><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /></div>
                <Button onClick={save} className="w-full">Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div> :
        filtered.length === 0 ? <p className="text-muted-foreground">No products.</p> :
        <div className="space-y-2">
          {filtered.map((p) => (
            <Card key={p.id}>
              <CardContent className="py-3 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {p.image_url && <img src={p.image_url} alt={p.name} className="h-12 w-12 rounded object-cover bg-muted" />}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{p.name}</span>
                      <Badge variant="secondary" className="capitalize">{p.category.replace("_", " ")}</Badge>
                      {!p.is_active && <Badge variant="destructive">inactive</Badge>}
                      {p.stock_quantity === 0 && p.is_active && <Badge variant="destructive">out of stock</Badge>}
                      {p.stock_quantity > 0 && p.stock_quantity < 5 && <Badge variant="outline">low</Badge>}
                    </div>
                    {p.description && <div className="text-xs text-muted-foreground truncate max-w-md mt-0.5">{p.description}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <InlineCell label="Price" prefix="R" value={(p.price_cents / 100).toFixed(2)} editing={editCell?.id === p.id && editCell.field === "price"} editState={editCell} setEdit={(v) => setEditCell(v ? { id: p.id, field: "price", value: (p.price_cents / 100).toFixed(2) } : null)} setValue={(v) => setEditCell((c) => c ? { ...c, value: v } : null)} onSave={saveCell} />
                  <InlineCell label="Stock" value={String(p.stock_quantity)} editing={editCell?.id === p.id && editCell.field === "stock"} editState={editCell} setEdit={(v) => setEditCell(v ? { id: p.id, field: "stock", value: String(p.stock_quantity) } : null)} setValue={(v) => setEditCell((c) => c ? { ...c, value: v } : null)} onSave={saveCell} />
                  <Switch checked={p.is_active} onCheckedChange={() => toggleActive(p)} />
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </div>
  );
}

function InlineCell({ label, prefix, value, editing, editState, setEdit, setValue, onSave }: any) {
  if (editing && editState) {
    return (
      <div className="flex items-center gap-1">
        <Input autoFocus value={editState.value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") onSave(); if (e.key === "Escape") setEdit(false); }} className="h-8 w-24" />
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onSave}><Check className="h-4 w-4" /></Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEdit(false)}><X className="h-4 w-4" /></Button>
      </div>
    );
  }
  return (
    <button onClick={() => setEdit(true)} className="text-right hover:bg-accent/50 rounded px-2 py-1 transition-colors">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium tabular-nums">{prefix}{value}</div>
    </button>
  );
}
