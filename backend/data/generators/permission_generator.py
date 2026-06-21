import random
from datetime import datetime, timedelta
import sys
sys.path.insert(0, '/tmp/cc-agent/68062460/project/backend/data')
from config import RESOURCES, PLATFORMS, COUNTS

PERMISSION_LEVELS = ["Read", "Write", "Delete", "Execute", "Admin", "SuperAdmin"]

def generate_permissions(employee_ids):
    permissions = []
    perm_id = 1
    total = COUNTS["permissions"]
    base_date = datetime.now()

    for _ in range(total):
        emp_id = random.choice(employee_ids)
        platform = random.choice(PLATFORMS)
        resource = random.choice(RESOURCES)
        level = random.choice(PERMISSION_LEVELS)

        granted_date = base_date - timedelta(days=random.randint(1, 730))
        last_used = base_date - timedelta(days=random.randint(1, 30)) if random.random() > 0.2 else None
        is_admin = level in ["Admin", "SuperAdmin"]

        permissions.append({
            "permission_id": f"PERM{perm_id:06d}",
            "employee_id": emp_id,
            "platform": platform,
            "resource_name": resource,
            "permission_level": level,
            "granted_date": granted_date.strftime("%Y-%m-%d"),
            "last_used": last_used.strftime("%Y-%m-%d %H:%M:%S") if last_used else None,
            "is_admin": is_admin,
        })
        perm_id += 1

    return permissions
