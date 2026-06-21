import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ─── INDIAN NAME POOLS ───
const HINDU_FIRST_M = ["Arjun", "Rahul", "Tarun", "Prasad", "Aditya", "Karthik", "Vikram", "Mahesh", "Deepak", "Harsha", "Ankit", "Nitin", "Rajesh", "Suresh", "Amit", "Vijay", "Sanjay", "Ramesh", "Srinivas", "Ganesh", "Manjunath", "Prakash", "Naveen", "Kumar", "Shashi", "Venkat", "Raghav", "Krishna", "Balaji", "Sridhar", "Mohan", "Ashok", "Dinesh", "Girish", "Ravi", "Santosh", "Murali", "Rohit", "Abhinav", "Manoj", "Ajay", "Shivam", "Anirudh", "Akash", "Sagar", "Vishal", "Pramod", "Dhananjay", "Kiran", "Madhav", "Vivek", "Sunil", "Milind", "Uday", "Nikhil", "Gaurav", "Sachin", "Raj"];
const HINDU_FIRST_F = ["Priya", "Divya", "Shreya", "Pooja", "Neha", "Meera", "Kavya", "Sara", "Aadhya", "Navya", "Ira", "Sakshi", "Anjali", "Sneha", "Ananya", "Deepika", "Bhavna", "Pallavi", "Swati", "Rashmi", "Komal", "Madhuri", "Shweta", "Mamta", "Anita"];
const HINDU_LAST = ["Sharma", "Verma", "Gowda", "Hegde", "Iyer", "Reddy", "Rao", "Patil", "Mishra", "Bhat", "Agarwal", "Joshi", "Kumar", "Singh", "Gupta", "Menon", "Nair", "Pillai", "Swamy", "Prasad", "Murthy", "Shetty", "Kulkarni", "Desai", "Jain", "Mehta", "Shah", "Bhattacharya", "Mukherjee", "Banerjee", "Chatterjee", "Naidu", "Pandey", "Tiwari", "Saxena", "Sinha", "Yadav", "Dutta", "Ghosh", "Naik", "Pawar", "Jadhav", "More", "Kamble", "Deshmukh", "Bhosale", "Mahajan", "Purohit", "Trivedi", "Soni", "Varma", "Chauhan", "Rathore", "Tomar", "Parmar", "Solanki", "Rana", "Thakur"];

const MUSLIM_FIRST_M = ["Rizwan", "Faizan", "Aamir", "Imran", "Sameer", "Arshad", "Zubair", "Salman", "Shahid", "Aslam", "Nadeem", "Kareem", "Hamza", "Yusuf", "Omar", "Khalid", "Mohammed", "Ayaan", "Abdul", "Bilal", "Faisal", "Danish", "Farhan", "Kamran", "Tariq"];
const MUSLIM_FIRST_F = ["Ayesha", "Fatima", "Noor", "Hina", "Sana", "Aaliya", "Maryam", "Zoya", "Anaya", "Rida", "Hiba", "Saba", "Aiman", "Eman", "Khadija"];
const MUSLIM_LAST = ["Ahmed", "Shaikh", "Khan", "Hussain", "Rahman", "Ali", "Mirza", "Qureshi", "Malik", "Hashmi", "Siddiqui", "Farooqi", "Ansari", "Sayed", "Baig"];

const CHRISTIAN_FIRST_M = ["Thomas", "Joseph", "Aaron", "Paul", "Daniel", "George", "Michael", "John", "Philip", "Stephen", "James", "David", "Andrew", "Peter", "Matthew"];
const CHRISTIAN_FIRST_F = ["Maria", "Anna", "Rebecca", "Susan", "Elizabeth", "Mary", "Sarah", "Rachel", "Diana", "Sandra", "Anita", "Catherine"];
const CHRISTIAN_LAST = ["Fernandes", "Dsouza", "Mathew", "Varghese", "Kurian", "Thomas", "George", "Jacob", "Philip", "Paul", "Pinto", "Coelho", "Gomes", "Pereira"];

const STATES = ["Karnataka", "Kerala", "Tamil Nadu", "Andhra Pradesh", "Telangana", "Delhi", "Maharashtra", "Punjab", "Uttar Pradesh", "Gujarat", "West Bengal", "Goa", "Rajasthan"];

const DEPARTMENTS = ["Cyber Security", "IT Operations", "Treasury", "Retail Banking", "Corporate Banking", "Risk Management", "Compliance", "Human Resources", "Finance", "Technology", "Data Engineering", "Quality Assurance", "Customer Support", "Operations"];

const DESIGNATIONS = ["Engineer", "Senior Engineer", "Manager", "Senior Manager", "Analyst", "Senior Analyst", "Executive", "Lead", "Director", "Architect"];

const PLATFORMS = ["Active Directory", "Azure AD", "AWS IAM", "Okta", "Kubernetes", "VPN Gateway", "UPI Gateway", "SWIFT Core", "Core Banking", "Oracle DB", "Jenkins", "GitLab", "ServiceNow"];

const RESOURCES = ["UPI Ledger", "RBI Reporting", "Customer KYC", "SWIFT Gateway", "Treasury Server", "Core Banking", "Payment Switch", "NEFT Processor", "Card Settlement", "ATM Gateway", "Fraud Detection", "Risk Analytics"];

const GROUPS = ["Domain Admins", "Azure Admins", "UPI Admins", "SOC Team", "Treasury Ops", "VPN Access", "Core Banking Admins", "SWIFT Users", "RBI Reporters", "Cloud Team"];

const RELATIONSHIP_TYPES = ["member_of", "inherits", "assume_role", "delegated_access", "manages", "reports_to"];
const PERMISSION_LEVELS = ["Read", "Write", "Delete", "Execute", "Admin", "SuperAdmin"];
const MEMBERSHIP_TYPES = ["direct", "inherited", "nested", "delegated"];
const AUDIT_ACTIONS = ["LOGIN_SUCCESS", "FAILED_LOGIN", "UPI_TRANSFER", "TOKEN_CREATED", "ROLE_ESCALATION", "PERMISSION_GRANTED", "API_CALL", "DATA_ACCESS"];
const CITIES = ["Bangalore", "Mumbai", "Chennai", "Delhi", "Hyderabad", "Kochi", "Pune", "Kolkata"];
const FRAMEWORKS = ["NIST", "CIS", "GDPR", "ISO27001", "RBI Guidelines"];
const VIOLATION_TYPES = ["Excessive Permissions", "Stale Account", "Missing MFA", "Unauthorized Access", "Privilege Accumulation"];
const SERVICES = ["svc-upi", "svc-swift", "svc-rbi", "svc-neft", "svc-payment", "svc-fraud", "svc-kyc", "svc-auth"];
const NOTIFICATION_TYPES = ["Zombie credential", "Dormant account", "Privilege escalation", "Token expired", "Compliance violation"];
const TEMP_ACCESS_TYPES = ["Emergency Access", "Temporary Admin", "DBA Access", "Production Access"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function daysAgo(days: number): string { const d = new Date(); d.setDate(d.getDate() - days); return d.toISOString().split("T")[0]; }

function generateName(idx: number): { first: string; last: string; religion: string } {
  const r = idx % 100;
  if (r < 90) {
    const first = idx % 2 === 0 ? pick(HINDU_FIRST_M) : pick(HINDU_FIRST_F);
    return { first, last: pick(HINDU_LAST), religion: "Hindu" };
  } else if (r < 97) {
    const first = idx % 2 === 0 ? pick(MUSLIM_FIRST_M) : pick(MUSLIM_FIRST_F);
    return { first, last: pick(MUSLIM_LAST), religion: "Muslim" };
  } else {
    const first = idx % 2 === 0 ? pick(CHRISTIAN_FIRST_M) : pick(CHRISTIAN_FIRST_F);
    return { first, last: pick(CHRISTIAN_LAST), religion: "Christian" };
  }
}

async function batchInsert(supabase: any, table: string, rows: any[], batchSize: number): Promise<{ inserted: number; errors: string[] }> {
  const errors: string[] = [];
  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) {
      errors.push(`batch ${Math.floor(i/batchSize)}: ${error.message.substring(0, 100)}`);
    } else {
      inserted += chunk.length;
    }
  }
  return { inserted, errors };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const results: string[] = [];
    const BATCH = 500;

    // PHASE 1: EMPLOYEES (8500) - with guaranteed unique emails
    results.push("PHASE 1: Generating 8500 employees...");
    const employees: any[] = [];

    for (let i = 0; i < 8500; i++) {
      const { first, last } = generateName(i);
      const empNum = String(i + 1).padStart(5, "0");
      // Guaranteed unique email using employee number
      const email = `emp${empNum}@bharatsecurebank.in`;

      employees.push({
        employee_id: `EMP${empNum}`,
        full_name: `${first} ${last}`,
        email: email,
        department: pick(DEPARTMENTS),
        region: pick(STATES),
        designation: pick(DESIGNATIONS),
        employment_status: i < 7800 ? "active" : (i < 8100 ? "suspended" : "terminated"),
        join_date: daysAgo(randInt(30, 3650)),
        termination_date: i >= 8100 ? daysAgo(randInt(1, 180)) : null,
        manager_id: i > 10 ? `EMP${String(randInt(1, i)).padStart(5, "0")}` : null,
        risk_level: i < 7500 ? "low" : (i < 8200 ? "medium" : (i < 8400 ? "high" : "critical"))
      });
    }

    const empResult = await batchInsert(supabase, "employees", employees, BATCH);
    results.push(`Inserted ${empResult.inserted} employees`);
    if (empResult.errors.length > 0) results.push(`Employee errors: ${empResult.errors.join("; ")}`);

    // PHASE 2: PLATFORM ACCOUNTS (30000)
    results.push("PHASE 2: Generating platform accounts...");
    const accounts: any[] = [];
    const activeEmps = employees.filter(e => e.employment_status !== "terminated");

    for (let i = 0; i < 30000; i++) {
      const emp = pick(activeEmps);
      accounts.push({
        account_id: `ACC${String(i + 1).padStart(6, "0")}`,
        employee_id: emp.employee_id,
        platform: pick(PLATFORMS),
        username: `user${i + 1}`,
        account_status: Math.random() < 0.92 ? "active" : "dormant",
        last_login: new Date(Date.now() - randInt(0, 90) * 86400000).toISOString(),
        mfa_enabled: Math.random() < 0.4,
        created_date: daysAgo(randInt(30, 1000))
      });
    }
    const accResult = await batchInsert(supabase, "platform_accounts", accounts, BATCH);
    results.push(`Inserted ${accResult.inserted} platform accounts`);

    // PHASE 3: PERMISSIONS (42000)
    results.push("PHASE 3: Generating permissions...");
    const permissions: any[] = [];
    for (let i = 0; i < 42000; i++) {
      const emp = pick(employees);
      permissions.push({
        permission_id: `PERM${String(i + 1).padStart(6, "0")}`,
        employee_id: emp.employee_id,
        platform: pick(PLATFORMS),
        resource_name: pick(RESOURCES),
        permission_level: pick(PERMISSION_LEVELS),
        granted_date: daysAgo(randInt(1, 730)),
        last_used: Math.random() < 0.7 ? new Date(Date.now() - randInt(0, 90) * 86400000).toISOString() : null,
        is_admin: Math.random() < 0.15
      });
    }
    const permResult = await batchInsert(supabase, "permissions", permissions, BATCH);
    results.push(`Inserted ${permResult.inserted} permissions`);

    // PHASE 4: GROUP MEMBERSHIPS (25000)
    results.push("PHASE 4: Generating group memberships...");
    const groups: any[] = [];
    for (let i = 0; i < 25000; i++) {
      const emp = pick(employees);
      groups.push({
        group_id: `GRP${String(i + 1).padStart(6, "0")}`,
        employee_id: emp.employee_id,
        platform: pick(PLATFORMS),
        group_name: pick(GROUPS),
        parent_group: Math.random() < 0.3 ? pick(GROUPS) : null,
        membership_type: pick(MEMBERSHIP_TYPES)
      });
    }
    const grpResult = await batchInsert(supabase, "group_memberships", groups, BATCH);
    results.push(`Inserted ${grpResult.inserted} group memberships`);

    // PHASE 5: SERVICE ACCOUNTS (2500)
    results.push("PHASE 5: Generating service accounts...");
    const svcAccounts: any[] = [];
    for (let i = 0; i < 2500; i++) {
      const emp = pick(activeEmps);
      const priv = pick(["Read", "Write", "Admin", "SuperAdmin"]);
      svcAccounts.push({
        service_account_id: `SVC${String(i + 1).padStart(5, "0")}`,
        owner_employee_id: emp.employee_id,
        service_name: `${pick(SERVICES)}-${i + 1}`,
        platform: pick(PLATFORMS),
        privilege_level: priv,
        last_used: Math.random() < 0.8 ? new Date(Date.now() - randInt(0, 60) * 86400000).toISOString() : null,
        token_active: Math.random() < 0.75,
        risk_level: priv === "SuperAdmin" ? "critical" : (priv === "Admin" ? "high" : "medium")
      });
    }
    const svcResult = await batchInsert(supabase, "service_accounts", svcAccounts, BATCH);
    results.push(`Inserted ${svcResult.inserted} service accounts`);

    // PHASE 6: API TOKENS (4000)
    results.push("PHASE 6: Generating API tokens...");
    const tokens: any[] = [];
    for (let i = 0; i < 4000; i++) {
      const emp = pick(activeEmps);
      const isOld = Math.random() < 0.25;
      tokens.push({
        token_id: `TOK${String(i + 1).padStart(6, "0")}`,
        employee_id: emp.employee_id,
        platform: pick(PLATFORMS),
        token_name: `token-${i + 1}`,
        created_date: daysAgo(isOld ? randInt(180, 720) : randInt(1, 90)),
        last_used: new Date(Date.now() - randInt(0, 60) * 86400000).toISOString(),
        rotated: !isOld,
        active: !isOld || Math.random() < 0.5,
        risk_level: isOld ? pick(["high", "critical"]) : pick(["low", "medium"])
      });
    }
    const tokResult = await batchInsert(supabase, "api_tokens", tokens, BATCH);
    results.push(`Inserted ${tokResult.inserted} API tokens`);

    // PHASE 7: TEMPORARY ACCESS (2000)
    results.push("PHASE 7: Generating temporary access...");
    const tempAccess: any[] = [];
    for (let i = 0; i < 2000; i++) {
      const emp = pick(activeEmps);
      const isExpired = Math.random() < 0.3;
      tempAccess.push({
        temp_access_id: `TMP${String(i + 1).padStart(6, "0")}`,
        employee_id: emp.employee_id,
        platform: pick(PLATFORMS),
        access_granted: pick(TEMP_ACCESS_TYPES),
        expiry_date: daysAgo(isExpired ? -randInt(1, 30) : randInt(1, 90)),
        current_status: isExpired ? "expired" : "active",
        still_active: isExpired && Math.random() < 0.5,
        risk_level: isExpired ? pick(["high", "critical"]) : pick(["low", "medium"])
      });
    }
    const tmpResult = await batchInsert(supabase, "temporary_access", tempAccess, BATCH);
    results.push(`Inserted ${tmpResult.inserted} temporary access records`);

    // PHASE 8: OFFBOARDING (1200)
    results.push("PHASE 8: Generating offboarding records...");
    const terminatedEmps = employees.filter(e => e.employment_status === "terminated");
    const offboarding: any[] = [];
    for (let i = 0; i < Math.min(1200, terminatedEmps.length); i++) {
      const emp = terminatedEmps[i];
      const hasResidual = Math.random() < 0.4;
      offboarding.push({
        offboard_id: `OFF${String(i + 1).padStart(6, "0")}`,
        employee_id: emp.employee_id,
        termination_date: emp.termination_date || daysAgo(randInt(1, 180)),
        hr_status: hasResidual ? pick(["pending", "overdue"]) : "complete",
        ad_status: Math.random() < 0.7 ? "disabled" : "active",
        azure_status: Math.random() < 0.7 ? "disabled" : "active",
        aws_status: hasResidual ? "active" : "disabled",
        okta_status: Math.random() < 0.7 ? "disabled" : "active",
        salesforce_status: Math.random() < 0.8 ? "disabled" : "active",
        residual_access_found: hasResidual
      });
    }
    const offResult = await batchInsert(supabase, "offboarding_records", offboarding, BATCH);
    results.push(`Inserted ${offResult.inserted} offboarding records`);

    // PHASE 9: COMPLIANCE VIOLATIONS (2500)
    results.push("PHASE 9: Generating compliance violations...");
    const violations: any[] = [];
    for (let i = 0; i < 2500; i++) {
      const emp = pick(employees);
      violations.push({
        violation_id: `VIO${String(i + 1).padStart(6, "0")}`,
        employee_id: emp.employee_id,
        framework: pick(FRAMEWORKS),
        control: `CTRL-${randInt(1, 10)}`,
        violation_type: pick(VIOLATION_TYPES),
        severity: pick(["low", "medium", "high", "critical"]),
        status: pick(["open", "in_progress", "resolved"])
      });
    }
    const vioResult = await batchInsert(supabase, "compliance_violations", violations, BATCH);
    results.push(`Inserted ${vioResult.inserted} compliance violations`);

    // PHASE 10: SECURITY METRICS (24 months)
    results.push("PHASE 10: Generating security metrics...");
    const metrics: any[] = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 24);

    for (let m = 0; m < 24; m++) {
      const monthDate = new Date(startDate);
      monthDate.setMonth(monthDate.getMonth() + m);

      let identities = 7200 + Math.floor(m * 54);
      let privileged = 720 + Math.floor(m * 5);

      metrics.push({
        month_id: m + 1,
        month: monthDate.toISOString().slice(0, 7),
        total_identities: Math.min(8500, identities),
        privileged_accounts: Math.min(830, privileged),
        zombie_accounts: 55 + Math.floor(m * 0.8),
        dormant_accounts: 110 + Math.floor(m * 1.2),
        compliance_violations: 48 + Math.floor(m * 0.4),
        attack_paths: Math.min(18, 8 + Math.floor(m * 0.4)),
        cross_platform_risks: Math.min(22, 10 + Math.floor(m * 0.5)),
        temp_access_drift: Math.min(37, 20 + Math.floor(m * 0.7))
      });
    }
    // Set final month exact values
    metrics[23].total_identities = 8500;
    metrics[23].privileged_accounts = 830;
    metrics[23].zombie_accounts = 74;
    metrics[23].dormant_accounts = 138;
    metrics[23].compliance_violations = 57;
    metrics[23].attack_paths = 18;
    metrics[23].cross_platform_risks = 22;
    metrics[23].temp_access_drift = 37;

    const metResult = await batchInsert(supabase, "security_metrics_history", metrics, BATCH);
    results.push(`Inserted ${metResult.inserted} metrics records`);

    // PHASE 11: NOTIFICATIONS (10000)
    results.push("PHASE 11: Generating notifications...");
    const notifications: any[] = [];
    for (let i = 0; i < 10000; i++) {
      const emp = pick(employees);
      notifications.push({
        notification_id: `NOTIF${String(i + 1).padStart(6, "0")}`,
        employee_id: emp.employee_id,
        message: pick(NOTIFICATION_TYPES),
        severity: pick(["info", "warning", "critical"]),
        status: pick(["unread", "read", "actioned"])
      });
    }
    const notifResult = await batchInsert(supabase, "notifications", notifications, BATCH);
    results.push(`Inserted ${notifResult.inserted} notifications`);

    // PHASE 12: AUDIT LOGS (80000)
    results.push("PHASE 12: Generating audit logs...");
    const auditLogs: any[] = [];
    for (let i = 0; i < 80000; i++) {
      const emp = pick(employees);
      const action = pick(AUDIT_ACTIONS);
      auditLogs.push({
        log_id: `LOG${String(i + 1).padStart(8, "0")}`,
        employee_id: emp.employee_id,
        platform: pick(PLATFORMS),
        action_type: action,
        resource: pick(RESOURCES),
        timestamp: new Date(Date.now() - randInt(0, 90) * 86400000 - randInt(0, 23) * 3600000).toISOString(),
        location: pick(CITIES),
        anomaly_score: ["FAILED_LOGIN", "ROLE_ESCALATION"].includes(action) ? Math.random() * 0.5 + 0.5 : Math.random() * 0.3
      });
    }
    const logResult = await batchInsert(supabase, "audit_logs", auditLogs, BATCH);
    results.push(`Inserted ${logResult.inserted} audit logs`);

    // PHASE 13: IDENTITY RELATIONSHIPS (25000) - no FK constraints
    results.push("PHASE 13: Generating identity relationships...");
    const relationships: any[] = [];
    for (let i = 0; i < 25000; i++) {
      relationships.push({
        relationship_id: `REL${String(i + 1).padStart(7, "0")}`,
        source_id: `EMP${String(randInt(1, 8500)).padStart(5, "0")}`,
        target_id: `EMP${String(randInt(1, 8500)).padStart(5, "0")}`,
        relationship_type: pick(RELATIONSHIP_TYPES),
        platform: pick(PLATFORMS)
      });
    }
    const relResult = await batchInsert(supabase, "identity_relationships", relationships, BATCH);
    results.push(`Inserted ${relResult.inserted} identity relationships`);

    // PHASE 14: PRIVILEGE HISTORY (15000)
    results.push("PHASE 14: Generating privilege history...");
    const privHistory: any[] = [];
    for (let i = 0; i < 15000; i++) {
      const emp = pick(employees);
      privHistory.push({
        history_id: `HIST${String(i + 1).padStart(7, "0")}`,
        employee_id: emp.employee_id,
        month: `${2024 + Math.floor(randInt(0, 18) / 12)}-${String(randInt(1, 12)).padStart(2, "0")}`,
        platform: pick(PLATFORMS),
        old_permission: pick(["Read", "Write", "Admin"]),
        new_permission: pick(PERMISSION_LEVELS),
        change_reason: pick(["Role Promotion", "Transfer", "Grant Extended", "Audit Remediation"])
      });
    }
    const histResult = await batchInsert(supabase, "privilege_history", privHistory, BATCH);
    results.push(`Inserted ${histResult.inserted} privilege history records`);

    // FINAL VERIFICATION
    const { count: empCount } = await supabase.from("employees").select("*", { count: "exact", head: true });
    const { count: paCount } = await supabase.from("platform_accounts").select("*", { count: "exact", head: true });
    const { count: permCount } = await supabase.from("permissions").select("*", { count: "exact", head: true });
    const { count: gmCount } = await supabase.from("group_memberships").select("*", { count: "exact", head: true });
    const { count: saCount } = await supabase.from("service_accounts").select("*", { count: "exact", head: true });
    const { count: atCount } = await supabase.from("api_tokens").select("*", { count: "exact", head: true });
    const { count: taCount } = await supabase.from("temporary_access").select("*", { count: "exact", head: true });
    const { count: obCount } = await supabase.from("offboarding_records").select("*", { count: "exact", head: true });
    const { count: cvCount } = await supabase.from("compliance_violations").select("*", { count: "exact", head: true });
    const { count: mhCount } = await supabase.from("security_metrics_history").select("*", { count: "exact", head: true });
    const { count: ntCount } = await supabase.from("notifications").select("*", { count: "exact", head: true });
    const { count: alCount } = await supabase.from("audit_logs").select("*", { count: "exact", head: true });
    const { count: irCount } = await supabase.from("identity_relationships").select("*", { count: "exact", head: true });
    const { count: phCount } = await supabase.from("privilege_history").select("*", { count: "exact", head: true });

    return new Response(JSON.stringify({
      status: "COMPLETE",
      phases: results,
      counts: {
        employees: empCount,
        platform_accounts: paCount,
        permissions: permCount,
        group_memberships: gmCount,
        service_accounts: saCount,
        api_tokens: atCount,
        temporary_access: taCount,
        offboarding_records: obCount,
        compliance_violations: cvCount,
        security_metrics_history: mhCount,
        notifications: ntCount,
        audit_logs: alCount,
        identity_relationships: irCount,
        privilege_history: phCount
      }
    }, null, 2), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
