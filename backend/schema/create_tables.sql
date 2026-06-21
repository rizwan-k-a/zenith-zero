-- Aureon Global Bank — Enterprise Identity Data Layer
-- All tables connected relationally via employee_id

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLE 1: EMPLOYEES (Master Identity Table)
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  department TEXT NOT NULL,
  region TEXT NOT NULL,
  designation TEXT NOT NULL,
  employment_status TEXT NOT NULL CHECK (employment_status IN ('active', 'terminated', 'suspended', 'on_leave')),
  join_date DATE NOT NULL,
  termination_date DATE,
  manager_id TEXT,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 2: PLATFORM ACCOUNTS
CREATE TABLE IF NOT EXISTS platform_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id TEXT NOT NULL UNIQUE,
  employee_id TEXT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  username TEXT NOT NULL,
  account_status TEXT NOT NULL CHECK (account_status IN ('active', 'disabled', 'suspended', 'expired')),
  last_login TIMESTAMPTZ,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  created_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 3: GROUP_MEMBERSHIPS
CREATE TABLE IF NOT EXISTS group_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id TEXT NOT NULL,
  employee_id TEXT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  group_name TEXT NOT NULL,
  parent_group TEXT,
  membership_type TEXT NOT NULL CHECK (membership_type IN ('direct', 'inherited', 'nested', 'delegated')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 4: PERMISSIONS
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  permission_id TEXT NOT NULL UNIQUE,
  employee_id TEXT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  permission_level TEXT NOT NULL CHECK (permission_level IN ('Read', 'Write', 'Delete', 'Execute', 'Admin', 'SuperAdmin')),
  granted_date DATE NOT NULL,
  last_used TIMESTAMPTZ,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 5: IDENTITY_RELATIONSHIPS
CREATE TABLE IF NOT EXISTS identity_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id TEXT NOT NULL UNIQUE,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('member_of', 'inherits', 'assume_role', 'delegated_access', 'owns_token', 'manages', 'reports_to')),
  platform TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 6: PRIVILEGE_HISTORY
CREATE TABLE IF NOT EXISTS privilege_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  history_id TEXT NOT NULL UNIQUE,
  employee_id TEXT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  platform TEXT NOT NULL,
  old_permission TEXT NOT NULL,
  new_permission TEXT NOT NULL,
  change_reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 7: OFFBOARDING_RECORDS
CREATE TABLE IF NOT EXISTS offboarding_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offboard_id TEXT NOT NULL UNIQUE,
  employee_id TEXT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  termination_date DATE NOT NULL,
  hr_status TEXT NOT NULL CHECK (hr_status IN ('complete', 'pending', 'overdue')),
  ad_status TEXT NOT NULL CHECK (ad_status IN ('disabled', 'active', 'unknown')),
  azure_status TEXT NOT NULL CHECK (azure_status IN ('disabled', 'active', 'unknown')),
  aws_status TEXT NOT NULL CHECK (aws_status IN ('disabled', 'active', 'unknown')),
  okta_status TEXT NOT NULL CHECK (okta_status IN ('disabled', 'active', 'unknown')),
  salesforce_status TEXT NOT NULL CHECK (salesforce_status IN ('disabled', 'active', 'unknown')),
  residual_access_found BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 8: TEMPORARY_ACCESS
CREATE TABLE IF NOT EXISTS temporary_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  temp_access_id TEXT NOT NULL UNIQUE,
  employee_id TEXT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  access_granted TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  current_status TEXT NOT NULL CHECK (current_status IN ('active', 'expired', 'revoked', 'extended')),
  still_active BOOLEAN DEFAULT FALSE,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 9: SERVICE_ACCOUNTS
CREATE TABLE IF NOT EXISTS service_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_account_id TEXT NOT NULL UNIQUE,
  owner_employee_id TEXT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  privilege_level TEXT NOT NULL CHECK (privilege_level IN ('Read', 'Write', 'Admin', 'SuperAdmin')),
  last_used TIMESTAMPTZ,
  token_active BOOLEAN DEFAULT FALSE,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 10: API_TOKENS
CREATE TABLE IF NOT EXISTS api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id TEXT NOT NULL UNIQUE,
  employee_id TEXT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  token_name TEXT NOT NULL,
  created_date DATE NOT NULL,
  last_used TIMESTAMPTZ,
  rotated BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 11: AUDIT_LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id TEXT NOT NULL UNIQUE,
  employee_id TEXT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  action_type TEXT NOT NULL,
  resource TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  anomaly_score REAL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 12: COMPLIANCE_VIOLATIONS
CREATE TABLE IF NOT EXISTS compliance_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  violation_id TEXT NOT NULL UNIQUE,
  employee_id TEXT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  framework TEXT NOT NULL,
  control TEXT NOT NULL,
  violation_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policies
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_employees" ON employees FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_employees" ON employees FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_employees" ON employees FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "delete_employees" ON employees FOR DELETE TO anon, authenticated USING (true);

ALTER TABLE platform_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_pa" ON platform_accounts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_pa" ON platform_accounts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_pa" ON platform_accounts FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "delete_pa" ON platform_accounts FOR DELETE TO anon, authenticated USING (true);

ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_gm" ON group_memberships FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_gm" ON group_memberships FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_gm" ON group_memberships FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "delete_gm" ON group_memberships FOR DELETE TO anon, authenticated USING (true);

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_perm" ON permissions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_perm" ON permissions FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_perm" ON permissions FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "delete_perm" ON permissions FOR DELETE TO anon, authenticated USING (true);

ALTER TABLE identity_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_ir" ON identity_relationships FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_ir" ON identity_relationships FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_ir" ON identity_relationships FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "delete_ir" ON identity_relationships FOR DELETE TO anon, authenticated USING (true);

ALTER TABLE privilege_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_ph" ON privilege_history FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_ph" ON privilege_history FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_ph" ON privilege_history FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "delete_ph" ON privilege_history FOR DELETE TO anon, authenticated USING (true);

ALTER TABLE offboarding_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_ob" ON offboarding_records FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_ob" ON offboarding_records FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_ob" ON offboarding_records FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "delete_ob" ON offboarding_records FOR DELETE TO anon, authenticated USING (true);

ALTER TABLE temporary_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_ta" ON temporary_access FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_ta" ON temporary_access FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_ta" ON temporary_access FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "delete_ta" ON temporary_access FOR DELETE TO anon, authenticated USING (true);

ALTER TABLE service_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_sa" ON service_accounts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_sa" ON service_accounts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_sa" ON service_accounts FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "delete_sa" ON service_accounts FOR DELETE TO anon, authenticated USING (true);

ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_at" ON api_tokens FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_at" ON api_tokens FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_at" ON api_tokens FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "delete_at" ON api_tokens FOR DELETE TO anon, authenticated USING (true);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_al" ON audit_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_al" ON audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_al" ON audit_logs FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "delete_al" ON audit_logs FOR DELETE TO anon, authenticated USING (true);

ALTER TABLE compliance_violations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_cv" ON compliance_violations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "insert_cv" ON compliance_violations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "update_cv" ON compliance_violations FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "delete_cv" ON compliance_violations FOR DELETE TO anon, authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_region ON employees(region);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_pa_employee ON platform_accounts(employee_id);
CREATE INDEX IF NOT EXISTS idx_pa_platform ON platform_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_gm_employee ON group_memberships(employee_id);
CREATE INDEX IF NOT EXISTS idx_perm_employee ON permissions(employee_id);
CREATE INDEX IF NOT EXISTS idx_ir_source ON identity_relationships(source_id);
CREATE INDEX IF NOT EXISTS idx_ir_target ON identity_relationships(target_id);
CREATE INDEX IF NOT EXISTS idx_ph_employee ON privilege_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_ob_employee ON offboarding_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_ta_employee ON temporary_access(employee_id);
CREATE INDEX IF NOT EXISTS idx_sa_owner ON service_accounts(owner_employee_id);
CREATE INDEX IF NOT EXISTS idx_at_employee ON api_tokens(employee_id);
CREATE INDEX IF NOT EXISTS idx_al_employee ON audit_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_al_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_cv_employee ON compliance_violations(employee_id);

-- Dashboard views
CREATE OR REPLACE VIEW v_employee_risk_summary AS
SELECT
  e.employee_id,
  e.full_name,
  e.department,
  e.region,
  e.employment_status,
  e.risk_level,
  COUNT(DISTINCT pa.id) AS account_count,
  COUNT(DISTINCT p.id) AS permission_count,
  COUNT(DISTINCT p.id) FILTER (WHERE p.is_admin = TRUE) AS admin_permissions,
  COUNT(DISTINCT sa.id) AS service_accounts,
  COUNT(DISTINCT at.id) AS api_tokens,
  COUNT(DISTINCT cv.id) AS violations,
  MAX(pa.last_login) AS last_login
FROM employees e
LEFT JOIN platform_accounts pa ON e.employee_id = pa.employee_id
LEFT JOIN permissions p ON e.employee_id = p.employee_id
LEFT JOIN service_accounts sa ON e.employee_id = sa.owner_employee_id
LEFT JOIN api_tokens at ON e.employee_id = at.employee_id
LEFT JOIN compliance_violations cv ON e.employee_id = cv.employee_id
GROUP BY e.employee_id, e.full_name, e.department, e.region, e.employment_status, e.risk_level;

CREATE OR REPLACE VIEW v_zombie_accounts AS
SELECT
  e.employee_id,
  e.full_name,
  e.department,
  e.termination_date,
  pa.platform,
  pa.account_status,
  pa.last_login,
  'Zombie Credential' AS detection_type,
  e.risk_level
FROM employees e
JOIN platform_accounts pa ON e.employee_id = pa.employee_id
WHERE e.employment_status = 'terminated'
  AND pa.account_status = 'active';

CREATE OR REPLACE VIEW v_privilege_creep AS
SELECT
  e.employee_id,
  e.full_name,
  e.department,
  ph.old_permission,
  ph.new_permission,
  ph.change_reason,
  ph.month,
  ph.platform,
  CASE
    WHEN ph.new_permission = 'SuperAdmin' AND ph.old_permission = 'Admin' THEN 'high'
    WHEN ph.new_permission = 'Admin' AND ph.old_permission = 'Write' THEN 'medium'
    WHEN ph.new_permission IN ('Admin', 'SuperAdmin') THEN 'critical'
    ELSE 'low'
  END AS creep_risk
FROM employees e
JOIN privilege_history ph ON e.employee_id = ph.employee_id
WHERE ph.new_permission != ph.old_permission;
