import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormField } from "@/components/auth/FormField";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Mail, CheckCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { checkServerRateLimit, RATE_LIMITS } from "@/lib/rateLimiter";
import { resetPasswordSchema } from "@/lib/schemas/auth";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [canResend, setCanResend] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);

  const startResendCountdown = () => {
    setCanResend(false);
    setResendCountdown(60);
    
    const interval = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    // Validate email with schema
    const validation = resetPasswordSchema.safeParse({ email });
    if (!validation.success) {
      setError(validation.error.errors[0]?.message);
      return;
    }

    setLoading(true);

    try {
      const rateLimit = await checkServerRateLimit(
        RATE_LIMITS.PASSWORD_RESET.endpoint,
        RATE_LIMITS.PASSWORD_RESET.maxRequests,
        RATE_LIMITS.PASSWORD_RESET.windowMinutes
      );

      if (!rateLimit.allowed) {
        const waitMinutes = Math.ceil((rateLimit.retryAfter || 0) / 60);
        toast.error(
          `Too many reset attempts. Please wait ${waitMinutes} minute${waitMinutes !== 1 ? 's' : ''}.`,
          { duration: 8000 }
        );
        setLoading(false);
        return;
      }

      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        validation.data.email, 
        {
          redirectTo: `${window.location.origin}/update-password`,
        }
      );

      if (authError) {
        if (authError.message?.toLowerCase().includes("rate limit") || 
            authError.message?.toLowerCase().includes("too many requests")) {
          toast.error(
            "Too many reset attempts. Please wait before trying again.",
            { duration: 8000 }
          );
        } else {
          // Always show success to prevent email enumeration
          setEmailSent(true);
          startResendCountdown();
          toast.success("If an account exists, you'll receive a reset link.");
        }
      } else {
        setEmailSent(true);
        startResendCountdown();
        toast.success("Password reset email sent! Check your inbox.");
      }
    } catch (err) {
      console.error("Password reset error:", err);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    await handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <AuthLayout>
      <div className="space-y-4 w-full max-w-md">
        <BackButton to="/login" />

        <Card className="elevated-card">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                {emailSent ? (
                  <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
                ) : (
                  <Mail className="h-7 w-7 text-primary" />
                )}
              </div>
            </div>
            <CardTitle>
              {emailSent ? "Check Your Email" : "Reset Your Password"}
            </CardTitle>
            <CardDescription>
              {emailSent
                ? "We've sent you a password reset link"
                : "Enter your email address and we'll send you a link to reset your password"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {emailSent ? (
              <div className="text-center space-y-5">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium">{email}</p>
                  <p className="text-xs text-muted-foreground">
                    Click the link in the email to create a new password. 
                    The link expires in 1 hour.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Didn't receive the email? Check your spam folder or try again.
                  </p>

                  <Button 
                    onClick={handleResend}
                    variant="outline" 
                    className="w-full"
                    disabled={!canResend || loading}
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" />
                    ) : canResend ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resend Email
                      </>
                    ) : (
                      `Resend in ${resendCountdown}s`
                    )}
                  </Button>

                  <Button 
                    onClick={() => {
                      setEmailSent(false);
                      setEmail("");
                    }} 
                    variant="ghost" 
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Try a different email
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <Link 
                    to="/login" 
                    className="text-sm text-primary hover:underline"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <FormField
                  id="reset-email"
                  label="Email Address"
                  type="email"
                  placeholder="parent@example.com"
                  value={email}
                  onChange={(value) => {
                    setEmail(value);
                    setError(undefined);
                  }}
                  error={error}
                  autoComplete="email"
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Reset Link
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Remember your password?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
