-- Phase 3: Security Monitoring Tables (Fixed)

CREATE TABLE IF NOT EXISTS security_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  acknowledged_by UUID REFERENCES profiles(id),
  acknowledged_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_alerts_severity ON security_alerts(severity, created_at DESC);
CREATE INDEX idx_security_alerts_type ON security_alerts(alert_type, created_at DESC);

CREATE TABLE IF NOT EXISTS failed_auth_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  ip_address INET NOT NULL,
  user_agent TEXT,
  failure_reason TEXT NOT NULL CHECK (failure_reason IN ('invalid_credentials', 'account_locked', 'rate_limited', 'mfa_failed')),
  attempted_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_failed_auth_ip ON failed_auth_attempts(ip_address, attempted_at DESC);
CREATE INDEX idx_failed_auth_email ON failed_auth_attempts(email, attempted_at DESC);

CREATE TABLE IF NOT EXISTS ip_blocklist (
  ip_address INET PRIMARY KEY,
  reason TEXT NOT NULL,
  blocked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS data_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  accessed_table TEXT NOT NULL,
  accessed_record_id UUID,
  access_type TEXT NOT NULL CHECK (access_type IN ('read', 'write', 'delete', 'export')),
  access_count INT DEFAULT 1,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX idx_data_access_user_time ON data_access_audit(user_id, accessed_at DESC);

CREATE TABLE IF NOT EXISTS user_access_baselines (
  user_id UUID PRIMARY KEY REFERENCES profiles(id),
  table_access_patterns JSONB DEFAULT '{}',
  typical_access_times TEXT[] DEFAULT '{}',
  baseline_updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_blocklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_access_baselines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view security alerts" ON security_alerts FOR SELECT
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can manage security alerts" ON security_alerts FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "System can insert failed auth" ON failed_auth_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view failed auth" ON failed_auth_attempts FOR SELECT
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins manage IP blocklist" ON ip_blocklist FOR ALL
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "System insert audit" ON data_access_audit FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins view audit" ON data_access_audit FOR SELECT
USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'));