# PROJECT OVERVIEW — ZENITH ZERO

## For Faculty Guides & Hackathon Evaluators

Complete guide to understanding, evaluating, and demonstrating ZENITH ZERO without requiring verbal explanations.

---

## Executive Summary

**ZENITH ZERO** is an enterprise-grade identity security intelligence platform designed for modern banking infrastructure. It detects privilege abuse, identifies zombie credentials, tracks compliance violations, and orchestrates automated remediation across hybrid identity platforms.

### Problem It Solves
- **Privilege Creep**: Employees accumulate excessive permissions over time
- **Zombie Credentials**: Terminated employees retain active accounts
- **Identity Governance Gaps**: No unified visibility into cross-platform access
- **Compliance Risk**: Regulatory violations in identity controls (NIST, GDPR, RBI)
- **Incident Response**: Manual, slow remediation of security violations

### Solution Delivered
- Real-time threat detection across 12 enterprise platforms
- Automated privilege cascade revocation
- Compliance violation management
- Multi-page synchronization without refresh
- Database-persisted audit trail

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | Type-safe UI with hot reload |
| **State** | Zustand | Global state with invalidation pattern |
| **Styling** | TailwindCSS + Shadcn UI | Enterprise component library |
| **Database** | Supabase PostgreSQL | Cloud database with RLS policies |
| **Visualization** | Recharts + ReactFlow | Dashboards and graph visualization |
| **Build** | Vite | Fast development and optimized builds |

---

## Feature Overview

### 1. Executive Dashboard
- **Live KPI Metrics**: Total Identities, High Risk, Privileged Accounts, Zombie Accounts, Dormant Credentials, Compliance Violations
- **Risk Distribution Chart**: Visual breakdown of identity risk levels
- **Platform Distribution**: Account and privilege spread across enterprise platforms
- **Privilege History**: Temporal trend of permission changes
- **Dormant Access Analysis**: Credential age distribution
- **LIVE DATA Badge**: Indicates real-time data from database

### 2. Identity Graph
- **Visual Relationship Mapping**: Employee → Accounts → Permissions → Groups
- **Lazy Loading**: Initial load <100 nodes, children load on demand
- **Dependency Analysis**: Shows identity chains and cross-platform access paths
- **Interactive Inspection**: Click nodes to drill-down into relationships

### 3. Privilege Analysis  
- **Admin Access Review**: List all employees with admin-level permissions
- **Permission Breakdown**: Granular view of access by platform and resource
- **Excessive Privilege Detection**: Flags business-unjustified access
- **Approval Workflow**: Manager verification of elevated privileges

### 4. Access Risk Detection
- **Residual Access**: Terminated employees with active accounts
- **Dormant Credentials**: Unused accounts > 90 days
- **Unusual Account Activity**: Failed logins, off-hours access
- **Risk Scoring**: Composite risk from multiple factors

### 5. Attack Path Simulator
- **Graph Traversal**: DFS-based privilege escalation paths
- **Scenario Modeling**: "From junior employee to production database"
- **Risk Assessment**: Likelihood and impact of attacks
- **Mitigation Recommendations**: Automatic remediation suggestions

### 6. Compliance Center
- **Compliance Score**: Aggregate compliance across frameworks
- **Violation Tracking**: NIST, GDPR, RBI control violations
- **Remediation Tracking**: Status of violation resolution
- **Export Reports**: Audit-ready compliance documentation

### 7. Remediation Engine
- **Workbench**: All actionable security issues in priority queue
- **Global Revoke**: Single-click recursive privilege removal
- **Approvals Workflow**: Critical action approval process
- **Lifecycle Orchestration**: Employee termination with complete account cleanup
- **Residual Scanner**: Post-termination orphaned access detection

---

## Demo Flow (10 Minutes)

### Step 1: Dashboard Overview (2 min)
1. Open application: `http://localhost:5173`
2. Observe LIVE DATA badge (confirms database connection)
3. Review KPI cards:
   - Total Identities: 8,500 (realistic enterprise scale)
   - High Risk: 238 (connected to Remediation Engine)
   - Privileged Accounts: ~300 (admin-level permissions)
   - Zombie Accounts: ~45 (terminated with active accounts)
   - Dormant Credentials: ~800 (unused > 90 days)

### Step 2: Identity Graph (2 min)
1. Navigate to "Identity Graph"
2. Initial load shows <100 nodes (performance optimization)
3. Click on employee nodes to see:
   - Platform accounts
   - Permissions and groups
   - Identity relationships
4. Observe lazy-loaded children appear on demand

### Step 3: Compliance Center (1 min)
1. Navigate to "Compliance Center"
2. Show compliance score (should be high)
3. Review violations if any are open
4. Explain NIST/GDPR/RBI framework tracking

### Step 4: Remediation Engine (3 min)
1. Navigate to "Remediation Engine"
2. Workbench tab shows pending issues:
   - Compliance violations
   - Residual access (terminated employees)
   - Expired temporary access
3. Click one "Resolve" button to execute remediation
4. Observe:
   - Notification bell updates
   - Row disappears from table
   - Total issues count decrements
   - Dashboard High Risk count decreases (live sync)
5. (Optional) Try "Global Revoke" on one employee:
   - Shows recursive cascade across 8+ tables
   - Permanent mutation with audit trail

### Step 5: Live Synchronization (1 min)
1. Keep dashboard and remediation open in split screens
2. Execute remediation on one page
3. Observe dashboard metrics update instantly
4. No page refresh required
5. Explain cache invalidation pattern

### Step 6: Database Verification (1 min)
1. Open Supabase dashboard
2. Run query to show mutation persistence:
```sql
SELECT COUNT(*) FROM residual_access_violations WHERE status='active';
```
3. Compare before/after to prove database writes
4. Show audit trail in compliance_violations or lifecycle_events table

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                       │
│  React 18 + TypeScript + TailwindCSS + Shadcn UI       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Dashboard   │  │ Identity     │  │ Remediation  │  │
│  │  Executive   │  │ Graph        │  │ Engine       │  │
│  │  KPIs        │  │ Visualization│  │ Workbench    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│              STATE MANAGEMENT LAYER                     │
│  Zustand Global Store + Data Version Invalidation      │
│  ├─ invalidateData() increments dataVersion             │
│  └─ All hooks depend on [dataVersion]                   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│           DATABASE ABSTRACTION LAYER                    │
│  dbService.ts: All SQL Operations                       │
│  ├─ getHighRiskEmployeeCount() [SYNCED TO DASHBOARD]   │
│  ├─ getResidualAccessViolations()                      │
│  ├─ executeGlobalRevokeAll() [RECURSIVE CASCADE]        │
│  ├─ updateComplianceViolationStatus()                   │
│  └─ insertNotification() [AUDIT TRAIL]                  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│        SUPABASE BACKEND (PostgreSQL + RLS)              │
│                                                          │
│  18 Tables with Row-Level Security Policies             │
│  ├─ Core: employees, platform_accounts, permissions    │
│  ├─ Security: compliance_violations, notifications     │
│  ├─ Audit: lifecycle_events, audit_logs                │
│  └─ Detection: residual_access_violations, temp_access │
│                                                          │
│  Engines:                                               │
│  ├─ Zombie Credential Detection                        │
│  ├─ Privilege Creep Detection                          │
│  ├─ Compliance Violation Monitoring                     │
│  ├─ Attack Path Simulation                             │
│  └─ Lifecycle Orchestration                            │
└─────────────────────────────────────────────────────────┘
```

---

## Key Engineering Decisions

### 1. Real Database Persistence
- **Why**: Demonstrates production-quality architecture, not mock data
- **How**: Every mutation writes to Supabase PostgreSQL immediately
- **Proof**: Refresh browser → data persists; query database → changes visible

### 2. Global State Invalidation Pattern
- **Why**: Eliminates manual cache invalidation bugs
- **How**: `dataVersion` incremented on mutation → all hooks refetch
- **Result**: Dashboard, graph, compliance all sync instantly without refresh

### 3. Notification Database Integration
- **Why**: Audit trail for compliance and incidents
- **How**: Every mutation calls `insertNotification()` before UI update
- **Proof**: Bell badge queries database, survives refresh, shows history

### 4. Recursive Revoke Cascade
- **Why**: Prevents orphaned access; enforces referential integrity
- **How**: 9-step cascade across permissions, accounts, groups, tokens, temp access
- **Guarantee**: No manual cleanup needed; one employee remove = complete privilege removal

### 5. RLS Policies (Database-Level Security)
- **Why**: Prevents SQL injection and unauthorized access
- **How**: PostgreSQL RLS policies on all mutation tables
- **Benefit**: No application bypass possible; security enforced at database

---

## Evaluation Criteria

### Functionality ✓
- [ ] Dashboard loads with live data (LIVE DATA badge visible)
- [ ] Identity graph renders without errors
- [ ] Compliance violations display correctly
- [ ] Remediation engine shows pending issues
- [ ] Global revoke executes without errors

### Real-Time Synchronization ✓
- [ ] Execute remediation → Dashboard updates instantly
- [ ] No page refresh required
- [ ] Multiple pages stay in sync
- [ ] Browser refresh preserves state (database-backed)

### Database Persistence ✓
- [ ] Query database before mutation
- [ ] Execute UI mutation
- [ ] Query database after mutation
- [ ] Verify changes persisted permanently
- [ ] Refresh browser → changes still present

### Code Quality ✓
- [ ] TypeScript strict mode enabled
- [ ] No `console.error()` or silent failures
- [ ] Error messages are specific and actionable
- [ ] Mutations include audit trail creation
- [ ] RLS policies prevent unauthorized access

### Enterprise Features ✓
- [ ] RBAC implemented (Admin/Analyst/Auditor roles)
- [ ] Audit trail for all mutations
- [ ] Compliance framework integration (NIST/GDPR/RBI)
- [ ] Scalable to 8500+ employees
- [ ] Multi-user concurrent sessions

---

## Common Evaluation Questions & Answers

### Q: "Where does the data come from?"
**A**: Supabase PostgreSQL database with 8,500 employees and 200K+ records seeded from realistic banking enterprise simulation. Every metric comes from live database queries, not mock arrays.

**Proof**: `npm run dev` → Dashboard shows LIVE DATA badge and queried KPIs.

### Q: "How do mutations persist?"
**A**: All mutations execute immediately against PostgreSQL. Every change creates an audit log entry. Refresh browser or query database to verify—data is permanent, not client-side state.

**Proof**: 
1. Note a compliance violation ID
2. Click Resolve button
3. Query: `SELECT status FROM compliance_violations WHERE id='XXX'`
4. Status will be 'resolved' in database

### Q: "Why does the dashboard update instantly?"
**A**: Zustand state management with `dataVersion` invalidation. When mutation executes, `dataVersion` increments, triggering all hooks to refetch from database. No manual cache clearing needed.

**Proof**: Open dashboard and Remediation Engine side-by-side, execute remediation, observe dashboard metrics change without page refresh.

### Q: "Can you demonstrate the cascade revoke?"
**A**: Yes. Global revoke removes employee from 8+ linked tables:
1. Disable platform_accounts
2. Delete permissions
3. Remove group_memberships
4. Revoke api_tokens
5. End temporary_access
6. Deactivate service_accounts
7. Delete identity_relationships
8. Insert cross_dep_locks
9. Resolve residual_access_violations

**Proof**: 
```sql
SELECT COUNT(*) FROM permissions WHERE employee_id='EMPXXXX' AND active=true;
-- Run BEFORE: should show N permissions
-- Execute Global Revoke
-- Run AFTER: should show 0
```

### Q: "How is security implemented?"
**A**: Row-Level Security (RLS) policies in PostgreSQL prevent unauthorized access at database level. No application bypass possible. All mutations authenticated via JWT tokens from Supabase Auth.

### Q: "What happens if database is down?"
**A**: Application detects connection failure and shows "LIVE DATA" badge disappears. Dashboard shows cached data or error state. Mutations are blocked with clear error message. Graceful degradation.

---

## Troubleshooting During Demo

### Dashboard Shows "0" for All Metrics
1. Check browser console for errors (F12)
2. Verify Supabase connection: Open Network tab, look for `/rest/v1/employees` queries
3. Check `.env.local` file has correct Supabase credentials
4. Restart dev server: `npm run dev`

### Global Revoke Shows Error
1. Error message should explain which table failed
2. Check RLS policies allow INSERT/UPDATE/DELETE for authenticated role
3. Verify employee_id exists in employees table
4. Check foreign key constraints aren't preventing deletion

### Dashboard Doesn't Update After Remediation
1. Verify `dataVersion` incremented in Zustand store (DevTools → React tab)
2. Check browser Network tab → should see new API request to Supabase
3. Verify hook has `[dataVersion]` in dependency array
4. Clear browser cache: `Ctrl+Shift+Delete`

### Graph Visualization Fails
1. Check ReactFlow library loaded (Network tab)
2. Verify employee count > 0
3. Check browser console for layout algorithm errors
4. Try clearing browser cache and hard reload: `Ctrl+F5`

---

## Code Navigation Guide

### Frontend Structure
```
src/
├── pages/
│   ├── DashboardPage.tsx          [Main KPI dashboard]
│   ├── IdentityGraphPage.tsx       [Graph visualization]
│   ├── CompliancePage.tsx          [Compliance violations]
│   ├── RemediationPage.tsx         [Remediation engine]
│   └── ...
├── services/
│   └── dbService.ts               [ALL database queries & mutations]
├── hooks/
│   └── useSupabaseData.ts          [Data fetching hooks]
├── store/
│   └── appStore.ts                [Zustand global state]
└── engines/
    └── lifecycleEngine.ts          [Cascade revoke logic]
```

### Key Files for Evaluation

| File | Purpose | What to Look For |
|------|---------|-----------------|
| `src/services/dbService.ts` | All SQL operations | `getHighRiskEmployeeCount()` - synced to dashboard; `executeGlobalRevokeAll()` - recursive cascade |
| `src/store/appStore.ts` | Global state | `invalidateData()` pattern, `dataVersion` usage |
| `src/hooks/useSupabaseData.ts` | Data fetching | `[dataVersion]` dependency array in all hooks |
| `src/pages/DashboardPage.tsx` | Dashboard | High Risk metric pulls from Remediation Engine count |
| `src/components/remediation/WorkbenchTab.tsx` | Remediation UI | Error handling, proper mutation execution |

---

## Sign-Off Criteria

**Project is production-ready when:**
- [ ] All 7 mutations execute with database persistence
- [ ] Dashboard and Remediation Engine stay in sync
- [ ] No silent failures or hidden errors
- [ ] Audit trail created for every mutation
- [ ] RLS policies prevent unauthorized access
- [ ] Browser refresh preserves all data
- [ ] Multi-user scenarios work correctly
- [ ] No console errors on any page

---

## Enterprise Connector Architecture

To demonstrate production viability, ZENITH ZERO is designed to integrate with real enterprise identity systems via an ingestion and orchestration layer:

- **Azure AD Graph API connector**: Syncs Microsoft 365 and Azure AD identities, groups, and RBAC roles.
- **AWS IAM connector**: Normalizes AWS IAM policies, roles, and user permissions for cross-platform mapping.
- **Okta SCIM connector**: Ingests identity lifecycle events in real-time.
- **LDAP Active Directory connector**: Connects to legacy on-premise AD.
- **Kafka event ingestion pipeline**: Streams high-volume audit logs into Zenith Zero.
- **SIEM integration with Splunk**: Exports critical alerts to the enterprise SOC.
- **ITSM integration with ServiceNow**: Converts remediation actions into traceable approval tickets.
- **Approval workflow orchestration**: Ensures no destructive actions execute without documented approval.

*Note: This architecture is documented for production deployment scoping and is not actively connected in this demonstration prototype.*

---

## Appendix: SQL for Manual Verification

### Verify Total Issues (Should match Dashboard High Risk)
```sql
SELECT 
  (SELECT COUNT(*) FROM residual_access_violations WHERE status='active') +
  (SELECT COUNT(*) FROM compliance_violations WHERE status='open') +
  (SELECT COUNT(*) FROM temporary_access WHERE current_status='active') as total_high_risk_issues;
```

### Verify Mutation Audit Trail
```sql
SELECT * FROM lifecycle_events ORDER BY created_at DESC LIMIT 10;
```

### Verify Notification Persistence
```sql
SELECT COUNT(*) FROM notifications;
-- Should increment after each mutation
```

### Check RLS Policies Active
```sql
SELECT * FROM pg_policies WHERE tablename IN ('compliance_violations', 'residual_access_violations', 'permissions');
```

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-06-21  
**Intended Audience**: Faculty Guides, Hackathon Judges, Technical Evaluators
