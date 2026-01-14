import { useCallback } from "react";

// Use production reCAPTCHA key from environment variable
// Test key fallback only allowed in development
const RECAPTCHA_TEST_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

// Enforce production key requirement
if (import.meta.env.PROD && !import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  throw new Error(
    "VITE_RECAPTCHA_SITE_KEY is required in production. " +
    "Please configure your reCAPTCHA site key in environment variables."
  );
}

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || RECAPTCHA_TEST_KEY;

// Warn in development if using test key
if (import.meta.env.DEV && !import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  console.warn(
    "⚠️ Development mode: Using reCAPTCHA test key. " +
    "Set VITE_RECAPTCHA_SITE_KEY for production testing."
  );
}

export const useRecaptcha = () => {
  const executeRecaptcha = useCallback(async (action: string): Promise<string> => {
    try {
      // Check if grecaptcha is loaded
      if (typeof window === "undefined" || !window.grecaptcha) {
        console.warn("reCAPTCHA not loaded yet");
        return ""; // Return empty token for development
      }

      // Wait for grecaptcha to be ready
      return new Promise((resolve) => {
        window.grecaptcha.ready(async () => {
          try {
            const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, {
              action,
            });
            resolve(token);
          } catch (error) {
            console.error("reCAPTCHA execution error:", error);
            resolve(""); // Return empty token on error
          }
        });
      });
    } catch (error) {
      console.error("reCAPTCHA error:", error);
      return ""; // Return empty token on error
    }
  }, []);

  return { executeRecaptcha };
};

// Extend window interface for TypeScript
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}
