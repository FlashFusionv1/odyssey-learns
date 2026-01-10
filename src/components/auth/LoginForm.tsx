import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/auth/FormField";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { loginSchema } from "@/lib/schemas/auth";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { checkServerRateLimit, RATE_LIMITS } from "@/lib/rateLimiter";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LogIn, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loginError, setLoginError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const { signIn } = useAuth();
  const { executeRecaptcha } = useRecaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoginError(null);
    
    const validation = loginSchema.safeParse({ email, password });
    
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === "email") fieldErrors.email = err.message;
        if (err.path[0] === "password") fieldErrors.password = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const rateLimit = await checkServerRateLimit(
        RATE_LIMITS.LOGIN.endpoint,
        RATE_LIMITS.LOGIN.maxRequests,
        RATE_LIMITS.LOGIN.windowMinutes
      );

      if (!rateLimit.allowed) {
        const waitMinutes = Math.ceil((rateLimit.retryAfter || 0) / 60);
        setLoginError(`Too many login attempts. Please wait ${waitMinutes} minute${waitMinutes !== 1 ? 's' : ''} before trying again.`);
        setLoading(false);
        return;
      }

      // Execute reCAPTCHA (graceful - never blocks login)
      try {
        const recaptchaToken = await executeRecaptcha("login");
        if (recaptchaToken) {
          const { supabase } = await import("@/integrations/supabase/client");
          const { data: verifyResult } = await supabase.functions.invoke("verify-recaptcha", {
            body: { token: recaptchaToken, action: "login" }
          });
          
          if (verifyResult?.suspicious) {
            console.warn("reCAPTCHA flagged suspicious activity:", verifyResult);
          }
        }
      } catch (verifyError) {
        console.warn("reCAPTCHA verification skipped:", verifyError);
      }

      const { error } = await signIn(validation.data.email, validation.data.password);

      if (error) {
        setAttemptCount(prev => prev + 1);
        
        // Provide helpful error messages without revealing too much
        if (error.message?.toLowerCase().includes("invalid")) {
          setLoginError("Invalid email or password. Please check your credentials and try again.");
        } else if (error.message?.toLowerCase().includes("email not confirmed")) {
          setLoginError("Please verify your email address before signing in. Check your inbox for the confirmation link.");
        } else if (error.message?.toLowerCase().includes("disabled")) {
          setLoginError("This account has been disabled. Please contact support for assistance.");
        } else {
          setLoginError("Unable to sign in. Please check your credentials and try again.");
        }

        // Show additional help after multiple failures
        if (attemptCount >= 2) {
          toast.info("Having trouble? Try resetting your password or use the magic link option.", {
            duration: 8000
          });
        }
      } else {
        // Store remember me preference
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }
        toast.success("Welcome back!");
      }
    } catch (err) {
      console.error("Login error:", err);
      setLoginError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-md" noValidate>
      {loginError && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{loginError}</AlertDescription>
        </Alert>
      )}

      <FormField
        id="login-email"
        label="Email"
        type="email"
        placeholder="parent@example.com"
        value={email}
        onChange={(value) => {
          setEmail(value);
          setErrors((prev) => ({ ...prev, email: undefined }));
          setLoginError(null);
        }}
        error={errors.email}
        autoComplete="email"
      />

      <FormField
        id="login-password"
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(value) => {
          setPassword(value);
          setErrors((prev) => ({ ...prev, password: undefined }));
          setLoginError(null);
        }}
        error={errors.password}
        maxLength={128}
        autoComplete="current-password"
        labelExtra={
          <Link 
            to="/reset-password" 
            className="text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            Forgot password?
          </Link>
        }
      />

      <div className="flex items-center space-x-2">
        <Checkbox 
          id="remember-me" 
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked === true)}
        />
        <Label 
          htmlFor="remember-me" 
          className="text-sm font-normal text-muted-foreground cursor-pointer"
        >
          Remember me for 30 days
        </Label>
      </div>

      <Button type="submit" className="w-full hover-scale" disabled={loading}>
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </>
        )}
      </Button>
    </form>
  );
};
