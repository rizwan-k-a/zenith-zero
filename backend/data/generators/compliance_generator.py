import random
import sys
sys.path.insert(0, '/tmp/cc-agent/68062460/project/backend/data')
from config import COMPLIANCE_FRAMEWORKS, COUNTS

VIOLATION_TYPES = [
    "Excessive Permissions",
    "Stale Account",
    "Missing MFA",
    "Unauthorized Access",
    "Privilege Accumulation",
    "Orphaned Account",
    "Password Policy Violation",
    "Data Access Violation",
]

SEVERITY_LEVELS = ["low", "medium", "high", "critical"]
STATUS_LEVELS = ["open", "in_progress", "resolved", "dismissed"]
CONTROLS = ["AC-1", "AC-2", "AC-3", "IA-1", "IA-2", "SC-1", "SC-2", "AU-1", "AU-2"]

def generate_compliance_violations(employee_ids):
    violations = []
    total = COUNTS["compliance_violations"]

    for i in range(total):
        emp_id = random.choice(employee_ids)
        framework = random.choice(COMPLIANCE_FRAMEWORKS)
        violation_type = random.choice(VIOLATION_TYPES)
        control = random.choice(CONTROLS)

        severity_choices = ["low"] * 30 + ["medium"] * 35 + ["high"] * 25 + ["critical"] * 10
        severity = random.choice(severity_choices)

        status_choices = ["resolved"] * 60 + ["open"] * 25 + ["in_progress"] * 10 + ["dismissed"] * 5
        status = random.choice(status_choices)

        violations.append({
            "violation_id": f"VIO{i+1:06d}",
            "employee_id": emp_id,
            "framework": framework,
            "control": control,
            "violation_type": violation_type,
            "severity": severity,
            "status": status,
        })

    return violations
