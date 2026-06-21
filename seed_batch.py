#!/usr/bin/env python3
import urllib.request, json, sys, re

BASE_URL = 'https://mwzvkewlcpgkzzaoadir.supabase.co/rest/v1'
API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13enZrZXdsY3Bna3p6YW9hZGlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NDQyOTIsImV4cCI6MjA5NzUyMDI5Mn0.gZAqbO9BtUXFFG4td4V0ee-MLGJYuIvyfB9GCBFu_8c'
HEADERS = {
    'apikey': API_KEY,
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates,return=minimal',
}

# Check if already seeded
req = urllib.request.Request(f'{BASE_URL}/employees?limit=1', headers={**HEADERS, 'Prefer': 'count=exact'})
try:
    resp = urllib.request.urlopen(req, timeout=10)
    ct = resp.headers.get('Content-Range', '')
    if '/' in ct:
        existing = int(ct.split('/')[-1])
        print(f'Already seeded: {existing} employees')
        if existing >= 1000:
            sys.exit(0)
except Exception as e:
    print(f'Check error: {e}')

print('Starting seed...')

# Read SQL file
with open('employees_batch_0.sql', 'r') as f:
    sql = f.read()

# Extract the VALUES part
start = sql.find('VALUES (')
end = sql.find(' ON CONFLICT')
values_str = sql[start:end]

# Split by ),( but we need to be careful - the split creates the first and last elements
# with extra parentheses
parts = values_str.split('),(')

# Fix first and last parts
parts[0] = parts[0].replace('VALUES (', '').strip()
parts[-1] = parts[-1].rstrip(')').strip()

records = []
for p in parts:
    # Parse: 'EMP00001', 'Name', 'email', 'dept', 'region', 'desig', 'status', 'date', NULL, 'mgr', 'risk'
    # Split by comma, but commas could be inside quotes - not needed here
    # The format is: 'value', 'value', ..., NULL, 'value', 'value'
    # Simple: split by comma, then strip quotes and spaces
    values = [v.strip().strip("'\"") for v in p.split(',')]
    if len(values) == 11:
        emp_id, full_name, email, dept, region, desig, status, join_date, term_date, manager_id, risk = values
        record = {
            'employee_id': emp_id,
            'full_name': full_name,
            'email': email,
            'department': dept,
            'region': region,
            'designation': desig,
            'employment_status': status,
            'join_date': join_date,
            'termination_date': None if term_date == 'NULL' else term_date,
            'manager_id': None if manager_id == 'NULL' else manager_id,
            'risk_level': risk,
        }
        records.append(record)

print(f'Parsed {len(records)} records')

# Insert in batches - all records must have same keys
batch_size = 100
inserted = 0
for i in range(0, len(records), batch_size):
    batch = records[i:i+batch_size]
    body = json.dumps(batch).encode('utf-8')
    req = urllib.request.Request(f'{BASE_URL}/employees', headers=HEADERS, data=body, method='POST')
    try:
        resp = urllib.request.urlopen(req, timeout=60)
        if resp.status in (200, 201):
            inserted += len(batch)
            print(f'  Inserted {inserted}/{len(records)}')
        else:
            print(f'  Error: HTTP {resp.status}')
    except Exception as e:
        print(f'  Error batch {i//batch_size}: {e}')
        try:
            if hasattr(e, 'read'):
                err = e.read().decode()
                print(f'  Details: {err[:200]}')
        except:
            pass

print(f'\nTotal inserted: {inserted}')
