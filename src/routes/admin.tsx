import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, LayoutDashboard, Calendar, Sparkles, Users, ShoppingBag, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Palm Aura" }] }),
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/bookings", label: "Bookings", icon: Calendar },
  { to: "/admin/services", label: "Services", icon: Sparkles },
  { to: "/admin/staff", label: "Staff", icon: Users },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/vouchers", label: "Vouchers", icon: Ticket },
];

function AdminLayout() {
  const { user, loading, hasRole, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && (!user || (!hasRole("admin") && !hasRole("manager") && !hasRole("owner")))) {
      if (typeof window !== "undefined") window.location.href = "/auth";
    }
  }, [user, loading, hasRole]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-60 border-r bg-card hidden md:flex flex-col">
        <div className="p-6 border-b">
          <Link to="/" className="text-xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Palm Aura</Link>
          <p className="text-xs text-muted-foreground mt-1">Admin Console</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={cn("flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors", active ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground hover:bg-accent/50")}>
                <Icon className="h-4 w-4" />{n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t space-y-1">
          <Button asChild variant="ghost" size="sm" className="w-full justify-start"><Link to="/">View site</Link></Button>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>Sign out</Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
