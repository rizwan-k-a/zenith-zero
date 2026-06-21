
-- Identity Lifecycle Orchestration Tables

CREATE TABLE IF NOT EXISTS lifecycle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  employee_id text,
  employee_name text,
  platform text,
  account_id text,
  action_detail text NOT NULL,
  performed_by text NOT NULL,
  severity text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lifecycle_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_lifecycle_events" ON lifecycle_events FOR SELECT TO anon USING (true);
CREATE POLICY "insert_lifecycle_events" ON lifecycle_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "update_lifecycle_events" ON lifecycle_events FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "delete_lifecycle_events" ON lifecycle_events FOR DELETE TO anon USING (true);

-- Manual approval workflow for high-critical systems
CREATE TABLE IF NOT EXISTS revocation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text NOT NULL,
  employee_name text NOT NULL,
  platform text NOT NULL,
  account_id text NOT NULL,
  access_level text NOT NULL,
  system_type text NOT NULL,
  criticality text NOT NULL DEFAULT 'critical',
  requested_by text NOT NULL,
  approved_by text,
  status text DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

ALTER TABLE revocation_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_revocation_requests" ON revocation_requests FOR SELECT TO anon USING (true);
CREATE POLICY "insert_revocation_requests" ON revocation_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "update_revocation_requests" ON revocation_requests FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "delete_revocation_requests" ON revocation_requests FOR DELETE TO anon USING (true);

-- Residual access violations (access surviving revocation)
CREATE TABLE IF NOT EXISTS residual_access_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text NOT NULL,
  employee_name text NOT NULL,
  termination_date text,
  platform text NOT NULL,
  account_id text NOT NULL,
  access_level text NOT NULL,
  severity text NOT NULL,
  detected_at timestamptz DEFAULT now(),
  last_scan_at timestamptz DEFAULT now(),
  status text DEFAULT 'active'
);

ALTER TABLE residual_access_violations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_residual_violations" ON residual_access_violations FOR SELECT TO anon USING (true);
CREATE POLICY "insert_residual_violations" ON residual_access_violations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "update_residual_violations" ON residual_access_violations FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "delete_residual_violations" ON residual_access_violations FOR DELETE TO anon USING (true);

-- Cross-dependency locks to block privilege re-creation via alternate trust paths
CREATE TABLE IF NOT EXISTS cross_dep_locks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text NOT NULL,
  source_platform text NOT NULL,
  target_platform text NOT NULL,
  trust_path text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by text NOT NULL
);

ALTER TABLE cross_dep_locks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "select_cross_dep_locks" ON cross_dep_locks FOR SELECT TO anon USING (true);
CREATE POLICY "insert_cross_dep_locks" ON cross_dep_locks FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "update_cross_dep_locks" ON cross_dep_locks FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "delete_cross_dep_locks" ON cross_dep_locks FOR DELETE TO anon USING (true);
