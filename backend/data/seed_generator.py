# Bharat Secure Bank — Indian Enterprise Banking Data Generator
# Generates realistic Indian banking identity data for 5000 employees
# Supports: Indian names (Hindu/Muslim/Christian/Sikh), Indian states, banking platforms

import random
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple

# ─── INDIAN NAME POOLS ────────────────────────────────────────────
MUSLIM_FIRST_M = ["Mohammed", "Ayaan", "Abdul", "Faizan", "Imran", "Asif", "Salman", "Bilal", "Zubair", "Faisal", "Sameer", "Arman", "Saif", "Danish", "Farhan", "Kamran", "Nadeem", "Owais", "Rizwan", "Tariq", "Usman", "Waseem", "Yasir"]
MUSLIM_FIRST_F = ["Sameera", "Ayesha", "Zara", "Fatima", "Noor", "Hina", "Sana", "Aaliya", "Maryam", "Zoya", "Anaya", "Inaya", "Rida", "Hiba", "Saba", "Aiman", "Eman", "Khadija", "Rabia", "Sumayya"]
MUSLIM_LAST = ["Khan", "Ahmed", "Sheikh", "Hussain", "Rahman", "Siddiqui", "Ansari", "Qureshi", "Faruqi", "Malik", "Hashmi", "Nadwi", "Usmani", "Baig", "Mirza", "Pasha", "Sherwani", "Bukhari"]

HINDU_FIRST_M = ["Arjun", "Rahul", "Karthik", "Harsh", "Aditya", "Vivek", "Suresh", "Rohan", "Karan", "Vikram", "Sandeep", "Naveen", "Prashant", "Gaurav", "Nikhil", "Akash", "Abhishek", "Siddharth", "Varun", "Tarun", "Amit", "Sunil", "Rajesh", "Anil", "Manish"]
HINDU_FIRST_F = ["Sneha", "Ananya", "Priya", "Deepika", "Divya", "Shreya", "Pooja", "Neha", "Meera", "Kavya", "Sara", "Pari", "Aadhya", "Navya", "Ira", "Sakshi", "Naina", "Anjali", "Bhavna"]
HINDU_LAST = ["Sharma", "Verma", "Gupta", "Joshi", "Mehta", "Shah", "Desai", "Malhotra", "Agarwal", "Bhat", "Srivastava", "Tiwari", "Pandey", "Saxena", "Sinha", "Yadav", "Mishra", "Banerjee", "Chatterjee", "Dutta", "Ghosh"]
HINDU_SOUTH = ["Iyer", "Iyengar", "Nair", "Menon", "Nambiar", "Pillai", "Reddy", "Rao", "Shetty", "Hegde", "Kulkarni", "Subramanian", "Raghavan", "Murthy", "Krishnan", "Srinivasan"]

CHRISTIAN_FIRST_M = ["Joseph", "Kevin", "Samuel", "Chris", "Nathan", "John", "Mark", "Paul", "Thomas", "George", "Michael", "Stephen", "Andrew", "Philip", "Simon", "Peter", "James", "David", "Roy"]
CHRISTIAN_FIRST_F = ["Maria", "Anna", "Rebecca", "Susan", "Elizabeth", "Mary", "Sarah", "Rachel", "Diana", "Sandra", "Anita", "Catherine", "Patricia", "Lisa", "Donna", "Linda", "Helen", "Nancy"]
CHRISTIAN_LAST = ["Mathew", "Dsouza", "Thomas", "Fernandes", "George", "Jacob", "Philip", "Paul", "Pinto", "Coelho", "Gomes", "Pereira", "Almeida", "Braganza", "Coutinho", "Mascarenhas", "Noronha", "Furtado", "Dias"]

SIKH_FIRST_M = ["Gurpreet", "Manpreet", "Amritpal", "Harbhajan", "Jaspreet", "Harjinder", "Sukhwinder", "Paramjit", "Ravinder", "Davinder", "Kuldeep", "Baljeet", "Hardeep", "Mandeep", "Simran"]
SIKH_FIRST_F = ["Harleen", "Manpreet", "Gurleen", "Simran", "Jasmine", "Navleen", "Pargat", "Rupinder", "Sukhpreet", "Amrita", "Baljot", "Dilpreet", "Ekam", "Gunjan"]
SIKH_LAST = ["Singh", "Kaur", "Sandhu", "Gill", "Dhillon", "Brar", "Sidhu", "Cheema", "Grewal", "Bajwa", "Mann", "Thind", "Bhinder", "Sodhi"]

# ─── INDIAN STATES & CITIES ───────────────────────────────────────
STATE_CITY = [
    {"state": "Karnataka", "city": "Bangalore", "district": "Bengaluru Urban", "office_location": "Koramangala"},
    {"state": "Karnataka", "city": "Bangalore", "district": "Bengaluru Urban", "office_location": "Indiranagar"},
    {"state": "Karnataka", "city": "Bangalore", "district": "Bengaluru Urban", "office_location": "Electronic City"},
    {"state": "Karnataka", "city": "Bangalore", "district": "Bengaluru Urban", "office_location": "Whitefield"},
    {"state": "Karnataka", "city": "Bangalore", "district": "Bengaluru Urban", "office_location": "HSR Layout"},
    {"state": "Karnataka", "city": "Bangalore", "district": "Bengaluru Urban", "office_location": "JP Nagar"},
    {"state": "Karnataka", "city": "Mysore", "district": "Mysuru", "office_location": "Hebbal Industrial Area"},
    {"state": "Karnataka", "city": "Mangalore", "district": "Dakshina Kannada", "office_location": "Hampankatta"},
    {"state": "Kerala", "city": "Kochi", "district": "Ernakulam", "office_location": "Kakkanad"},
    {"state": "Kerala", "city": "Kochi", "district": "Ernakulam", "office_location": "Infopark"},
    {"state": "Kerala", "city": "Trivandrum", "district": "Thiruvananthapuram", "office_location": "Technopark"},
    {"state": "Kerala", "city": "Kozhikode", "district": "Kozhikode", "office_location": "Mavoor Road"},
    {"state": "Tamil Nadu", "city": "Chennai", "district": "Chennai", "office_location": "Anna Nagar"},
    {"state": "Tamil Nadu", "city": "Chennai", "district": "Chennai", "office_location": "T Nagar"},
    {"state": "Tamil Nadu", "city": "Coimbatore", "district": "Coimbatore", "office_location": "RS Puram"},
    {"state": "Tamil Nadu", "city": "Madurai", "district": "Madurai", "office_location": "Tallakulam"},
    {"state": "Andhra Pradesh", "city": "Visakhapatnam", "district": "Visakhapatnam", "office_location": "Dwaraka Nagar"},
    {"state": "Andhra Pradesh", "city": "Vijayawada", "district": "Krishna", "office_location": "MG Road"},
    {"state": "Telangana", "city": "Hyderabad", "district": "Hyderabad", "office_location": "Banjara Hills"},
    {"state": "Telangana", "city": "Hyderabad", "district": "Hyderabad", "office_location": "HITEC City"},
    {"state": "Telangana", "city": "Hyderabad", "district": "Hyderabad", "office_location": "Gachibowli"},
    {"state": "Delhi", "city": "New Delhi", "district": "New Delhi", "office_location": "Connaught Place"},
    {"state": "Delhi", "city": "New Delhi", "district": "South Delhi", "office_location": "Nehru Place"},
    {"state": "Punjab", "city": "Chandigarh", "district": "Chandigarh", "office_location": "Sector 17"},
    {"state": "Punjab", "city": "Mohali", "district": "SAS Nagar", "office_location": "Phase 7"},
    {"state": "Punjab", "city": "Ludhiana", "district": "Ludhiana", "office_location": "Model Town"},
    {"state": "Maharashtra", "city": "Mumbai", "district": "Mumbai City", "office_location": "Andheri"},
    {"state": "Maharashtra", "city": "Mumbai", "district": "Mumbai Suburban", "office_location": "Bandra Kurla Complex"},
    {"state": "Maharashtra", "city": "Pune", "district": "Pune", "office_location": "MG Road"},
    {"state": "Maharashtra", "city": "Pune", "district": "Pune", "office_location": "Hinjewadi"},
    {"state": "Gujarat", "city": "Ahmedabad", "district": "Ahmedabad", "office_location": "CG Road"},
    {"state": "Gujarat", "city": "Surat", "district": "Surat", "office_location": "Ring Road"},
    {"state": "West Bengal", "city": "Kolkata", "district": "Kolkata", "office_location": "Park Street"},
    {"state": "West Bengal", "city": "Kolkata", "district": "Kolkata", "office_location": "Salt Lake"},
    {"state": "Rajasthan", "city": "Jaipur", "district": "Jaipur", "office_location": "C Scheme"},
    {"state": "Uttar Pradesh", "city": "Noida", "district": "Gautam Buddh Nagar", "office_location": "Sector 62"},
    {"state": "Uttar Pradesh", "city": "Lucknow", "district": "Lucknow", "office_location": "Hazratganj"},
    {"state": "Madhya Pradesh", "city": "Bhopal", "district": "Bhopal", "office_location": "MP Nagar"},
    {"state": "Madhya Pradesh", "city": "Indore", "district": "Indore", "office_location": "Vijay Nagar"},
    {"state": "Bihar", "city": "Patna", "district": "Patna", "office_location": "Boring Road"},
    {"state": "Odisha", "city": "Bhubaneswar", "district": "Khordha", "office_location": "Saheed Nagar"},
    {"state": "Assam", "city": "Guwahati", "district": "Kamrup Metropolitan", "office_location": "GS Road"},
    {"state": "Jammu and Kashmir", "city": "Jammu", "district": "Jammu", "office_location": "Gandhi Nagar"},
    {"state": "Haryana", "city": "Gurgaon", "district": "Gurugram", "office_location": "Cyber City"},
    {"state": "Goa", "city": "Panaji", "district": "North Goa", "office_location": "Panaji City"},
    {"state": "Chandigarh", "city": "Chandigarh", "district": "Chandigarh", "office_location": "Sector 17"},
    {"state": "Puducherry", "city": "Puducherry", "district": "Puducherry", "office_location": "Boulevard"},
]

DEPARTMENTS = [
    "Retail Banking", "Treasury", "Risk Management", "Cybersecurity", "Compliance",
    "Cloud Engineering", "DevOps", "Core Banking Systems", "Finance", "HR",
    "Operations", "Data Engineering", "Fraud Analytics",
]

DESIGNATIONS = [
    "Junior Analyst", "Senior Analyst", "Associate", "Senior Associate",
    "Team Lead", "Manager", "Senior Manager", "Vice President",
    "Head of Department", "Chief Technology Officer", "Chief Information Security Officer",
    "Systems Engineer", "Senior Systems Engineer", "Cloud Administrator",
    "Database Administrator", "Security Engineer", "DevOps Engineer",
    "Banking Operations Specialist", "Fraud Analyst", "Risk Analyst",
]

PLATFORMS = [
    "Active Directory", "Azure AD", "AWS IAM", "Okta", "Kubernetes",
    "Oracle Database", "Jenkins", "Core Banking API", "UPI Gateway",
    "Payment Processing Engine", "SWIFT Gateway",
]

GROUPS = [
    "Retail_Banking_Read", "Retail_Banking_Write", "Treasury_Admin", "Treasury_Read",
    "Cloud_Infra_Admin", "UPI_Transaction_Audit", "Fraud_Detection_Admin",
    "Payment_Gateway_Operator", "Oracle_DB_Admin", "CoreBanking_Production_Access",
    "Kubernetes_Cluster_Admin", "SWIFT_Gateway_Admin", "Azure_AD_Global_Admin",
    "AWS_Admin_Role", "Okta_Super_Admin", "Jenkins_Pipeline_Admin",
    "RBI_Reporting_Access", "DevOps_Pipeline_Admin",
]

RESOURCES = [
    "UPI Transaction Ledger", "Customer KYC Database", "Core Banking Database",
    "Treasury Payment Engine", "SWIFT Transaction Gateway", "RBI Reporting Database",
    "Oracle Settlement Database", "Payment Microservices Cluster",
]

PERMISSION_LEVELS = ["Read", "Write", "Delete", "Execute", "Admin", "SuperAdmin"]

SVC_NAMES = [
    "svc-upi-engine", "svc-core-banking", "svc-payment-reconciliation",
    "svc-risk-engine", "svc-rbi-reporting", "svc-customer-sync",
    "svc-ledger-service", "svc-neft-processing", "svc-kyc-verification",
    "svc-swift-message", "svc-fraud-detection", "svc-settlement-engine",
]

TEMP_ACCESS_TYPES = [
    "Emergency Production Access", "Temporary Treasury Admin",
    "Temporary UPI Gateway Access", "Temporary Kubernetes Admin",
    "Temporary Core Banking Admin", "Emergency SWIFT Gateway Access",
]

ACTION_TYPES = [
    "UPI_TRANSFER", "SWIFT_PAYMENT", "ROLE_CHANGE", "DB_ACCESS", "LOGIN",
    "FAILED_LOGIN", "TOKEN_CREATE", "ASSUME_ROLE", "DELETE_RESOURCE",
    "LOGIN_FROM_NEW_LOCATION",
]

LOCATIONS = [
    "Bangalore", "Chennai", "Kochi", "Hyderabad", "Delhi", "Mumbai",
    "Pune", "Kolkata", "Ahmedabad", "Chandigarh",
]

FRAMEWORKS = ["RBI Guidelines", "NIST", "CIS", "GDPR", "ISO 27001"]
VIOLATION_TYPES = [
    "Zombie Credential", "Dormant Privileged Access", "Unrotated API Token",
    "Unauthorized UPI Access", "Privilege Escalation", "Temporary Access Drift",
    "Residual Access After Termination",
]

COMPLIANCE_CONTROLS = {
    "RBI Guidelines": ["RBI-DBS-CSRF", "RBI-IT-1.1", "RBI-Cyber-3.2", "RBI-Access-5.1"],
    "NIST": ["AC-2", "AC-6", "AU-2", "IA-2", "SC-8", "AC-5"],
    "CIS": ["CIS-1.4", "CIS-2.1", "CIS-4.1", "CIS-6.2", "CIS-16.5"],
    "GDPR": ["GDPR-32", "GDPR-25", "GDPR-30"],
    "ISO 27001": ["A.9.2.1", "A.9.4.1", "A.12.4.1", "A.9.2.3"],
}


def generate_name() -> Tuple[str, str, str]:
    """Returns (first_name, last_name, religion)"""
    r = random.random() * 100
    if r < 30:
        first = random.choice(HINDU_FIRST_M if random.random() < 0.5 else HINDU_FIRST_F)
        last = random.choice(HINDU_SOUTH) if random.random() < 0.4 else random.choice(HINDU_LAST)
        return first, last, "Hindu"
    elif r < 50:
        first = random.choice(MUSLIM_FIRST_M if random.random() < 0.5 else MUSLIM_FIRST_F)
        return first, random.choice(MUSLIM_LAST), "Muslim"
    elif r < 70:
        first = random.choice(CHRISTIAN_FIRST_M if random.random() < 0.5 else CHRISTIAN_FIRST_F)
        return first, random.choice(CHRISTIAN_LAST), "Christian"
    else:
        first = random.choice(SIKH_FIRST_M if random.random() < 0.5 else SIKH_FIRST_F)
        return first, random.choice(SIKH_LAST), "Sikh"


def generate_username(first: str, last: str) -> str:
    f = ''.join(c.lower() for c in first if c.isalpha())
    l = ''.join(c.lower() for c in last if c.isalpha())
    variants = [
        f"{f}.{l}", f"{f[0]}{l}", f"{f}{l[0]}", f"{f}_{l}",
        f"{f}_upi", f"{f}_azure", f"{f}{random.randint(1, 99)}",
        f"{l}_{f[0]}", f"{f[0]}{l[0]}_prod",
    ]
    return random.choice(variants)


def slugify(name: str) -> str:
    return name.lower().replace(" ", ".").replace(".", ".")


def days_ago_iso(days: int) -> str:
    from datetime import timezone
    d = datetime.now(timezone.utc) - timedelta(days=days)
    d = d.replace(hour=random.randint(7, 20), minute=random.randint(0, 59), second=random.randint(0, 59))
    return d.isoformat()


def date_ago_iso(days: int) -> str:
    d = datetime.now() - timedelta(days=days)
    return d.strftime("%Y-%m-%d")


def risk_level_for_designation(designation: str) -> str:
    if "Chief" in designation or "Head" in designation:
        return "critical"
    if "VP" in designation or "Manager" in designation or "Lead" in designation:
        return "high"
    if "Admin" in designation or "Engineer" in designation or "Senior" in designation:
        return "medium"
    return "low"


def generate_employees(count: int = 5000) -> List[Dict[str, Any]]:
    employees = []
    seen_emails = set()
    for i in range(count):
        first, last, religion = generate_name()
        loc = random.choice(STATE_CITY)
        dept = random.choice(DEPARTMENTS)
        designation = random.choice(DESIGNATIONS)
        is_terminated = random.random() < 0.08
        is_high_priv = random.random() < 0.15
        employee_id = f"BSB{i+1:05d}"

        email = f"{slugify(first)}.{slugify(last)}@bharatsecurebank.in"
        suffix = 1
        while email in seen_emails:
            email = f"{slugify(first)}.{slugify(last)}{suffix}@bharatsecurebank.in"
            suffix += 1
        seen_emails.add(email)

        join_days = random.randint(30, 365 * 10)
        if is_high_priv:
            risk_level = "critical" if random.random() < 0.3 else "high"
        else:
            risk_level = risk_level_for_designation(designation)

        employees.append({
            "employee_id": employee_id,
            "full_name": f"{first} {last}",
            "email": email,
            "department": dept,
            "region": loc["state"],
            "state": loc["state"],
            "city": loc["city"],
            "district": loc["district"],
            "office_location": loc["office_location"],
            "residential_address": f"{random.randint(1, 200)}, {loc['office_location']}, {loc['city']}, {loc['state']}",
            "religion": religion,
            "designation": designation,
            "employment_status": "terminated" if is_terminated else "active",
            "join_date": date_ago_iso(join_days),
            "termination_date": date_ago_iso(random.randint(1, 180)) if is_terminated else None,
            "manager_id": f"BSB{random.randint(1, min(i, count)):05d}" if i > 5 else None,
            "risk_level": risk_level,
        })
    return employees


def generate_platform_accounts(employees: List[Dict]) -> List[Dict]:
    accounts = []
    counter = 0
    for emp in employees:
        num = random.randint(2, 6)
        platforms = random.sample(PLATFORMS, min(num, len(PLATFORMS)))
        parts = emp["full_name"].split(" ")
        first, last = parts[0], parts[1] if len(parts) > 1 else parts[0]
        for platform in platforms:
            counter += 1
            is_active = (random.random() < 0.3) if emp["employment_status"] == "terminated" else (random.random() < 0.85)
            accounts.append({
                "account_id": f"PA{counter:06d}",
                "employee_id": emp["employee_id"],
                "platform": platform,
                "username": generate_username(first, last),
                "account_status": "active" if is_active else random.choice(["disabled", "suspended"]),
                "last_login": days_ago_iso(random.randint(0, 120)) if is_active else days_ago_iso(random.randint(60, 400)),
                "mfa_enabled": random.random() < 0.4,
                "created_date": date_ago_iso(random.randint(30, 1095)),
            })
    return accounts


def generate_group_memberships(employees: List[Dict]) -> List[Dict]:
    groups = []
    for emp in employees:
        num = random.randint(1, 4)
        selected = random.sample(GROUPS, min(num, len(GROUPS)))
        for group in selected:
            groups.append({
                "group_id": f"GRP{len(groups)+1:06d}",
                "employee_id": emp["employee_id"],
                "platform": random.choice(PLATFORMS),
                "group_name": group,
                "parent_group": group.replace("_Write", "_Read").replace("_Admin", "_Read") if "_Write" in group or "_Admin" in group else None,
                "membership_type": random.choice(["direct", "inherited", "nested", "delegated"]),
            })
    return groups


def generate_permissions(employees: List[Dict]) -> List[Dict]:
    perms = []
    for emp in employees:
        num = random.randint(1, 5)
        for _ in range(num):
            resource = random.choice(RESOURCES)
            platform = random.choice(PLATFORMS)
            is_admin = emp["risk_level"] in ("critical", "high")
            level = random.choice(["Admin", "SuperAdmin"]) if is_admin and random.random() < 0.3 else random.choice(["Read", "Write", "Execute", "Delete"])
            perms.append({
                "permission_id": f"PRM{len(perms)+1:06d}",
                "employee_id": emp["employee_id"],
                "platform": platform,
                "resource_name": resource,
                "permission_level": level,
                "granted_date": date_ago_iso(random.randint(30, 1000)),
                "last_used": days_ago_iso(random.randint(0, 90)) if random.random() < 0.7 else None,
                "is_admin": level in ("Admin", "SuperAdmin"),
            })
    return perms


def generate_service_accounts(employees: List[Dict], count: int = 1000) -> List[Dict]:
    active_emps = [e for e in employees if e["employment_status"] == "active"]
    accounts = []
    for i in range(count):
        owner = random.choice(active_emps)
        priv_level = random.choice(["Read", "Write", "Admin", "SuperAdmin"])
        days_unused = random.randint(0, 200)
        accounts.append({
            "service_account_id": f"SVC{i+1:05d}",
            "owner_employee_id": owner["employee_id"],
            "service_name": f"{random.choice(SVC_NAMES)}-{random.randint(1, 50)}",
            "platform": random.choice(PLATFORMS),
            "privilege_level": priv_level,
            "last_used": days_ago_iso(days_unused) if days_unused < 365 else None,
            "token_active": random.random() < 0.7,
            "risk_level": "critical" if priv_level == "SuperAdmin" else ("high" if priv_level == "Admin" else "medium"),
        })
    return accounts


def generate_api_tokens(employees: List[Dict], count: int = 1500) -> List[Dict]:
    active_emps = [e for e in employees if e["employment_status"] == "active"]
    tokens = []
    for i in range(count):
        emp = random.choice(active_emps)
        is_old = random.random() < 0.25
        created_days = random.randint(180, 720) if is_old else random.randint(1, 90)
        platform = random.choice(PLATFORMS)
        prefix = ("upi" if "UPI" in platform else "swift" if "SWIFT" in platform
                  else "oracle" if "Oracle" in platform else "core-banking" if "Core" in platform
                  else platform.lower().replace(" ", "-"))
        tokens.append({
            "token_id": f"TOK{i+1:05d}",
            "employee_id": emp["employee_id"],
            "platform": platform,
            "token_name": f"{prefix}-{random.choice(['prod', 'dev', 'staging', 'api'])}-token",
            "created_date": date_ago_iso(created_days),
            "last_used": days_ago_iso(random.randint(0, 60)) if random.random() < 0.8 else None,
            "rotated": not is_old,
            "active": random.random() < 0.85,
            "risk_level": random.choice(["high", "critical"]) if is_old else random.choice(["low", "medium"]),
        })
    return tokens


def generate_audit_logs(employees: List[Dict], count: int = 25000) -> List[Dict]:
    logs = []
    anomalous = 0
    for i in range(count):
        emp = random.choice(employees)
        action = random.choice(ACTION_TYPES)
        location = random.choice(LOCATIONS)
        anomaly_score = 0.0
        ts = days_ago_iso(random.randint(0, 90))

        r = random.random()
        if r < 0.05:
            ts = days_ago_iso(random.randint(0, 90)).replace("T", f"T{random.randint(0, 3):02d}:", 1)
            anomaly_score = random.uniform(0.6, 0.9)
            anomalous += 1
        elif r < 0.08:
            location = random.choice([l for l in LOCATIONS if l != location])
            anomaly_score = random.uniform(0.7, 1.0)
            anomalous += 1
        elif r < 0.12:
            anomaly_score = random.uniform(0.5, 0.8)
            anomalous += 1
        elif r < 0.14:
            anomaly_score = random.uniform(0.8, 1.0)
            anomalous += 1
        elif r < 0.17 and emp["employment_status"] == "terminated":
            anomaly_score = random.uniform(0.7, 0.95)
            anomalous += 1

        resource = random.choice(RESOURCES)
        if action == "UPI_TRANSFER": resource = "UPI Transaction Ledger"
        elif action == "SWIFT_PAYMENT": resource = "SWIFT Transaction Gateway"
        elif action == "DB_ACCESS": resource = random.choice(["Core Banking Database", "Oracle Settlement Database", "Customer KYC Database"])
        elif action in ("LOGIN", "FAILED_LOGIN"): resource = "Authentication Gateway"
        elif action == "TOKEN_CREATE": resource = "API Token Management"
        elif action == "ASSUME_ROLE": resource = random.choice(["AWS IAM", "Azure AD", "Okta"])

        logs.append({
            "log_id": f"LOG{i+1:06d}",
            "employee_id": emp["employee_id"],
            "platform": random.choice(PLATFORMS),
            "action_type": action,
            "resource": resource,
            "timestamp": ts,
            "location": location,
            "anomaly_score": anomaly_score,
        })
    return logs


def generate_compliance_violations(employees: List[Dict], count: int = 3000) -> List[Dict]:
    violations = []
    for i in range(count):
        emp = random.choice(employees)
        framework = random.choice(FRAMEWORKS)
        controls = COMPLIANCE_CONTROLS.get(framework, ["Unknown"])
        vtype = random.choice(VIOLATION_TYPES)
        severity = random.choice(["high", "critical"]) if vtype in ("Zombie Credential", "Privilege Escalation", "Residual Access After Termination") else random.choice(["low", "medium", "high"])
        violations.append({
            "violation_id": f"VIO{i+1:05d}",
            "employee_id": emp["employee_id"],
            "framework": framework,
            "control": random.choice(controls),
            "violation_type": vtype,
            "severity": severity,
            "status": random.choice(["open", "in_progress", "resolved", "dismissed", "open", "open"]),
        })
    return violations


def generate_identity_relationships(employees: List[Dict], count: int = 10000) -> List[Dict]:
    rels = []
    rel_types = ["member_of", "inherits", "assume_role", "delegated_access", "owns_token", "manages", "reports_to"]
    for i in range(count):
        emp1 = random.choice(employees)
        emp2 = random.choice(employees)
        if emp1["employee_id"] == emp2["employee_id"]:
            continue
        rels.append({
            "relationship_id": f"REL{i+1:06d}",
            "source_id": emp1["employee_id"],
            "target_id": emp2["employee_id"],
            "relationship_type": random.choice(rel_types),
            "platform": random.choice(PLATFORMS),
        })
    return rels


def generate_offboarding_records(employees: List[Dict]) -> List[Dict]:
    terminated = [e for e in employees if e["employment_status"] == "terminated"]
    records = []
    for i, emp in enumerate(terminated):
        ad_disabled = random.random() < 0.7
        aws_active = random.random() < 0.4
        okta_active = random.random() < 0.3
        api_token_active = random.random() < 0.2
        upi_active = random.random() < 0.15
        records.append({
            "offboard_id": f"OFF{i+1:05d}",
            "employee_id": emp["employee_id"],
            "termination_date": emp["termination_date"],
            "hr_status": random.choice(["complete", "pending", "overdue"]),
            "ad_status": "disabled" if ad_disabled else "active",
            "azure_status": "active" if okta_active else "disabled",
            "aws_status": "active" if aws_active else "disabled",
            "okta_status": "active" if okta_active else "disabled",
            "salesforce_status": "active" if api_token_active else "disabled",
            "residual_access_found": aws_active or okta_active or api_token_active or upi_active,
        })
    return records


def generate_temporary_access(employees: List[Dict], count: int = 800) -> List[Dict]:
    active_emps = [e for e in employees if e["employment_status"] == "active"]
    records = []
    for i in range(min(count, len(active_emps))):
        emp = random.choice(active_emps)
        is_expired = random.random() < 0.3
        now = datetime.now()
        if is_expired:
            expiry = (now - timedelta(days=random.randint(1, 30))).strftime("%Y-%m-%d")
        else:
            expiry = (now + timedelta(days=random.randint(1, 90))).strftime("%Y-%m-%d")
        records.append({
            "temp_access_id": f"TA{i+1:05d}",
            "employee_id": emp["employee_id"],
            "platform": random.choice(PLATFORMS),
            "access_granted": random.choice(TEMP_ACCESS_TYPES),
            "expiry_date": expiry,
            "current_status": "expired" if is_expired else "active",
            "still_active": is_expired,
            "risk_level": random.choice(["high", "critical"]) if is_expired else random.choice(["low", "medium"]),
        })
    return records


def generate_privilege_history(employees: List[Dict]) -> List[Dict]:
    high_priv = [e for e in employees if e["risk_level"] in ("high", "critical")]
    months = ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06"]
    history = []
    for emp in high_priv:
        for _ in range(random.randint(1, 4)):
            history.append({
                "history_id": f"PH{len(history)+1:06d}",
                "employee_id": emp["employee_id"],
                "month": random.choice(months),
                "platform": random.choice(PLATFORMS),
                "old_permission": random.choice(PERMISSION_LEVELS),
                "new_permission": random.choice(PERMISSION_LEVELS),
                "change_reason": random.choice(["Role Promotion", "Department Transfer", "Temporary Grant Extended", "Audit Finding Remediation", "Access Review"]),
            })
    return history


def generate_user_roles() -> List[Dict]:
    return [
        {"email": "admin@bharatsecurebank.in", "role": "Admin"},
        {"email": "analyst@bharatsecurebank.in", "role": "Security Analyst"},
        {"email": "auditor@bharatsecurebank.in", "role": "Auditor"},
    ]
