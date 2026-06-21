import random
import sys
sys.path.insert(0, '/tmp/cc-agent/68062460/project/backend/data')
from config import NOTIFICATION_TYPES, COUNTS

def generate_notifications(employee_ids):
    notifications = []
    total = COUNTS["notifications"]

    for i in range(total):
        emp_id = random.choice(employee_ids)
        notif_type = random.choice(NOTIFICATION_TYPES)

        severity_choices = ["info"] * 40 + ["warning"] * 35 + ["critical"] * 25
        severity = random.choice(severity_choices)

        status_choices = ["unread"] * 40 + ["read"] * 50 + ["actioned"] * 10
        status = random.choice(status_choices)

        notifications.append({
            "notification_id": f"NOTIF{i+1:06d}",
            "employee_id": emp_id,
            "message": notif_type,
            "severity": severity,
            "status": status,
        })

    return notifications
