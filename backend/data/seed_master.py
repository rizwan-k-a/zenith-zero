#!/usr/bin/env python3
"""
Full Database Regeneration Pipeline for BharatSecure Bank
Run this script to completely wipe and rebuild all data.
"""

import sys
sys.path.insert(0, '/tmp/cc-agent/68062460/project/backend/data')

from config import COUNTS
from utils.supabase_client import get_client
from utils.cleanup import wipe_database, cleanup_user_roles
from utils.batch_insert import insert_batches, verify_count

from generators.employee_generator import generate_employees
from generators.account_generator import generate_platform_accounts
from generators.permission_generator import generate_permissions
from generators.group_generator import generate_group_memberships
from generators.service_generator import generate_service_accounts
from generators.token_generator import generate_api_tokens
from generators.temporary_access_generator import generate_temporary_access
from generators.offboarding_generator import generate_offboarding_records
from generators.privilege_history_generator import generate_privilege_history
from generators.compliance_generator import generate_compliance_violations
from generators.audit_log_generator import generate_audit_logs
from generators.relationship_generator import generate_identity_relationships
from generators.notification_generator import generate_notifications
from generators.metrics_generator import generate_security_metrics_history

def phase_1_cleanup():
    print("\n" + "="*60)
    print("PHASE 1: COMPLETE DATABASE CLEANUP")
    print("="*60)

    wipe_database()

    keep_emails = [
        "admin@bharatsecurebank.in",
        "analyst@bharatsecurebank.in",
        "auditor@bharatsecurebank.in",
    ]
    cleanup_user_roles(keep_emails)

    print("\nPHASE 1 COMPLETE: Database wiped")

def phase_2_seed_employees(employee_ids):
    print("\n" + "="*60)
    print("STEP 1: Employees (Foundation)")
    print("="*60)
    employees = generate_employees()
    insert_batches("employees", employees)
    employee_ids = [e["employee_id"] for e in employees]
    print(f"Generated {len(employee_ids)} employee IDs")
    return employee_ids

def phase_3_seed_all(employee_ids):
    print("\n" + "="*60)
    print("PHASE 3: SEED ALL DATA (DEPENDENCY ORDER)")
    print("="*60)

    print("\n--- STEP 2: Platform Accounts ---")
    accounts = generate_platform_accounts(employee_ids)
    insert_batches("platform_accounts", accounts)

    print("\n--- STEP 3: Permissions ---")
    permissions = generate_permissions(employee_ids)
    insert_batches("permissions", permissions)

    print("\n--- STEP 4: Group Memberships ---")
    groups = generate_group_memberships(employee_ids)
    insert_batches("group_memberships", groups)

    print("\n--- STEP 5: Service Accounts ---")
    services = generate_service_accounts(employee_ids)
    insert_batches("service_accounts", services)

    print("\n--- STEP 6: API Tokens ---")
    tokens = generate_api_tokens(employee_ids)
    insert_batches("api_tokens", tokens)

    print("\n--- STEP 7: Temporary Access ---")
    temp_access = generate_temporary_access(employee_ids)
    insert_batches("temporary_access", temp_access)

    print("\n--- STEP 8: Offboarding Records ---")
    offboarding = generate_offboarding_records(employee_ids)
    insert_batches("offboarding_records", offboarding)

    print("\n--- STEP 9: Privilege History ---")
    history = generate_privilege_history(employee_ids)
    insert_batches("privilege_history", history)

    print("\n--- STEP 10: Compliance Violations ---")
    compliance = generate_compliance_violations(employee_ids)
    insert_batches("compliance_violations", compliance)

    print("\n--- STEP 11: Audit Logs ---")
    audit_logs = generate_audit_logs(employee_ids)
    insert_batches("audit_logs", audit_logs)

    print("\n--- STEP 12: Identity Relationships ---")
    relationships = generate_identity_relationships(employee_ids)
    insert_batches("identity_relationships", relationships)

    print("\n--- STEP 13: Notifications ---")
    try:
        notifications = generate_notifications(employee_ids)
        insert_batches("notifications", notifications)
    except Exception as e:
        print(f"Notifications insert skipped: {e}")

    print("\n--- STEP 14: Security Metrics History ---")
    try:
        metrics = generate_security_metrics_history()
        insert_batches("security_metrics_history", metrics)
    except Exception as e:
        print(f"Metrics insert skipped: {e}")

    print("\nPHASE 3 COMPLETE: All data seeded")

def phase_4_verify():
    print("\n" + "="*60)
    print("PHASE 4: VERIFICATION")
    print("="*60)

    verify_count("employees", COUNTS["employees"])
    verify_count("platform_accounts", COUNTS["platform_accounts"])
    verify_count("permissions", COUNTS["permissions"])
    verify_count("group_memberships", COUNTS["group_memberships"])
    verify_count("service_accounts", COUNTS["service_accounts"])
    verify_count("api_tokens", COUNTS["api_tokens"])
    verify_count("temporary_access", COUNTS["temporary_access"])
    verify_count("offboarding_records", COUNTS["offboarding_records"])
    verify_count("privilege_history", COUNTS["privilege_history"])
    verify_count("compliance_violations", COUNTS["compliance_violations"])
    verify_count("audit_logs", COUNTS["audit_logs"])
    verify_count("identity_relationships", COUNTS["identity_relationships"])

    try:
        verify_count("notifications", COUNTS["notifications"])
    except Exception:
        print("  notifications: Table verification skipped")

    try:
        metrics = generate_security_metrics_history()
        verify_count("security_metrics_history", len(metrics))
    except Exception:
        print("  security_metrics_history: Table verification skipped")

    print("\nPHASE 4 COMPLETE: Verification done")

def main():
    print("="*60)
    print("BHARATSECURE BANK - FULL DATABASE REGENERATION")
    print("="*60)

    phase_1_cleanup()

    employee_ids = []
    employee_ids = phase_2_seed_employees(employee_ids)

    phase_3_seed_all(employee_ids)

    phase_4_verify()

    print("\n" + "="*60)
    print("REGENERATION COMPLETE")
    print("="*60)

if __name__ == "__main__":
    main()
