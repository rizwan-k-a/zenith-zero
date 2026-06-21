# Bharat Secure Bank — Full Data Seeding Script
# Seeds all Supabase tables with realistic Indian banking data
# Usage: python seed_data.py
#
# Prerequisites:
#   - VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env (or environment)
#   - Auth users must be created first via the edge function or Supabase dashboard:
#     admin@bharatsecurebank.in / SecureBank@123
#     analyst@bharatsecurebank.in / SecureBank@123
#     auditor@bharatsecurebank.in / SecureBank@123
#
# This script purges all existing data before seeding.

import os
import sys
import time
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("VITE_SUPABASE_ANON_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("ERROR: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env")
    sys.exit(1)

try:
    from supabase import create_client
except ImportError:
    print("Installing supabase-py...")
    os.system(f"{sys.executable} -m pip install supabase")
    from supabase import create_client

from seed_generator import (
    generate_employees, generate_platform_accounts, generate_group_memberships,
    generate_permissions, generate_service_accounts, generate_api_tokens,
    generate_audit_logs, generate_compliance_violations, generate_identity_relationships,
    generate_offboarding_records, generate_temporary_access, generate_privilege_history,
    generate_user_roles,
)

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
BATCH_SIZE = 500


def batch_insert(table: str, rows: list):
    if not rows:
        return 0
    inserted = 0
    for i in range(0, len(rows), BATCH_SIZE):
        chunk = rows[i:i + BATCH_SIZE]
        try:
            result = supabase.table(table).insert(chunk).execute()
            inserted += len(chunk)
        except Exception as e:
            # Try individual rows
            for row in chunk:
                try:
                    supabase.table(table).insert(row).execute()
                    inserted += 1
                except Exception as e2:
                    if "duplicate" not in str(e2).lower() and "unique" not in str(e2).lower():
                        print(f"  {table} row error: {e2}")
        if inserted % 1000 == 0:
            print(f"  {table}: {inserted}/{len(rows)}")
    return inserted


def purge_all():
    tables = [
        "audit_logs", "compliance_violations", "api_tokens", "service_accounts",
        "temporary_access", "offboarding_records", "privilege_history",
        "identity_relationships", "permissions", "group_memberships",
        "platform_accounts", "lifecycle_events", "revocation_requests",
        "residual_access_violations", "cross_dep_locks", "employees", "user_roles",
    ]
    for table in tables:
        try:
            supabase.table(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        except Exception:
            pass
    print("Purged all tables")


def main():
    print("=" * 60)
    print("Bharat Secure Bank — Data Seeding")
    print("=" * 60)

    # Step 1: Purge
    print("\n[1/15] Purging old data...")
    purge_all()

    # Step 2: User roles
    print("\n[2/15] Inserting user roles...")
    roles = generate_user_roles()
    batch_insert("user_roles", roles)
    print(f"  Inserted {len(roles)} user roles")

    # Step 3: Employees
    print("\n[3/15] Generating 5000 employees...")
    employees = generate_employees(5000)
    batch_insert("employees", employees)
    print(f"  Inserted {len(employees)} employees")

    # Step 4: Platform accounts
    print("\n[4/15] Generating platform accounts...")
    accounts = generate_platform_accounts(employees)
    batch_insert("platform_accounts", accounts)
    print(f"  Inserted {len(accounts)} platform accounts")

    # Step 5: Group memberships
    print("\n[5/15] Generating group memberships...")
    groups = generate_group_memberships(employees)
    batch_insert("group_memberships", groups)
    print(f"  Inserted {len(groups)} group memberships")

    # Step 6: Permissions
    print("\n[6/15] Generating permissions...")
    perms = generate_permissions(employees)
    batch_insert("permissions", perms)
    print(f"  Inserted {len(perms)} permissions")

    # Step 7: Identity relationships
    print("\n[7/15] Generating identity relationships...")
    rels = generate_identity_relationships(employees, 10000)
    batch_insert("identity_relationships", rels)
    print(f"  Inserted {len(rels)} identity relationships")

    # Step 8: Privilege history
    print("\n[8/15] Generating privilege history...")
    history = generate_privilege_history(employees)
    batch_insert("privilege_history", history)
    print(f"  Inserted {len(history)} privilege history records")

    # Step 9: Offboarding records
    print("\n[9/15] Generating offboarding records...")
    offboard = generate_offboarding_records(employees)
    batch_insert("offboarding_records", offboard)
    print(f"  Inserted {len(offboard)} offboarding records")

    # Step 10: Temporary access
    print("\n[10/15] Generating temporary access...")
    temp_access = generate_temporary_access(employees)
    batch_insert("temporary_access", temp_access)
    print(f"  Inserted {len(temp_access)} temporary access records")

    # Step 11: Service accounts
    print("\n[11/15] Generating 1000 service accounts...")
    svc_accounts = generate_service_accounts(employees, 1000)
    batch_insert("service_accounts", svc_accounts)
    print(f"  Inserted {len(svc_accounts)} service accounts")

    # Step 12: API tokens
    print("\n[12/15] Generating 1500 API tokens...")
    tokens = generate_api_tokens(employees, 1500)
    batch_insert("api_tokens", tokens)
    print(f"  Inserted {len(tokens)} API tokens")

    # Step 13: Audit logs
    print("\n[13/15] Generating 25000 audit logs...")
    logs = generate_audit_logs(employees, 25000)
    batch_insert("audit_logs", logs)
    print(f"  Inserted {len(logs)} audit logs")

    # Step 14: Compliance violations
    print("\n[14/15] Generating 3000 compliance violations...")
    violations = generate_compliance_violations(employees, 3000)
    batch_insert("compliance_violations", violations)
    print(f"  Inserted {len(violations)} compliance violations")

    # Summary
    print("\n" + "=" * 60)
    print("SEEDING COMPLETE")
    print("=" * 60)
    print(f"  Employees:          {len(employees)}")
    print(f"  Platform Accounts:   {len(accounts)}")
    print(f"  Group Memberships:   {len(groups)}")
    print(f"  Permissions:         {len(perms)}")
    print(f"  Identity Relations:  {len(rels)}")
    print(f"  Privilege History:   {len(history)}")
    print(f"  Offboarding Records: {len(offboard)}")
    print(f"  Temporary Access:    {len(temp_access)}")
    print(f"  Service Accounts:    {len(svc_accounts)}")
    print(f"  API Tokens:          {len(tokens)}")
    print(f"  Audit Logs:          {len(logs)}")
    print(f"  Compliance Violations: {len(violations)}")
    print(f"  User Roles:          {len(roles)}")
    print("\n  Organization: Bharat Secure Bank")
    print("  Auth Users:")
    print("    admin@bharatsecurebank.in / SecureBank@123 (Admin)")
    print("    analyst@bharatsecurebank.in / SecureBank@123 (Security Analyst)")
    print("    auditor@bharatsecurebank.in / SecureBank@123 (Auditor)")
    print("=" * 60)

    print("\n[15/15] NOTE: Auth users must be created in Supabase Dashboard > Authentication")
    print("  Or invoke the edge function: POST /functions/v1/seed-enterprise-data")
    print("  The edge function handles both auth user creation and data seeding.")


if __name__ == "__main__":
    main()
