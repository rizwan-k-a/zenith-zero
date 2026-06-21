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

    const statements = [
      // permissions: DELETE was missing — caused all deletePermission() calls to silently fail
      `DROP POLICY IF EXISTS "anon_delete_perm" ON permissions`,
      `CREATE POLICY "anon_delete_perm" ON permissions FOR DELETE TO anon, authenticated USING (true)`,
      `DROP POLICY IF EXISTS "anon_insert_perm" ON permissions`,
      `CREATE POLICY "anon_insert_perm" ON permissions FOR INSERT TO anon, authenticated WITH CHECK (true)`,
      // group_memberships: UPDATE and DELETE were missing
      `DROP POLICY IF EXISTS "anon_update_gm" ON group_memberships`,
      `CREATE POLICY "anon_update_gm" ON group_memberships FOR UPDATE TO anon, authenticated USING (true)`,
      `DROP POLICY IF EXISTS "anon_delete_gm" ON group_memberships`,
      `CREATE POLICY "anon_delete_gm" ON group_memberships FOR DELETE TO anon, authenticated USING (true)`,
      // identity_relationships: UPDATE, DELETE, INSERT were missing
      `DROP POLICY IF EXISTS "anon_update_ir" ON identity_relationships`,
      `CREATE POLICY "anon_update_ir" ON identity_relationships FOR UPDATE TO anon, authenticated USING (true)`,
      `DROP POLICY IF EXISTS "anon_delete_ir" ON identity_relationships`,
      `CREATE POLICY "anon_delete_ir" ON identity_relationships FOR DELETE TO anon, authenticated USING (true)`,
      `DROP POLICY IF EXISTS "anon_insert_ir" ON identity_relationships`,
      `CREATE POLICY "anon_insert_ir" ON identity_relationships FOR INSERT TO anon, authenticated WITH CHECK (true)`,
      // privilege_history: UPDATE and DELETE
      `DROP POLICY IF EXISTS "anon_update_ph" ON privilege_history`,
      `CREATE POLICY "anon_update_ph" ON privilege_history FOR UPDATE TO anon, authenticated USING (true)`,
      `DROP POLICY IF EXISTS "anon_delete_ph" ON privilege_history`,
      `CREATE POLICY "anon_delete_ph" ON privilege_history FOR DELETE TO anon, authenticated USING (true)`,
      // temporary_access: DELETE
      `DROP POLICY IF EXISTS "anon_delete_ta" ON temporary_access`,
      `CREATE POLICY "anon_delete_ta" ON temporary_access FOR DELETE TO anon, authenticated USING (true)`,
      // service_accounts: DELETE
      `DROP POLICY IF EXISTS "anon_delete_sa" ON service_accounts`,
      `CREATE POLICY "anon_delete_sa" ON service_accounts FOR DELETE TO anon, authenticated USING (true)`,
      // api_tokens: DELETE
      `DROP POLICY IF EXISTS "anon_delete_at" ON api_tokens`,
      `CREATE POLICY "anon_delete_at" ON api_tokens FOR DELETE TO anon, authenticated USING (true)`,
      // compliance_violations: DELETE
      `DROP POLICY IF EXISTS "anon_delete_cv" ON compliance_violations`,
      `CREATE POLICY "anon_delete_cv" ON compliance_violations FOR DELETE TO anon, authenticated USING (true)`,
      // lifecycle_events: UPDATE
      `DROP POLICY IF EXISTS "anon_update_le" ON lifecycle_events`,
      `CREATE POLICY "anon_update_le" ON lifecycle_events FOR UPDATE TO anon, authenticated USING (true)`,
      // cross_dep_locks: UPDATE and DELETE
      `DROP POLICY IF EXISTS "anon_update_cdl" ON cross_dep_locks`,
      `CREATE POLICY "anon_update_cdl" ON cross_dep_locks FOR UPDATE TO anon, authenticated USING (true)`,
      `DROP POLICY IF EXISTS "anon_delete_cdl" ON cross_dep_locks`,
      `CREATE POLICY "anon_delete_cdl" ON cross_dep_locks FOR DELETE TO anon, authenticated USING (true)`,
      // residual_access_violations: DELETE
      `DROP POLICY IF EXISTS "anon_delete_rav" ON residual_access_violations`,
      `CREATE POLICY "anon_delete_rav" ON residual_access_violations FOR DELETE TO anon, authenticated USING (true)`,
      // user_roles: UPDATE and DELETE
      `DROP POLICY IF EXISTS "anon_update_ur" ON user_roles`,
      `CREATE POLICY "anon_update_ur" ON user_roles FOR UPDATE TO anon, authenticated USING (true)`,
      `DROP POLICY IF EXISTS "anon_delete_ur" ON user_roles`,
      `CREATE POLICY "anon_delete_ur" ON user_roles FOR DELETE TO anon, authenticated USING (true)`,
    ];

    const results: { stmt: string; ok: boolean; error?: string }[] = [];
    for (const stmt of statements) {
      try {
        await sql.unsafe(stmt);
        results.push({ stmt: stmt.slice(0, 70), ok: true });
      } catch (e: any) {
        results.push({ stmt: stmt.slice(0, 70), ok: false, error: e.message });
      }
    }
    await sql.end();

    const failed = results.filter(r => !r.ok);
    return new Response(JSON.stringify({ ok: failed.length === 0, total: results.length, failed_count: failed.length, failed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message, stack: err.stack?.slice(0, 400) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
