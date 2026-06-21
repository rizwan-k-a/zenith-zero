/*
# Aureon Global Bank — Enterprise Identity Data Layer
Creates all 12 core tables with indexes, FKs, and RLS policies.
*/

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

CREATE TABLE IF NOT EXISTS identity_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id TEXT NOT NULL UNIQUE,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('member_of', 'inherits', 'assume_role', 'delegated_access', 'owns_token', 'manages', 'reports_to')),
  platform TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id TEXT NOT NULL UNIQUE,
  employee_id TEXT NOT NULL REFERENCES employees(employee_id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  action_type TEXT NOT NULL,
  resource TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  anomaly_score REAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Security Analyst', 'Auditor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lifecycle_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  employee_id TEXT,
  employee_name TEXT,
  platform TEXT,
  account_id TEXT,
  action_detail TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  severity TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS revocation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  platform TEXT NOT NULL,
  account_id TEXT NOT NULL,
  access_level TEXT NOT NULL,
  system_type TEXT NOT NULL,
  criticality TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  approved_by TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'executed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS residual_access_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  termination_date DATE NOT NULL,
  platform TEXT NOT NULL,
  account_id TEXT NOT NULL,
  access_level TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'resolved')),
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  last_scan_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cross_dep_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT NOT NULL,
  source_platform TEXT NOT NULL,
  target_platform TEXT NOT NULL,
  trust_path TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE privilege_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE offboarding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporary_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifecycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE revocation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE residual_access_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_dep_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_employees" ON employees FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_employees" ON employees FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_employees" ON employees FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "anon_delete_employees" ON employees FOR DELETE TO anon, authenticated USING (true);
CREATE POLICY "anon_select_pa" ON platform_accounts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_pa" ON platform_accounts FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_pa" ON platform_accounts FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "anon_delete_pa" ON platform_accounts FOR DELETE TO anon, authenticated USING (true);
CREATE POLICY "anon_select_gm" ON group_memberships FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_select_perm" ON permissions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_update_perm" ON permissions FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "anon_select_ir" ON identity_relationships FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_select_ph" ON privilege_history FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_select_ob" ON offboarding_records FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_select_ta" ON temporary_access FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_update_ta" ON temporary_access FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "anon_select_sa" ON service_accounts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_update_sa" ON service_accounts FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "anon_select_at" ON api_tokens FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_update_at" ON api_tokens FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "anon_select_al" ON audit_logs FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_select_cv" ON compliance_violations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_update_cv" ON compliance_violations FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "anon_select_ur" ON user_roles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_select_le" ON lifecycle_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_le" ON lifecycle_events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_select_rr" ON revocation_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_update_rr" ON revocation_requests FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_rr" ON revocation_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_select_rav" ON residual_access_violations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_update_rav" ON residual_access_violations FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_rav" ON residual_access_violations FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_select_cdl" ON cross_dep_locks FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_cdl" ON cross_dep_locks FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_region ON employees(region);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(employment_status);
CREATE INDEX IF NOT EXISTS idx_employees_risk ON employees(risk_level);
CREATE INDEX IF NOT EXISTS idx_pa_employee ON platform_accounts(employee_id);
CREATE INDEX IF NOT EXISTS idx_pa_platform ON platform_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_pa_status ON platform_accounts(account_status);
CREATE INDEX IF NOT EXISTS idx_gm_employee ON group_memberships(employee_id);
CREATE INDEX IF NOT EXISTS idx_perm_employee ON permissions(employee_id);
CREATE INDEX IF NOT EXISTS idx_perm_level ON permissions(permission_level);
CREATE INDEX IF NOT EXISTS idx_ir_source ON identity_relationships(source_id);
CREATE INDEX IF NOT EXISTS idx_ir_target ON identity_relationships(target_id);
CREATE INDEX IF NOT EXISTS idx_ph_employee ON privilege_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_ob_employee ON offboarding_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_ta_employee ON temporary_access(employee_id);
CREATE INDEX IF NOT EXISTS idx_ta_status ON temporary_access(current_status);
CREATE INDEX IF NOT EXISTS idx_sa_owner ON service_accounts(owner_employee_id);
CREATE INDEX IF NOT EXISTS idx_at_employee ON api_tokens(employee_id);
CREATE INDEX IF NOT EXISTS idx_al_employee ON audit_logs(employee_id);
CREATE INDEX IF NOT EXISTS idx_al_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_cv_employee ON compliance_violations(employee_id);
CREATE INDEX IF NOT EXISTS idx_cv_status ON compliance_violations(status);
CREATE INDEX IF NOT EXISTS idx_le_employee ON lifecycle_events(employee_id);
CREATE INDEX IF NOT EXISTS idx_rr_employee ON revocation_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_rav_employee ON residual_access_violations(employee_id);
