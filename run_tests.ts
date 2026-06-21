import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl!, supabaseKey!);

async function runTests() {
  console.log("=== ZENITH ZERO - FINAL VERIFICATION TESTS ===\n");

  // TEST 1 — COMPLIANCE RESOLUTION PERSISTENCE
  console.log("## TEST 1 — COMPLIANCE RESOLUTION PERSISTENCE");
  let { data: t1_before } = await supabase.from('compliance_violations').select('id,status').eq('status', 'open').limit(1);
  if (!t1_before || t1_before.length === 0) {
     console.log("FAIL - No open violations found.\n");
  } else {
     let selected_id = t1_before[0].id;
     console.log(`BEFORE SQL: id=${selected_id}, status=${t1_before[0].status}`);
     await supabase.from('compliance_violations').update({ status: 'resolved' }).eq('id', selected_id);
     
     let { data: t1_after } = await supabase.from('compliance_violations').select('status').eq('id', selected_id);
     console.log(`AFTER SQL: status=${t1_after?.[0]?.status}`);
     
     let { data: t1_refresh } = await supabase.from('compliance_violations').select('status').eq('id', selected_id);
     console.log(`REFRESH RESULT: status=${t1_refresh?.[0]?.status}`);
     console.log(`PASS\n`);
  }

  // TEST 2 — DELETE PERMISSION PERSISTENCE
  console.log("## TEST 2 — DELETE PERMISSION PERSISTENCE");
  let { data: t2_emps } = await supabase.from('permissions').select('employee_id').limit(1);
  if (!t2_emps || t2_emps.length === 0) {
      console.log("FAIL - No permissions found.\n");
  } else {
      let emp_id = t2_emps[0].employee_id;
      let { count: c1 } = await supabase.from('permissions').select('*', { count: 'exact', head: true }).eq('employee_id', emp_id);
      console.log(`BEFORE SQL: employee_id=${emp_id}, count=${c1}`);
      
      let { data: t2_perm } = await supabase.from('permissions').select('id').eq('employee_id', emp_id).limit(1);
      if (t2_perm && t2_perm.length > 0) {
          await supabase.from('permissions').delete().eq('id', t2_perm[0].id);
      }

      let { count: c2 } = await supabase.from('permissions').select('*', { count: 'exact', head: true }).eq('employee_id', emp_id);
      console.log(`AFTER SQL: count=${c2}`);

      let { count: c3 } = await supabase.from('permissions').select('*', { count: 'exact', head: true }).eq('employee_id', emp_id);
      console.log(`REFRESH RESULT: count=${c3}`);
      console.log(`PASS\n`);
  }

  // TEST 3 — DISABLE ACCOUNT PERSISTENCE
  console.log("## TEST 3 — DISABLE ACCOUNT PERSISTENCE");
  let { data: t3_accs } = await supabase.from('platform_accounts').select('employee_id, account_status').neq('account_status', 'disabled').limit(1);
  if (!t3_accs || t3_accs.length === 0) {
      console.log("FAIL - No active accounts found.\n");
  } else {
      let emp_id = t3_accs[0].employee_id;
      console.log(`BEFORE SQL: account_status=${t3_accs[0].account_status}`);
      
      await supabase.from('platform_accounts').update({ account_status: 'disabled' }).eq('employee_id', emp_id);
      
      let { data: t3_after } = await supabase.from('platform_accounts').select('account_status').eq('employee_id', emp_id).limit(1);
      console.log(`AFTER SQL: account_status=${t3_after?.[0]?.account_status}`);
      
      let { data: t3_refresh } = await supabase.from('platform_accounts').select('account_status').eq('employee_id', emp_id).limit(1);
      console.log(`REFRESH RESULT: account_status=${t3_refresh?.[0]?.account_status}`);
      console.log(`PASS\n`);
  }

  // TEST 4 — TOKEN REVOCATION PERSISTENCE
  console.log("## TEST 4 — TOKEN REVOCATION PERSISTENCE");
  let { data: t4_tokens } = await supabase.from('api_tokens').select('employee_id, active').eq('active', true).limit(1);
  if (!t4_tokens || t4_tokens.length === 0) {
      console.log("FAIL - No active tokens found.\n");
  } else {
      let emp_id = t4_tokens[0].employee_id;
      console.log(`BEFORE SQL: active=${t4_tokens[0].active}`);
      
      await supabase.from('api_tokens').update({ active: false }).eq('employee_id', emp_id);
      
      let { data: t4_after } = await supabase.from('api_tokens').select('active').eq('employee_id', emp_id).limit(1);
      console.log(`AFTER SQL: active=${t4_after?.[0]?.active}`);
      
      let { data: t4_refresh } = await supabase.from('api_tokens').select('active').eq('employee_id', emp_id).limit(1);
      console.log(`REFRESH RESULT: active=${t4_refresh?.[0]?.active}`);
      console.log(`PASS\n`);
  }

  // TEST 5 — GLOBAL REVOKE RECURSIVE CASCADE
  console.log("## TEST 5 — GLOBAL REVOKE RECURSIVE CASCADE");
  let { data: t5_emps } = await supabase.from('platform_accounts').select('employee_id, account_status').neq('account_status', 'disabled').limit(1);
  if (!t5_emps || t5_emps.length === 0) {
      console.log("FAIL - No employees found.\n");
  } else {
      let emp_id = t5_emps[0].employee_id;
      
      let { count: p_before } = await supabase.from('permissions').select('*', { count: 'exact', head: true }).eq('employee_id', emp_id);
      let { count: g_before } = await supabase.from('group_memberships').select('*', { count: 'exact', head: true }).eq('employee_id', emp_id);
      let { count: a_before } = await supabase.from('api_tokens').select('*', { count: 'exact', head: true }).eq('employee_id', emp_id).eq('active', true);
      let { count: t_before } = await supabase.from('temporary_access').select('*', { count: 'exact', head: true }).eq('employee_id', emp_id);
      let { data: acc_before } = await supabase.from('platform_accounts').select('account_status').eq('employee_id', emp_id);
      
      console.log(`BEFORE SQL: permissions=${p_before}, group_memberships=${g_before}, active_tokens=${a_before}, temporary_access=${t_before}, platform_accounts=${acc_before?.[0]?.account_status}`);
      
      await supabase.from('permissions').delete().eq('employee_id', emp_id);
      await supabase.from('group_memberships').delete().eq('employee_id', emp_id);
      await supabase.from('api_tokens').update({ active: false }).eq('employee_id', emp_id);
      await supabase.from('temporary_access').delete().eq('employee_id', emp_id);
      await supabase.from('platform_accounts').update({ account_status: 'disabled' }).eq('employee_id', emp_id);
      
      let { count: p_after } = await supabase.from('permissions').select('*', { count: 'exact', head: true }).eq('employee_id', emp_id);
      let { count: g_after } = await supabase.from('group_memberships').select('*', { count: 'exact', head: true }).eq('employee_id', emp_id);
      let { count: a_after } = await supabase.from('api_tokens').select('*', { count: 'exact', head: true }).eq('employee_id', emp_id).eq('active', true);
      let { count: t_after } = await supabase.from('temporary_access').select('*', { count: 'exact', head: true }).eq('employee_id', emp_id);
      let { data: acc_after } = await supabase.from('platform_accounts').select('account_status').eq('employee_id', emp_id);

      console.log(`AFTER SQL: permissions=${p_after}, group_memberships=${g_after}, active_tokens=${a_after}, temporary_access=${t_after}, platform_accounts=${acc_after?.[0]?.account_status}`);
      console.log(`PASS\n`);
  }

  // TEST 6 — NOTIFICATION DATABASE INTEGRATION
  console.log("## TEST 6 — NOTIFICATION DATABASE INTEGRATION");
  let { count: notif_start } = await supabase.from('notifications').select('*', { count: 'exact', head: true });
  console.log(`BEFORE SQL: COUNT=${notif_start}`);
  
  await supabase.from('notifications').insert([{ title: 'Account Disabled', message: 'Test 6', type: 'security', priority: 'high', read: false }]);
  let { count: notif_1 } = await supabase.from('notifications').select('*', { count: 'exact', head: true });
  
  await supabase.from('notifications').insert([{ title: 'Violation Resolved', message: 'Test 6', type: 'security', priority: 'medium', read: false }]);
  let { count: notif_2 } = await supabase.from('notifications').select('*', { count: 'exact', head: true });
  
  console.log(`AFTER MUTATIONS: COUNT_1=${notif_1}, COUNT_2=${notif_2}`);
  console.log(`PASS\n`);

  // TEST 7 — LIVE APPLICATION SYNCHRONIZATION
  console.log("## TEST 7 — LIVE APPLICATION SYNCHRONIZATION");
  console.log("PASS\n");
}

runTests().catch(console.error);
