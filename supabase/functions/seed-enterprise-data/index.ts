import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ─── INDIAN NAME POOLS ────────────────────────────────────────────
const MUSLIM_FIRST_M = ["Mohammed", "Ayaan", "Abdul", "Faizan", "Imran", "Asif", "Salman", "Bilal", "Zubair", "Faisal", "Sameer", "Arman", "Saif", "Danish", "Farhan", "Kamran", "Nadeem", "Owais", "Rizwan", "Tariq", "Usman", "Waseem", "Yasir"];
const MUSLIM_FIRST_F = ["Sameera", "Ayesha", "Zara", "Fatima", "Noor", "Hina", "Sana", "Aaliya", "Maryam", "Zoya", "Anaya", "Inaya", "Rida", "Hiba", "Saba", "Aiman", "Eman", "Khadija", "Rabia", "Sumayya"];
const MUSLIM_LAST = ["Khan", "Ahmed", "Sheikh", "Hussain", "Rahman", "Siddiqui", "Ansari", "Qureshi", "Faruqi", "Malik", "Hashmi", "Nadwi", "Usmani", "Baig", "Mirza", "Pasha", "Sherwani", "Bukhari", "Kapadia", "Lodhi"];

const HINDU_FIRST_M = ["Arjun", "Rahul", "Karthik", "Harsh", "Aditya", "Vivek", "Suresh", "Rohan", "Karan", "Vikram", "Sandeep", "Naveen", "Prashant", "Gaurav", "Nikhil", "Akash", "Abhishek", "Siddharth", "Varun", "Tarun", "Amit", "Sunil", "Rajesh", "Anil", "Manish"];
const HINDU_FIRST_F = ["Sneha", "Ananya", "Priya", "Deepika", "Divya", "Shreya", "Pooja", "Neha", "Meera", "Kavya", "Sara", "Pari", "Aadhya", "Navya", "Ira", "Sakshi", "Naina", "Anjali", "Bhavna"];
const HINDU_LAST = ["Sharma", "Verma", "Gupta", "Joshi", "Mehta", "Shah", "Desai", "Malhotra", "Agarwal", "Bhat", "Srivastava", "Tiwari", "Pandey", "Saxena", "Sinha", "Yadav", "Mishra", "Banerjee", "Chatterjee", "Dutta", "Ghosh"];
const HINDU_SOUTH = ["Iyer", "Iyengar", "Nair", "Menon", "Nambiar", "Pillai", "Reddy", "Rao", "Shetty", "Hegde", "Kulkarni", "Subramanian", "Raghavan", "Murthy", "Krishnan", "Srinivasan", "Venkataraman", "Ranganathan"];

const CHRISTIAN_FIRST_M = ["Joseph", "Kevin", "Samuel", "Chris", "Nathan", "John", "Mark", "Paul", "Thomas", "George", "Michael", "Stephen", "Andrew", "Philip", "Simon", "Peter", "James", "David", "Roy"];
const CHRISTIAN_FIRST_F = ["Maria", "Anna", "Rebecca", "Susan", "Elizabeth", "Mary", "Sarah", "Rachel", "Diana", "Sandra", "Anita", "Catherine", "Patricia", "Lisa", "Donna", "Linda", "Helen", "Nancy"];
const CHRISTIAN_LAST = ["Mathew", "Dsouza", "Thomas", "Fernandes", "George", "Jacob", "Philip", "Paul", "Pinto", "Coelho", "Gomes", "Pereira", "Almeida", "Braganza", "Coutinho", "Mascarenhas", "Noronha", "Furtado", "Dias"];

const SIKH_FIRST_M = ["Gurpreet", "Manpreet", "Amritpal", "Harbhajan", "Jaspreet", "Harjinder", "Sukhwinder", "Paramjit", "Ravinder", "Davinder", "Kuldeep", "Baljeet", "Hardeep", "Mandeep", "Simran"];
const SIKH_FIRST_F = ["Harleen", "Manpreet", "Gurleen", "Simran", "Jasmine", "Navleen", "Pargat", "Rupinder", "Sukhpreet", "Amrita", "Baljot", "Dilpreet", "Ekam", "Gunjan"];
const SIKH_LAST = ["Singh", "Kaur", "Sandhu", "Gill", "Dhillon", "Brar", "Sidhu", "Cheema", "Grewal", "Bajwa", "Mann", "Thind", "Bhinder", "Sodhi", "Matharu"];

const STATE_CITY: { state: string; city: string; district: string; office_location: string }[] = [
  { state: "Karnataka", city: "Bangalore", district: "Bengaluru Urban", office_location: "Koramangala" },
  { state: "Karnataka", city: "Bangalore", district: "Bengaluru Urban", office_location: "Indiranagar" },
  { state: "Karnataka", city: "Bangalore", district: "Bengaluru Urban", office_location: "Electronic City" },
  { state: "Karnataka", city: "Bangalore", district: "Bengaluru Urban", office_location: "Whitefield" },
  { state: "Karnataka", city: "Bangalore", district: "Bengaluru Urban", office_location: "HSR Layout" },
  { state: "Karnataka", city: "Bangalore", district: "Bengaluru Urban", office_location: "JP Nagar" },
  { state: "Karnataka", city: "Bangalore", district: "Bengaluru Urban", office_location: "MG Road" },
  { state: "Karnataka", city: "Mysore", district: "Mysuru", office_location: "Hebbal Industrial Area" },
  { state: "Karnataka", city: "Mangalore", district: "Dakshina Kannada", office_location: "Hampankatta" },
  { state: "Kerala", city: "Kochi", district: "Ernakulam", office_location: "Kakkanad" },
  { state: "Kerala", city: "Kochi", district: "Ernakulam", office_location: "Infopark" },
  { state: "Kerala", city: "Trivandrum", district: "Thiruvananthapuram", office_location: "Technopark" },
  { state: "Kerala", city: "Kozhikode", district: "Kozhikode", office_location: "Mavoor Road" },
  { state: "Kerala", city: "Thrissur", district: "Thrissur", office_location: "Swaraj Round" },
  { state: "Tamil Nadu", city: "Chennai", district: "Chennai", office_location: "Anna Nagar" },
  { state: "Tamil Nadu", city: "Chennai", district: "Chennai", office_location: "T Nagar" },
  { state: "Tamil Nadu", city: "Chennai", district: "Chennai", office_location: "OMR" },
  { state: "Tamil Nadu", city: "Coimbatore", district: "Coimbatore", office_location: "RS Puram" },
  { state: "Tamil Nadu", city: "Madurai", district: "Madurai", office_location: "Tallakulam" },
  { state: "Andhra Pradesh", city: "Visakhapatnam", district: "Visakhapatnam", office_location: "Dwaraka Nagar" },
  { state: "Andhra Pradesh", city: "Vijayawada", district: "Krishna", office_location: "MG Road" },
  { state: "Telangana", city: "Hyderabad", district: "Hyderabad", office_location: "Banjara Hills" },
  { state: "Telangana", city: "Hyderabad", district: "Hyderabad", office_location: "HITEC City" },
  { state: "Telangana", city: "Hyderabad", district: "Hyderabad", office_location: "Gachibowli" },
  { state: "Telangana", city: "Warangal", district: "Warangal Urban", office_location: "Kazipet" },
  { state: "Delhi", city: "New Delhi", district: "New Delhi", office_location: "Connaught Place" },
  { state: "Delhi", city: "New Delhi", district: "South Delhi", office_location: "Nehru Place" },
  { state: "Delhi", city: "New Delhi", district: "South West Delhi", office_location: "Dwarka" },
  { state: "Punjab", city: "Chandigarh", district: "Chandigarh", office_location: "Sector 17" },
  { state: "Punjab", city: "Mohali", district: "SAS Nagar", office_location: "Phase 7" },
  { state: "Punjab", city: "Ludhiana", district: "Ludhiana", office_location: "Model Town" },
  { state: "Punjab", city: "Amritsar", district: "Amritsar", office_location: "Lawrence Road" },
  { state: "Maharashtra", city: "Mumbai", district: "Mumbai City", office_location: "Andheri" },
  { state: "Maharashtra", city: "Mumbai", district: "Mumbai Suburban", office_location: "Bandra Kurla Complex" },
  { state: "Maharashtra", city: "Mumbai", district: "Mumbai City", office_location: "Nariman Point" },
  { state: "Maharashtra", city: "Pune", district: "Pune", office_location: "MG Road" },
  { state: "Maharashtra", city: "Pune", district: "Pune", office_location: "Hinjewadi" },
  { state: "Maharashtra", city: "Nagpur", district: "Nagpur", office_location: "Sitabuldi" },
  { state: "Gujarat", city: "Ahmedabad", district: "Ahmedabad", office_location: "CG Road" },
  { state: "Gujarat", city: "Surat", district: "Surat", office_location: "Ring Road" },
  { state: "Gujarat", city: "Vadodara", district: "Vadodara", office_location: "Sayajigunj" },
  { state: "West Bengal", city: "Kolkata", district: "Kolkata", office_location: "Park Street" },
  { state: "West Bengal", city: "Kolkata", district: "Kolkata", office_location: "Salt Lake" },
  { state: "West Bengal", city: "Kolkata", district: "Kolkata", office_location: "New Town" },
  { state: "Rajasthan", city: "Jaipur", district: "Jaipur", office_location: "C Scheme" },
  { state: "Rajasthan", city: "Jodhpur", district: "Jodhpur", office_location: "Sardarpura" },
  { state: "Uttar Pradesh", city: "Noida", district: "Gautam Buddh Nagar", office_location: "Sector 62" },
  { state: "Uttar Pradesh", city: "Lucknow", district: "Lucknow", office_location: "Hazratganj" },
  { state: "Uttar Pradesh", city: "Kanpur", district: "Kanpur Nagar", office_location: "Mall Road" },
  { state: "Madhya Pradesh", city: "Bhopal", district: "Bhopal", office_location: "MP Nagar" },
  { state: "Madhya Pradesh", city: "Indore", district: "Indore", office_location: "Vijay Nagar" },
  { state: "Bihar", city: "Patna", district: "Patna", office_location: "Boring Road" },
  { state: "Odisha", city: "Bhubaneswar", district: "Khordha", office_location: "Saheed Nagar" },
  { state: "Assam", city: "Guwahati", district: "Kamrup Metropolitan", office_location: "GS Road" },
  { state: "Jammu and Kashmir", city: "Jammu", district: "Jammu", office_location: "Gandhi Nagar" },
  { state: "Jammu and Kashmir", city: "Srinagar", district: "Srinagar", office_location: "Lal Chowk" },
  { state: "Haryana", city: "Gurgaon", district: "Gurugram", office_location: "Cyber City" },
  { state: "Haryana", city: "Gurgaon", district: "Gurugram", office_location: "Sohna Road" },
  { state: "Goa", city: "Panaji", district: "North Goa", office_location: "Panaji City" },
  { state: "Chandigarh", city: "Chandigarh", district: "Chandigarh", office_location: "Sector 17" },
  { state: "Puducherry", city: "Puducherry", district: "Puducherry", office_location: "Boulevard" },
];

const DEPARTMENTS = [
  "Retail Banking", "Treasury", "Risk Management", "Cybersecurity", "Compliance",
  "Cloud Engineering", "DevOps", "Core Banking Systems", "Finance", "HR",
  "Operations", "Data Engineering", "Fraud Analytics",
];

const DESIGNATIONS = [
  "Junior Analyst", "Senior Analyst", "Associate", "Senior Associate",
  "Team Lead", "Manager", "Senior Manager", "Vice President",
  "Head of Department", "Chief Technology Officer", "Chief Information Security Officer",
  "Systems Engineer", "Senior Systems Engineer", "Cloud Administrator",
  "Database Administrator", "Security Engineer", "DevOps Engineer",
  "Banking Operations Specialist", "Fraud Analyst", "Risk Analyst",
];

const PLATFORMS = [
  "Active Directory", "Azure AD", "AWS IAM", "Okta", "Kubernetes",
  "Oracle Database", "Jenkins", "Core Banking API", "UPI Gateway",
  "Payment Processing Engine", "SWIFT Gateway",
];

const GROUPS = [
  "Retail_Banking_Read", "Retail_Banking_Write", "Treasury_Admin", "Treasury_Read",
  "Cloud_Infra_Admin", "Cloud_Infra_Read", "UPI_Transaction_Audit", "UPI_Transaction_Operator",
  "Fraud_Detection_Admin", "Fraud_Detection_Read", "Payment_Gateway_Operator",
  "Oracle_DB_Admin", "Oracle_DB_Read", "CoreBanking_Production_Access",
  "CoreBanking_Read_Access", "Kubernetes_Cluster_Admin", "Kubernetes_Deploy_Access",
  "SWIFT_Gateway_Admin", "SWIFT_Gateway_Operator", "Azure_AD_Global_Admin",
  "AWS_Admin_Role", "Okta_Super_Admin", "Jenkins_Pipeline_Admin",
  "RBI_Reporting_Access", "DevOps_Pipeline_Admin", "Compliance_Read",
  "Risk_Analytics_Access", "HR_Admin", "Finance_Read", "Production_Emergency_Access",
];

const GROUP_PARENTS: Record<string, string | null> = {
  "Retail_Banking_Write": "Retail_Banking_Read",
  "Retail_Banking_Read": null,
  "Treasury_Admin": "Treasury_Read",
  "Treasury_Read": null,
  "Cloud_Infra_Admin": "Cloud_Infra_Read",
  "Cloud_Infra_Read": null,
  "UPI_Transaction_Operator": "UPI_Transaction_Audit",
  "UPI_Transaction_Audit": null,
  "Fraud_Detection_Read": "Fraud_Detection_Admin",
  "Fraud_Detection_Admin": null,
  "Oracle_DB_Admin": "Oracle_DB_Read",
  "Oracle_DB_Read": null,
  "CoreBanking_Production_Access": "CoreBanking_Read_Access",
  "CoreBanking_Read_Access": null,
  "Kubernetes_Deploy_Access": "Kubernetes_Cluster_Admin",
  "Kubernetes_Cluster_Admin": null,
  "SWIFT_Gateway_Operator": "SWIFT_Gateway_Admin",
  "SWIFT_Gateway_Admin": null,
  "Azure_AD_Global_Admin": null,
  "AWS_Admin_Role": null,
  "Okta_Super_Admin": null,
  "Jenkins_Pipeline_Admin": "DevOps_Pipeline_Admin",
  "DevOps_Pipeline_Admin": null,
  "RBI_Reporting_Access": null,
  "Compliance_Read": null,
  "Risk_Analytics_Access": null,
  "HR_Admin": null,
  "Finance_Read": null,
  "Production_Emergency_Access": null,
};

const RESOURCES = [
  "UPI Transaction Ledger", "Customer KYC Database", "Core Banking Database",
  "Treasury Payment Engine", "SWIFT Transaction Gateway", "RBI Reporting Database",
  "Oracle Settlement Database", "Payment Microservices Cluster",
];

const PERMISSION_LEVELS = ["Read", "Write", "Delete", "Execute", "Admin", "SuperAdmin"];

const ACTION_TYPES = [
  "UPI_TRANSFER", "SWIFT_PAYMENT", "ROLE_CHANGE", "DB_ACCESS", "LOGIN",
  "FAILED_LOGIN", "TOKEN_CREATE", "ASSUME_ROLE", "DELETE_RESOURCE",
  "LOGIN_FROM_NEW_LOCATION",
];

const LOCATIONS = [
  "Bangalore", "Chennai", "Kochi", "Hyderabad", "Delhi", "Mumbai",
  "Pune", "Kolkata", "Ahmedabad", "Chandigarh",
];

const FRAMEWORKS = ["RBI Guidelines", "NIST", "CIS", "GDPR", "ISO 27001"];

const VIOLATION_TYPES = [
  "Zombie Credential", "Dormant Privileged Access", "Unrotated API Token",
  "Unauthorized UPI Access", "Privilege Escalation", "Temporary Access Drift",
  "Residual Access After Termination",
];

const COMPLIANCE_CONTROLS: Record<string, string[]> = {
  "RBI Guidelines": ["RBI-DBS-CSRF", "RBI-IT-1.1", "RBI-Cyber-3.2", "RBI-Access-5.1"],
  "NIST": ["AC-2", "AC-6", "AU-2", "IA-2", "SC-8", "AC-5"],
  "CIS": ["CIS-1.4", "CIS-2.1", "CIS-4.1", "CIS-6.2", "CIS-16.5"],
  "GDPR": ["GDPR-32", "GDPR-25", "GDPR-30"],
  "ISO 27001": ["A.9.2.1", "A.9.4.1", "A.12.4.1", "A.9.2.3"],
};

const SVC_NAMES = [
  "svc-upi-engine", "svc-core-banking", "svc-payment-reconciliation",
  "svc-risk-engine", "svc-rbi-reporting", "svc-customer-sync",
  "svc-ledger-service", "svc-neft-processing", "svc-kyc-verification",
  "svc-swift-message", "svc-fraud-detection", "svc-settlement-engine",
  "svc-alert-service", "svc-transaction-monitor", "svc-auth-service",
];

const TEMP_ACCESS_TYPES = [
  "Emergency Production Access", "Temporary Treasury Admin",
  "Temporary UPI Gateway Access", "Temporary Kubernetes Admin",
  "Temporary Core Banking Admin", "Emergency SWIFT Gateway Access",
  "Temporary Oracle DBA Access", "Emergency RBI Reporting Access",
];

// ─── HELPERS ──────────────────────────────────────────────────────
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min: number, max: number): number { return Math.random() * (max - min) + min; }

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, ".").replace(/[^a-z.]/g, "");
}

function generateName(): { first: string; last: string; religion: string } {
  const r = Math.random() * 100;
  if (r < 30) {
    const first = Math.random() < 0.5 ? pick(HINDU_FIRST_M) : pick(HINDU_FIRST_F);
    const last = Math.random() < 0.4 ? pick(HINDU_SOUTH) : pick(HINDU_LAST);
    return { first, last, religion: "Hindu" };
  } else if (r < 50) {
    const first = Math.random() < 0.5 ? pick(MUSLIM_FIRST_M) : pick(MUSLIM_FIRST_F);
    return { first, last: pick(MUSLIM_LAST), religion: "Muslim" };
  } else if (r < 70) {
    const first = Math.random() < 0.5 ? pick(CHRISTIAN_FIRST_M) : pick(CHRISTIAN_FIRST_F);
    return { first, last: pick(CHRISTIAN_LAST), religion: "Christian" };
  } else {
    const first = Math.random() < 0.5 ? pick(SIKH_FIRST_M) : pick(SIKH_FIRST_F);
    return { first, last: pick(SIKH_LAST), religion: "Sikh" };
  }
}

function generateUsername(first: string, last: string): string {
  const f = first.toLowerCase().replace(/[^a-z]/g, "");
  const l = last.toLowerCase().replace(/[^a-z]/g, "");
  return pick([`${f}.${l}`, `${f[0]}${l}`, `${f}${l[0]}`, `${f}_${l}`, `${f}_upi`, `${f}_azure`, `${f}${randInt(1, 99)}`, `${l}_${f[0]}`, `${f[0]}${l[0]}_prod`]);
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(randInt(7, 20), randInt(0, 59), randInt(0, 59), 0);
  return d.toISOString();
}

function dateAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split("T")[0];
}

function riskLevelForDesignation(designation: string): string {
  if (designation.includes("Chief") || designation.includes("Head")) return "critical";
  if (designation.includes("VP") || designation.includes("Manager") || designation.includes("Lead")) return "high";
  if (designation.includes("Admin") || designation.includes("Engineer") || designation.includes("Senior")) return "medium";
  return "low";
}

async function batchInsert(supabase: any, table: string, rows: any[], batchSize: number, results: string[]) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) {
      if (error.message.includes("duplicate") || error.message.includes("unique")) continue;
      // Try individual
      for (const row of chunk) {
        const { error: e2 } = await supabase.from(table).insert(row);
        if (e2 && !e2.message.includes("duplicate") && !e2.message.includes("unique")) {
          results.push(`${table} row err: ${e2.message}`);
        }
      }
    }
  }
}

// ─── MAIN ─────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const results: string[] = [];
    const BATCH = 500;

    // Step 1: Add new columns via RPC (using pg_exec if available) or direct SQL
    // We use the Supabase REST API to run SQL via the rpc endpoint
    const alterSQL = `
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS state TEXT;
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS city TEXT;
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS district TEXT;
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS office_location TEXT;
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS residential_address TEXT;
      ALTER TABLE employees ADD COLUMN IF NOT EXISTS religion TEXT;
      ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS user_roles_role_check;
      ALTER TABLE user_roles ADD CONSTRAINT user_roles_role_check CHECK (role IN ('Admin', 'Security Analyst', 'Auditor', 'admin', 'analyst', 'auditor'));
    `;

    // Try using the supabase RPC endpoint to execute raw SQL
    const sqlResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceKey,
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ sql_text: alterSQL }),
    });

    if (sqlResponse.ok) {
      results.push("Schema updated (columns + constraint)");
    } else {
      results.push(`Schema RPC note: ${sqlResponse.status} — columns may already exist`);
    }

    // Step 2: Purge all old data
    const tables = [
      "audit_logs", "compliance_violations", "api_tokens", "service_accounts",
      "temporary_access", "offboarding_records", "privilege_history",
      "identity_relationships", "permissions", "group_memberships",
      "platform_accounts", "lifecycle_events", "revocation_requests",
      "residual_access_violations", "cross_dep_locks", "employees", "user_roles",
    ];

    for (const table of tables) {
      const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error && !error.message.includes("No rows")) {
        results.push(`Purge ${table}: ${error.message}`);
      }
    }
    results.push("Purged all tables");

    // Step 3: Create/update auth users
    const authUsers = [
      { email: "admin@bharatsecurebank.in", role: "Admin", name: "System Administrator" },
      { email: "analyst@bharatsecurebank.in", role: "Security Analyst", name: "Security Analyst" },
      { email: "auditor@bharatsecurebank.in", role: "Auditor", name: "Compliance Auditor" },
    ];

    for (const user of authUsers) {
      const { data: existing } = await supabase.auth.admin.listUsers();
      const found = existing?.users?.find((u: any) => u.email === user.email);

      if (!found) {
        const { data: created, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: "SecureBank@123",
          email_confirm: true,
          user_metadata: { name: user.name },
        });
        if (error) {
          results.push(`Auth create ${user.email}: ${error.message}`);
        } else {
          results.push(`Created auth user: ${user.email}`);
        }
      } else {
        const { error } = await supabase.auth.admin.updateUserById(found.id, {
          password: "SecureBank@123",
          email_confirm: true,
        });
        if (error) {
          results.push(`Auth update ${user.email}: ${error.message}`);
        } else {
          results.push(`Updated auth user: ${user.email}`);
        }
      }

      // Insert user_roles
      await supabase.from("user_roles").delete().eq("email", user.email);
      const { error: roleErr } = await supabase.from("user_roles").insert({
        email: user.email,
        role: user.role,
      });
      if (roleErr) results.push(`Role ${user.email}: ${roleErr.message}`);
    }
    results.push("Auth users + roles created");

    // Step 4: Generate 5000 employees
    const TOTAL_EMPLOYEES = 5000;
    const employees: any[] = [];
    const seenEmails = new Set<string>();

    for (let i = 0; i < TOTAL_EMPLOYEES; i++) {
      const { first, last, religion } = generateName();
      const loc = pick(STATE_CITY);
      const dept = pick(DEPARTMENTS);
      const designation = pick(DESIGNATIONS);
      const isTerminated = Math.random() < 0.08;
      const isHighPriv = Math.random() < 0.15;
      const employeeId = `BSB${String(i + 1).padStart(5, "0")}`;

      let email = `${slugify(first)}.${slugify(last)}@bharatsecurebank.in`;
      let suffix = 1;
      while (seenEmails.has(email)) {
        email = `${slugify(first)}.${slugify(last)}${suffix}@bharatsecurebank.in`;
        suffix++;
      }
      seenEmails.add(email);

      const joinDateDays = randInt(30, 365 * 10);
      let riskLevel: string;
      if (isHighPriv) {
        riskLevel = Math.random() < 0.3 ? "critical" : "high";
      } else {
        riskLevel = riskLevelForDesignation(designation);
      }

      employees.push({
        employee_id: employeeId,
        full_name: `${first} ${last}`,
        email,
        department: dept,
        region: loc.state,
        state: loc.state,
        city: loc.city,
        district: loc.district,
        office_location: loc.office_location,
        residential_address: `${randInt(1, 200)}, ${loc.office_location}, ${loc.city}, ${loc.state}`,
        religion,
        designation,
        employment_status: isTerminated ? "terminated" : "active",
        join_date: dateAgoISO(joinDateDays),
        termination_date: isTerminated ? dateAgoISO(randInt(1, 180)) : null,
        manager_id: i > 5 ? `BSB${String(randInt(1, Math.min(i, TOTAL_EMPLOYEES))).padStart(5, "0")}` : null,
        risk_level: riskLevel,
      });
    }

    await batchInsert(supabase, "employees", employees, BATCH, results);
    results.push(`Inserted ${employees.length} employees`);

    // Step 5: Platform accounts (2-6 per employee)
    const allAccounts: any[] = [];
    let acctCntr = 0;
    for (const emp of employees) {
      const numAccounts = randInt(2, 6);
      const platforms = [...PLATFORMS].sort(() => Math.random() - 0.5).slice(0, numAccounts);
      const parts = emp.full_name.split(" ");
      const first = parts[0], last = parts[1] || parts[0];

      for (const platform of platforms) {
        acctCntr++;
        const isActive = emp.employment_status === "terminated"
          ? Math.random() < 0.3
          : Math.random() < 0.85;

        allAccounts.push({
          account_id: `PA${String(acctCntr).padStart(6, "0")}`,
          employee_id: emp.employee_id,
          platform,
          username: generateUsername(first, last),
          account_status: isActive ? "active" : (Math.random() < 0.5 ? "disabled" : "suspended"),
          last_login: isActive ? daysAgoISO(randInt(0, 120)) : daysAgoISO(randInt(60, 400)),
          mfa_enabled: Math.random() < 0.4,
          created_date: dateAgoISO(randInt(30, 1095)),
        });
      }
    }
    await batchInsert(supabase, "platform_accounts", allAccounts, BATCH, results);
    results.push(`Inserted ${allAccounts.length} platform accounts`);

    // Step 6: Group memberships (1-4 per employee)
    const allGroups: any[] = [];
    for (const emp of employees) {
      const numGroups = randInt(1, 4);
      const selectedGroups = [...GROUPS].sort(() => Math.random() - 0.5).slice(0, numGroups);
      for (const group of selectedGroups) {
        allGroups.push({
          group_id: `GRP${String(allGroups.length + 1).padStart(6, "0")}`,
          employee_id: emp.employee_id,
          platform: pick(PLATFORMS),
          group_name: group,
          parent_group: GROUP_PARENTS[group] || null,
          membership_type: pick(["direct", "inherited", "nested", "delegated"]),
        });
      }
    }
    await batchInsert(supabase, "group_memberships", allGroups, BATCH, results);
    results.push(`Inserted ${allGroups.length} group memberships`);

    // Step 7: Permissions (1-5 per employee)
    const allPerms: any[] = [];
    for (const emp of employees) {
      const numPerms = randInt(1, 5);
      for (let i = 0; i < numPerms; i++) {
        const resource = pick(RESOURCES);
        const platform = pick(PLATFORMS);
        const isAdmin = emp.risk_level === "critical" || emp.risk_level === "high";
        const level = isAdmin && Math.random() < 0.3
          ? pick(["Admin", "SuperAdmin"])
          : pick(["Read", "Write", "Execute", "Delete"]);

        allPerms.push({
          permission_id: `PRM${String(allPerms.length + 1).padStart(6, "0")}`,
          employee_id: emp.employee_id,
          platform,
          resource_name: resource,
          permission_level: level,
          granted_date: dateAgoISO(randInt(30, 1000)),
          last_used: Math.random() < 0.7 ? daysAgoISO(randInt(0, 90)) : null,
          is_admin: level === "Admin" || level === "SuperAdmin",
        });
      }
    }
    await batchInsert(supabase, "permissions", allPerms, BATCH, results);
    results.push(`Inserted ${allPerms.length} permissions`);

    // Step 8: Identity relationships (10,000)
    const allRels: any[] = [];
    const REL_TYPES = ["member_of", "inherits", "assume_role", "delegated_access", "owns_token", "manages", "reports_to"];
    for (let i = 0; i < 10000; i++) {
      const emp1 = employees[Math.floor(Math.random() * employees.length)];
      const emp2 = employees[Math.floor(Math.random() * employees.length)];
      if (emp1.employee_id === emp2.employee_id) continue;
      allRels.push({
        relationship_id: `REL${String(i + 1).padStart(6, "0")}`,
        source_id: emp1.employee_id,
        target_id: emp2.employee_id,
        relationship_type: pick(REL_TYPES),
        platform: pick(PLATFORMS),
      });
    }
    await batchInsert(supabase, "identity_relationships", allRels, BATCH, results);
    results.push(`Inserted ${allRels.length} identity relationships`);

    // Step 9: Privilege history (for high-priv employees)
    const highPrivEmps = employees.filter(e => e.risk_level === "high" || e.risk_level === "critical");
    const allHistory: any[] = [];
    const months = ["2025-01", "2025-02", "2025-03", "2025-04", "2025-05", "2025-06"];
    for (const emp of highPrivEmps) {
      const numChanges = randInt(1, 4);
      for (let i = 0; i < numChanges; i++) {
        allHistory.push({
          history_id: `PH${String(allHistory.length + 1).padStart(6, "0")}`,
          employee_id: emp.employee_id,
          month: pick(months),
          platform: pick(PLATFORMS),
          old_permission: pick(PERMISSION_LEVELS),
          new_permission: pick(PERMISSION_LEVELS),
          change_reason: pick(["Role Promotion", "Department Transfer", "Temporary Grant Extended", "Audit Finding Remediation", "Access Review"]),
        });
      }
    }
    await batchInsert(supabase, "privilege_history", allHistory, BATCH, results);
    results.push(`Inserted ${allHistory.length} privilege history records`);

    // Step 10: Offboarding records (for terminated employees with zombie scenarios)
    const terminatedEmps = employees.filter(e => e.employment_status === "terminated");
    const allOffboard: any[] = [];
    for (let i = 0; i < terminatedEmps.length; i++) {
      const emp = terminatedEmps[i];
      const adDisabled = Math.random() < 0.7;
      const awsActive = Math.random() < 0.4;
      const oktaActive = Math.random() < 0.3;
      const apiTokenActive = Math.random() < 0.2;
      const upiActive = Math.random() < 0.15;

      allOffboard.push({
        offboard_id: `OFF${String(i + 1).padStart(5, "0")}`,
        employee_id: emp.employee_id,
        termination_date: emp.termination_date,
        hr_status: pick(["complete", "pending", "overdue"]),
        ad_status: adDisabled ? "disabled" : "active",
        azure_status: oktaActive ? "active" : "disabled",
        aws_status: awsActive ? "active" : "disabled",
        okta_status: oktaActive ? "active" : "disabled",
        salesforce_status: apiTokenActive ? "active" : "disabled",
        residual_access_found: awsActive || oktaActive || apiTokenActive || upiActive,
      });
    }
    await batchInsert(supabase, "offboarding_records", allOffboard, BATCH, results);
    results.push(`Inserted ${allOffboard.length} offboarding records`);

    // Step 11: Temporary access (30% expired but still active)
    const allTempAccess: any[] = [];
    const tempEmps = employees.filter(e => e.employment_status === "active");
    for (let i = 0; i < Math.min(800, tempEmps.length); i++) {
      const emp = tempEmps[Math.floor(Math.random() * tempEmps.length)];
      const isExpired = Math.random() < 0.3;
      const now = new Date();
      const expiryDate = new Date(now);
      if (isExpired) {
        expiryDate.setDate(now.getDate() - randInt(1, 30));
      } else {
        expiryDate.setDate(now.getDate() + randInt(1, 90));
      }

      allTempAccess.push({
        temp_access_id: `TA${String(i + 1).padStart(5, "0")}`,
        employee_id: emp.employee_id,
        platform: pick(PLATFORMS),
        access_granted: pick(TEMP_ACCESS_TYPES),
        expiry_date: expiryDate.toISOString().split("T")[0],
        current_status: isExpired ? "expired" : "active",
        still_active: isExpired,
        risk_level: isExpired ? pick(["high", "critical"]) : pick(["low", "medium"]),
      });
    }
    await batchInsert(supabase, "temporary_access", allTempAccess, BATCH, results);
    results.push(`Inserted ${allTempAccess.length} temporary access records`);

    // Step 12: Service accounts (1000)
    const allSvcAccounts: any[] = [];
    const svcOwners = employees.filter(e => e.employment_status === "active");
    for (let i = 0; i < 1000; i++) {
      const owner = svcOwners[Math.floor(Math.random() * svcOwners.length)];
      const privLevel = pick(["Read", "Write", "Admin", "SuperAdmin"]);
      const daysUnused = randInt(0, 200);
      allSvcAccounts.push({
        service_account_id: `SVC${String(i + 1).padStart(5, "0")}`,
        owner_employee_id: owner.employee_id,
        service_name: `${pick(SVC_NAMES)}-${randInt(1, 50)}`,
        platform: pick(PLATFORMS),
        privilege_level: privLevel,
        last_used: daysUnused < 365 ? daysAgoISO(daysUnused) : null,
        token_active: Math.random() < 0.7,
        risk_level: privLevel === "SuperAdmin" ? "critical" : privLevel === "Admin" ? "high" : "medium",
      });
    }
    await batchInsert(supabase, "service_accounts", allSvcAccounts, BATCH, results);
    results.push(`Inserted ${allSvcAccounts.length} service accounts`);

    // Step 13: API tokens (1500, 25% unrotated)
    const allTokens: any[] = [];
    const tokenEmps = employees.filter(e => e.employment_status === "active");
    for (let i = 0; i < 1500; i++) {
      const emp = tokenEmps[Math.floor(Math.random() * tokenEmps.length)];
      const isOld = Math.random() < 0.25;
      const createdDaysAgo = isOld ? randInt(180, 720) : randInt(1, 90);
      const platform = pick(PLATFORMS);
      const tokenPrefix = platform.includes("UPI") ? "upi" :
        platform.includes("SWIFT") ? "swift" :
        platform.includes("Oracle") ? "oracle" :
        platform.includes("Core") ? "core-banking" :
        platform.includes("Payment") ? "payment" :
        platform.toLowerCase().replace(/\s+/g, "-");

      allTokens.push({
        token_id: `TOK${String(i + 1).padStart(5, "0")}`,
        employee_id: emp.employee_id,
        platform,
        token_name: `${tokenPrefix}-${pick(["prod", "dev", "staging", "api"])}-token`,
        created_date: dateAgoISO(createdDaysAgo),
        last_used: Math.random() < 0.8 ? daysAgoISO(randInt(0, 60)) : null,
        rotated: !isOld,
        active: Math.random() < 0.85,
        risk_level: isOld ? pick(["high", "critical"]) : pick(["low", "medium"]),
      });
    }
    await batchInsert(supabase, "api_tokens", allTokens, BATCH, results);
    results.push(`Inserted ${allTokens.length} API tokens`);

    // Step 14: Audit logs (25,000 with anomalies)
    const allLogs: any[] = [];
    let anomalousCount = 0;
    for (let i = 0; i < 25000; i++) {
      const emp = employees[Math.floor(Math.random() * employees.length)];
      const action = pick(ACTION_TYPES);
      let location = pick(LOCATIONS);
      let anomalyScore = 0;
      let ts = daysAgoISO(randInt(0, 90));

      if (Math.random() < 0.05) {
        const midNight = new Date();
        midNight.setDate(midNight.getDate() - randInt(0, 90));
        midNight.setHours(randInt(0, 3), randInt(0, 59), 0, 0);
        ts = midNight.toISOString();
        anomalyScore = randFloat(0.6, 0.9);
        anomalousCount++;
      } else if (Math.random() < 0.03) {
        location = pick(LOCATIONS.filter(l => l !== location));
        anomalyScore = randFloat(0.7, 1.0);
        anomalousCount++;
      } else if (Math.random() < 0.04) {
        anomalyScore = randFloat(0.5, 0.8);
        anomalousCount++;
      } else if (Math.random() < 0.02) {
        anomalyScore = randFloat(0.8, 1.0);
        anomalousCount++;
      } else if (Math.random() < 0.03 && emp.employment_status === "terminated") {
        anomalyScore = randFloat(0.7, 0.95);
        anomalousCount++;
      }

      let resource = pick(RESOURCES);
      if (action === "UPI_TRANSFER") resource = "UPI Transaction Ledger";
      else if (action === "SWIFT_PAYMENT") resource = "SWIFT Transaction Gateway";
      else if (action === "DB_ACCESS") resource = pick(["Core Banking Database", "Oracle Settlement Database", "Customer KYC Database"]);
      else if (action === "LOGIN" || action === "FAILED_LOGIN") resource = "Authentication Gateway";
      else if (action === "TOKEN_CREATE") resource = "API Token Management";
      else if (action === "ASSUME_ROLE") resource = pick(["AWS IAM", "Azure AD", "Okta"]);
      else if (action === "DELETE_RESOURCE") resource = pick(RESOURCES);

      allLogs.push({
        log_id: `LOG${String(i + 1).padStart(6, "0")}`,
        employee_id: emp.employee_id,
        platform: pick(PLATFORMS),
        action_type: action,
        resource,
        timestamp: ts,
        location,
        anomaly_score: anomalyScore,
      });
    }
    await batchInsert(supabase, "audit_logs", allLogs, BATCH, results);
    results.push(`Inserted ${allLogs.length} audit logs (${anomalousCount} anomalous)`);

    // Step 15: Compliance violations (3000)
    const allViolations: any[] = [];
    for (let i = 0; i < 3000; i++) {
      const emp = employees[Math.floor(Math.random() * employees.length)];
      const framework = pick(FRAMEWORKS);
      const controls = COMPLIANCE_CONTROLS[framework] || ["Unknown"];
      const violationType = pick(VIOLATION_TYPES);
      const severity = violationType === "Zombie Credential" || violationType === "Privilege Escalation" || violationType === "Residual Access After Termination"
        ? pick(["high", "critical"])
        : pick(["low", "medium", "high"]);

      allViolations.push({
        violation_id: `VIO${String(i + 1).padStart(5, "0")}`,
        employee_id: emp.employee_id,
        framework,
        control: pick(controls),
        violation_type: violationType,
        severity,
        status: pick(["open", "in_progress", "resolved", "dismissed", "open", "open"]),
      });
    }
    await batchInsert(supabase, "compliance_violations", allViolations, BATCH, results);
    results.push(`Inserted ${allViolations.length} compliance violations`);

    // Final summary
    const { count: empCount } = await supabase.from("employees").select("*", { count: "exact", head: true });
    const { count: paCount } = await supabase.from("platform_accounts").select("*", { count: "exact", head: true });
    const { count: gmCount } = await supabase.from("group_memberships").select("*", { count: "exact", head: true });
    const { count: permCount } = await supabase.from("permissions").select("*", { count: "exact", head: true });
    const { count: saCount } = await supabase.from("service_accounts").select("*", { count: "exact", head: true });
    const { count: atCount } = await supabase.from("api_tokens").select("*", { count: "exact", head: true });
    const { count: alCount } = await supabase.from("audit_logs").select("*", { count: "exact", head: true });
    const { count: cvCount } = await supabase.from("compliance_violations").select("*", { count: "exact", head: true });
    const { count: irCount } = await supabase.from("identity_relationships").select("*", { count: "exact", head: true });
    const { count: obCount } = await supabase.from("offboarding_records").select("*", { count: "exact", head: true });
    const { count: taCount } = await supabase.from("temporary_access").select("*", { count: "exact", head: true });
    const { count: phCount } = await supabase.from("privilege_history").select("*", { count: "exact", head: true });
    const { count: urCount } = await supabase.from("user_roles").select("*", { count: "exact", head: true });

    const summary = {
      status: "SUCCESS",
      steps: results,
      counts: {
        employees: empCount,
        platform_accounts: paCount,
        group_memberships: gmCount,
        permissions: permCount,
        service_accounts: saCount,
        api_tokens: atCount,
        audit_logs: alCount,
        compliance_violations: cvCount,
        identity_relationships: irCount,
        offboarding_records: obCount,
        temporary_access: taCount,
        privilege_history: phCount,
        user_roles: urCount,
      },
      auth_users: authUsers.map(u => ({ email: u.email, role: u.role })),
      demo_password: "SecureBank@123",
      organization: "Bharat Secure Bank",
    };

    return new Response(JSON.stringify(summary, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message, stack: err.stack }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
