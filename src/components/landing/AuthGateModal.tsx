import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

interface AuthGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceName?: string;
}

export const AuthGateModal = ({ open, onOpenChange, serviceName }: AuthGateModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "rgba(180,120,56,0.12)" }}>
            <Sparkles className="h-6 w-6" style={{ color: "#b47838" }} />
          </div>
          <DialogTitle className="text-center text-xl">Sign in to continue</DialogTitle>
          <DialogDescription className="text-center">
            {serviceName 
              ? `Sign in to book "${serviceName}" and manage your Palm Aura experience.`
              : "Sign in to book services and manage your Palm Aura experience."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4">
          <Button asChild className="text-white hover:opacity-90" style={{ background: "#b47838" }}>
            <Link to={`/auth?mode=signup${serviceName ? `&service=${encodeURIComponent(serviceName)}` : ""}`}>Sign Up</Link>
          </Button>
          <Button asChild variant="outline" style={{ borderColor: "rgba(180,120,56,0.3)", color: "#b47838" }}>
            <Link to={`/auth?mode=login${serviceName ? `&service=${encodeURIComponent(serviceName)}` : ""}`}>Log In</Link>
          </Button>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Continue Browsing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
