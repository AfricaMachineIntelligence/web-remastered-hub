import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, X, Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { adminCreateUser } from "@/lib/admin-users.functions";

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
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Team & Roles</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create staff accounts and grant or revoke roles. {isOwner ? "As an owner, you can manage all roles including admin and owner." : "Admins cannot grant or revoke admin or owner — ask an owner for those."}
          </p>
        </div>
        <CreateUserDialog assignable={assignable} onCreated={load} />
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

function CreateUserDialog({ assignable, onCreated }: { assignable: AppRole[]; onCreated: () => void }) {
  const createUser = useServerFn(adminCreateUser);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"password" | "invite">("password");
  const [role, setRole] = useState<AppRole>("frontdesk");

  const reset = () => {
    setEmail(""); setFullName(""); setPassword(""); setRole("frontdesk"); setMode("password");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createUser({
        data: {
          email,
          fullName: fullName || undefined,
          password: mode === "password" ? password : undefined,
          sendInvite: mode === "invite",
          roles: role === "guest" ? [] : [role],
        },
      });
      toast.success(mode === "invite" ? "Invitation sent" : "User created");
      reset();
      setOpen(false);
      onCreated();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><UserPlus className="h-4 w-4 mr-2" /> Add team member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add team member</DialogTitle>
          <DialogDescription>Create a new user account and assign a starting role.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cu-email">Email</Label>
            <Input id="cu-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cu-name">Full name</Label>
            <Input id="cu-name" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Optional" />
          </div>
          <div className="space-y-2">
            <Label>Setup method</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="password">Set initial password</SelectItem>
                <SelectItem value="invite">Send invitation email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {mode === "password" && (
            <div className="space-y-2">
              <Label htmlFor="cu-pw">Initial password</Label>
              <Input id="cu-pw" type="text" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required placeholder="Min 6 characters" />
              <p className="text-xs text-muted-foreground">Share securely. The user can reset it after first sign-in.</p>
            </div>
          )}
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AppRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {assignable.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
