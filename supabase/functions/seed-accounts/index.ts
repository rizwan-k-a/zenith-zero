import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const PLATFORMS = ["Active Directory", "Azure AD", "AWS IAM", "Okta", "Kubernetes", "VPN Gateway", "UPI Gateway", "SWIFT Core", "Core Banking", "Oracle DB", "Jenkins", "GitLab", "ServiceNow"];
const STATUSES = ["active", "active", "active", "active", "active", "active", "active", "active", "disabled", "suspended", "expired"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }
function daysAgo(days: number): string { const d = new Date(); d.setDate(d.getDate() - days); return d.toISOString().split("T")[0]; }

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Get active employees
    const { data: employees } = await supabase
      .from("employees")
      .select("employee_id")
      .neq("employment_status", "terminated");

    if (!employees || employees.length === 0) {
      return new Response(JSON.stringify({ error: "No active employees found" }), { status: 400, headers: corsHeaders });
    }

    const results: string[] = [];
    const BATCH = 500;
    let inserted = 0;

    // Generate 30000 platform accounts
    for (let batch = 0; batch < 60; batch++) {  // 60 batches * 500 = 30000
      const accounts: any[] = [];
      for (let i = 0; i < 500; i++) {
        const emp = pick(employees);
        const globalIdx = batch * 500 + i;
        accounts.push({
          account_id: `ACC${String(globalIdx + 1).padStart(6, "0")}`,
          employee_id: emp.employee_id,
          platform: pick(PLATFORMS),
          username: `user${globalIdx + 1}`,
          account_status: pick(STATUSES),
          last_login: pick(STATUSES) === "active" ? new Date(Date.now() - randInt(0, 90) * 86400000).toISOString() : null,
          mfa_enabled: Math.random() < 0.4,
          created_date: daysAgo(randInt(30, 1000))
        });
      }

      const { error } = await supabase.from("platform_accounts").insert(accounts);
      if (error) {
        if (!error.message.includes("duplicate")) {
          results.push(`Batch ${batch} error: ${error.message}`);
        }
      } else {
        inserted += accounts.length;
      }
      results.push(`Batch ${batch}: inserted ${inserted}/30000`);
    }

    // Verify final count
    const { count } = await supabase.from("platform_accounts").select("*", { count: "exact", head: true });

    return new Response(JSON.stringify({
      status: "COMPLETE",
      inserted,
      final_count: count,
      details: results.slice(-10)
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
