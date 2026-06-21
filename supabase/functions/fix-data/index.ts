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
    // STEP 1: Fix is_admin flag
    // is_admin should only be true for Admin and SuperAdmin levels.
    // Current state: many Read/Write/Execute rows also have is_admin=true (seed bug).
    // =========================================================
    const step1a = await sql`
      UPDATE permissions
      SET is_admin = false
      WHERE permission_level NOT IN ('Admin', 'SuperAdmin')
        AND is_admin = true
    `;
    results.push({ step: "Fix is_admin: clear false positives (non-Admin/SuperAdmin rows)", rows_affected: step1a.count });

    const step1b = await sql`
      UPDATE permissions
      SET is_admin = true
      WHERE permission_level IN ('Admin', 'SuperAdmin')
        AND is_admin = false
    `;
    results.push({ step: "Fix is_admin: set missing true on Admin/SuperAdmin rows", rows_affected: step1b.count });

    // =========================================================
    // STEP 2: Create realistic zombie accounts
    // Pick 80 terminated employees whose ALL platform_accounts are disabled,
    // and set 1-2 accounts back to 'active' to simulate orphaned access.
    // Target: ~80 zombie platform_accounts across ~50 terminated employees.
    // =========================================================
    const termEmps = await sql`
      SELECT e.employee_id
      FROM employees e
      WHERE e.employment_status = 'terminated'
        AND NOT EXISTS (
          SELECT 1 FROM platform_accounts pa
          WHERE pa.employee_id = e.employee_id
            AND pa.account_status = 'active'
        )
      LIMIT 50
    `;
    let zombieTotal = 0;
    for (const emp of termEmps.slice(0, 50)) {
      // Reactivate exactly 1 disabled account per employee
      const updated = await sql`
        UPDATE platform_accounts
        SET account_status = 'active'
        WHERE employee_id = ${emp.employee_id}
          AND account_status = 'disabled'
          AND id IN (
            SELECT id FROM platform_accounts
            WHERE employee_id = ${emp.employee_id}
              AND account_status = 'disabled'
            LIMIT 1
          )
      `;
      zombieTotal += updated.count;
    }
    results.push({ step: "Zombie accounts: reactivate 1 account per 50 terminated employees", rows_affected: zombieTotal });

    // =========================================================
    // STEP 3: Reduce open compliance violations to realistic range
    // Target: keep 60 open, move the rest to 'resolved'.
    // Current: 775 open, 869 in_progress — way too many.
    // =========================================================
    // Keep first 60 open rows as-is, resolve the remaining open ones
    const resolveExcessOpen = await sql`
      UPDATE compliance_violations
      SET status = 'resolved'
      WHERE status = 'open'
        AND id NOT IN (
          SELECT id FROM compliance_violations
          WHERE status = 'open'
          ORDER BY created_at DESC
          LIMIT 60
        )
    `;
    results.push({ step: "Compliance: resolve excess open violations (keep 60)", rows_affected: resolveExcessOpen.count });

    // Also resolve most in_progress — keep 20
    const resolveExcessInProgress = await sql`
      UPDATE compliance_violations
      SET status = 'resolved'
      WHERE status = 'in_progress'
        AND id NOT IN (
          SELECT id FROM compliance_violations
          WHERE status = 'in_progress'
          ORDER BY created_at DESC
          LIMIT 20
        )
    `;
    results.push({ step: "Compliance: resolve excess in_progress violations (keep 20)", rows_affected: resolveExcessInProgress.count });

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
