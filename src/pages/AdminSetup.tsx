import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Shield } from "lucide-react";

export default function AdminSetup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSetupAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.rpc('add_admin_role', { _email: email });
      
      if (error) throw error;
      
      toast.success(`Admin role added to ${email}`);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to add admin role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Admin Setup</h1>
          <p className="text-muted-foreground text-sm">
            Add admin role to an existing user account
          </p>
        </div>

        <form onSubmit={handleSetupAdmin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">User Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              This user must already have an account. After adding admin role, they can log in and access the admin dashboard.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Adding Admin Role..." : "Make Admin"}
          </Button>
        </form>

        <div className="pt-4 border-t text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="text-sm"
          >
            Back to Login
          </Button>
        </div>
      </Card>
    </div>
  );
}
