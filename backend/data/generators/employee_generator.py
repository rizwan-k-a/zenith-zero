import random
from datetime import datetime, timedelta
import sys
sys.path.insert(0, '/tmp/cc-agent/68062460/project/backend/data')
from config import (
    HINDU_FIRST_NAMES, HINDU_LAST_NAMES,
    MUSLIM_FIRST_NAMES, MUSLIM_LAST_NAMES,
    CHRISTIAN_FIRST_NAMES, CHRISTIAN_LAST_NAMES,
    DEPARTMENTS, REGIONS, COUNTS
)

DESIGNATIONS = {
    "Cyber Security": ["Security Engineer", "Security Analyst", "SOC Analyst", "Security Architect", "CISO"],
    "IT Operations": ["System Administrator", "Network Engineer", "DevOps Engineer", "IT Manager"],
    "Treasury": ["Treasury Analyst", "Treasury Manager", "Cash Manager", "FX Analyst"],
    "Retail Banking": ["Branch Manager", "Relationship Manager", "Loan Officer", "Customer Executive"],
    "Corporate Banking": ["Corporate Manager", "Credit Analyst", "Relationship Manager", "Business Head"],
    "Risk Management": ["Risk Analyst", "Risk Manager", "Chief Risk Officer", "Credit Risk Analyst"],
    "Compliance": ["Compliance Officer", "AML Analyst", "KYC Analyst", "Compliance Manager"],
    "Human Resources": ["HR Executive", "HR Manager", "Recruiter", "HR Director"],
    "Finance": ["Financial Analyst", "Accountant", "Finance Manager", "CFO"],
    "Technology": ["Software Engineer", "Tech Lead", "Engineering Manager", "CTO"],
    "Data Engineering": ["Data Engineer", "Data Scientist", "Data Architect", "Analytics Manager"],
    "Quality Assurance": ["QA Engineer", "QA Lead", "Test Manager", "QA Director"],
    "Customer Support": ["Support Executive", "Support Lead", "Support Manager", "Customer Success Manager"],
    "Operations" : ["Operations Executive", "Operations Manager", "Process Lead", "COO"],
}

def generate_employees():
    employees = []
    emp_id = 1
    base_date = datetime.now()

    hindu_count = 7650
    muslim_count = 595
    christian_count = 255

    for _ in range(hindu_count):
        first = random.choice(HINDU_FIRST_NAMES)
        last = random.choice(HINDU_LAST_NAMES)
        full_name = f"{first} {last}"
        email = f"{first.lower()}.{last.lower()}@bharatsecurebank.in"

        dept = random.choice(DEPARTMENTS)
        designation = random.choice(DESIGNATIONS.get(dept, ["Employee"]))
        region = random.choice(REGIONS)

        status_choices = ["active"] * 92 + ["suspended"] * 4 + ["terminated"] * 2 + ["on_leave"] * 2
        status = random.choice(status_choices)

        risk_choices = ["low"] * 70 + ["medium"] * 20 + ["high"] * 8 + ["critical"] * 2
        risk = random.choice(risk_choices)

        join_date = base_date - timedelta(days=random.randint(30, 3650))

        termination_date = None
        if status == "terminated":
            termination_date = (join_date + timedelta(days=random.randint(365, 1825))).strftime("%Y-%m-%d")

        manager_id = f"EMP{random.randint(1, emp_id):05d}" if emp_id > 10 else None

        employees.append({
            "employee_id": f"EMP{emp_id:05d}",
            "full_name": full_name,
            "email": email,
            "department": dept,
            "designation": designation,
            "region": region,
            "employment_status": status,
            "join_date": join_date.strftime("%Y-%m-%d"),
            "termination_date": termination_date,
            "manager_id": manager_id,
            "risk_level": risk,
        })
        emp_id += 1

    for _ in range(muslim_count):
        first = random.choice(MUSLIM_FIRST_NAMES)
        last = random.choice(MUSLIM_LAST_NAMES)
        full_name = f"{first} {last}"
        email = f"{first.lower()}.{last.lower()}@bharatsecurebank.in"

        dept = random.choice(DEPARTMENTS)
        designation = random.choice(DESIGNATIONS.get(dept, ["Employee"]))
        region = random.choice(REGIONS)

        status_choices = ["active"] * 92 + ["suspended"] * 4 + ["terminated"] * 2 + ["on_leave"] * 2
        status = random.choice(status_choices)

        risk_choices = ["low"] * 70 + ["medium"] * 20 + ["high"] * 8 + ["critical"] * 2
        risk = random.choice(risk_choices)

        join_date = base_date - timedelta(days=random.randint(30, 3650))

        termination_date = None
        if status == "terminated":
            termination_date = (join_date + timedelta(days=random.randint(365, 1825))).strftime("%Y-%m-%d")

        manager_id = f"EMP{random.randint(1, emp_id):05d}" if emp_id > 10 else None

        employees.append({
            "employee_id": f"EMP{emp_id:05d}",
            "full_name": full_name,
            "email": email,
            "department": dept,
            "designation": designation,
            "region": region,
            "employment_status": status,
            "join_date": join_date.strftime("%Y-%m-%d"),
            "termination_date": termination_date,
            "manager_id": manager_id,
            "risk_level": risk,
        })
        emp_id += 1

    for _ in range(christian_count):
        first = random.choice(CHRISTIAN_FIRST_NAMES)
        last = random.choice(CHRISTIAN_LAST_NAMES)
        full_name = f"{first} {last}"
        email = f"{first.lower()}.{last.lower()}@bharatsecurebank.in"

        dept = random.choice(DEPARTMENTS)
        designation = random.choice(DESIGNATIONS.get(dept, ["Employee"]))
        region = random.choice(REGIONS)

        status_choices = ["active"] * 92 + ["suspended"] * 4 + ["terminated"] * 2 + ["on_leave"] * 2
        status = random.choice(status_choices)

        risk_choices = ["low"] * 70 + ["medium"] * 20 + ["high"] * 8 + ["critical"] * 2
        risk = random.choice(risk_choices)

        join_date = base_date - timedelta(days=random.randint(30, 3650))

        termination_date = None
        if status == "terminated":
            termination_date = (join_date + timedelta(days=random.randint(365, 1825))).strftime("%Y-%m-%d")

        manager_id = f"EMP{random.randint(1, emp_id):05d}" if emp_id > 10 else None

        employees.append({
            "employee_id": f"EMP{emp_id:05d}",
            "full_name": full_name,
            "email": email,
            "department": dept,
            "designation": designation,
            "region": region,
            "employment_status": status,
            "join_date": join_date.strftime("%Y-%m-%d"),
            "termination_date": termination_date,
            "manager_id": manager_id,
            "risk_level": risk,
        })
        emp_id += 1

    random.shuffle(employees)

    for i, emp in enumerate(employees, 1):
        emp["employee_id"] = f"EMP{i:05d}"

    return employees
