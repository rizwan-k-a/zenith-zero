import random
from datetime import datetime, timedelta
import sys
sys.path.insert(0, '/tmp/cc-agent/68062460/project/backend/data')
from config import PLATFORMS, COUNTS

RISK_LEVELS = ["low", "medium", "high", "critical"]

def generate_api_tokens(employee_ids):
    tokens = []
    total = COUNTS["api_tokens"]
    base_date = datetime.now()

    for i in range(total):
        emp_id = random.choice(employee_ids)
        platform = random.choice(PLATFORMS)

        token_name = f"{platform.lower().replace(' ', '-')}-token-{i+1}"

        status_choices = ["healthy"] * 75 + ["stale"] * 15 + ["exposed"] * 10
        status = random.choice(status_choices)

        if status == "healthy":
            created_date = base_date - timedelta(days=random.randint(1, 30))
            risk = "low"
            rotated = random.choice([True, False])
        elif status == "stale":
            created_date = base_date - timedelta(days=random.randint(31, 180))
            risk = "medium"
            rotated = False
        else:
            created_date = base_date - timedelta(days=random.randint(180, 365))
            risk = random.choice(["high", "critical"])
            rotated = False

        last_used = base_date - timedelta(days=random.randint(1, 7)) if status == "healthy" else base_date - timedelta(days=random.randint(30, 90))

        tokens.append({
            "token_id": f"TOK{i+1:06d}",
            "employee_id": emp_id,
            "platform": platform,
            "token_name": token_name,
            "created_date": created_date.strftime("%Y-%m-%d"),
            "last_used": last_used.strftime("%Y-%m-%d %H:%M:%S"),
            "rotated": rotated,
            "active": status != "exposed",
            "risk_level": risk,
        })

    return tokens
