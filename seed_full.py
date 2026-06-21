#!/usr/bin/env python3
"""
Aureon Global Bank — Full Enterprise Data Seeding
Generates and inserts all 50K+ records via Supabase REST API.
"""
import urllib.request, json, sys, time, random
from datetime import datetime, timedelta, date

BASE_URL = "https://mwzvkewlcpgkzzaoadir.supabase.co/rest/v1"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13enZrZXdsY3Bna3p6YW9hZGlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NDQyOTIsImV4cCI6MjA5NzUyMDI5Mn0.gZAqbO9BtUXFFG4td4V0ee-MLGJYuIvyfB9GCBFu_8c"
HEADERS = {
    "apikey": API_KEY,
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates,return=minimal",
}

REGIONS = ["France", "India", "Singapore", "Germany", "United Kingdom", "United States"]
DEPARTMENTS = [
    "Treasury", "Retail Banking", "Investment Banking", "Risk Management",
    "Compliance", "Cybersecurity", "Cloud Engineering", "DevOps", "Finance", "HR", "Operations",
]
PLATFORMS = ["Active Directory", "Azure AD", "AWS IAM", "Okta", "Salesforce", "Kubernetes", "Jenkins"]
GROUPS = [
    "Finance_Read", "Cloud_Admin", "Azure_Global_Admin", "AWS_Admin_Role",
    "Treasury_Supervisor", "Database_Admin", "Kubernetes_Admin", "AD_Domain_Admins",
    "Enterprise_Security", "DataLake_Access", "Trading_Desk", "HR_Admin", "DevOps_Pipeline",
    "Compliance_Read", "Risk_Analytics", "Payments_Admin", "Settlement_Viewer",
    "Production_Emergency", "DR_Privileged", "BackOffice_Access",
]
RESOURCES = [
    "prod-customer-db", "trade-settlement-db", "risk-analytics-lake", "treasury-cash",
    "compliance-archive", "hr-payroll-system", "customer-pii-vault", "fx-trading-engine",
    "payment-gateway", "core-banking-api", "fraud-detection-model", "regulatory-reporting",
    "settlement-queue", "internal-payments", "accounting-ledger", "liquidity-pool",
    "mortgage-portfolio", "investment-fund-admin", "custody-system", "securities-clearing",
]
ACTION_TYPES = [
    "Login", "AssumeRole", "DBAccess", "RoleChange", "DeleteBucket", "TokenCreate",
    "PolicyAttach", "UserCreate", "GroupJoin", "ResourceAccess", "PrivilegeEscalation",
    "TokenRotate", "AccountDisable", "PasswordReset", "MFAEnroll",
]
LOCATIONS = [
    "Paris", "Mumbai", "Singapore", "Frankfurt", "London", "New York",
    "Lyon", "Delhi", "Bangalore", "Berlin", "Manchester", "Chicago",
    "Marseille", "Chennai", "Pune", "Hamburg", "Birmingham", "San Francisco",
]
NAMES = {
    "France": [
        "Alexandre", "Sophie", "Julien", "Marie", "Pierre", "Claire", "Thomas", "Laura",
        "Nicolas", "Isabelle", "François", "Camille", "Antoine", "Léa", "Maxime", "Chloé",
        "Hugo", "Manon", "Lucas", "Emma", "Théo", "Inès", "Louis", "Jade", "Raphaël", "Lina",
        "Arthur", "Zoé", "Nathan", "Léna", "Olivier", "Charlotte", "Baptiste", "Audrey",
    ],
    "India": [
        "Ravi", "Priya", "Kiran", "Deepa", "Suresh", "Rajesh", "Anil", "Sunil", "Vijay", "Amit",
        "Neha", "Sneha", "Preeti", "Meera", "Divya", "Shreya", "Ritu", "Suman", "Anita", "Sunita",
        "Manish", "Sanjay", "Arun", "Kamal", "Mohan", "Nitin", "Prakash", "Satish", "Dinesh", "Vikas",
        "Asha", "Rekha", "Geeta", "Lata", "Poonam", "Kavita", "Usha", "Sarika", "Nisha", "Sapna",
    ],
    "Singapore": [
        "Wei", "Li", "Jun", "Hui", "Min", "Shi", "Ying", "Feng", "Kai", "Lin", "Jia", "Xin",
        "Qi", "Lei", "Hao", "Tao", "Bo", "Ming", "Chun", "Dong", "Jin", "Rui", "Yan", "Bin",
        "Ping", "Hong", "Fang", "Yuan", "Xiang", "Tian", "Yong", "Zhi", "Qiang", "Mei",
    ],
    "Germany": [
        "Hans", "Anna", "Klaus", "Maria", "Peter", "Ursula", "Wolfgang", "Ingrid", "Dieter", "Helga",
        "Manfred", "Brigitte", "Jürgen", "Gerda", "Rolf", "Irmgard", "Günter", "Hannelore", "Fritz", "Edith",
        "Heinz", "Margot", "Karl", "Lieselotte", "Werner", "Erna", "Otto", "Else", "Wilhelm", "Elfriede",
    ],
    "United Kingdom": [
        "James", "Emma", "William", "Olivia", "George", "Sophia", "Henry", "Ava", "Edward", "Isabella",
        "Charles", "Mia", "Arthur", "Amelia", "Alfred", "Harper", "Frederick", "Evelyn", "Thomas", "Abigail",
        "Richard", "Emily", "Robert", "Elizabeth", "David", "Grace", "Andrew", "Chloe", "Daniel", "Lucy",
    ],
    "United States": [
        "Michael", "Jennifer", "Christopher", "Amanda", "Matthew", "Jessica", "Joshua", "Sarah", "Andrew", "Ashley",
        "Daniel", "David", "Samantha", "James", "Stephanie", "Joseph", "Nicole", "Ryan", "Elizabeth", "John",
        "Lauren", "Brandon", "Kayla", "Justin", "Rachel", "Jonathan", "Rebecca", "Tyler", "Megan", "Brian",
    ],
}
SURNAMES = {
    "France": ["Martin", "Dubois", "Moreau", "Lefevre", "Blanc", "Girard", "Simon", "Bernard", "Roux", "Petit", "Rousseau", "Fontaine", "Lambert", "Chevalier", "Gauthier", "Perrin", "Morin", "Richard", "Bonnet", "Lemoine", "Clement", "Leroy", "Leroux", "Dupont", "Garcia"],
    "India": ["Sharma", "Patel", "Kumar", "Reddy", "Nair", "Gupta", "Singh", "Verma", "Iyer", "Desai", "Joshi", "Mehta", "Shah", "Rao", "Agarwal", "Chopra", "Malhotra", "Bhat", "Dutta", "Ghosh", "Banerjee", "Mukherjee", "Chatterjee", "Sengupta", "Bhattacharya", "Das", "Bose", "Sen", "Pillai", "Menon"],
    "Singapore": ["Tan", "Lim", "Lee", "Chen", "Wang", "Zhang", "Liu", "Wu", "Huang", "Yang", "Zhao", "Zhou", "Xu", "Sun", "Ma", "Zhu", "Hu", "Gao", "Lin", "He", "Zheng", "Deng", "Feng", "Cao", "Peng", "Xie", "Han", "Tang", "Pan", "Yu"],
    "Germany": ["Mueller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Koch", "Bauer", "Richter", "Klein", "Wolf", "Schroeder", "Neumann", "Schwarz", "Zimmermann", "Braun", "Krueger", "Hofmann", "Hartmann", "Lange", "Schmitt", "Werner", "Krause", "Meier", "Koenig", "Engel"],
    "United Kingdom": ["Smith", "Jones", "Taylor", "Brown", "Davies", "Evans", "Wilson", "Thomas", "Johnson", "Roberts", "Robinson", "Wright", "Thompson", "Walker", "White", "Edwards", "Hughes", "Green", "Hall", "Lewis", "Harris", "Clarke", "Patel", "Jackson", "Wood", "Young", "Turner", "Martin", "Cooper", "Hill"],
    "United States": ["Johnson", "Williams", "Brown", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Rodriguez", "Gonzalez", "Martinez"],
}
DESIGNATIONS = ["Analyst", "Senior Analyst", "Manager", "Senior Manager", "Director", "VP", "SVP", "MD", "Associate"]
RISK_LEVELS = ["low", "medium", "high", "critical"]

NOW = datetime(2025, 6, 20)
TODAY = date(2025, 6, 20)

def insert_batch(table, records, batch_size=100):
    """Insert records in batches."""
    inserted = 0
    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        body = json.dumps(batch).encode("utf-8")
        req = urllib.request.Request(
            f"{BASE_URL}/{table}",
            headers=HEADERS,
            data=body,
            method="POST",
        )
        try:
            resp = urllib.request.urlopen(req, timeout=60)
            if resp.status in (200, 201):
                inserted += len(batch)
                sys.stdout.write(f"\r  {table}: {inserted}/{len(records)}")
                sys.stdout.flush()
        except Exception as e:
            try:
                if hasattr(e, 'read'):
                    err = e.read().decode()[:100]
                    # Only print if not a duplicate conflict
                    if "duplicate" not in err.lower():
                        print(f"\n  {table} batch {i//batch_size}: {err}")
            except:
                pass
    print()
    return inserted


def generate_employees(count=5000):
    employees = []
    for i in range(count):
        region = random.choice(REGIONS)
        first = random.choice(NAMES[region])
        last = random.choice(SURNAMES[region])
        emp_id = f"EMP{str(i+1).zfill(5)}"
        dept = random.choice(DEPARTMENTS)
        desig = random.choice(DESIGNATIONS)
        
        status_roll = random.random()
        if status_roll < 0.08:
            status = "terminated"
            term_days = random.randint(1, 365)
            term_date = (NOW - timedelta(days=term_days)).date()
        elif status_roll < 0.10:
            status = "suspended"
            term_date = None
        elif status_roll < 0.15:
            status = "on_leave"
            term_date = None
        else:
            status = "active"
            term_date = None
        
        join_days = random.randint(365, 3650)
        join_date = (NOW - timedelta(days=join_days)).date()
        
        if status == "terminated" and term_date and (TODAY - term_date).days > 90:
            risk = random.choices(RISK_LEVELS, weights=[5, 15, 40, 40])[0]
        elif desig in ["VP", "SVP", "MD", "Director"]:
            risk = random.choices(RISK_LEVELS, weights=[20, 40, 30, 10])[0]
        else:
            risk = random.choices(RISK_LEVELS, weights=[60, 30, 8, 2])[0]
        
        emp = {
            "employee_id": emp_id,
            "full_name": f"{first} {last}",
            "email": f"{first.lower()}.{last.lower()}{random.randint(1,999)}@aureonbank.com",
            "department": dept,
            "region": region,
            "designation": desig,
            "employment_status": status,
            "join_date": join_date.isoformat(),
            "termination_date": term_date.isoformat() if term_date else None,
            "manager_id": f"EMP{str(random.randint(1, min(i, 100))).zfill(5)}" if i > 10 else None,
            "risk_level": risk,
        }
        employees.append(emp)
    return employees


def generate_platform_accounts(employees):
    accounts = []
    acc_idx = 1
    for emp in employees:
        if emp["employment_status"] == "terminated":
            num_accs = random.choices([0, 1, 2, 3], weights=[10, 30, 40, 20])[0]
        elif emp["employment_status"] == "active":
            num_accs = random.choices([2, 3, 4, 5], weights=[10, 40, 35, 15])[0]
        else:
            num_accs = random.choices([1, 2, 3], weights=[30, 50, 20])[0]
        
        chosen_platforms = random.sample(PLATFORMS, min(num_accs, len(PLATFORMS)))
        
        for platform in chosen_platforms:
            if emp["employment_status"] == "terminated":
                is_active = random.random() < 0.35
            else:
                is_active = random.random() < 0.92
            
            status = "active" if is_active else random.choice(["disabled", "suspended", "expired"])
            last_login = None
            if is_active:
                days = random.randint(1, 90)
                last_login = (NOW - timedelta(days=days)).isoformat()
            
            accounts.append({
                "account_id": f"ACC{str(acc_idx).zfill(6)}",
                "employee_id": emp["employee_id"],
                "platform": platform,
                "username": f"{emp['full_name'].lower().replace(' ', '.')}@{platform.lower().replace(' ', '')}",
                "account_status": status,
                "last_login": last_login,
                "mfa_enabled": random.random() < 0.6,
                "created_date": (NOW - timedelta(days=random.randint(30, 1000))).date().isoformat(),
            })
            acc_idx += 1
    return accounts


def generate_permissions(employees, accounts):
    permissions = []
    perm_idx = 1
    perm_levels = ["Read", "Write", "Delete", "Execute", "Admin", "SuperAdmin"]
    for emp in employees:
        emp_accs = [a for a in accounts if a["employee_id"] == emp["employee_id"]]
        for acc in emp_accs:
            num_perms = random.choices([1, 2, 3, 4, 5], weights=[25, 35, 25, 10, 5])[0]
            for _ in range(num_perms):
                level = random.choices(perm_levels, weights=[40, 25, 10, 10, 10, 5])[0]
                last_used = None
                if random.random() < 0.7:
                    last_used = (NOW - timedelta(days=random.randint(1, 180))).isoformat()
                permissions.append({
                    "permission_id": f"PERM{str(perm_idx).zfill(6)}",
                    "employee_id": emp["employee_id"],
                    "platform": acc["platform"],
                    "resource_name": random.choice(RESOURCES),
                    "permission_level": level,
                    "granted_date": (NOW - timedelta(days=random.randint(30, 730))).date().isoformat(),
                    "last_used": last_used,
                    "is_admin": level in ["Admin", "SuperAdmin"],
                })
                perm_idx += 1
    return permissions


def generate_group_memberships(employees, accounts):
    memberships = []
    for emp in employees:
        emp_accs = [a for a in accounts if a["employee_id"] == emp["employee_id"]]
        for acc in emp_accs:
            num_groups = random.choices([1, 2, 3, 4], weights=[40, 35, 20, 5])[0]
            chosen_groups = random.sample(GROUPS, min(num_groups, len(GROUPS)))
            for grp in chosen_groups:
                memberships.append({
                    "group_id": f"GRP{random.randint(1000, 9999)}",
                    "employee_id": emp["employee_id"],
                    "platform": acc["platform"],
                    "group_name": grp,
                    "parent_group": random.choice([None, None, None, random.choice(GROUPS)]),
                    "membership_type": random.choice(["direct", "inherited", "nested", "delegated"]),
                })
    return memberships


def generate_identity_relationships(employees):
    relationships = []
    rel_idx = 1
    for emp in employees:
        if emp["manager_id"] and random.random() < 0.8:
            relationships.append({
                "relationship_id": f"REL{str(rel_idx).zfill(5)}",
                "source_id": emp["employee_id"],
                "target_id": emp["manager_id"],
                "relationship_type": "reports_to",
                "platform": "HR",
            })
            rel_idx += 1
        if random.random() < 0.3:
            other = random.choice(employees)
            if other["employee_id"] != emp["employee_id"]:
                relationships.append({
                    "relationship_id": f"REL{str(rel_idx).zfill(5)}",
                    "source_id": emp["employee_id"],
                    "target_id": other["employee_id"],
                    "relationship_type": random.choice(["member_of", "inherits", "assume_role", "delegated_access"]),
                    "platform": random.choice(PLATFORMS),
                })
                rel_idx += 1
    return relationships


def generate_privilege_history(employees):
    history = []
    hist_idx = 1
    progression = ["Read", "Write", "Delete", "Execute", "Admin", "SuperAdmin"]
    for emp in employees:
        if emp["employment_status"] != "active":
            continue
        if random.random() < 0.02:
            months = random.randint(3, 12)
            start_idx = random.randint(0, 2)
            for m in range(months):
                current_idx = min(start_idx + m, len(progression) - 1)
                prev_idx = max(0, current_idx - 1)
                history.append({
                    "history_id": f"HIST{str(hist_idx).zfill(5)}",
                    "employee_id": emp["employee_id"],
                    "month": (NOW - timedelta(days=30 * m)).strftime("%Y-%m"),
                    "platform": random.choice(PLATFORMS),
                    "old_permission": progression[prev_idx],
                    "new_permission": progression[current_idx],
                    "change_reason": random.choice([
                        "Role change", "Project requirement", "Emergency access", "Temporary elevation",
                    ]),
                })
                hist_idx += 1
    return history


def generate_offboarding_records(employees):
    records = []
    for emp in employees:
        if emp["employment_status"] != "terminated" or not emp["termination_date"]:
            continue
        if random.random() < 0.8:
            statuses = ["disabled", "active", "unknown"]
            records.append({
                "offboard_id": f"OB{emp['employee_id']}",
                "employee_id": emp["employee_id"],
                "termination_date": emp["termination_date"],
                "hr_status": random.choice(["complete", "pending", "overdue"]),
                "ad_status": random.choice(statuses),
                "azure_status": random.choice(statuses),
                "aws_status": random.choice(statuses),
                "okta_status": random.choice(statuses),
                "salesforce_status": random.choice(statuses),
                "residual_access_found": random.random() < 0.35,
            })
    return records


def generate_temporary_access(employees):
    records = []
    for emp in employees:
        if emp["employment_status"] != "active":
            continue
        if random.random() < 0.06:
            expiry = (NOW - timedelta(days=random.randint(-60, 30))).date()
            is_overdue = expiry < TODAY
            records.append({
                "temp_access_id": f"TEMP{emp['employee_id']}",
                "employee_id": emp["employee_id"],
                "platform": random.choice(PLATFORMS),
                "access_granted": random.choice(["cluster-admin", "iam:PassRole", "Security Reader", "DB Admin"]),
                "expiry_date": expiry.isoformat(),
                "current_status": "active" if not is_overdue else random.choice(["expired", "revoked", "extended"]),
                "still_active": is_overdue,
                "risk_level": "critical" if is_overdue else random.choice(["low", "medium", "high"]),
            })
    return records


def generate_service_accounts(employees):
    accounts = []
    for i in range(500):
        owner = random.choice(employees)
        level = random.choices(["Read", "Write", "Admin", "SuperAdmin"], weights=[30, 30, 25, 15])[0]
        last_used = None
        if random.random() < 0.6:
            last_used = (NOW - timedelta(days=random.randint(1, 180))).isoformat()
        accounts.append({
            "service_account_id": f"SVC{str(i+1).zfill(5)}",
            "owner_employee_id": owner["employee_id"],
            "service_name": random.choice(["payment-processor", "trade-api", "risk-engine", "compliance-scanner", "data-pipeline"]),
            "platform": random.choice(PLATFORMS),
            "privilege_level": level,
            "last_used": last_used,
            "token_active": random.random() < 0.75,
            "risk_level": "critical" if level == "SuperAdmin" and not last_used else random.choice(["low", "medium", "high"]),
        })
    return accounts


def generate_api_tokens(employees):
    tokens = []
    for i in range(1000):
        owner = random.choice(employees)
        last_used = None
        if random.random() < 0.8:
            last_used = (NOW - timedelta(days=random.randint(1, 180))).isoformat()
        tokens.append({
            "token_id": f"TOK{str(i+1).zfill(5)}",
            "employee_id": owner["employee_id"],
            "platform": random.choice(PLATFORMS),
            "token_name": random.choice(["prod-api-key", "staging-token", "ci-cd-token", "reporting-token", "webhook-token"]),
            "created_date": (NOW - timedelta(days=random.randint(30, 730))).date().isoformat(),
            "last_used": last_used,
            "rotated": random.random() < 0.8,
            "active": random.random() < 0.85,
            "risk_level": "critical" if not last_used and random.random() < 0.2 else random.choice(["low", "medium", "high"]),
        })
    return tokens


def generate_audit_logs(employees):
    logs = []
    for i in range(10000):
        emp = random.choice(employees)
        action = random.choice(ACTION_TYPES)
        anomaly = 0.0
        if emp["employment_status"] == "terminated":
            anomaly += 0.8
        if action in ["PrivilegeEscalation", "AssumeRole", "DeleteBucket"]:
            anomaly += 0.5
        if action == "TokenCreate" and emp["employment_status"] == "terminated":
            anomaly += 0.9
        logs.append({
            "log_id": f"LOG{str(i+1).zfill(6)}",
            "employee_id": emp["employee_id"],
            "platform": random.choice(PLATFORMS),
            "action_type": action,
            "resource": random.choice(RESOURCES),
            "timestamp": (NOW - timedelta(days=random.randint(0, 365), hours=random.randint(0, 23))).isoformat(),
            "location": random.choice(LOCATIONS),
            "anomaly_score": min(1.0, anomaly + random.random() * 0.2),
        })
    return logs


def generate_compliance_violations(employees):
    violations = []
    frameworks = ["NIST SP 800-53", "CIS Controls v8", "GDPR Article 32", "Zero Trust Architecture"]
    controls = [
        "AC-2 (Account Management)", "AC-3 (Access Enforcement)", "AC-6 (Least Privilege)",
        "IA-2 (Identification)", "IA-4 (Identifier Management)", "SC-7 (Boundary Protection)",
        "AU-6 (Audit Review)", "CM-7 (Least Functionality)", "SI-4 (Information Monitoring)",
    ]
    violation_types = [
        "Excessive Privilege", "Inactive Account", "Missing MFA", "Stale Credentials",
        "Orphaned Service Account", "Privilege Escalation", "Dormant Access", "Cross-Platform Risk",
    ]
    for i in range(1000):
        emp = random.choice(employees)
        sev = random.choices(["low", "medium", "high", "critical"], weights=[20, 35, 30, 15])[0]
        violations.append({
            "violation_id": f"VIO{str(i+1).zfill(5)}",
            "employee_id": emp["employee_id"],
            "framework": random.choice(frameworks),
            "control": random.choice(controls),
            "violation_type": random.choice(violation_types),
            "severity": sev,
            "status": random.choices(["open", "in_progress", "resolved", "dismissed"], weights=[35, 20, 30, 15])[0],
        })
    return violations


def generate_user_roles():
    return [
        {"email": "admin@aureonbank.com", "role": "Admin"},
        {"email": "analyst@aureonbank.com", "role": "Security Analyst"},
        {"email": "auditor@aureonbank.com", "role": "Auditor"},
    ]


def seed():
    print("=" * 60)
    print("AUREON GLOBAL BANK — Enterprise Identity Data Seeding")
    print("=" * 60)
    
    # Check if already seeded
    req = urllib.request.Request(
        f"{BASE_URL}/employees?limit=1",
        headers={**HEADERS, "Prefer": "count=exact"},
    )
    try:
        resp = urllib.request.urlopen(req, timeout=10)
        ct = resp.headers.get("Content-Range", "")
        if "/" in ct:
            existing = int(ct.split("/")[-1])
            if existing >= 1000:
                print(f"\nAlready seeded: {existing} employees. Skipping.")
                return
    except:
        pass
    
    print("\nGenerating enterprise data...")
    random.seed(42)
    
    employees = generate_employees(5000)
    print(f"  employees: {len(employees)}")
    
    accounts = generate_platform_accounts(employees)
    print(f"  platform_accounts: {len(accounts)}")
    
    permissions = generate_permissions(employees, accounts)
    print(f"  permissions: {len(permissions)}")
    
    groups = generate_group_memberships(employees, accounts)
    print(f"  group_memberships: {len(groups)}")
    
    relationships = generate_identity_relationships(employees)
    print(f"  identity_relationships: {len(relationships)}")
    
    history = generate_privilege_history(employees)
    print(f"  privilege_history: {len(history)}")
    
    offboarding = generate_offboarding_records(employees)
    print(f"  offboarding_records: {len(offboarding)}")
    
    temp_access = generate_temporary_access(employees)
    print(f"  temporary_access: {len(temp_access)}")
    
    svc_accounts = generate_service_accounts(employees)
    print(f"  service_accounts: {len(svc_accounts)}")
    
    tokens = generate_api_tokens(employees)
    print(f"  api_tokens: {len(tokens)}")
    
    logs = generate_audit_logs(employees)
    print(f"  audit_logs: {len(logs)}")
    
    violations = generate_compliance_violations(employees)
    print(f"  compliance_violations: {len(violations)}")
    
    user_roles = generate_user_roles()
    print(f"  user_roles: {len(user_roles)}")
    
    print("\nInserting into database...")
    tables_data = [
        ("employees", employees),
        ("platform_accounts", accounts),
        ("permissions", permissions),
        ("group_memberships", groups),
        ("identity_relationships", relationships),
        ("privilege_history", history),
        ("offboarding_records", offboarding),
        ("temporary_access", temp_access),
        ("service_accounts", svc_accounts),
        ("api_tokens", tokens),
        ("audit_logs", logs),
        ("compliance_violations", violations),
        ("user_roles", user_roles),
    ]
    
    total_inserted = 0
    for table, records in tables_data:
        result = insert_batch(table, records)
        total_inserted += result
    
    print(f"\n{'=' * 60}")
    print(f"SEEDING COMPLETE: {total_inserted} records inserted")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    seed()
