import { useCallback } from "react";

// Test site key for development - replace with real key before production
const RECAPTCHA_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";

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
