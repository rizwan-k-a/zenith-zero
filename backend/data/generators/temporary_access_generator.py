import random
from datetime import datetime, timedelta
import sys
sys.path.insert(0, '/tmp/cc-agent/68062460/project/backend/data')
from config import RESOURCES, PLATFORMS, COUNTS

RISK_LEVELS = ["low", "medium", "high", "critical"]
ACCESS_STATUSES = ["active", "expired", "revoked", "extended"]

def generate_temporary_access(employee_ids):
    grants = []
    total = COUNTS["temporary_access"]
    base_date = datetime.now()

    for i in range(total):
        emp_id = random.choice(employee_ids)
        platform = random.choice(PLATFORMS)
        resource = random.choice(RESOURCES)

        status_choices = ["active"] * 85 + ["expired"] * 10 + ["revoked"] * 3 + ["extended"] * 2
        current_status = random.choice(status_choices)

        if current_status == "active":
            expiry_date = base_date + timedelta(days=random.randint(1, 30))
            still_active = True
        elif current_status == "expired":
            expiry_date = base_date - timedelta(days=random.randint(1, 30))
            still_active = False
        elif current_status == "revoked":
            expiry_date = base_date - timedelta(days=random.randint(1, 15))
            still_active = False
        else:
            expiry_date = base_date + timedelta(days=random.randint(30, 60))
            still_active = True

        risk_choices = ["low"] * 50 + ["medium"] * 30 + ["high"] * 15 + ["critical"] * 5
        risk = random.choice(risk_choices)

        grants.append({
            "temp_access_id": f"TMP{i+1:06d}",
            "employee_id": emp_id,
            "platform": platform,
            "access_granted": resource,
            "expiry_date": expiry_date.strftime("%Y-%m-%d"),
            "current_status": current_status,
            "still_active": still_active,
            "risk_level": risk,
        })

    return grants
