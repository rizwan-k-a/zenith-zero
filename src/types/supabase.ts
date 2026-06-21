export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      employees: {
        Row: {
          id: string
          employee_id: string
          full_name: string
          email: string
          department: string
          region: string
          designation: string
          employment_status: 'active' | 'terminated' | 'suspended' | 'on_leave'
          join_date: string
          termination_date: string | null
          manager_id: string | null
          risk_level: 'low' | 'medium' | 'high' | 'critical'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['employees']['Insert']>
      }
      platform_accounts: {
        Row: {
          id: string
          account_id: string
          employee_id: string
          platform: string
          username: string
          account_status: 'active' | 'disabled' | 'suspended' | 'expired'
          last_login: string | null
          mfa_enabled: boolean
          created_date: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['platform_accounts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['platform_accounts']['Insert']>
      }
      permissions: {
        Row: {
          id: string
          permission_id: string
          employee_id: string
          platform: string
          resource_name: string
          permission_level: 'Read' | 'Write' | 'Delete' | 'Execute' | 'Admin' | 'SuperAdmin'
          granted_date: string
          last_used: string | null
          is_admin: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['permissions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['permissions']['Insert']>
      }
      group_memberships: {
        Row: {
          id: string
          group_id: string
          employee_id: string
          platform: string
          group_name: string
          parent_group: string | null
          membership_type: 'direct' | 'inherited' | 'nested' | 'delegated'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['group_memberships']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['group_memberships']['Insert']>
      }
      identity_relationships: {
        Row: {
          id: string
          relationship_id: string
          source_id: string
          target_id: string
          relationship_type: 'member_of' | 'inherits' | 'assume_role' | 'delegated_access' | 'owns_token' | 'manages' | 'reports_to'
          platform: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['identity_relationships']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['identity_relationships']['Insert']>
      }
      privilege_history: {
        Row: {
          id: string
          history_id: string
          employee_id: string
          month: string
          platform: string
          old_permission: string
          new_permission: string
          change_reason: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['privilege_history']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['privilege_history']['Insert']>
      }
      offboarding_records: {
        Row: {
          id: string
          offboard_id: string
          employee_id: string
          termination_date: string
          hr_status: 'complete' | 'pending' | 'overdue'
          ad_status: 'disabled' | 'active' | 'unknown'
          azure_status: 'disabled' | 'active' | 'unknown'
          aws_status: 'disabled' | 'active' | 'unknown'
          okta_status: 'disabled' | 'active' | 'unknown'
          salesforce_status: 'disabled' | 'active' | 'unknown'
          residual_access_found: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['offboarding_records']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['offboarding_records']['Insert']>
      }
      temporary_access: {
        Row: {
          id: string
          temp_access_id: string
          employee_id: string
          platform: string
          access_granted: string
          expiry_date: string
          current_status: 'active' | 'expired' | 'revoked' | 'extended'
          still_active: boolean
          risk_level: 'low' | 'medium' | 'high' | 'critical'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['temporary_access']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['temporary_access']['Insert']>
      }
      api_tokens: {
        Row: {
          id: string
          token_id: string
          employee_id: string
          platform: string
          token_name: string
          created_date: string
          last_used: string | null
          rotated: boolean
          active: boolean
          risk_level: 'low' | 'medium' | 'high' | 'critical'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['api_tokens']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['api_tokens']['Insert']>
      }
      service_accounts: {
        Row: {
          id: string
          service_account_id: string
          owner_employee_id: string
          service_name: string
          platform: string
          privilege_level: 'Read' | 'Write' | 'Admin' | 'SuperAdmin'
          last_used: string | null
          token_active: boolean
          risk_level: 'low' | 'medium' | 'high' | 'critical'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['service_accounts']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['service_accounts']['Insert']>
      }
      audit_logs: {
        Row: {
          id: string
          log_id: string
          employee_id: string
          platform: string
          action_type: string
          resource: string
          timestamp: string
          location: string
          anomaly_score: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
      }
      compliance_violations: {
        Row: {
          id: string
          violation_id: string
          employee_id: string
          framework: string
          control: string
          violation_type: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          status: 'open' | 'in_progress' | 'resolved' | 'dismissed'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['compliance_violations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['compliance_violations']['Insert']>
      }
      user_roles: {
        Row: {
          id: string
          email: string
          role: 'Admin' | 'Security Analyst' | 'Auditor'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_roles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_roles']['Insert']>
      }
      lifecycle_events: {
        Row: {
          id: string
          event_type: string
          employee_id: string | null
          employee_name: string | null
          platform: string | null
          account_id: string | null
          action_detail: string
          performed_by: string
          severity: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['lifecycle_events']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['lifecycle_events']['Insert']>
      }
      revocation_requests: {
        Row: {
          id: string
          employee_id: string
          employee_name: string
          platform: string
          account_id: string
          access_level: string
          system_type: string
          criticality: string
          requested_by: string
          approved_by: string | null
          status: 'pending' | 'approved' | 'rejected' | 'executed'
          notes: string | null
          created_at: string
          resolved_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['revocation_requests']['Row'], 'id' | 'created_at' | 'resolved_at'>
        Update: Partial<Database['public']['Tables']['revocation_requests']['Insert']>
      }
      residual_access_violations: {
        Row: {
          id: string
          employee_id: string
          employee_name: string
          termination_date: string
          platform: string
          account_id: string
          access_level: string
          severity: 'low' | 'medium' | 'high' | 'critical'
          status: 'active' | 'resolved'
          detected_at: string
          last_scan_at: string
        }
        Insert: Omit<Database['public']['Tables']['residual_access_violations']['Row'], 'id' | 'detected_at' | 'last_scan_at'>
        Update: Partial<Database['public']['Tables']['residual_access_violations']['Insert']>
      }
      cross_dep_locks: {
        Row: {
          id: string
          employee_id: string
          source_platform: string
          target_platform: string
          trust_path: string
          created_by: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['cross_dep_locks']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['cross_dep_locks']['Insert']>
      }
    }
    Views: {}
    Functions: {
      platform_distribution: { Args: {}; Returns: { platform: string; accounts: number; privileged: number }[] }
      dormant_access_stats: { Args: {}; Returns: { platform: string; dormant30: number; dormant60: number; dormant90: number }[] }
    }
    Enums: {}
    CompositeTypes: {}
  }
}
