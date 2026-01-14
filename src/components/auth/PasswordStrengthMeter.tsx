import { useMemo } from "react";
import { Check, X, AlertTriangle, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPasswordStrength } from "@/lib/schemas/auth";

interface PasswordStrengthMeterProps {
  password: string;
  showDetails?: boolean;
}

const strengthConfig = [
  { label: "Very Weak", color: "bg-destructive", textColor: "text-destructive", icon: ShieldAlert },
  { label: "Weak", color: "bg-orange-500", textColor: "text-orange-500", icon: AlertTriangle },
  { label: "Fair", color: "bg-yellow-500", textColor: "text-yellow-500", icon: Shield },
  { label: "Strong", color: "bg-green-500", textColor: "text-green-500", icon: ShieldCheck },
  { label: "Very Strong", color: "bg-emerald-600", textColor: "text-emerald-600", icon: ShieldCheck },
];

export const PasswordStrengthMeter = ({ 
  password, 
  showDetails = true 
}: PasswordStrengthMeterProps) => {
  const analysis = useMemo(() => getPasswordStrength(password), [password]);
  
  const config = strengthConfig[analysis.score];
  const Icon = config.icon;
  const strengthPercent = ((analysis.score + 1) / 5) * 100;

  // Calculate which requirements are met
  const requirements = useMemo(() => [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains number", met: /\d/.test(password) },
    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
  ], [password]);

  if (!password) return null;

  return (
    <div className="space-y-3 pt-2">
      {/* Strength bar and label */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Icon className={cn("h-4 w-4", config.textColor)} />
            <span>Password strength:</span>
          </div>
          <span className={cn("font-medium", config.textColor)}>
            {config.label}
          </span>
        </div>
        
        {/* Progress bar with segments */}
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((segment) => (
            <div
              key={segment}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-300",
                segment <= analysis.score ? config.color : "bg-muted"
              )}
            />
          ))}
        </div>
        
        {/* Crack time estimate */}
        <p className="text-xs text-muted-foreground">
          Time to crack: <span className="font-medium">{analysis.crackTime}</span>
        </p>
      </div>

      {/* Feedback from zxcvbn */}
      {analysis.feedback.warning && (
        <div className="flex items-start gap-2 text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 p-2 rounded-md">
          <AlertTriangle className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
          <span>{analysis.feedback.warning}</span>
        </div>
      )}

      {/* Suggestions */}
      {analysis.feedback.suggestions.length > 0 && analysis.score < 3 && (
        <div className="space-y-1">
          {analysis.feedback.suggestions.map((suggestion, i) => (
            <p key={i} className="text-xs text-muted-foreground">
              💡 {suggestion}
            </p>
          ))}
        </div>
      )}

      {/* Requirements checklist */}
      {showDetails && (
        <div className="space-y-1.5 pt-1">
          {requirements.map((req, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2 text-xs transition-colors",
                req.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
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
      )}
    </div>
  );
};
