#!/usr/bin/env python3
"""
Update existing database to realistic enterprise banking numbers.
Does NOT regenerate employees — updates counts and creates historical metrics.
"""
import os
import sys
import random
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from seed_data import supabase, REST_BASE, HEADERS
import urllib.request
import json

def get_count(table: str) -> int:
    url = f"{REST_BASE}/{table}?limit=1"
    headers = dict(HEADERS)
    headers["Prefer"] = "count=exact"
    req = urllib.request.Request(url, headers=headers)
    try:
        resp = urllib.request.urlopen(req, timeout=20)
        ct = resp.headers.get("Content-Range", "")
        if "/" in ct:
            return int(ct.split("/")[-1])
    except Exception:
        pass
    return 0

def update_employees_to_8500():
    """Add more employees if under 8500."""
    current = get_count("employees")
    needed = 8500 - current
    print(f"Current employees: {current}, needed: {needed}")
    if needed <= 0:
        print("Already have 8500+ employees")
        return
    # Generate additional employees
    from seed_generator import generate_all_data
    data = generate_all_data(employee_count=needed)
    # Insert only employees
    records = data["employees"]
    print(f"Inserting {len(records)} additional employees...")
    body = json.dumps(records).encode("utf-8")
    req = urllib.request.Request(f"{REST_BASE}/employees", headers=HEADERS, data=body, method="POST")
    try:
        resp = urllib.request.urlopen(req, timeout=120)
        print(f"Inserted: {resp.status}")
    except Exception as e:
        print(f"Error: {e}")

def create_security_metrics_history():
    """Create 18 months of realistic historical metrics."""
    print("Creating security_metrics_history...")
    months = []
    base_date = datetime(2025, 1, 1)
    for i in range(18):
        dt = base_date + timedelta(days=30*i)
        # Realistic trends: gradually improving
        total = 8200 + random.randint(-50, 100)
        high_risk = max(180, 320 - int(i * 8) + random.randint(-15, 15))
        privileged = max(580, 720 - int(i * 6) + random.randint(-20, 20))
        zombie = max(60, 110 - int(i * 3) + random.randint(-5, 5))
        dormant = max(120, 180 - int(i * 3) + random.randint(-8, 8))
        compliance = max(40, 85 - int(i * 2) + random.randint(-5, 5))
        temp_drift = max(20, 55 - int(i * 2) + random.randint(-3, 3))
        cross_risk = max(15, 45 - int(i * 1.5) + random.randint(-3, 3))
        attack_paths = max(8, 25 - int(i * 1) + random.randint(-2, 2))
        months.append({
            "metric_month": dt.strftime("%Y-%m-%d"),
            "total_identities": total,
            "high_risk_identities": high_risk,
            "privileged_accounts": privileged,
            "zombie_accounts": zombie,
            "dormant_credentials": dormant,
            "compliance_violations": compliance,
            "temporary_access_drift": temp_drift,
            "cross_platform_risks": cross_risk,
            "critical_attack_paths": attack_paths,
        })
    
    # Upsert
    body = json.dumps(months).encode("utf-8")
    req = urllib.request.Request(
        f"{REST_BASE}/security_metrics_history",
        headers={**HEADERS, "Prefer": "resolution=merge-duplicates"},
        data=body, method="POST"
    )
    try:
        resp = urllib.request.urlopen(req, timeout=120)
        print(f"Metrics inserted: {resp.status}")
    except Exception as e:
        print(f"Metrics error: {e}")

def create_notifications():
    """Create realistic notification events."""
    print("Creating notifications...")
    events = [
        ("Global Revoke Executed", "50 accounts disabled across 7 platforms", "critical", "remediation"),
        ("Compliance Violation Resolved", "NIST 800-53 control AC-2 remediated", "info", "compliance"),
        ("Employee Termination Workflow", "Offboarding initiated for EMP08421", "warning", "lifecycle"),
        ("Privilege Escalation Detected", "Anomalous admin assignment on AWS", "critical", "detection"),
        ("API Token Revoked", "Expired token deactivated for service account", "info", "remediation"),
        ("Cross-Platform Risk Found", "Shared credential detected AD + Azure", "warning", "detection"),
        ("Dormant Access Alert", "143 accounts inactive >90 days", "warning", "detection"),
        ("RBI Cyber Framework Audit", "Quarterly review completed — 91% score", "info", "compliance"),
    ]
    notifications = []
    now = datetime.now()
    for i, (title, msg, sev, cat) in enumerate(events):
        notifications.append({
            "title": title,
            "message": msg,
            "severity": sev,
            "category": cat,
            "read": False,
            "created_at": (now - timedelta(hours=i*3)).isoformat(),
        })
    body = json.dumps(notifications).encode("utf-8")
    req = urllib.request.Request(f"{REST_BASE}/notifications", headers=HEADERS, data=body, method="POST")
    try:
        resp = urllib.request.urlopen(req, timeout=60)
        print(f"Notifications inserted: {resp.status}")
    except Exception as e:
        print(f"Notification error: {e}")

if __name__ == "__main__":
    print("Updating to realistic enterprise banking numbers...")
    update_employees_to_8500()
    create_security_metrics_history()
    create_notifications()
    print("Done.")
