import { z } from 'zod';
import zxcvbn from 'zxcvbn';

// Common passwords list (subset for quick checks)
const COMMON_PASSWORDS = new Set([
  'password', 'password123', '123456', '12345678', 'qwerty', 
  'abc123', 'monkey', 'master', 'dragon', 'letmein',
  'login', 'admin', 'welcome', 'passw0rd', 'Password1'
]);

/**
 * Normalize email address for consistent storage
 * - Lowercase the entire email
 * - Trim whitespace
 */
export const normalizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

/**
 * Check if password is commonly used (security risk)
 */
export const isCommonPassword = (password: string): boolean => {
  return COMMON_PASSWORDS.has(password.toLowerCase());
};

/**
 * Get password strength score using zxcvbn
 * Returns 0-4 score where:
 * 0 = too guessable
 * 1 = very guessable
 * 2 = somewhat guessable
 * 3 = safely unguessable
 * 4 = very unguessable
 */
export const getPasswordStrength = (password: string): {
  score: number;
  feedback: { warning: string; suggestions: string[] };
  crackTime: string;
} => {
  if (!password) {
    return {
      score: 0,
      feedback: { warning: '', suggestions: ['Enter a password'] },
      crackTime: 'instant'
    };
  }
  
  const result = zxcvbn(password);
  return {
    score: result.score,
    feedback: result.feedback,
    crackTime: result.crack_times_display.offline_slow_hashing_1e4_per_second as string
  };
};

/**
 * Login schema with email normalization
 */
export const loginSchema = z.object({
  email: z.string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email address is too long')
    .transform(normalizeEmail),
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password is too long')
});

/**
 * Signup schema with enhanced password requirements
 */
export const signupSchema = z.object({
  email: z.string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email address is too long')
    .transform(normalizeEmail),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .refine(
      (password) => !isCommonPassword(password),
      'This password is too common. Please choose a stronger one.'
    )
    .refine(
      (password) => getPasswordStrength(password).score >= 2,
      'Password is too weak. Add uppercase, numbers, or special characters.'
    ),
  fullName: z.string()
    .trim()
    .min(1, 'Please enter your name')
    .max(100, 'Name is too long')
    .regex(/^[a-zA-Z\s\-'.]+$/, 'Name can only contain letters, spaces, hyphens, apostrophes, and periods')
});

/**
 * Password reset request schema
 */
export const resetPasswordSchema = z.object({
  email: z.string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email address is too long')
    .transform(normalizeEmail)
});

/**
 * Update password schema (after reset)
 */
export const updatePasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .refine(
      (password) => !isCommonPassword(password),
      'This password is too common. Please choose a stronger one.'
    )
    .refine(
      (password) => getPasswordStrength(password).score >= 2,
      'Password is too weak. Add uppercase, numbers, or special characters.'
    ),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

/**
 * Magic link login schema
 */
export const magicLinkSchema = z.object({
  email: z.string()
    .trim()
    .email('Please enter a valid email address')
    .max(255, 'Email address is too long')
    .transform(normalizeEmail)
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type MagicLinkInput = z.infer<typeof magicLinkSchema>;
