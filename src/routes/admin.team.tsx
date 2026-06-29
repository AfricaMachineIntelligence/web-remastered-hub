import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, X, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/team")({
  head: () => ({ meta: [{ title: "Team & Roles — Admin" }] }),
  component: AdminTeam,
});

const ALL_ROLES: AppRole[] = [
  "guest", "group_host", "corp_admin", "frontdesk",
  "provider", "restaurant", "manager", "admin", "owner",
];

function AdminTeam() {
  const { hasRole } = useAuth();
  const isOwner = hasRole("owner");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [addRole, setAddRole] = useState<Record<string, AppRole>>({});

  // Roles this user can assign
  const assignable = useMemo<AppRole[]>(() => {
    if (isOwner) return ALL_ROLES;
    // Admins cannot grant admin or owner
    return ALL_ROLES.filter((r) => r !== "admin" && r !== "owner");
  }, [isOwner]);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      (supabase as any).from("profiles").select("id, email, full_name, created_at").order("created_at", { ascending: false }),
      (supabase as any).from("user_roles").select("user_id, role"),
    ]);
    const roleMap = new Map<string, AppRole[]>();
    (roles || []).forEach((r: any) => {
      const arr = roleMap.get(r.user_id) || [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    });
    setUsers((profiles || []).map((p: any) => ({ ...p, roles: roleMap.get(p.id) || [] })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const canModify = (role: AppRole) => isOwner || (role !== "admin" && role !== "owner");

  const grant = async (userId: string, role: AppRole) => {
    const { error } = await (supabase as any).from("user_roles").insert({ user_id: userId, role });
    if (error) return toast.error(error.message);
    toast.success(`Granted ${role}`);
    load();
  };

  const revoke = async (userId: string, role: AppRole) => {
    if (!canModify(role)) return toast.error("Insufficient privileges");
    const { error } = await (supabase as any).from("user_roles").delete().eq("user_id", userId).eq("role", role);
    if (error) return toast.error(error.message);
    toast.success(`Revoked ${role}`);
    load();
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (u.email || "").toLowerCase().includes(q) || (u.full_name || "").toLowerCase().includes(q);
  });

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Team & Roles</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Grant or revoke roles for any signed-up user. {isOwner ? "As an owner, you can manage all roles including admin and owner." : "Admins cannot grant or revoke admin or owner — ask an owner for those."}
        </p>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => {
            const userRoles: AppRole[] = u.roles;
            const grantable = assignable.filter((r) => !userRoles.includes(r));
            const selected = addRole[u.id] || grantable[0];
            return (
              <Card key={u.id}>
                <CardContent className="py-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{u.full_name || "Unnamed"}</div>
                    <div className="text-sm text-muted-foreground truncate">{u.email}</div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 flex-1">
                    {userRoles.length === 0 && <span className="text-xs text-muted-foreground italic">no roles</span>}
                    {userRoles.map((r) => (
                      <Badge key={r} variant={r === "owner" || r === "admin" ? "default" : "secondary"} className="gap-1">
                        {r}
                        {canModify(r) && (
                          <button onClick={() => revoke(u.id, r)} className="hover:text-destructive ml-0.5" aria-label={`Revoke ${r}`}>
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {grantable.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Select value={selected} onValueChange={(v) => setAddRole({ ...addRole, [u.id]: v as AppRole })}>
                        <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {grantable.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={() => grant(u.id, selected)}>
                        <Plus className="h-4 w-4 mr-1" /> Grant
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && <div className="text-center text-muted-foreground py-12">No users found.</div>}
        </div>
      )}
    </div>
  );
}
