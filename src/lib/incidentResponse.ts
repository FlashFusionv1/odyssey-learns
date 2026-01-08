/**
 * Incident Response Playbooks
 * Automated responses to common security incidents
 */

import { supabase } from '@/integrations/supabase/client';

export interface SecurityIncident {
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  type: string;
  message: string;
  metadata: Record<string, any>;
}

/**
 * Send security alert to monitoring systems
 */
async function sendSecurityAlert(incident: SecurityIncident) {
  try {
    await supabase.from('security_alerts').insert({
      severity: incident.severity,
      alert_type: incident.type,
      message: incident.message,
      metadata: incident.metadata,
    });

    // For critical alerts, could also send to external monitoring
    if (incident.severity === 'critical' || incident.severity === 'high') {
      console.error(`SECURITY ALERT [${incident.severity}]: ${incident.type}`, incident);
    }
  } catch (error) {
    console.error('Failed to send security alert:', error);
  }
}

/**
 * Block an IP address temporarily
 */
async function blockIP(ipAddress: string, duration: string = '15 minutes') {
  const expiresAt = new Date();
  if (duration.includes('minute')) {
    const minutes = parseInt(duration);
    expiresAt.setMinutes(expiresAt.getMinutes() + minutes);
  } else if (duration.includes('hour')) {
    const hours = parseInt(duration);
    expiresAt.setHours(expiresAt.getHours() + hours);
  }

  await supabase.from('ip_blocklist').insert({
    ip_address: ipAddress,
    reason: 'Automated block due to suspicious activity',
    expires_at: expiresAt.toISOString(),
  });
}

/**
 * Log incident to database
 */
async function logIncident(type: string, metadata: Record<string, any>) {
  await supabase.from('security_alerts').insert({
    severity: 'medium',
    alert_type: type,
    message: `Incident logged: ${type}`,
    metadata,
  });
}

/**
 * Incident Response Playbooks
 */
export const IncidentPlaybooks = {
  /**
   * Brute Force Attack Response
   */
  brute_force_attack: async (metadata: {
    ip_address: string;
    email?: string;
    failureCount: number;
  }) => {
    // Step 1: Block IP
    await blockIP(metadata.ip_address, '1 hour');

    // Step 2: Send alert
    await sendSecurityAlert({
      severity: 'high',
      type: 'brute_force_attack',
      message: `Brute force attack detected from IP ${metadata.ip_address}`,
      metadata,
    });

    // Step 3: Log incident
    await logIncident('brute_force_attack', metadata);

    // Step 4: Notify user if account exists (done via email service)
    console.log(`Brute force detected for ${metadata.email || 'unknown email'}`);
  },

  /**
   * Data Breach Suspected Response
   */
  data_breach_suspected: async (metadata: {
    user_id: string;
    email: string;
    anomalyType: string;
  }) => {
    // Step 1: Send critical alert
    await sendSecurityAlert({
      severity: 'critical',
      type: 'data_breach_suspected',
      message: `Potential data breach detected for user ${metadata.user_id}`,
      metadata,
    });

    // Step 2: Log incident
    await logIncident('data_breach_suspected', metadata);

    // Step 3: Create alert for manual review
    console.error('DATA BREACH SUSPECTED - MANUAL REVIEW REQUIRED', metadata);
  },

  /**
   * Excessive Data Access Response
   */
  excessive_data_access: async (metadata: {
    user_id: string;
    table: string;
    accessCount: number;
    baseline: number;
  }) => {
    await sendSecurityAlert({
      severity: 'medium',
      type: 'excessive_data_access',
      message: `User ${metadata.user_id} accessing ${metadata.table} at ${Math.round(metadata.accessCount / metadata.baseline)}x normal rate`,
      metadata,
    });

    await logIncident('excessive_data_access', metadata);
  },

  /**
   * Admin Privilege Escalation Response
   */
  admin_privilege_escalation: async (metadata: {
    user_id: string;
    granted_by: string;
    role: string;
  }) => {
    await sendSecurityAlert({
      severity: 'critical',
      type: 'admin_privilege_escalation',
      message: `Admin role granted to user ${metadata.user_id} by ${metadata.granted_by}`,
      metadata,
    });

    await logIncident('admin_privilege_escalation', metadata);
  },

  /**
   * Rate Limit Abuse Response
   */
  rate_limit_abuse: async (metadata: {
    user_id?: string;
    ip_address: string;
    endpoint: string;
    violationCount: number;
  }) => {
    if (metadata.violationCount > 5) {
      await blockIP(metadata.ip_address, '30 minutes');
    }

    await sendSecurityAlert({
      severity: metadata.violationCount > 10 ? 'high' : 'medium',
      type: 'rate_limit_abuse',
      message: `Rate limit abuse detected from ${metadata.ip_address}`,
      metadata,
    });

    await logIncident('rate_limit_abuse', metadata);
  },
};

/**
 * Detect brute force attempts
 */
export async function detectBruteForce(email: string, ipAddress: string) {
  const { data: recentFailures } = await supabase
    .from('failed_auth_attempts')
    .select('*')
    .eq('ip_address', ipAddress)
    .gte('attempted_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());

  if (recentFailures && recentFailures.length >= 5) {
    await IncidentPlaybooks.brute_force_attack({
      ip_address: ipAddress,
      email,
      failureCount: recentFailures.length,
    });
    return true;
  }

  return false;
}

/**
 * Detect anomalous data access
 */
export async function detectAnomalousAccess(
  userId: string,
  tableName: string,
  currentAccessCount: number
) {
  const { data: baseline } = await supabase
    .from('user_access_baselines')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (baseline) {
    const patterns = baseline.table_access_patterns as Record<string, number>;
    const averageAccess = patterns[tableName] || 0;

    if (currentAccessCount > averageAccess * 5) {
      await IncidentPlaybooks.excessive_data_access({
        user_id: userId,
        table: tableName,
        accessCount: currentAccessCount,
        baseline: averageAccess,
      });
      return true;
    }
  }

  return false;
}
