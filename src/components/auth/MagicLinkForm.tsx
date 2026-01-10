import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/auth/FormField";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { magicLinkSchema } from "@/lib/schemas/auth";
import { checkServerRateLimit, RATE_LIMITS } from "@/lib/rateLimiter";
import { Mail, CheckCircle, Sparkles } from "lucide-react";

export const MagicLinkForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    const validation = magicLinkSchema.safeParse({ email });
    
    if (!validation.success) {
      setError(validation.error.errors[0]?.message);
      return;
    }

    setLoading(true);

    try {
      // Rate limit check (share with login limits)
      const rateLimit = await checkServerRateLimit(
        RATE_LIMITS.LOGIN.endpoint,
        RATE_LIMITS.LOGIN.maxRequests,
        RATE_LIMITS.LOGIN.windowMinutes
      );

      if (!rateLimit.allowed) {
        toast.error(
          `Too many attempts. Please wait ${Math.ceil((rateLimit.retryAfter || 0) / 60)} minutes.`
        );
        setLoading(false);
        return;
      }

      const { error: authError } = await supabase.auth.signInWithOtp({
        email: validation.data.email,
        options: {
          emailRedirectTo: `${window.location.origin}/parent`,
        }
      });

      if (authError) {
        if (authError.message?.toLowerCase().includes("rate limit")) {
          toast.error("Too many requests. Please wait before trying again.");
        } else {
          toast.error(authError.message || "Failed to send magic link");
        }
      } else {
        setEmailSent(true);
        toast.success("Magic link sent! Check your email.");
      }
    } catch (err) {
      console.error("Magic link error:", err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center space-y-4 py-4">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">Check your email</h3>
          <p className="text-sm text-muted-foreground">
            We sent a magic link to <span className="font-medium">{email}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Click the link in the email to sign in. It expires in 1 hour.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            setEmailSent(false);
            setEmail("");
          }}
          className="mt-4"
        >
          Use a different email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Sparkles className="h-4 w-4 text-primary" />
        <span>No password needed — we'll email you a sign-in link</span>
      </div>

      <FormField
        id="magic-link-email"
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
            Send Magic Link
          </>
        )}
      </Button>
    </form>
  );
};
