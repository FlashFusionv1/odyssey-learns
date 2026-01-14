import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormField } from "@/components/auth/FormField";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Lock, CheckCircle, AlertTriangle, ShieldCheck } from "lucide-react";
import { updatePasswordSchema, getPasswordStrength } from "@/lib/schemas/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";

const UpdatePassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [sessionError, setSessionError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for valid recovery session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check if this is a recovery flow (has access_token in URL or recovery session)
      const accessToken = searchParams.get('access_token');
      const type = searchParams.get('type');
      
      if (!session && !accessToken) {
        setSessionError("This password reset link has expired or is invalid. Please request a new one.");
      } else if (type === 'recovery' || searchParams.get('type') === 'recovery') {
        // Valid recovery session
        setSessionError(null);
      }
    };

    checkSession();
  }, [searchParams]);

  // Real-time password match indicator
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate with Zod schema
    const result = updatePasswordSchema.safeParse({ password, confirmPassword });
    
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof errors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Additional strength check
    const strength = getPasswordStrength(password);
    if (strength.score < 2) {
      setErrors({ password: "Please choose a stronger password" });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        if (error.message?.toLowerCase().includes("same as")) {
          setErrors({ password: "New password must be different from your current password" });
        } else if (error.message?.toLowerCase().includes("weak")) {
          setErrors({ password: "Password is too weak. Please choose a stronger one." });
        } else {
          throw error;
        }
      } else {
        setSuccess(true);
        toast.success("Password updated successfully!");
        
        // Redirect after showing success
        setTimeout(() => {
          navigate("/parent");
        }, 3000);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to update password";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Show error if no valid session
  if (sessionError) {
    return (
      <AuthLayout>
        <Card className="elevated-card w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <CardTitle>Link Expired</CardTitle>
            <CardDescription>{sessionError}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/reset-password">Request New Reset Link</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">Back to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  // Show success state
  if (success) {
    return (
      <AuthLayout>
        <Card className="elevated-card w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-in zoom-in">
                <ShieldCheck className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle>Password Updated!</CardTitle>
            <CardDescription>
              Your password has been changed successfully. You'll be redirected to your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Redirecting in a few seconds...
            </p>
            <Button asChild variant="outline">
              <Link to="/parent">Go to Dashboard Now</Link>
            </Button>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Card className="elevated-card w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-7 w-7 text-primary" />
            </div>
          </div>
          <CardTitle>Create New Password</CardTitle>
          <CardDescription>
            Choose a strong password that you haven't used before
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField
              id="new-password"
              label="New Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(value) => {
                setPassword(value);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={errors.password}
              maxLength={128}
              autoComplete="new-password"
            >
              <PasswordStrengthMeter password={password} />
            </FormField>

            <div className="space-y-2">
              <FormField
                id="confirm-new-password"
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(value) => {
                  setConfirmPassword(value);
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                error={errors.confirmPassword}
                maxLength={128}
                autoComplete="new-password"
              />
              {passwordsMatch && (
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Passwords match
                </p>
              )}
            </div>

            <Alert className="bg-muted/50">
              <ShieldCheck className="h-4 w-4" />
              <AlertDescription className="text-xs">
                For your security, use a unique password with a mix of letters, numbers, and symbols.
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !password || !confirmPassword}
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
};

export default UpdatePassword;
