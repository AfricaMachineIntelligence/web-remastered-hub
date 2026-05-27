import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Palm Aura" }] }),
  component: AuthPage,
});

function AuthPage() {
  const { signIn, signUp, user, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const m = params.get("mode");
    if (m === "signup" || m === "login") setMode(m);
  }, []);

  useEffect(() => {
    if (!loading && user && typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
  }, [user, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    if (mode === "login") await signIn(email, password);
    else await signUp(email, password, fullName);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Palm Aura
          </CardTitle>
          <CardDescription>Beauty, wellness & dining for the whole family</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => setMode(v as "login" | "signup")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Log in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <form onSubmit={handleSubmit} className="space-y-4 pt-6">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "login" && (
                    <Link to="/forgot-password" className="text-xs text-muted-foreground hover:underline">
                      Forgot?
                    </Link>
                  )}
                </div>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <Button type="submit" disabled={submitting} className="w-full text-white hover:opacity-90" style={{ background: "#b47838" }}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mode === "login" ? "Log in" : "Create account"}
              </Button>
            </form>
          </Tabs>
          <div className="mt-6 text-center text-sm">
            <Link to="/" className="text-muted-foreground hover:underline">← Back to home</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
