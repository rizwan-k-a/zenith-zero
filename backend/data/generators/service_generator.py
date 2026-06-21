import random
from datetime import datetime, timedelta
import sys
sys.path.insert(0, '/tmp/cc-agent/68062460/project/backend/data')
from config import SERVICES, PLATFORMS, COUNTS

PRIVILEGE_LEVELS = ["Read", "Write", "Admin", "SuperAdmin"]

def generate_service_accounts(employee_ids):
    accounts = []
    total = COUNTS["service_accounts"]
    base_date = datetime.now()

    for i in range(total):
        service = random.choice(SERVICES)
        owner_id = random.choice(employee_ids)
        platform = random.choice(PLATFORMS)
        privilege = random.choice(PRIVILEGE_LEVELS)

        status_choices = ["active"] * 85 + ["inactive"] * 10 + ["deprecated"] * 5
        status = random.choice(status_choices)

        last_used = base_date - timedelta(days=random.randint(1, 30)) if status == "active" else None
        token_active = status == "active" and random.random() > 0.3

        risk_choices = ["low"] * 60 + ["medium"] * 25 + ["high"] * 12 + ["critical"] * 3
        risk = random.choice(risk_choices)

        accounts.append({
            "service_account_id": f"SVC{i+1:05d}",
            "owner_employee_id": owner_id,
            "service_name": service,
            "platform": platform,
            "privilege_level": privilege,
            "last_used": last_used.strftime("%Y-%m-%d %H:%M:%S") if last_used else None,
            "token_active": token_active,
            "risk_level": risk,
        })

    return accounts
