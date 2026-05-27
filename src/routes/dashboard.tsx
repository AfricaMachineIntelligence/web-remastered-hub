import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Palm Aura" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, loading, signOut, roles } = useAuth();

  useEffect(() => {
    if (!loading && !user && typeof window !== "undefined") {
      window.location.href = "/auth";
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link to="/">Home</Link></Button>
            <Button variant="ghost" onClick={signOut}>Sign out</Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Your account</CardTitle>
            <CardDescription>Role: {roles.join(", ") || "guest"}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Bookings, vouchers, and order history will appear here once the booking flow is ported.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
