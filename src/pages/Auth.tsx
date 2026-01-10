import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Separator } from "@/components/ui/separator";
import { Wand2, KeyRound } from "lucide-react";

type AuthTab = "login" | "signup" | "magic-link";

const Auth = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [showMagicLink, setShowMagicLink] = useState(false);

  // Determine initial tab from URL search params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab === "signup") {
      setActiveTab("signup");
    } else if (tab === "magic-link") {
      setShowMagicLink(true);
    }
  }, [location.search]);

  // Redirect authenticated users
  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/parent", { replace: true });
      }
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading) {
    return (
      <AuthLayout>
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AuthLayout>
    );
  }

  // Don't render auth form if already logged in (will redirect)
  if (user) {
    return (
      <AuthLayout>
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthHeader 
        showLogo 
        title="Welcome to Inner Odyssey" 
        description="Empowering kids to learn and grow"
      />

      <Card className="p-6 elevated-card">
        {showMagicLink ? (
          <div className="space-y-4">
            <MagicLinkForm />
            <Separator />
            <Button 
              variant="ghost" 
              className="w-full" 
              onClick={() => setShowMagicLink(false)}
            >
              <KeyRound className="h-4 w-4 mr-2" />
              Sign in with password instead
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <Tabs 
              value={activeTab} 
              onValueChange={(v) => setActiveTab(v as AuthTab)} 
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Create Account</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0">
                <LoginForm />
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <SignupForm />
              </TabsContent>
            </Tabs>

            {activeTab === "login" && (
              <>
                <div className="relative my-4">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    or
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => setShowMagicLink(true)}
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Sign in with Magic Link
                </Button>
              </>
            )}
          </div>
        )}
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        By continuing, you agree to our{" "}
        <Link to="/terms" className="text-primary hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link to="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>
      </p>

      <div className="text-center">
        <Button
          variant="link"
          onClick={() => navigate("/admin-setup")}
          className="text-xs text-muted-foreground hover:text-primary"
        >
          Need to set up an admin? Click here
        </Button>
      </div>
    </AuthLayout>
  );
};

export default Auth;
