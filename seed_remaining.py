#!/usr/bin/env python3
import urllib.request, json, sys, random
from datetime import datetime, timedelta, date
from seed_full import (
    generate_employees, generate_platform_accounts, generate_permissions,
    generate_group_memberships, generate_identity_relationships, generate_privilege_history,
    generate_offboarding_records, generate_temporary_access, generate_service_accounts,
    generate_api_tokens, generate_audit_logs, generate_compliance_violations,
    generate_user_roles, BASE_URL, API_KEY, HEADERS
)

random.seed(42)

# Check each table's current count
tables_to_check = {
    'employees': 5000,
    'platform_accounts': 15000,
    'permissions': 20000,
    'group_memberships': 8000,
    'identity_relationships': 5000,
    'privilege_history': 100,
    'offboarding_records': 400,
    'temporary_access': 300,
    'service_accounts': 500,
    'api_tokens': 1000,
    'audit_logs': 10000,
    'compliance_violations': 1000,
    'user_roles': 3,
}

def get_count(table):
    try:
        req = urllib.request.Request(f'{BASE_URL}/{table}?limit=1', headers={**HEADERS, 'Prefer': 'count=exact'})
        resp = urllib.request.urlopen(req, timeout=10)
        ct = resp.headers.get('Content-Range', '')
        if '/' in ct:
            return int(ct.split('/')[-1])
    except:
        pass
    return 0

# Generate all data first
print("Generating all enterprise data...")
employees = generate_employees(5000)
print(f"  employees: {len(employees)}")
accounts = generate_platform_accounts(employees)
print(f"  platform_accounts: {len(accounts)}")
permissions = generate_permissions(employees, accounts)
print(f"  permissions: {len(permissions)}")
groups = generate_group_memberships(employees, accounts)
print(f"  group_memberships: {len(groups)}")
relationships = generate_identity_relationships(employees)
print(f"  identity_relationships: {len(relationships)}")
history = generate_privilege_history(employees)
print(f"  privilege_history: {len(history)}")
offboarding = generate_offboarding_records(employees)
print(f"  offboarding_records: {len(offboarding)}")
temp_access = generate_temporary_access(employees)
print(f"  temporary_access: {len(temp_access)}")
svc_accounts = generate_service_accounts(employees)
print(f"  service_accounts: {len(svc_accounts)}")
tokens = generate_api_tokens(employees)
print(f"  api_tokens: {len(tokens)}")
logs = generate_audit_logs(employees)
print(f"  audit_logs: {len(logs)}")
violations = generate_compliance_violations(employees)
print(f"  compliance_violations: {len(violations)}")
user_roles = generate_user_roles()
print(f"  user_roles: {len(user_roles)}")

# Check and seed each table
print("\nChecking and seeding tables...")

table_data = [
    ('employees', employees),
    ('platform_accounts', accounts),
    ('permissions', permissions),
    ('group_memberships', groups),
    ('identity_relationships', relationships),
    ('privilege_history', history),
    ('offboarding_records', offboarding),
    ('temporary_access', temp_access),
    ('service_accounts', svc_accounts),
    ('api_tokens', tokens),
    ('audit_logs', logs),
    ('compliance_violations', violations),
    ('user_roles', user_roles),
]

for table, records in table_data:
    current_count = get_count(table)
    print(f"\n{table}: {current_count} records")
    if current_count >= len(records) * 0.5:
        print(f"  Skipping (already has enough data)")
        continue
    
    print(f"  Inserting {len(records)} records...")
    inserted = 0
    batch_size = 100
    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        body = json.dumps(batch).encode('utf-8')
        req = urllib.request.Request(f'{BASE_URL}/{table}', headers=HEADERS, data=body, method='POST')
        try:
            resp = urllib.request.urlopen(req, timeout=60)
            if resp.status in (200, 201):
                inserted += len(batch)
                sys.stdout.write(f"\r    {inserted}/{len(records)}")
                sys.stdout.flush()
        except Exception as e:
            try:
                if hasattr(e, 'read'):
                    err = e.read().decode()[:100]
                    if "duplicate" not in err.lower() and "42501" not in err:
                        print(f"\n    Error: {err}")
            except:
                pass
    print(f"\n  Inserted: {inserted}")

print("\nDone! Verifying counts...")
for table, _ in table_data:
    count = get_count(table)
    print(f"  {table}: {count}")
