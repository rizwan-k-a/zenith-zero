import random
from datetime import datetime, timedelta
import sys
sys.path.insert(0, '/tmp/cc-agent/68062460/project/backend/data')
from config import PLATFORMS, COUNTS

PERMISSION_LEVELS = ["Read", "Write", "Admin", "SuperAdmin"]
CHANGE_REASONS = [
    "Role Change", "Promotion", "Project Assignment", "Temporary Access",
    "Security Review", "Compliance Requirement", "Manager Approval", "Emergency Access"
]

def generate_privilege_history(employee_ids):
    history = []
    total = COUNTS["privilege_history"]
    base_date = datetime.now()

    for i in range(total):
        emp_id = random.choice(employee_ids)
        platform = random.choice(PLATFORMS)

        month_date = base_date - timedelta(days=random.randint(1, 365))
        month = month_date.strftime("%Y-%m")

        old_perm = random.choice(PERMISSION_LEVELS[:3])
        new_perm = random.choice(PERMISSION_LEVELS)

        change_reason = random.choice(CHANGE_REASONS)

        history.append({
            "history_id": f"HIST{i+1:07d}",
            "employee_id": emp_id,
            "month": month,
            "platform": platform,
            "old_permission": old_perm,
            "new_permission": new_perm,
            "change_reason": change_reason,
        })

    return history
