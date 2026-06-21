#!/usr/bin/env python3
"""
Aureon Global Bank — Enterprise Identity Data Seeding
Automatically creates schema and seeds data when database is available.
Usage: python3 backend/startup.py
"""
import sys
import os
import urllib.request
import urllib.error
import json
from pathlib import Path

# Load env
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(env_path)

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL", "")
ANON_KEY = os.environ.get("VITE_SUPABASE_ANON_KEY", "")
REST_BASE = f"{SUPABASE_URL}/rest/v1"
HEADERS = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates",
}


def check_table(table: str) -> bool:
    """Check if table exists via REST API."""
    url = f"{REST_BASE}/{table}?limit=1"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        resp = urllib.request.urlopen(req, timeout=20)
        return resp.status == 200
    except urllib.error.HTTPError as e:
        if e.code == 404:
            body = e.read().decode()
            return "PGRST205" not in body and "does not exist" not in body
    except Exception:
        pass
    return False


def get_count(table: str) -> int:
    """Get row count."""
    url = f"{REST_BASE}/{table}?limit=1"
    headers = dict(HEADERS)
    headers["Prefer"] = "count=exact"
    req = urllib.request.Request(url, headers=headers)
    try:
        resp = urllib.request.urlopen(req, timeout=20)
        ct = resp.headers.get("Content-Range", "")
        if "/" in ct:
            return int(ct.split("/")[-1])
        data = json.loads(resp.read().decode())
        return len(data)
    except Exception:
        return 0


def batch_insert(table: str, records: list, batch_size: int = 500) -> dict:
    """Insert records in batches."""
    inserted = 0
    errors = []
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        body = json.dumps(batch).encode("utf-8")
        req = urllib.request.Request(
            f"{REST_BASE}/{table}", headers=HEADERS, data=body, method="POST"
        )
        try:
            resp = urllib.request.urlopen(req, timeout=120)
            if resp.status in (200, 201):
                inserted += len(batch)
            else:
                errors.append(f"HTTP {resp.status}")
        except urllib.error.HTTPError as e:
            errors.append(f"{e.code}: {e.read().decode()[:150]}")
        except Exception as ex:
            errors.append(str(ex)[:150])
    return {"inserted": inserted, "errors": errors}


def seed_if_empty():
    print("=" * 60)
    print("Aureon Global Bank — Enterprise Identity Data Seeding")
    print("=" * 60)
    
    tables = [
        "employees", "platform_accounts", "group_memberships", "permissions",
        "identity_relationships", "privilege_history", "offboarding_records",
        "temporary_access", "service_accounts", "api_tokens",
        "audit_logs", "compliance_violations",
    ]
    
    print("\nChecking table availability...")
    available = []
    for t in tables:
        exists = check_table(t)
        print(f"  {'OK' if exists else 'MISSING'} {t}")
        if exists:
            available.append(t)
    
    if not available:
        print("\nNo tables found. The database schema needs to be created first.")
        print("\nPlease run this SQL in the Supabase SQL Editor:")
        print("https://supabase.com/dashboard/project/mwzvkewlcpgkzzaoadir/sql/new")
        print("\nSQL file: backend/schema/create_tables.sql")
        return
    
    # Check if already seeded
    emp_count = get_count("employees")
    if emp_count > 0:
        print(f"\nAlready seeded: {emp_count} employees found. Skipping.")
        return
    
    # Generate data
    print("\nGenerating enterprise data...")
    sys.path.insert(0, str(Path(__file__).parent / "data"))
    from seed_generator import generate_all_data
    data = generate_all_data()
    
    # Insert
    print("\nInserting into database...")
    for table in tables:
        records = data[table]
        print(f"  {table}: {len(records)} records...", end=" ")
        result = batch_insert(table, records)
        if result["errors"]:
            print(f" {result['inserted']}/{len(records)} (errors: {len(result['errors'])})")
        else:
            print(f"OK ({result['inserted']})")
    
    print("\n" + "=" * 60)
    print("Seeding complete!")
    print("=" * 60)


if __name__ == "__main__":
    seed_if_empty()
