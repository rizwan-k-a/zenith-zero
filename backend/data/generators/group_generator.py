import random
import sys
sys.path.insert(0, '/tmp/cc-agent/68062460/project/backend/data')
from config import GROUPS, PLATFORMS, COUNTS

MEMBERSHIP_TYPES = ["direct", "inherited", "nested", "delegated"]

def generate_group_memberships(employee_ids):
    memberships = []
    total = COUNTS["group_memberships"]
    group_id = 1

    for _ in range(total):
        emp_id = random.choice(employee_ids)
        group = random.choice(GROUPS)
        platform = random.choice(PLATFORMS)
        membership_type = random.choice(MEMBERSHIP_TYPES)

        parent_group = random.choice(GROUPS) if membership_type in ["inherited", "nested"] else None

        memberships.append({
            "group_id": f"GRP{group_id:06d}",
            "employee_id": emp_id,
            "platform": platform,
            "group_name": group,
            "parent_group": parent_group,
            "membership_type": membership_type,
        })
        group_id += 1

    return memberships
