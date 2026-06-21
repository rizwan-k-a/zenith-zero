import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" };

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: empStatus } = await supabase.from("employees").select("employment_status");
    const empStatusCounts: Record<string, number> = {};
    empStatus?.forEach(e => { empStatusCounts[e.employment_status] = (empStatusCounts[e.employment_status] || 0) + 1; });

    const { data: accStatus } = await supabase.from("platform_accounts").select("account_status");
    const accStatusCounts: Record<string, number> = {};
    accStatus?.forEach(a => { accStatusCounts[a.account_status] = (accStatusCounts[a.account_status] || 0) + 1; });

    const { data: activeEmps } = await supabase.from("employees").select("employee_id").eq("employment_status", "active");
    const activeEmpIds = activeEmps?.map(e => e.employee_id) || [];

    const { data: adminPerms } = await supabase.from("permissions")
      .select("employee_id")
      .in("permission_level", ["Admin", "SuperAdmin"])
      .in("employee_id", activeEmpIds);

    const uniquePrivilegedAccounts = new Set(adminPerms?.map(p => p.employee_id) || []);

    const { count: tempDrift } = await supabase.from("temporary_access")
      .select("*", { count: "exact", head: true })
      .eq("still_active", true);

    const { count: residualAccess } = await supabase.from("offboarding_records")
      .select("*", { count: "exact", head: true })
      .eq("residual_access_found", true);

    const { count: staleTokens } = await supabase.from("api_tokens")
      .select("*", { count: "exact", head: true })
      .eq("rotated", false);

    const { count: zombieAccounts } = await supabase.from("offboarding_records")
      .select("*", { count: "exact", head: true })
      .or("ad_status.eq.active,aws_status.eq.active,okta_status.eq.active");

    const { data: sampleNames } = await supabase.from("employees").select("full_name").limit(20);

    const { count: totalIdentities } = await supabase.from("employees").select("*", { count: "exact", head: true });

    const { count: openViolations } = await supabase.from("compliance_violations")
      .select("*", { count: "exact", head: true })
      .in("status", ["open", "in_progress"]);

    const { count: criticalViolations } = await supabase.from("compliance_violations")
      .select("*", { count: "exact", head: true })
      .eq("severity", "critical")
      .in("status", ["open", "in_progress"]);

    return new Response(JSON.stringify({
      employment_status: empStatusCounts,
      platform_account_status: accStatusCounts,
      privileged_accounts: uniquePrivilegedAccounts.size,
      temp_access_drift: tempDrift,
      residual_access_count: residualAccess,
      stale_tokens: staleTokens,
      zombie_accounts: zombieAccounts,
      sample_names: sampleNames?.map(n => n.full_name),
      total_identities: totalIdentities,
      open_compliance_violations: openViolations,
      critical_violations: criticalViolations
    }, null, 2), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
