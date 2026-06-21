import random
from datetime import datetime, timedelta
import sys
sys.path.insert(0, '/tmp/cc-agent/68062460/project/backend/data')
from config import AUDIT_ACTIONS, CITIES, PLATFORMS, RESOURCES, COUNTS

def generate_audit_logs(employee_ids):
    logs = []
    total = COUNTS["audit_logs"]

    base_date = datetime.now()

    for i in range(total):
        emp_id = random.choice(employee_ids)
        platform = random.choice(PLATFORMS)
        action = random.choice(AUDIT_ACTIONS)
        resource = random.choice(RESOURCES)
        city = random.choice(CITIES)

        log_time = base_date - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23), minutes=random.randint(0, 59))

        anomaly_score = round(random.random() * 100, 2)
        if action in ["FAILED_LOGIN", "SUSPICIOUS_ACCESS", "ROLE_ESCALATION"]:
            anomaly_score = round(random.uniform(50, 100), 2)

        logs.append({
            "log_id": f"LOG{i+1:08d}",
            "employee_id": emp_id,
            "platform": platform,
            "action_type": action,
            "resource": resource,
            "timestamp": log_time.strftime("%Y-%m-%d %H:%M:%S"),
            "location": city,
            "anomaly_score": anomaly_score,
        })

    return logs
