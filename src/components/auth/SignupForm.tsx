import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/auth/FormField";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRecaptcha } from "@/hooks/useRecaptcha";
import { checkServerRateLimit, RATE_LIMITS } from "@/lib/rateLimiter";
import { signupSchema, getPasswordStrength } from "@/lib/schemas/auth";
import { UserPlus, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";

type FormErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
};

export const SignupForm = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [signupError, setSignupError] = useState<string | null>(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { executeRecaptcha } = useRecaptcha();

  const clearFieldError = (field: keyof FormErrors) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setSignupError(null);
  };

  // Check if password matches confirmation in real-time
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsDontMatch = confirmPassword && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSignupError(null);

    // Check terms acceptance first
    if (!acceptTerms) {
      setErrors({ terms: "You must accept the Terms of Service and Privacy Policy" });
      return;
    }

    // Validate with Zod schema
    const validationData = { fullName, email, password };
    const result = signupSchema.safeParse(validationData);
    
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof FormErrors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords don't match" });
      return;
    }

    // Check password strength (require at least "Fair")
    const strength = getPasswordStrength(password);
    if (strength.score < 2) {
      setErrors({ password: "Please choose a stronger password" });
      return;
    }

    setLoading(true);

    try {
      const rateLimit = await checkServerRateLimit(
        RATE_LIMITS.SIGNUP.endpoint,
        RATE_LIMITS.SIGNUP.maxRequests,
        RATE_LIMITS.SIGNUP.windowMinutes
      );

      if (!rateLimit.allowed) {
        const waitMinutes = Math.ceil((rateLimit.retryAfter || 0) / 60);
        setSignupError(`Too many signup attempts. Please wait ${waitMinutes} minute${waitMinutes !== 1 ? 's' : ''}.`);
        setLoading(false);
        return;
      }

      // Execute reCAPTCHA (graceful - never blocks signup)
      try {
        const recaptchaToken = await executeRecaptcha("signup");
        if (recaptchaToken) {
          const { supabase } = await import("@/integrations/supabase/client");
          const { data: verifyResult } = await supabase.functions.invoke("verify-recaptcha", {
            body: { token: recaptchaToken, action: "signup" }
          });
          
          if (verifyResult?.suspicious) {
            console.warn("reCAPTCHA flagged suspicious activity:", verifyResult);
          }
        }
      } catch (verifyError) {
        console.warn("reCAPTCHA verification skipped:", verifyError);
      }

      const { error } = await signUp(result.data.email, password, result.data.fullName);

      if (error) {
        if (error.message?.includes("already registered")) {
          setSignupError("An account with this email already exists. Please sign in instead.");
        } else if (error.message?.toLowerCase().includes("password")) {
          setErrors({ password: error.message });
        } else if (error.message?.toLowerCase().includes("email")) {
          setErrors({ email: error.message });
        } else {
          setSignupError(error.message || "Failed to create account. Please try again.");
        }
      } else {
        toast.success("Account created successfully! Welcome to Inner Odyssey.", {
          duration: 5000
        });
        navigate("/parent-setup");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setSignupError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-md" noValidate>
      {signupError && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{signupError}</AlertDescription>
        </Alert>
      )}

      <FormField
        id="signup-fullName"
        label="Full Name"
        type="text"
        placeholder="John Doe"
        value={fullName}
        onChange={(value) => {
          setFullName(value);
          clearFieldError("fullName");
        }}
        error={errors.fullName}
        autoComplete="name"
      />

      <FormField
        id="signup-email"
        label="Email"
        type="email"
        placeholder="parent@example.com"
        value={email}
        onChange={(value) => {
          setEmail(value);
          clearFieldError("email");
        }}
        error={errors.email}
        autoComplete="email"
      />

      <FormField
        id="signup-password"
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(value) => {
          setPassword(value);
          clearFieldError("password");
        }}
        error={errors.password}
        maxLength={128}
        autoComplete="new-password"
      >
        <PasswordStrengthMeter password={password} />
      </FormField>

      <div className="space-y-2">
        <FormField
          id="signup-confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(value) => {
            setConfirmPassword(value);
            clearFieldError("confirmPassword");
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
        {passwordsDontMatch && !errors.confirmPassword && (
          <p className="text-xs text-orange-600 dark:text-orange-400">
            Passwords don't match yet
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="accept-terms" 
            checked={acceptTerms}
            onCheckedChange={(checked) => {
              setAcceptTerms(checked === true);
              clearFieldError("terms");
            }}
            className="mt-0.5"
          />
          <Label 
            htmlFor="accept-terms" 
            className="text-sm font-normal text-muted-foreground cursor-pointer leading-tight"
          >
            I agree to the{" "}
            <Link to="/terms" className="text-primary hover:underline" target="_blank">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary hover:underline" target="_blank">
              Privacy Policy
            </Link>
          </Label>
        </div>
        {errors.terms && (
          <p className="text-sm text-destructive" role="alert">
            {errors.terms}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full hover-scale" disabled={loading}>
        {loading ? (
          <LoadingSpinner size="sm" />
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-2" />
            Create Account
          </>
        )}
      </Button>
    </form>
  );
};
