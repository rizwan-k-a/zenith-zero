import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import postgres from "npm:postgres@3.4.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

  try {
    const pgUrl = Deno.env.get("SUPABASE_DB_URL");
    if (!pgUrl) {
      return new Response(JSON.stringify({ error: "SUPABASE_DB_URL not available" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const sql = postgres(pgUrl, { ssl: "require", max: 1 });
    const results: { step: string; rows_affected: number; detail?: string }[] = [];

    // =========================================================
    // STEP 1: Reduce Admin/SuperAdmin permission rows to realistic ratio
    //
    // Current: 14,070 is_admin=true rows → 6936 distinct employees (81.6%)
    // Target: ~700-900 distinct privileged employees (~8-10%)
    //
    // Strategy: demote most Admin/SuperAdmin permissions to lower levels.
    // Keep Admin/SuperAdmin only for ~800 employees (randomly selected by hash).
    // For all OTHER employees who have Admin/SuperAdmin, downgrade to 'Write' or 'Execute'.
    // =========================================================

    // First, get how many distinct employees currently have admin perms
    const [countBefore] = await sql`
      SELECT COUNT(DISTINCT employee_id) as cnt
      FROM permissions
      WHERE is_admin = true
    `;
    results.push({ step: "Before: distinct privileged employees", rows_affected: parseInt(countBefore.cnt), detail: countBefore.cnt + " employees" });

    // Demote all Admin/SuperAdmin permissions from employees where
    // employee_id hash % 10 > 0 (i.e., keep ~10% = ~850 employees)
    // Use MD5 hash of employee_id to get a stable pseudo-random selection
    const demoteAdmin = await sql`
      UPDATE permissions
      SET permission_level = CASE
            WHEN permission_level = 'SuperAdmin' THEN 'Admin'
            ELSE 'Write'
          END,
          is_admin = false
      WHERE is_admin = true
        AND employee_id NOT IN (
          SELECT employee_id
          FROM (
            SELECT DISTINCT employee_id, md5(employee_id) as sort_key
            FROM permissions
            WHERE is_admin = true
          ) ranked
          ORDER BY sort_key
          LIMIT 850
        )
    `;
    results.push({ step: "Demote excess Admin/SuperAdmin: keep 850 distinct employees privileged", rows_affected: demoteAdmin.count });

    // Verify result
    const [countAfter] = await sql`
      SELECT COUNT(DISTINCT employee_id) as cnt
      FROM permissions
      WHERE is_admin = true
    `;
    results.push({ step: "After: distinct privileged employees", rows_affected: parseInt(countAfter.cnt), detail: countAfter.cnt + " employees" });

    // =========================================================
    // STEP 2: Create more zombie accounts
    //
    // Only 3 were created in fix-data because only 3 of the 50 selected
    // terminated employees had disabled accounts.
    // Now: pick ANY 80 terminated employees and reactivate accounts for them.
    // =========================================================

    // Count current zombies
    const [zombieBefore] = await sql`
      SELECT COUNT(*) as cnt
      FROM platform_accounts pa
      JOIN employees e ON e.employee_id = pa.employee_id
      WHERE e.employment_status = 'terminated'
        AND pa.account_status = 'active'
    `;
    results.push({ step: "Zombie BEFORE", rows_affected: parseInt(zombieBefore.cnt), detail: zombieBefore.cnt + " active accounts for terminated employees" });

    // Reactivate 1 account per terminated employee for the first 80 employees
    // that still have at least one non-active account
    const zombieResult = await sql`
      UPDATE platform_accounts
      SET account_status = 'active'
      WHERE id IN (
        SELECT (MIN(pa.id::text))::uuid
        FROM platform_accounts pa
        JOIN employees e ON e.employee_id = pa.employee_id
        WHERE e.employment_status = 'terminated'
          AND pa.account_status != 'active'
        GROUP BY pa.employee_id
        LIMIT 80
      )
    `;
    results.push({ step: "Zombie: reactivate 1 account per 80 terminated employees", rows_affected: zombieResult.count });

    // Verify zombie count
    const [zombieAfter] = await sql`
      SELECT COUNT(*) as cnt
      FROM platform_accounts pa
      JOIN employees e ON e.employee_id = pa.employee_id
      WHERE e.employment_status = 'terminated'
        AND pa.account_status = 'active'
    `;
    results.push({ step: "Zombie AFTER", rows_affected: parseInt(zombieAfter.cnt), detail: zombieAfter.cnt + " active accounts for terminated employees" });

    // =========================================================
    // STEP 3: Reduce temporary_access active count to realistic range
    // Current: 1391 active temp access records for 8500 employees = 16.4% have active temp access
    // Target: ~150-200 active (realistic: <2.5% of workforce)
    // Expire/revoke most of them by setting current_status='expired'
    // =========================================================

    const [taBefore] = await sql`SELECT COUNT(*) as cnt FROM temporary_access WHERE current_status = 'active'`;
    results.push({ step: "Temp access active BEFORE", rows_affected: parseInt(taBefore.cnt) });

    const taExpire = await sql`
      UPDATE temporary_access
      SET current_status = 'expired',
          still_active = false
      WHERE current_status = 'active'
        AND id NOT IN (
          SELECT id FROM temporary_access
          WHERE current_status = 'active'
          ORDER BY expiry_date DESC
          LIMIT 180
        )
    `;
    results.push({ step: "Temp access: expire excess (keep 180 active)", rows_affected: taExpire.count });

    const [taAfter] = await sql`SELECT COUNT(*) as cnt FROM temporary_access WHERE current_status = 'active'`;
    results.push({ step: "Temp access active AFTER", rows_affected: parseInt(taAfter.cnt) });

    await sql.end();

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message, stack: err.stack?.slice(0, 400) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
