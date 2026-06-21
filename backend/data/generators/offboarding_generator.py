import random
from datetime import datetime, timedelta
import sys
sys.path.insert(0, '/tmp/cc-agent/68062460/project/backend/data')
from config import COUNTS

HR_STATUSES = ["complete", "pending", "overdue"]
SYSTEM_STATUSES = ["disabled", "active", "unknown"]

def generate_offboarding_records(employee_ids):
    records = []
    total = COUNTS["offboarding_records"]
    base_date = datetime.now()

    for i in range(total):
        emp_id = random.choice(employee_ids)
        termination_date = base_date - timedelta(days=random.randint(1, 90))

        status_choices = ["complete"] * 80 + ["pending"] * 13 + ["overdue"] * 7
        overall_status = random.choice(status_choices)

        if overall_status == "complete":
            hr_status = "complete"
            ad_status = "disabled"
            azure_status = "disabled"
            aws_status = "disabled"
            okta_status = "disabled"
            salesforce_status = "disabled"
            residual = False
        elif overall_status == "pending":
            hr_status = "pending"
            ad_status = random.choice(SYSTEM_STATUSES)
            azure_status = random.choice(SYSTEM_STATUSES)
            aws_status = random.choice(SYSTEM_STATUSES)
            okta_status = random.choice(SYSTEM_STATUSES)
            salesforce_status = random.choice(SYSTEM_STATUSES)
            residual = any(s == "active" for s in [ad_status, azure_status, aws_status, okta_status, salesforce_status])
        else:
            hr_status = "overdue"
            ad_status = "active"
            azure_status = random.choice(["active", "unknown"])
            aws_status = random.choice(["active", "unknown"])
            okta_status = random.choice(["active", "unknown"])
            salesforce_status = random.choice(["active", "unknown"])
            residual = True

        records.append({
            "offboard_id": f"OFF{i+1:06d}",
            "employee_id": emp_id,
            "termination_date": termination_date.strftime("%Y-%m-%d"),
            "hr_status": hr_status,
            "ad_status": ad_status,
            "azure_status": azure_status,
            "aws_status": aws_status,
            "okta_status": okta_status,
            "salesforce_status": salesforce_status,
            "residual_access_found": residual,
        })

    return records
