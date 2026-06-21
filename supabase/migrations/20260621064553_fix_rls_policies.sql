/*
# Fix RLS policies — allow INSERT for all tables
*/
DROP POLICY IF EXISTS "anon_insert_employees" ON employees;
CREATE POLICY "anon_insert_employees" ON employees FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_insert_pa" ON platform_accounts;
CREATE POLICY "anon_insert_pa" ON platform_accounts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_insert_gm" ON group_memberships;
CREATE POLICY "anon_insert_gm" ON group_memberships FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_insert_perm" ON permissions;
CREATE POLICY "anon_insert_perm" ON permissions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_insert_ir" ON identity_relationships;
CREATE POLICY "anon_insert_ir" ON identity_relationships FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_insert_ph" ON privilege_history;
CREATE POLICY "anon_insert_ph" ON privilege_history FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_insert_ob" ON offboarding_records;
CREATE POLICY "anon_insert_ob" ON offboarding_records FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_insert_ta" ON temporary_access;
CREATE POLICY "anon_insert_ta" ON temporary_access FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_insert_sa" ON service_accounts;
CREATE POLICY "anon_insert_sa" ON service_accounts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_insert_at" ON api_tokens;
CREATE POLICY "anon_insert_at" ON api_tokens FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_insert_al" ON audit_logs;
CREATE POLICY "anon_insert_al" ON audit_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_insert_cv" ON compliance_violations;
CREATE POLICY "anon_insert_cv" ON compliance_violations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_insert_ur" ON user_roles;
CREATE POLICY "anon_insert_ur" ON user_roles FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_insert_le" ON lifecycle_events;
CREATE POLICY "anon_insert_le" ON lifecycle_events FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_insert_rr" ON revocation_requests;
CREATE POLICY "anon_insert_rr" ON revocation_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_insert_rav" ON residual_access_violations;
CREATE POLICY "anon_insert_rav" ON residual_access_violations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_insert_cdl" ON cross_dep_locks;
CREATE POLICY "anon_insert_cdl" ON cross_dep_locks FOR INSERT TO anon, authenticated WITH CHECK (true);
