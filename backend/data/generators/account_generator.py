import random
from datetime import datetime, timedelta
import sys
sys.path.insert(0, '/tmp/cc-agent/68062460/project/backend/data')
from config import PLATFORMS, COUNTS

def generate_platform_accounts(employee_ids):
    accounts = []
    acc_id = 1
    total = COUNTS["platform_accounts"]
    base_date = datetime.now()

    accounts_per_employee = total // len(employee_ids)
    remainder = total % len(employee_ids)

    for emp_id in employee_ids:
        num_accounts = accounts_per_employee
        if remainder > 0:
            num_accounts += 1
            remainder -= 1

        for _ in range(num_accounts):
            platform = random.choice(PLATFORMS)

            status_choices = ["active"] * 92 + ["suspended"] * 4 + ["disabled"] * 2 + ["expired"] * 2
            account_status = random.choice(status_choices)

            username = f"{emp_id.lower()}_{platform.lower().replace(' ', '_')}"

            last_login = base_date - timedelta(days=random.randint(1, 90)) if account_status == "active" else None
            mfa_enabled = random.choice([True] * 30 + [False] * 70)
            created_date = base_date - timedelta(days=random.randint(30, 1825))

            accounts.append({
                "account_id": f"ACC{acc_id:06d}",
                "employee_id": emp_id,
                "platform": platform,
                "username": username,
                "account_status": account_status,
                "last_login": last_login.strftime("%Y-%m-%d %H:%M:%S") if last_login else None,
                "mfa_enabled": mfa_enabled,
                "created_date": created_date.strftime("%Y-%m-%d"),
            })
            acc_id += 1

            if acc_id > total:
                break
        if acc_id > total:
            break

    return accounts[:total]
