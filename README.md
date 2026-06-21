# ZENITH ZERO

## Enterprise Identity Security Intelligence Platform

Advanced enterprise-grade identity governance and privilege abuse detection platform for hybrid banking infrastructure.

---

## Problem Statement

Modern enterprises suffer from critical identity security gaps:

- **Privilege Creep**: Accumulated access rights that exceed job requirements
- **Zombie Credentials**: Terminated employees retaining active accounts across platforms
- **Cross-Platform Access Abuse**: Identity relationships spanning multiple systems without correlation
- **Excessive Permissions**: Admin-level access proliferation without legitimate business justification
- **Offboarding Security Gaps**: Incomplete account deprovisioning across enterprise platforms
- **Lack of Unified Identity Governance**: Siloed identity and access management without centralized oversight
- **Compliance Violations**: NIST, GDPR, RBI framework non-compliance with undetected regulatory gaps

**Result**: Enterprise risk exposure, regulatory penalties, and security incidents from unmanaged identities.

---

## Proposed Solution

ZENITH ZERO provides comprehensive identity security through:

### Detection & Analytics
- **Identity Graph Intelligence**: Relationship mapping and dependency analysis across platforms
- **Zombie Credential Detection**: Automated discovery of terminated employees with active accounts
- **Privilege Creep Detection**: Identification of excessive or unnecessary permissions
- **Cross-Platform Risk Engine**: Multi-platform privilege correlation and risk scoring
- **Dormant Credential Analysis**: Detection of unused credentials aging > 90 days
- **Compliance Monitoring**: Continuous framework validation (NIST, GDPR, RBI)

### Threat Simulation & Remediation
- **Attack Path Simulation**: Graph-based attack scenario modeling
- **Privilege Abuse Detection**: Behavior anomaly identification
- **Automated Remediation Workflows**: Policy-driven access revocation
- **Global Revoke Orchestration**: Recursive cascade privilege removal across linked entities
- **Lifecycle Orchestration**: Employee termination with complete privilege discovery
- **Real-Time Monitoring**: Continuous audit trail and anomaly detection

---

## System Architecture

### Frontend Layer
- **React 18** with TypeScript for type-safe UI development
- **TailwindCSS** for responsive design
- **Shadcn UI** component library for enterprise aesthetics
- **Recharts** for data visualization and KPI dashboards
- **ReactFlow** for identity graph visualization
- **Framer Motion** for smooth UI interactions
- **Vite** for optimized bundling and fast development

### State Management Layer
- **Zustand** for global state management
- **Data Version Invalidation**: Cache invalidation pattern for real-time synchronization
- **Cross-Page Synchronization**: Automatic state updates across all pages on mutations

### Backend & Data Layer
- **Supabase PostgreSQL**: Enterprise-grade relational database
- **Row-Level Security (RLS)**: Granular access control at database level
- **Authentication**: Built-in JWT-based authentication
- **Realtime Subscriptions**: Live updates across connected clients

### Detection Engines (Server-Side)
- **Zombie Credential Detection**: Query for terminated employees with active accounts
- **Privilege Creep Detection**: Permission-to-role mapping analysis
- **Cross-Platform Risk Engine**: Identity relationship scoring algorithm
- **Dormant Credential Scanner**: Last-login timestamp analysis
- **Compliance Violation Engine**: Framework-based control validation
- **Attack Simulation Engine**: Graph traversal for privilege escalation paths
- **Identity Lifecycle Engine**: Recursive cascade detection and remediation

---

## Database Architecture

### Core Identity Tables
- **employees**: Employee directory with risk classification
- **platform_accounts**: Account presence across platforms
- **permissions**: Granular access rights per employee
- **service_accounts**: System and application accounts
- **api_tokens**: Application authentication tokens
- **group_memberships**: Group-based access hierarchies

### Relationship & Dependency Tables
- **identity_relationships**: Platform-agnostic identity linking
- **privilege_history**: Temporal privilege change audit trail
- **cross_dep_locks**: Dependency tracking for cascade operations

### Security & Monitoring Tables
- **compliance_violations**: Regulatory control violations
- **residual_access_violations**: Orphaned access after termination
- **temporary_access**: Time-bound privilege grants
- **offboarding_records**: Employee termination tracking
- **audit_logs**: Comprehensive action audit trail
- **lifecycle_events**: Identity lifecycle state transitions
- **revocation_requests**: Access removal requests and approval workflow
- **notifications**: Audit-trail notifications for all mutations

### Analytics Tables
- **security_metrics_history**: Monthly KPI snapshots for trend analysis
- **privilege_history**: Temporal permission changes for compliance reporting

---

## Enterprise Dataset

ZENITH ZERO operates on a realistic Indian banking enterprise simulation:

- **8,500 employees** across 7 regions with role-based hierarchies
- **30,000 platform accounts** spanning 12 enterprise platforms
- **42,000 active permissions** with multi-level access controls
- **80,000+ audit log events** capturing 6 months of activity
- **25,000 identity relationships** modeling complex interdependencies
- **4,000 API tokens** for application authentication
- **10,000+ notifications** from mutation audit trail
- **24-month historical security metrics** for trend analysis

**Platforms Represented**: Active Directory, Azure AD, AWS IAM, Okta, Kubernetes RBAC, Oracle DB, Jenkins, GitLab, UPI Gateway, SWIFT, Core Banking, Service Now

---

## Security Engines

### 1. Zombie Credential Detection
Discovers accounts belonging to terminated employees still active on platforms.
- **Query**: Terminated employees + active platform_accounts
- **Action**: Alert and automated disable option

### 2. Privilege Escalation Detection  
Identifies unusual privilege elevation patterns.
- **Query**: Recent permission_level changes from basic to admin
- **Severity**: Based on employee risk_level and platform sensitivity

### 3. Dormant Credential Analysis
Identifies unused credentials aging > 90 days.
- **Query**: platform_accounts with last_login > 90 days ago
- **Risk**: Compromised credentials with low detection probability

### 4. Cross-Platform Privilege Risk
Scores risk based on permissions across linked identities.
- **Query**: Multi-platform identity_relationships + permission levels
- **Algorithm**: Cumulative risk scoring across platforms

### 5. Compliance Violation Monitoring
Continuous NIST, GDPR, and RBI control validation.
- **Controls**: Admin access limits, MFA requirements, access review frequency
- **Automation**: Automatic violation resolution with audit trail

### 6. Attack Path Simulation
Graph-based privilege escalation simulation.
- **Algorithm**: DFS traversal of identity_relationships and group_memberships
- **Output**: Potential attack paths with remediation recommendations

### 7. Lifecycle Orchestration Engine
Automated employee termination with cascade privilege revocation.
- **Operations**: Platform account disabling, permission deletion, group removal, API token revocation
- **Guarantee**: No orphaned access post-termination

---

## Role-Based Access Control

### Admin Role
- **Mission**: Full platform control and security management
- **Permissions**: 
  - Execute global revoke operations
  - Approve critical remediation actions
  - Trigger employee termination workflows
  - Access all detection engines
  - Export security reports

### Security Analyst Role
- **Mission**: Detection, analysis, and remediation execution
- **Permissions**:
  - View all dashboards and alerts
  - Execute remediation on violations
  - Resolve compliance violations
  - Manage identity graph
  - Limited to analysis and remediation (no system configuration)

### Auditor Role
- **Mission**: Compliance verification and audit reporting
- **Permissions**:
  - Read-only access to all data
  - View audit trail and lifecycle events
  - Export compliance reports
  - Cannot execute mutations

---

## Key Engineering Decisions

### 1. Real Database Persistence (No Mock Data)
- All operations write to PostgreSQL immediately
- No client-side fake state
- Every mutation creates audit trail in database
- Supports multi-user scenarios with live synchronization

### 2. Global State Invalidation Pattern
- Zustand `dataVersion` incremented on every mutation
- All data hooks depend on `[dataVersion]`
- Automatic refetch on any state change
- Zero manual cache invalidation

### 3. Cross-Page Synchronization
- Dashboard updates instantly when remediation executed on other page
- No page refresh required
- Realtime cascade through state invalidation

### 4. Notification Persistence
- Every mutation creates `notifications` database record
- Bell badge queries database, not Zustand state
- Notifications survive browser refresh
- Audit trail for all user actions

### 5. Recursive Revoke Cascade
- `executeGlobalRevokeAll()` maintains referential integrity
- Operations on 8+ linked tables with error collection
- Partial failure detection and reporting
- Lifecycle event creation for audit trail

### 6. RLS Policies
- Database-level access control via Supabase RLS
- Policies on all mutation tables
- Authentication required for all operations
- No application-level access bypass possible

---

## Professional Feature Highlights

- **Real-Time Enterprise Dashboard**: Live KPI monitoring with LIVE DATA badge
- **Identity Intelligence Graph**: Visual relationship mapping with lazy loading
- **Threat Detection Engines**: 7 specialized security scanning engines
- **Automated Remediation Orchestration**: Policy-driven access revocation
- **Live SQL Persistence**: Database-backed mutations with referential integrity
- **Cross-Page Synchronization**: Instant UI updates across all pages
- **Enterprise Audit Trail Logging**: Complete mutation audit trail
- **Banking Security Compliance**: NIST, GDPR, RBI framework validation

---

## Future Scalability

### Integration Roadmap
- **Kafka Stream Integration**: Real-time identity event ingestion
- **SIEM Integration**: Splunk, Elastic, Azure Sentinel exporters
- **Cloud Provider Connectors**: Azure AD, AWS IAM, GCP IAM native APIs
- **SSO Integration**: Okta, Auth0, OneLogin connectors
- **Behavioral Analytics**: Machine learning-based anomaly detection
- **AI-Assisted Remediation**: LLM-powered policy recommendations

### Performance Enhancements
- **GraphQL API**: Optimized data fetching
- **Database Query Optimization**: Index strategies for large datasets
- **Caching Layer**: Redis for metric queries
- **Async Processing**: Bull queue for heavy operations
- **Horizontal Scaling**: Stateless backend with load balancing

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

## License

Enterprise Demonstration Build - Proprietary
Designed for Aureon Global Bank Security Assessment & Hackathon Evaluation

---

## Technical Specifications

- **Frontend**: React 18, TypeScript, Vite
- **State**: Zustand with invalidation pattern
- **Backend**: Supabase PostgreSQL with RLS
- **Authentication**: JWT via Supabase Auth
- **Deployment**: Containerized with Docker
- **Database**: PostgreSQL 14+ with RLS policies
- **Data Volume**: 8500+ employees, 200K+ records
- **Concurrent Users**: 50+ simultaneous sessions
- **Real-Time**: WebSocket via Supabase Realtime
