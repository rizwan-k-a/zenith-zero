import os

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

COUNTS = {
    "employees": 8500,
    "platform_accounts": 30000,
    "permissions": 42000,
    "group_memberships": 25000,
    "service_accounts": 2500,
    "api_tokens": 4000,
    "temporary_access": 2000,
    "offboarding_records": 1200,
    "privilege_history": 15000,
    "compliance_violations": 2500,
    "audit_logs": 80000,
    "identity_relationships": 25000,
    "notifications": 10000,
}

DELETE_ORDER = [
    "cross_dep_locks",
    "residual_access_violations",
    "lifecycle_events",
    "revocation_requests",
    "identity_relationships",
    "audit_logs",
    "privilege_history",
    "offboarding_records",
    "temporary_access",
    "api_tokens",
    "service_accounts",
    "permissions",
    "group_memberships",
    "platform_accounts",
    "compliance_violations",
    "employees",
]

BATCH_SIZE = 500

PLATFORMS = [
    "Active Directory",
    "Azure AD",
    "AWS IAM",
    "Okta",
    "Kubernetes",
    "VPN Gateway",
    "UPI Gateway",
    "SWIFT Gateway",
    "Core Banking API",
    "Payment Processing Engine",
]

DEPARTMENTS = [
    "Cyber Security",
    "IT Operations",
    "Treasury",
    "Retail Banking",
    "Corporate Banking",
    "Risk Management",
    "Compliance",
    "Human Resources",
    "Finance",
    "Technology",
    "Data Engineering",
    "Quality Assurance",
    "Customer Support",
    "Operations",
]

REGIONS = [
    "Karnataka",
    "Kerala",
    "Tamil Nadu",
    "Andhra Pradesh",
    "Maharashtra",
    "Delhi",
    "Punjab",
    "Telangana",
    "Gujarat",
    "West Bengal",
    "Uttar Pradesh",
]

HINDU_FIRST_NAMES = [
    "Arjun", "Rahul", "Tarun", "Prasad", "Aditya", "Karthik", "Vikram", "Mahesh",
    "Deepak", "Harsha", "Ankit", "Nitin", "Rajesh", "Suresh", "Amit", "Vijay",
    "Sanjay", "Ramesh", "Srinivas", "Ganesh", "Manjunath", "Suresh", "Prakash",
    "Naveen", "Kumar", "Shashi", "Venkat", "Raghav", "Krishna", "Balaji",
    "Sridhar", "Mohan", "Ashok", "Dinesh", "Girish", "Ravi", "Santosh", "Murali",
]

HINDU_LAST_NAMES = [
    "Sharma", "Verma", "Gowda", "Hegde", "Iyer", "Reddy", "Rao", "Patil",
    "Mishra", "Bhat", "Agarwal", "Joshi", "Kumar", "Singh", "Gupta", "Menon",
    "Nair", "Pillai", "Swamy", "Prasad", "Murthy", "Shetty", "Kulkarni", "Desai",
    "Jain", "Mehta", "Shah", "Bhattacharya", "Mukherjee", "Banerjee", "Chatterjee",
]

MUSLIM_FIRST_NAMES = [
    "Rizwan", "Faizan", "Aamir", "Imran", "Sameer", "Arshad", "Zubair", "Salman",
    "Shahid", "Aslam", "Nadeem", "Kareem", "Hamza", "Yusuf", "Omar", "Khalid",
]

MUSLIM_LAST_NAMES = [
    "Ahmed", "Shaikh", "Khan", "Hussain", "Rahman", "Ali", "Mirza", "Qureshi",
    "Malik", "Hashmi", "Siddiqui", "Farooqi", "Ansari", "Sayed",
]

CHRISTIAN_FIRST_NAMES = [
    "Thomas", "Joseph", "Aaron", "Paul", "Daniel", "George", "Michael", "John",
    "Philip", "Stephen", "James", "David", "Andrew", "Peter", "Matthew",
]

CHRISTIAN_LAST_NAMES = [
    "Fernandes", "Dsouza", "Mathev", "Varghese", "Kurian", "Thomas", "George",
    "Pereira", "Menezes", "Coelho", "DSilva", "Castellino",
]

RESOURCES = [
    "UPI Ledger",
    "RBI Reporting Portal",
    "Customer KYC Database",
    "SWIFT Payment Gateway",
    "Treasury Server",
    "Core Banking Ledger",
    "Payment Switch",
    "NEFT Batch Processor",
    "Card Settlement Engine",
    "ATM Gateway",
    "Internet Banking Portal",
    "Mobile Banking API",
    "Fraud Detection System",
    "Transaction Monitoring",
    "Risk Analytics Dashboard",
]

GROUPS = [
    "Domain Admins",
    "Azure Global Admins",
    "UPI Transaction Admins",
    "SOC Monitoring Team",
    "Treasury Operators",
    "VPN Full Access",
    "Core Banking Admins",
    "SWIFT Gateway Users",
    "RBI Reporters",
    "IT Operations",
    "Cloud Engineers",
    "Database Admins",
    "Security Analysts",
    "Compliance Officers",
]

SERVICES = [
    "svc-upi-engine",
    "svc-swift-processor",
    "svc-rbi-reporting",
    "svc-neft-batch",
    "svc-payment-switch",
    "svc-card-settlement",
    "svc-fraud-detector",
    "svc-kyc-validator",
    "svc-audit-logger",
    "svc-notification",
    "svc-auth-gateway",
    "svc-ledger-sync",
    "svc-reconciliation",
    "svc-backup-agent",
]

AUDIT_ACTIONS = [
    "LOGIN_SUCCESS",
    "FAILED_LOGIN",
    "AWS_ASSUME_ROLE",
    "UPI_TRANSFER",
    "TOKEN_CREATED",
    "EXPORT_DATA",
    "ROLE_ESCALATION",
    "PERMISSION_GRANTED",
    "ACCOUNT_CREATED",
    "PASSWORD_RESET",
    "MFA_ENABLED",
    "SUSPICIOUS_ACCESS",
    "DATA_ACCESS",
    "CONFIG_CHANGE",
    "API_CALL",
]

CITIES = [
    "Bangalore", "Mumbai", "Chennai", "Delhi", "Hyderabad", "Kochi", "Pune",
    "Kolkata", "Ahmedabad", "Chandigarh", "Lucknow", "Jaipur",
]

COMPLIANCE_FRAMEWORKS = [
    "NIST", "CIS", "GDPR", "ISO27001", "RBI Guidelines", "PCI-DSS", "SOX",
]

RELATIONSHIP_TYPES = [
    "inherits",
    "owns",
    "assumes_role",
    "cross_platform_link",
    "member_of",
    "manages",
    "delegated_access",
]

NOTIFICATION_TYPES = [
    "Zombie credential detected",
    "Dormant AWS account detected",
    "Privilege escalation risk",
    "API token stale",
    "Compliance violation detected",
    "Orphaned permission found",
    "Cross-platform risk identified",
    "Temporary access expired",
    "Offboarding incomplete",
    "Suspicious login pattern",
]
