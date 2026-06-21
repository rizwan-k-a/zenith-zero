from datetime import datetime, timedelta

def generate_security_metrics_history():
    metrics = []

    base_date = datetime.now()
    start_date = base_date - timedelta(days=730)

    current_identities = 7200
    current_privileged = 750
    current_zombie = 65
    current_dormant = 115
    current_violations = 70
    current_attack_paths = 18
    current_cross_risks = 22
    current_temp_drift = 32

    current_date = start_date
    month_id = 1

    while current_date <= base_date:
        current_identities += int(current_identities * 0.01)
        current_privileged += int(current_privileged * 0.005) if month_id % 3 == 0 else 0
        current_zombie = max(60, current_zombie + int((current_zombie * 0.02)) - int(current_zombie * 0.015))
        current_dormant = max(100, current_dormant + int(current_dormant * 0.01) - int(current_dormant * 0.008))
        current_violations = max(40, min(90, current_violations + int(current_violations * 0.03) - int(current_violations * 0.025)))
        current_attack_paths = max(8, min(25, current_attack_paths + int(current_attack_paths * 0.02) - int(current_attack_paths * 0.015)))
        current_cross_risks = max(10, min(35, current_cross_risks + int(current_cross_risks * 0.015) - int(current_cross_risks * 0.01)))
        current_temp_drift = max(20, min(60, current_temp_drift + int(current_temp_drift * 0.02) - int(current_temp_drift * 0.018)))

        metrics.append({
            "month_id": month_id,
            "month": current_date.strftime("%Y-%m"),
            "total_identities": current_identities,
            "privileged_accounts": current_privileged,
            "zombie_accounts": current_zombie,
            "dormant_accounts": current_dormant,
            "compliance_violations": current_violations,
            "attack_paths": current_attack_paths,
            "cross_platform_risks": current_cross_risks,
            "temp_access_drift": current_temp_drift,
        })

        if current_date.month == 12:
            current_date = current_date.replace(year=current_date.year + 1, month=1)
        else:
            current_date = current_date.replace(month=current_date.month + 1)
        month_id += 1

    metrics[-1]["total_identities"] = 8500
    metrics[-1]["privileged_accounts"] = 802
    metrics[-1]["zombie_accounts"] = 74
    metrics[-1]["dormant_accounts"] = 131
    metrics[-1]["compliance_violations"] = 63
    metrics[-1]["attack_paths"] = 18
    metrics[-1]["cross_platform_risks"] = 22
    metrics[-1]["temp_access_drift"] = 37

    return metrics
