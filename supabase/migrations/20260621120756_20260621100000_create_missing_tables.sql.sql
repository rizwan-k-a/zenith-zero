-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id TEXT NOT NULL UNIQUE,
  employee_id TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  status TEXT NOT NULL CHECK (status IN ('unread', 'read', 'actioned')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create security_metrics_history table
CREATE TABLE IF NOT EXISTS security_metrics_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_id INTEGER NOT NULL UNIQUE,
  month TEXT NOT NULL,
  total_identities INTEGER NOT NULL,
  privileged_accounts INTEGER NOT NULL,
  zombie_accounts INTEGER NOT NULL,
  dormant_accounts INTEGER NOT NULL,
  compliance_violations INTEGER NOT NULL,
  attack_paths INTEGER NOT NULL,
  cross_platform_risks INTEGER NOT NULL,
  temp_access_drift INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_metrics_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "anon_select_notifications" ON notifications FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_select_smh" ON security_metrics_history FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_smh" ON security_metrics_history FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_employee ON notifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_smh_month ON security_metrics_history(month);
