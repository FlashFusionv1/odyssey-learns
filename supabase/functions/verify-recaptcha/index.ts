import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Minimum score threshold (0.0-1.0, higher = more likely human)
// 0.5 is Google's recommended threshold for most use cases
const SCORE_THRESHOLD = 0.5;

// Check if we're in development/test mode
const isDevelopment = () => {
  const env = Deno.env.get('ENVIRONMENT') || Deno.env.get('DENO_ENV');
  return env === 'development' || env === 'test' || env === 'local';
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, action } = await req.json();

    // Get reCAPTCHA secret key from environment
    const RECAPTCHA_SECRET_KEY = Deno.env.get('RECAPTCHA_SECRET_KEY');

    console.log('reCAPTCHA verification request:', {
      action,
      hasToken: !!token,
      tokenLength: token?.length || 0,
      hasSecretKey: !!RECAPTCHA_SECRET_KEY,
      environment: Deno.env.get('ENVIRONMENT') || 'production'
    });

    // SECURITY: Require secret key in production
    if (!RECAPTCHA_SECRET_KEY) {
      // Only allow bypass in explicit development mode
      if (isDevelopment()) {
        console.warn('⚠️ DEV MODE: RECAPTCHA_SECRET_KEY not configured - bypassing verification');
        return new Response(
          JSON.stringify({ 
            valid: true, 
            score: 1.0, 
            action, 
            reason: 'Development mode bypass',
            devMode: true
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // SECURITY: In production, reject if no secret key
      console.error('❌ SECURITY: RECAPTCHA_SECRET_KEY not configured in production');
      return new Response(
        JSON.stringify({ 
          valid: false, 
          score: 0, 
          action, 
          error: 'Bot protection misconfigured',
          code: 'CONFIG_ERROR'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Require token
    if (!token || token === '' || token.length < 20) {
      console.warn('❌ SECURITY: No valid reCAPTCHA token provided');
      return new Response(
        JSON.stringify({ 
          valid: false, 
          score: 0, 
          action, 
          error: 'Missing or invalid reCAPTCHA token',
          code: 'TOKEN_MISSING'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Verifying reCAPTCHA token for action: ${action}`);

    // Verify token with Google
    const verifyResponse = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`
      }
    );

    if (!verifyResponse.ok) {
      console.error('❌ Google reCAPTCHA API error:', verifyResponse.status);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          score: 0, 
          action, 
          error: 'Failed to verify with reCAPTCHA service',
          code: 'API_ERROR'
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const verifyData = await verifyResponse.json();

    console.log('reCAPTCHA verification result:', {
      success: verifyData.success,
      score: verifyData.score,
      action: verifyData.action,
      challenge_ts: verifyData.challenge_ts,
      errorCodes: verifyData['error-codes']
    });

    // SECURITY: Handle verification failures properly
    if (!verifyData.success) {
      const errorCodes = verifyData['error-codes'] || [];
      console.warn('❌ reCAPTCHA verification failed:', errorCodes.join(', '));
      
      // Map error codes to user-friendly messages
      let errorMessage = 'Bot verification failed';
      let statusCode = 403;
      
      if (errorCodes.includes('timeout-or-duplicate')) {
        errorMessage = 'Verification expired, please try again';
        statusCode = 400;
      } else if (errorCodes.includes('invalid-input-response')) {
        errorMessage = 'Invalid verification token';
        statusCode = 400;
      } else if (errorCodes.includes('invalid-input-secret')) {
        // Log but don't expose internal config issues
        console.error('❌ CRITICAL: Invalid reCAPTCHA secret key configured');
        errorMessage = 'Bot protection service error';
        statusCode = 500;
      }
      
      return new Response(
        JSON.stringify({ 
          valid: false, 
          score: 0, 
          action: verifyData.action || action,
          error: errorMessage,
          code: errorCodes[0] || 'VERIFICATION_FAILED'
        }),
        { status: statusCode, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Check score threshold (v3 specific)
    const score = verifyData.score ?? 0;
    const isValid = score >= SCORE_THRESHOLD;

    if (!isValid) {
      console.warn(`❌ reCAPTCHA score too low: ${score} < ${SCORE_THRESHOLD} (likely bot)`);
      return new Response(
        JSON.stringify({
          valid: false,
          score: score,
          action: verifyData.action || action,
          error: 'Verification failed - suspicious activity detected',
          code: 'LOW_SCORE'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY: Optionally validate action matches expected action
    if (action && verifyData.action && verifyData.action !== action) {
      console.warn(`⚠️ Action mismatch: expected=${action}, received=${verifyData.action}`);
      // This is suspicious but not necessarily invalid - log and continue
    }

    // ✅ All checks passed - human verified
    console.log(`✅ reCAPTCHA verified: score=${score}, action=${verifyData.action}`);
    return new Response(
      JSON.stringify({
        valid: true,
        score: score,
        action: verifyData.action || action,
        reason: 'Verified'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ reCAPTCHA verification error:', errorMessage);
    
    // SECURITY: Don't allow bypass on errors - reject the request
    return new Response(
      JSON.stringify({ 
        valid: false, 
        score: 0, 
        error: 'Bot verification service unavailable',
        code: 'SERVICE_ERROR'
      }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
