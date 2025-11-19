-- Phase 2: COPPA Compliance Tables

-- Parental consent tracking
CREATE TABLE IF NOT EXISTS parental_consent_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('initial', 'privacy_update', 'terms_update', 'data_sharing')),
  consent_version TEXT NOT NULL,
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  consent_text TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_consent_parent ON parental_consent_log(parent_id, consented_at DESC);
CREATE INDEX idx_consent_type_version ON parental_consent_log(consent_type, consent_version);

-- Add consent fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coppa_consent_version TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coppa_consented_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_year INT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT FALSE;

-- Data export audit log
CREATE TABLE IF NOT EXISTS data_export_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id) ON DELETE SET NULL,
  export_format TEXT NOT NULL CHECK (export_format IN ('json', 'csv')),
  export_size_bytes INT,
  exported_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_export_log_parent ON data_export_log(parent_id, exported_at DESC);

-- Child deletion tracking
ALTER TABLE children ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE children ADD COLUMN IF NOT EXISTS deletion_scheduled_at TIMESTAMPTZ;
ALTER TABLE children ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- Enable RLS on new tables
ALTER TABLE parental_consent_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consent log
CREATE POLICY "Parents can view their own consent logs"
  ON parental_consent_log FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "System can insert consent logs"
  ON parental_consent_log FOR INSERT
  WITH CHECK (parent_id = auth.uid());

-- RLS Policies for export log
CREATE POLICY "Parents can view their own export logs"
  ON data_export_log FOR SELECT
  USING (parent_id = auth.uid());

CREATE POLICY "System can insert export logs"
  ON data_export_log FOR INSERT
  WITH CHECK (parent_id = auth.uid());

-- Admins can view all for compliance audits
CREATE POLICY "Admins can view all consent logs"
  ON parental_consent_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can view all export logs"
  ON data_export_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );