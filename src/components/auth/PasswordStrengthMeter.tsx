import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PasswordStrengthMeterProps {
  password: string;
}

interface Requirement {
  label: string;
  met: boolean;
}

export const PasswordStrengthMeter = ({ password }: PasswordStrengthMeterProps) => {
  const requirements: Requirement[] = useMemo(() => {
    return [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
      { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
      { label: "Contains number", met: /\d/.test(password) },
      { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
    ];
  }, [password]);

  const metCount = requirements.filter((r) => r.met).length;
  const strength = metCount === 0 ? 0 : (metCount / requirements.length) * 100;

  const strengthLabel = useMemo(() => {
    if (metCount <= 2) return { text: "Weak", color: "text-destructive" };
    if (metCount <= 3) return { text: "Fair", color: "text-warning" };
    if (metCount <= 4) return { text: "Good", color: "text-success" };
    return { text: "Strong", color: "text-success" };
  }, [metCount]);

  const progressColor = useMemo(() => {
    if (metCount <= 2) return "bg-destructive";
    if (metCount <= 3) return "bg-warning";
    return "bg-success";
  }, [metCount]);

  if (!password) return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Password strength:</span>
          <span className={cn("font-medium", strengthLabel.color)}>
            {strengthLabel.text}
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn("h-full transition-all", progressColor)}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        {requirements.map((req, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors",
              req.met ? "text-success" : "text-muted-foreground"
            )}
          >
            {req.met ? (
              <Check className="h-3 w-3" />
            ) : (
              <X className="h-3 w-3" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
