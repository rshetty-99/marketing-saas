# RBAC Specification — Aura.ai Marketing SaaS Platform

> Version 2.0 | Applies to: F0, F6, F7, F8, F14, F15, Platform Admin, and all feature-level access control

---

## Table of Contents

1. [Two-Layer Role Architecture](#1-two-layer-role-architecture)
2. [Platform Roles](#2-platform-roles)
3. [Workspace Roles](#3-workspace-roles)
4. [Account Types & Onboarding Paths](#4-account-types--onboarding-paths)
5. [Onboarding Flow (F0)](#5-onboarding-flow-f0)
6. [Profile Completeness Score](#6-profile-completeness-score)
7. [Workspace Permission Matrix](#7-workspace-permission-matrix)
8. [Platform Permission Matrix](#8-platform-permission-matrix)
9. [Agency-Specific RBAC](#9-agency-specific-rbac)
10. [Agency Claiming Flow](#10-agency-claiming-flow)
11. [Approval Workflow RBAC (F6)](#11-approval-workflow-rbac-f6)
12. [Trial & Billing Model](#12-trial--billing-model)
13. [Notifications](#13-notifications)
14. [Audit Logging](#14-audit-logging)
15. [Firestore Data Model](#15-firestore-data-model)
16. [Firestore Security Rules](#16-firestore-security-rules)
17. [API Middleware](#17-api-middleware)
18. [Clerk Integration](#18-clerk-integration)
19. [Soft Delete & Data Retention](#19-soft-delete--data-retention)
20. [Migration & Upgrade Paths](#20-migration--upgrade-paths)
21. [TypeScript Definitions](#21-typescript-definitions)

---

## 1. Two-Layer Role Architecture

Aura.ai has two completely independent role systems. A person can only belong to ONE layer — never both.

```
┌──────────────────────────────────────────────────────────────┐
│  LAYER 1: Platform Roles                                     │
│  Who: Aura.ai internal team (founders, ops, support, etc.)   │
│  Where: /admin panel                                         │
│  Auth: Separate Clerk org ("aura-platform")                  │
│  Firestore: platform_users collection                        │
│  Purpose: Operate, monitor, and support the SaaS platform    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  LAYER 2: Workspace Roles                                    │
│  Who: Customers (freelancers, teams, agencies, clients)      │
│  Where: Main app (aura.ai)                                   │
│  Auth: Customer Clerk orgs (one per workspace)               │
│  Firestore: workspaces/{id}/members subcollection            │
│  Purpose: Use the product to create/manage marketing content │
└──────────────────────────────────────────────────────────────┘
```

**Exclusivity rule:** A Clerk user ID belongs to exactly one layer. Platform team members do NOT have workspace accounts. If someone needs both, they use separate email addresses.

---

## 2. Platform Roles

### 2.1 Role Definitions

Eight platform roles, hierarchical. Seeded `super_admin` at deployment creates all others via admin panel.

```
super_admin > platform_admin > partner_manager > operations > finance > support > content_moderator > analyst
```

| Role | Description | Primary Responsibilities |
|------|-------------|------------------------|
| **super_admin** | Founders / CTO. God-mode. | Everything. Seeded at deploy. Cannot be created via UI — only via database seed script. |
| **platform_admin** | Senior platform team. | All operations except destructive platform-level actions (drop database, modify super_admin). |
| **partner_manager** | Agency partnerships & onboarding. | Approve account type upgrades, manage agency partnerships, onboard enterprise clients, review agency applications. |
| **operations** | Day-to-day platform management. | User/workspace management, subscription overrides, trial extensions, feature flag toggles, impersonation (read-only). |
| **finance** | Billing & revenue operations. | View/manage Stripe subscriptions, process refunds, generate revenue reports, manage invoicing, view MRR/churn dashboards. |
| **support** | Customer support team. | View customer workspaces (impersonation read-only), respond to tickets, escalate issues, view audit logs for debugging. |
| **content_moderator** | Content & compliance review. | Review flagged content, enforce ToS violations, suspend content, issue warnings, review reported workspaces. |
| **analyst** | Read-only platform analytics. | View all dashboards (users, revenue, growth, engagement), export platform reports. Cannot modify any data. |

### 2.2 Platform Role Hierarchy

```
analyst:            view platform dashboards & reports
     ↑
content_moderator:  + review/flag/suspend user content, issue ToS warnings
     ↑
support:            + view customer workspaces (impersonate read-only), manage tickets
     ↑
finance:            + manage Stripe subscriptions, refunds, revenue reports
     ↑
operations:         + manage users/workspaces, toggle feature flags, extend trials
     ↑
partner_manager:    + approve upgrades, manage agency partnerships, enterprise onboarding
     ↑
platform_admin:     + create/manage platform team members, configure platform settings
     ↑
super_admin:        + destructive operations, seed management, platform deletion
```

### 2.3 Impersonation

Platform roles `operations` and `support` (and above) can "view as" a customer workspace.

**Rules:**
- Impersonation is **read-only** — no writes, no content creation, no publishing
- Every impersonation session is logged to `platform_audit_log` with: who, which workspace, start time, end time, reason
- Impersonation requires entering a reason before session starts
- Session auto-expires after 30 minutes
- Impersonation banner displayed in UI: "You are viewing as [workspace name] — read-only"
- Cannot impersonate during active write operations (e.g., while a support agent is also in the admin panel editing something)

---

## 3. Workspace Roles

### 3.1 Role Definitions

Six roles, strictly hierarchical. Higher roles inherit all permissions of lower roles.

```
owner > admin > manager > editor > viewer > client_portal
```

| Role | Scope | Description |
|------|-------|-------------|
| **owner** | Workspace | Created the workspace. Full control including billing, deletion, and ownership transfer. One per workspace. |
| **admin** | Workspace | Full operational control. Can manage members, roles, integrations, and all content. Cannot delete workspace or transfer ownership. |
| **manager** | Workspace | Can manage content workflows, approve content, publish, assign tasks, and view analytics. Cannot manage members or integrations. |
| **editor** | Workspace | Can create, edit, and submit content for approval. Cannot approve, publish, or access admin settings. |
| **viewer** | Workspace | Read-only access to content, analytics, and reports. Cannot create or modify anything. |
| **client_portal** | Client sub-workspace | External client access. Read-only view of reports and approved content for their specific client workspace only. |

### 3.2 Role Hierarchy Inheritance

```
client_portal:  view own reports
     ↑
viewer:         + view all workspace content, analytics, calendar
     ↑
editor:         + create/edit content, submit for approval, manage own drafts
     ↑
manager:        + approve/reject content, publish, assign tasks, view team analytics
     ↑
admin:          + manage members/roles, connect integrations, workspace settings
     ↑
owner:          + billing, delete workspace, transfer ownership
```

---

## 4. Account Types & Onboarding Paths

Every new customer sign-up selects one of three **account types** during onboarding. The account type determines the workspace structure, available tiers, and default role of the creator.

| Account Type | Description | Workspace Structure | Creator Default Role | Available Tiers |
|-------------|-------------|--------------------|--------------------|----------------|
| **Freelancer** | Solo creator or consultant. Can add seats later. | Single workspace, starts with one seat | `owner` | Starter, Growth |
| **Organization** | In-house marketing team | Single workspace, multi-seat | `owner` | Growth, Agency |
| **Agency** | Agency managing external clients | Parent workspace + client sub-workspaces | `owner` | Agency, Agency Pro, White-Label |

### 4.1 Account Type Capability Matrix

| Capability | Freelancer | Organization | Agency |
|-----------|:----------:|:------------:|:------:|
| Workspace members | 1 (expandable) | Per tier | Per tier |
| Team invitations | After upgrade | Y | Y |
| Role assignment | After upgrade | Y | Y |
| Approval workflows | Optional | Y (default on) | Y (default on) |
| Client sub-workspaces | - | - | Y |
| Client portal users | - | - | Y |
| White-label reports | - | - | Y (Pro+) |
| Client switcher | - | - | Y |
| Agency claiming | - | - | Y |
| Billing management | Y | Y | Y |

---

## 5. Onboarding Flow (F0)

### 5.1 New User Onboarding (Wizard)

The onboarding wizard collects essential information. Everything else is deferred to the profile completeness checklist.

```
Sign Up (Clerk — email, Google, or GitHub)
  │
  ├─ Step 1: Welcome — Select Account Type
  │    ├─ Freelancer   "I work independently"
  │    ├─ Organization  "I'm part of a marketing team"
  │    └─ Agency        "I manage clients"
  │
  ├─ Step 2: Create Workspace
  │    ├─ Workspace name (e.g., "Acme Marketing")
  │    ├─ Industry (dropdown — optional)
  │    ├─ Clerk Organization auto-created
  │    ├─ Creator assigned role: owner
  │    └─ 15-day free trial starts
  │
  ├─ Step 3: Quick Brand Setup (minimal — deeper setup in checklist)
  │    ├─ Brand/company name
  │    ├─ Primary brand color (color picker)
  │    ├─ Brand voice tone (dropdown: professional, casual, friendly, authoritative, playful)
  │    └─ [Skip for now] option available
  │
  ├─ Step 4 (Org/Agency only): Invite Team
  │    ├─ Email + role picker per invitee (admin | manager | editor | viewer)
  │    ├─ Bulk paste emails option
  │    └─ [Skip — I'll do this later] option available
  │
  ├─ Step 5 (Agency only): Create First Client
  │    ├─ Client name + contact email
  │    ├─ Clerk child org auto-created
  │    ├─ Assign team members from Step 4
  │    └─ [Skip — I'll do this later] option available
  │
  └─ Step 6: Land in Dashboard
       ├─ Profile completeness widget visible (see Section 6)
       ├─ Getting started checklist open
       └─ Trial countdown badge visible
```

### 5.2 Invited Member Onboarding

```
Invitation Email (Clerk)
  │
  ├─ Step 1: Accept Invite → Sign Up / Sign In via Clerk
  │
  ├─ Step 2: Role Pre-Assigned by Inviter (not selectable)
  │    └─ Welcome screen shows: "You've been invited to [Workspace] as [Role]"
  │
  └─ Step 3: Land in Workspace Dashboard
       └─ Feature access governed by assigned role
       └─ Personal profile completeness (name, avatar) shown
```

### 5.3 Client Portal User Onboarding

```
Agency creates client portal access (F14)
  │
  ├─ Client receives invitation email
  │
  ├─ Step 1: Sign up via Clerk (scoped to client org)
  │
  └─ Step 2: Land in Client Portal (read-only view)
       ├─ Reports dashboard
       ├─ Approved content gallery
       └─ Analytics summary
```

---

## 6. Profile Completeness Score

### 6.1 Score Calculation

The profile score incentivizes users to fully set up their workspace. Score is calculated per workspace and adapts to account type.

**Base actions (all account types):**

| Action | Points | Category |
|--------|:------:|----------|
| Account type selected | 5 | Onboarding |
| Workspace created | 5 | Onboarding |
| Brand name & colors set | 10 | Brand (F8) |
| Brand voice & tone configured | 10 | Brand (F8) |
| Brand guidelines PDF uploaded | 10 | Brand (F8/F16) |
| Logo uploaded | 5 | Brand (F8/F16) |
| At least one social account connected | 15 | Integrations (F9) |
| Email provider connected | 5 | Integrations (F11) |
| First content draft created | 15 | Activation (F1) |
| First content published | 10 | Activation (F3) |
| Billing information added | 10 | Billing (F15) |

**Org/Agency bonus actions:**

| Action | Points | Category |
|--------|:------:|----------|
| At least one team member invited | 10 | Team (F7) |
| Approval workflow configured | 5 | Workflow (F6) |

**Agency-only bonus actions:**

| Action | Points | Category |
|--------|:------:|----------|
| First client created | 10 | Client (F14) |
| Client portal user provisioned | 5 | Client (F14) |

**Total possible:**
- Freelancer: 100 points (from base actions)
- Organization: 115 points (base + org bonus)
- Agency: 130 points (base + org + agency bonus)

**Score display:** Normalized to percentage (points earned / total possible for account type).

### 6.2 UI Placement

- **Dashboard widget** (primary): Card showing circular progress ring + percentage + "Complete your profile" CTA
- **Sidebar badge**: Small progress ring next to workspace name in the sidebar
- **Checklist drawer**: Expandable panel listing all actions with done/todo status, deep-links to relevant settings

### 6.3 Behavior

- **Passive, not nagging**: No modal popups, no blocking dialogs
- **Smart prompts**: If score < 50% after 3 days, show a gentle banner on dashboard: "Finish setting up to unlock the full power of Aura"
- **Celebration**: At 100%, show confetti animation once + "Setup complete!" badge
- **Dismissible**: User can collapse/hide the widget (but it remains in sidebar as badge)
- **Recalculated on every dashboard load** (not real-time — cached with 5-minute TTL)

### 6.4 Firestore Model

```typescript
// Stored in workspaces/{id}/profile_score (single document)
interface ProfileScore {
  workspaceId: string;
  accountType: AccountType;
  completedActions: string[];     // e.g., ['workspace_created', 'brand_colors_set', ...]
  score: number;                  // raw points
  maxScore: number;               // max possible for this account type
  percentage: number;             // score / maxScore * 100
  widgetDismissed: boolean;
  calculatedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

---

## 7. Workspace Permission Matrix

### 7.1 Feature-Level Permissions

| Action | owner | admin | manager | editor | viewer | client_portal |
|--------|:-----:|:-----:|:-------:|:------:|:------:|:-------------:|
| **Content (F1, F2)** | | | | | | |
| Create/edit drafts | Y | Y | Y | Y | - | - |
| Delete own drafts | Y | Y | Y | Y | - | - |
| Delete any draft | Y | Y | - | - | - | - |
| View all drafts | Y | Y | Y | Y | Y | - |
| **Approvals (F6)** | | | | | | |
| Submit for approval | Y | Y | Y | Y | - | - |
| Approve/reject content | Y | Y | Y | - | - | - |
| Self-approve own content | Y | Y | - | - | - | - |
| Override rejection | Y | Y | - | - | - | - |
| Configure approval rules | Y | Y | - | - | - | - |
| **Publishing (F3)** | | | | | | |
| Publish approved content | Y | Y | Y | - | - | - |
| Schedule posts | Y | Y | Y | - | - | - |
| Unpublish/retract | Y | Y | Y | - | - | - |
| **Calendar (F4)** | | | | | | |
| View calendar | Y | Y | Y | Y | Y | - |
| Create/edit events | Y | Y | Y | Y | - | - |
| Delete events | Y | Y | Y | - | - | - |
| **Analytics (F5)** | | | | | | |
| View analytics dashboard | Y | Y | Y | Y | Y | Y (own client) |
| Export reports | Y | Y | Y | - | - | - |
| **Workspaces (F7)** | | | | | | |
| Update workspace settings | Y | Y | - | - | - | - |
| Invite members | Y | Y | - | - | - | - |
| Remove members | Y | Y | - | - | - | - |
| Assign/change roles | Y | Y | - | - | - | - |
| Assign role >= own level | - | - | - | - | - | - |
| Delete workspace | Y | - | - | - | - | - |
| Transfer ownership | Y | - | - | - | - | - |
| Request account type upgrade | Y | - | - | - | - | - |
| **Brand Voice (F8)** | | | | | | |
| Create/edit brand profile | Y | Y | - | - | - | - |
| Upload brand assets | Y | Y | Y | - | - | - |
| View brand profile | Y | Y | Y | Y | Y | - |
| **Social Connections (F9)** | | | | | | |
| Connect accounts (OAuth) | Y | Y | - | - | - | - |
| Disconnect accounts | Y | Y | - | - | - | - |
| View connected accounts | Y | Y | Y | Y | - | - |
| **SEO & Keywords (F10)** | | | | | | |
| Run keyword research | Y | Y | Y | Y | - | - |
| View SEO reports | Y | Y | Y | Y | Y | - |
| **Email Campaigns (F11)** | | | | | | |
| Create campaigns | Y | Y | Y | Y | - | - |
| Send campaigns | Y | Y | Y | - | - | - |
| View campaign analytics | Y | Y | Y | Y | Y | - |
| Manage suppression list | Y | Y | - | - | - | - |
| **Lead Management (F12)** | | | | | | |
| Create leads | Y | Y | Y | Y | - | - |
| Edit any lead | Y | Y | Y | - | - | - |
| Edit assigned leads only | - | - | - | Y | - | - |
| Delete leads | Y | Y | - | - | - | - |
| Reassign leads | Y | Y | Y | - | - | - |
| Export leads (CSV) | Y | Y | Y | - | - | - |
| **Image Generation (F13)** | | | | | | |
| Generate images | Y | Y | Y | Y | - | - |
| Delete generated images | Y | Y | Y | - | - | - |
| **Client Management (F14)** | | | | | | |
| Create client workspace | Y | Y | - | - | - | - |
| Archive/pause client | Y | Y | - | - | - | - |
| Assign team to client | Y | Y | - | - | - | - |
| Switch client context | Y | Y | Y | Y | - | - |
| Generate client reports | Y | Y | Y | - | - | - |
| Send reports to client | Y | Y | Y | - | - | - |
| Provision client portal user | Y | Y | - | - | - | - |
| View own client reports | - | - | - | - | - | Y |
| View approved content | - | - | - | - | - | Y |
| **Billing (F15)** | | | | | | |
| View billing/invoices | Y | Y | - | - | - | - |
| Change plan/tier | Y | - | - | - | - | - |
| **DAM (F16)** | | | | | | |
| Upload assets | Y | Y | Y | Y | - | - |
| Delete assets | Y | Y | Y | - | - | - |
| View/download assets | Y | Y | Y | Y | Y | - |

### 7.2 Constraint Rules

1. **No self-role-elevation**: A member cannot assign a role equal to or higher than their own. Only `owner` can promote to `admin`. Only `admin`+ can promote to `manager`.
2. **Self-approval restriction**: `editor` cannot approve their own content. `manager`+ can self-approve (configurable per workspace — see Section 11).
3. **Owner is immutable**: The `owner` role cannot be removed, only transferred to another `admin`.
4. **One owner per workspace**: Ownership transfer demotes the previous owner to `admin`.
5. **client_portal is external-only**: Cannot be assigned to workspace members. Auto-assigned when a client portal user is created via F14.
6. **Freelancer seat expansion**: Freelancer starts with 1 seat. Adding seats requires upgrading to Growth tier, which enables team invitations and role assignment.

---

## 8. Platform Permission Matrix

### 8.1 Admin Panel Features

| Action | super_admin | platform_admin | partner_manager | operations | finance | support | content_moderator | analyst |
|--------|:-----------:|:--------------:|:---------------:|:----------:|:-------:|:-------:|:-----------------:|:-------:|
| **Dashboard** | | | | | | | | |
| View platform metrics (users, MRR, churn) | Y | Y | Y | Y | Y | Y | Y | Y |
| Export platform reports | Y | Y | Y | Y | Y | - | - | Y |
| **User Management** | | | | | | | | |
| Search/view all users | Y | Y | Y | Y | - | Y | Y | - |
| Suspend user account | Y | Y | - | Y | - | - | Y | - |
| Reactivate user account | Y | Y | - | Y | - | - | - | - |
| Delete user account | Y | Y | - | - | - | - | - | - |
| **Workspace Management** | | | | | | | | |
| View any workspace details | Y | Y | Y | Y | - | Y | Y | - |
| Force-archive workspace | Y | Y | - | Y | - | - | - | - |
| Restore archived workspace | Y | Y | - | Y | - | - | - | - |
| **Impersonation** | | | | | | | | |
| View-as workspace (read-only) | Y | Y | - | Y | - | Y | - | - |
| **Subscriptions** | | | | | | | | |
| View all subscriptions | Y | Y | Y | Y | Y | Y | - | Y |
| Override tier | Y | Y | - | Y | Y | - | - | - |
| Extend trial | Y | Y | Y | Y | Y | - | - | - |
| Process refund | Y | Y | - | - | Y | - | - | - |
| **Upgrade Requests** | | | | | | | | |
| View pending upgrade requests | Y | Y | Y | Y | - | - | - | - |
| Approve/deny upgrade request | Y | Y | Y | - | - | - | - | - |
| **Feature Flags** | | | | | | | | |
| Toggle global feature flags | Y | Y | - | - | - | - | - | - |
| Toggle per-workspace feature flags | Y | Y | - | Y | - | - | - | - |
| **Content Moderation** | | | | | | | | |
| View flagged content | Y | Y | - | - | - | - | Y | - |
| Suspend content | Y | Y | - | - | - | - | Y | - |
| Issue ToS warning | Y | Y | - | - | - | - | Y | - |
| Suspend workspace for ToS violation | Y | Y | - | - | - | - | - | - |
| **Agency Partnerships** | | | | | | | | |
| View agency applications | Y | Y | Y | - | - | - | - | - |
| Approve agency partnerships | Y | Y | Y | - | - | - | - | - |
| Manage enterprise onboarding | Y | Y | Y | - | - | - | - | - |
| **Platform Team Management** | | | | | | | | |
| Create platform users | Y | Y | - | - | - | - | - | - |
| Assign platform roles | Y | Y | - | - | - | - | - | - |
| Deactivate platform users | Y | Y | - | - | - | - | - | - |
| **Platform Settings** | | | | | | | | |
| Configure global settings | Y | Y | - | - | - | - | - | - |
| Manage webhook/Slack integrations | Y | Y | - | - | - | - | - | - |
| View audit logs | Y | Y | Y | Y | Y | Y | Y | Y |
| **Destructive Operations** | | | | | | | | |
| Purge deleted data (before 90-day) | Y | - | - | - | - | - | - | - |
| Modify super_admin accounts | Y | - | - | - | - | - | - | - |
| Platform configuration reset | Y | - | - | - | - | - | - | - |

### 8.2 Admin Panel Route Structure

```
/admin                            → Platform dashboard (metrics overview)
/admin/users                      → User management (search, view, suspend)
/admin/users/:id                  → User detail + impersonation
/admin/workspaces                 → Workspace management
/admin/workspaces/:id             → Workspace detail + audit
/admin/subscriptions              → Subscription management
/admin/subscriptions/refunds      → Refund processing
/admin/upgrades                   → Upgrade request queue
/admin/feature-flags              → Feature flag management
/admin/moderation                 → Flagged content queue
/admin/moderation/warnings        → ToS warning history
/admin/partnerships               → Agency partnership management
/admin/team                       → Platform team management
/admin/audit-log                  → Platform audit log
/admin/settings                   → Platform configuration
/admin/notifications              → Platform notification center
```

**Note:** Admin panel starts as path-based (`/admin`). Will migrate to `admin.aura.ai` subdomain in a future phase.

### 8.3 Dashboard Sidebar Navigation — Permission Mapping

Each sidebar nav item is gated by a Firestore permission key from `workspace_permissions/{role}`. If the user's role doesn't have the permission, the item is hidden. View-only items use the lowest permission (e.g., `brand.view_profile` not `brand.create_edit_profile`) so viewers can browse content.

| Section | Nav Item | Permission Key | owner | admin | manager | editor | viewer |
|---------|----------|---------------|:-----:|:-----:|:-------:|:------:|:------:|
| Overview | Dashboard | *(none — always visible)* | Y | Y | Y | Y | Y |
| Content | Create | `content.create_edit_drafts` | Y | Y | Y | Y | - |
| Content | Repurpose | `content.create_edit_drafts` | Y | Y | Y | Y | - |
| Content | Approvals | `approvals.submit_for_approval` | Y | Y | Y | Y | - |
| Content | Publish | `publishing.publish` | Y | Y | Y | - | - |
| Content | Calendar | `calendar.view` | Y | Y | Y | Y | Y |
| Content | Assets | `dam.view_download` | Y | Y | Y | Y | Y |
| Content | Images | `images.generate` | Y | Y | Y | Y | - |
| Marketing | Analytics | `analytics.view_dashboard` | Y | Y | Y | Y | Y |
| Marketing | SEO | `seo.view_reports` | Y | Y | Y | Y | Y |
| Marketing | Email | `email.view_analytics` | Y | Y | Y | Y | Y |
| Marketing | Leads | `leads.create` | Y | Y | Y | Y | - |
| Workspace | Brand Voice | `brand.view_profile` | Y | Y | Y | Y | Y |
| Workspace | Integrations | `social.connect` | Y | Y | - | - | - |
| Workspace | Team | `workspace.invite_members` | Y | Y | - | - | - |
| Workspace | Clients | `clients.switch_context` *(agency only)* | Y | Y | Y | Y | - |
| Workspace | Billing | `billing.view` | Y | Y | - | - | - |
| Workspace | Settings | `workspace.update_settings` | Y | Y | - | - | - |

**Special routing rules:**
- `client_portal` role → redirected to `/portal` (separate layout, not the dashboard sidebar)
- Platform users (`platform_users/{userId}` exists) → redirected to `/admin`
- Agency `accountType` required for "Clients" nav item (in addition to permission check)

**Implementation:** Permissions are fetched server-side in `dashboard/layout.tsx` via `getPermissions('workspace', role)` from the Firestore-backed RBAC service (`src/lib/rbac/rbac-service.ts`), then passed as props to `AppSidebar`. The sidebar filters nav items client-side using the pre-fetched permission map.

---

## 9. Agency-Specific RBAC

### 9.1 Client Assignment Scoping

Agency team members access client sub-workspaces only when explicitly assigned. Their **workspace role** carries into the client context — there is no per-client role override.

```
Agency Workspace (Clerk Parent Org)
├── owner: Jane (agency founder)
├── admin: Mike (operations lead)
├── manager: Sarah (account manager)
├── editor: Tom (content writer)
│
├── Client: Acme Corp (Clerk Child Org)
│   ├── Assigned: Sarah (manager), Tom (editor)
│   └── Client Portal: acme@client.com (client_portal)
│
├── Client: Beta Inc (Clerk Child Org)
│   ├── Assigned: Sarah (manager)
│   └── Client Portal: beta@client.com (client_portal)
│
└── Client: Gamma LLC (Clerk Child Org)
    ├── Assigned: Mike (admin), Tom (editor)
    └── Client Portal: gamma@client.com (client_portal)
```

**Access rules:**
- `owner` and `admin` can access **all** client sub-workspaces without explicit assignment.
- `manager`, `editor`, `viewer` can only access clients they are assigned to via `assignedTeamMembers[]`.
- `client_portal` users see only their own client sub-workspace reports and approved content.

### 9.2 Client Portal User Creation

When an agency creates a client via F14, they can optionally provision a client portal login:

```
POST /api/clients/:clientId/portal-users
{
  "email": "contact@acme.com",
  "name": "Acme Contact"
}
```

This creates a Clerk user with `client_portal` role scoped to that specific client sub-workspace. The client portal user:
- Cannot see the agency workspace or other clients
- Can only view: published reports, approved content, analytics summaries
- Cannot create, edit, approve, or publish anything

---

## 10. Agency Claiming Flow

### 10.1 Overview

There are two paths for agency-client relationships:

**Path A — Agency creates client (standard):**
Agency admin creates a new client workspace. Client workspace is born as a sub-workspace. No claiming needed.

**Path B — Client self-signs up, then agency claims (adoption):**
Client signs up independently as a Freelancer or Organization, then gets adopted by an agency.

### 10.2 Path B — Claiming Flow

```
1. Agency generates a "claim code" (unique, time-limited — 7 days)
   └─ Admin panel: Clients → Add Existing Client → Generate Claim Code

2. Agency shares claim code with client
   └─ Via email, meeting, or client portal invitation link

3. Client enters claim code in their workspace settings
   └─ Settings → Agency Partnership → Enter Claim Code

4. System creates a "claim request" (pending)
   └─ Both parties see pending status

5. Client reviews & approves the claim
   └─ Client sees: "Agency [name] wants to manage your workspace"
   └─ Client must explicitly approve (consent-first)

6. On approval:
   ├─ Client workspace becomes a sub-workspace of the agency
   ├─ Clerk child org relationship established
   ├─ Agency team members can be assigned to client
   ├─ Client retains owner role within their workspace
   ├─ Agency admin gets admin-level access to client workspace
   └─ Client's existing data, content, and integrations are preserved

7. Billing:
   └─ Client's billing transfers to agency (agency pays for client seat)
   └─ Or: configurable — agency can choose to let client self-bill
```

### 10.3 Data Ownership on Exit

When a client leaves an agency (or agency releases a client):

| Data | Ownership |
|------|-----------|
| Content created BY the agency while managing | Agency retains a copy, client retains original |
| Content created BY the client before claiming | Client retains |
| Content created BY the client during agency management | Client retains |
| Analytics data | Both retain (snapshot exported to both) |
| Brand profile | Client retains |
| Social connections | Client retains (tokens stay in client workspace) |
| Client reports generated by agency | Agency retains copies, client retains copies |

**Exit process:**
1. Either party initiates detachment
2. 7-day grace period with notification to both parties
3. Full data export generated for both parties
4. Sub-workspace detached — becomes standalone Freelancer/Organization workspace
5. Agency team member assignments removed
6. Client portal access revoked
7. Billing reverts to client (if agency was paying)

### 10.4 Firestore Model — Claim Request

```typescript
// Collection: agency_claim_requests
interface AgencyClaimRequest {
  id: string;
  agencyWorkspaceId: string;
  clientWorkspaceId?: string;        // set when client enters code
  claimCode: string;                 // unique, hashed
  claimCodeExpiresAt: Timestamp;
  status: 'pending_code' | 'pending_approval' | 'approved' | 'rejected' | 'expired';
  initiatedBy: string;               // agency userId
  approvedBy?: string;               // client userId
  billingModel: 'agency_pays' | 'client_pays';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

---

## 11. Approval Workflow RBAC (F6)

### 11.1 Approval Chain

```
Editor creates draft
  │
  ├─ Submit for Approval → selects approver (manager+ from workspace)
  │
  ├─ Approver reviews
  │    ├─ Approve → draft marked "approved", unlocks publishing (F3)
  │    ├─ Reject → feedback comment, returned to editor
  │    └─ Reassign → forward to another eligible approver
  │
  └─ Manager/Admin/Owner publishes approved content via F3
```

### 11.2 Approver Assignment Rules

| Rule | Description |
|------|-------------|
| **Who can be an approver** | Any workspace member with role `manager`, `admin`, or `owner` |
| **Who selects the approver** | The content submitter picks from eligible approvers in their workspace |
| **Self-approval** | `manager`+ can self-approve by default. Workspace setting `requireExternalApproval` (default: `false`) disables this. `editor` can never self-approve. |
| **Approval reassignment** | An approver can reassign to another eligible approver |
| **Escalation** | If pending > configurable threshold (default: 48 hours), notification sent to all `admin`+ members |
| **Bulk approval** | `admin`+ can approve multiple items at once |

### 11.3 Workspace Approval Settings

```typescript
// Stored in workspaces/{id}/settings
interface ApprovalSettings {
  requireApproval: boolean;           // default: true for org/agency, false for freelancer
  requireExternalApproval: boolean;   // default: false — if true, managers cannot self-approve
  escalationThresholdHours: number;   // default: 48
  autoApproveForRoles: WorkspaceRole[]; // default: ['owner', 'admin'] — roles that bypass approval
}
```

---

## 12. Trial & Billing Model

### 12.1 Free Trial

| Attribute | Value |
|-----------|-------|
| Duration | 15 days from workspace creation |
| Access | Full feature access with usage caps |
| Expiry behavior | **Soft lock** — read-only mode. Users can view all data but cannot create, edit, publish, or generate. |
| Reactivation | Enter payment → immediately unlocked |
| Trial extension | Platform team (operations+) can extend via admin panel |

### 12.2 Trial Usage Caps

| Resource | Trial Limit |
|----------|:-----------:|
| Content drafts (F1) | 20 |
| Content repurposing (F2) | 10 |
| Publish jobs (F3) | 5 |
| Image generations (F13) | 10 |
| Email campaigns (F11) | 2 |
| Lead records (F12) | 50 |
| SEO keyword lookups (F10) | 20 |
| Team members (F7) | 3 |
| Client workspaces (F14) | 1 |
| Storage (F16 DAM) | 500 MB |

### 12.3 Pricing Tiers (Stripe)

Pricing model: **base tier fee + per-seat pricing** for team members beyond the included seats.

| Tier | Base Price/mo | Included Seats | Extra Seat/mo | Target Account Type |
|------|:------------:|:--------------:|:-------------:|---------------------|
| **Starter** | $29 | 1 | $15 | Freelancer |
| **Growth** | $79 | 5 | $12 | Freelancer (expanded), Organization |
| **Agency** | $199 | 10 | $10 | Agency |
| **Agency Pro** | $399 | 25 | $8 | Agency (enterprise) |
| **White-Label** | $799 | Unlimited | - | Agency (enterprise+) |

**Tier capabilities unlock progressively:**
- Starter: Core features (F1-F5, F8), 1 workspace, no approvals
- Growth: + Approvals (F6), team (F7), SEO (F10), email (F11)
- Agency: + Client management (F14), CRM (F12), image gen (F13), DAM (F16)
- Agency Pro: + White-label reports, REST API, priority support
- White-Label: + Custom domain, branded client portal, dedicated onboarding

### 12.4 Soft Lock Behavior (Post-Trial / Payment Lapse)

When a workspace enters soft lock:

| Feature | Behavior |
|---------|----------|
| Dashboard | Visible with soft-lock banner: "Your trial has ended. Upgrade to continue creating." |
| Existing content | Viewable (read-only) |
| Analytics | Viewable (read-only, data stops updating) |
| Calendar | Viewable (read-only) |
| Content creation | Disabled (button grayed, tooltip: "Upgrade to create content") |
| Publishing | Disabled |
| Integrations | Existing connections preserved, new connections disabled |
| Team management | Viewable, invites disabled |
| Export | Enabled (users can always export their data) |
| Billing page | Fully accessible (must be able to pay) |

---

## 13. Notifications

### 13.1 Platform Notifications (Admin Panel)

**Channels:** In-app notification center + email + Slack webhook

| Event | In-App | Email | Slack |
|-------|:------:|:-----:|:-----:|
| New user sign-up | Y | - | Y |
| Trial expiring (3 days before) | Y | Y | Y |
| Trial expired | Y | Y | Y |
| Upgrade request submitted | Y | Y | Y |
| Subscription payment failed | Y | Y | Y |
| Content flagged by moderation | Y | Y | - |
| ToS violation reported | Y | Y | Y |
| Impersonation session started | Y | - | Y |
| New agency partnership request | Y | Y | Y |
| High churn risk detected | Y | Y | Y |

**In-app notification center:**
- Bell icon in admin panel header with unread count badge
- Dropdown panel showing recent notifications
- Full notification page at `/admin/notifications`
- Each notification has: type, message, timestamp, link-to-action, read/unread status

**Slack integration:**
- Configurable webhook URL in platform settings
- Channel-per-category option (e.g., #aura-signups, #aura-billing, #aura-moderation)

### 13.2 Workspace Notifications (Customer App)

**Channels:** In-app + email (user-configurable preferences)

| Event | In-App | Email | Recipient |
|-------|:------:|:-----:|-----------|
| Invited to workspace | Y | Y | Invitee |
| Member joined workspace | Y | Y | Admin+ |
| Content submitted for approval | Y | Y | Selected approver |
| Content approved | Y | Y | Content creator |
| Content rejected (with feedback) | Y | Y | Content creator |
| Approval escalation (overdue) | Y | Y | All admin+ |
| Content published | Y | - | Creator + approver |
| New lead captured (F12) | Y | Y | Assigned member |
| Lead reassigned | Y | Y | New assignee |
| Social account disconnected | Y | Y | Admin+ |
| Trial expiring (3 days) | Y | Y | Owner |
| Trial expired | Y | Y | Owner + Admin |
| Agency claim request | Y | Y | Client workspace owner |
| Client report generated | Y | Y | Client portal user |
| Profile score milestone (50%, 100%) | Y | - | Owner |

**Notification preferences:**
- Per-user settings at `/settings/notifications`
- Toggle email on/off per event category
- In-app notifications always on (cannot be disabled, only marked read)

### 13.3 Firestore Model

```typescript
// Collection: notifications/{userId}/items/{notificationId}
interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;               // deep link to relevant page
  workspaceId?: string;             // null for platform notifications
  isRead: boolean;
  readAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;                // 'system' for automated
}

// Collection: platform_notifications/{notificationId}
interface PlatformNotification {
  id: string;
  type: PlatformNotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  severity: 'info' | 'warning' | 'critical';
  isRead: boolean;
  readBy: string[];                 // platform userIds who read it
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

---

## 14. Audit Logging

### 14.1 Platform Audit Log

Every platform action is logged to a separate collection. Immutable — no edits or deletes allowed.

```typescript
// Collection: platform_audit_log
interface PlatformAuditEntry {
  id: string;
  actorId: string;                   // platform user who performed action
  actorRole: PlatformRole;
  action: string;                    // e.g., 'user.suspend', 'subscription.refund', 'impersonation.start'
  targetType: 'user' | 'workspace' | 'subscription' | 'content' | 'platform_user' | 'feature_flag';
  targetId: string;
  metadata: Record<string, unknown>; // action-specific details
  ipAddress: string;
  userAgent: string;
  reason?: string;                   // required for impersonation, suspensions
  createdAt: Timestamp;
}
```

**Firestore rules:** Platform audit log is append-only. No updates, no deletes — even for super_admin.

**Retention:** Platform audit logs retained indefinitely (no 90-day purge).

### 14.2 Workspace Activity Log

Workspace owners and admins can view member activity within their workspace.

```typescript
// Collection: workspaces/{workspaceId}/activity_log
interface WorkspaceActivityEntry {
  id: string;
  actorId: string;                   // workspace member who performed action
  actorRole: WorkspaceRole;
  action: string;                    // e.g., 'content.create', 'content.approve', 'member.invite'
  targetType: 'content' | 'approval' | 'member' | 'publish_job' | 'lead' | 'client' | 'settings';
  targetId: string;
  targetName?: string;               // human-readable (e.g., "Blog post: SEO Tips")
  metadata?: Record<string, unknown>;
  createdAt: Timestamp;
  createdBy: string;
}
```

**Access:** `admin`+ can view. Displayed at `/workspace/settings/activity`.

**Retention:** Workspace activity logs follow the 90-day soft-delete window of the workspace.

---

## 15. Firestore Data Model

### 15.1 Platform Collections

```
platform_users/{userId}              → Platform team member profiles + roles
platform_audit_log/{entryId}         → Immutable platform action log
platform_notifications/{notifId}     → Admin panel notifications
platform_settings/global             → Singleton: global platform config
feature_flags/{flagId}               → Global + per-workspace feature flags
upgrade_requests/{requestId}         → Account type upgrade requests
agency_claim_requests/{requestId}    → Agency claiming flow
```

### 15.2 Workspace Collections

```
workspaces/{workspaceId}                              → Workspace config + metadata
workspaces/{workspaceId}/members/{userId}             → Member profiles + roles
workspaces/{workspaceId}/settings/approval            → Approval workflow config
workspaces/{workspaceId}/settings/notifications       → Workspace notification config
workspaces/{workspaceId}/profile_score/current        → Profile completeness score
workspaces/{workspaceId}/activity_log/{entryId}       → Member activity log
workspaces/{workspaceId}/content_drafts/{draftId}     → F1/F2 content
workspaces/{workspaceId}/approvals/{approvalId}       → F6 approval requests
workspaces/{workspaceId}/publish_jobs/{jobId}         → F3 publish queue
workspaces/{workspaceId}/calendar_events/{eventId}    → F4 calendar
workspaces/{workspaceId}/analytics/{snapshotId}       → F5 analytics
workspaces/{workspaceId}/brand_profiles/{profileId}   → F8 brand config
workspaces/{workspaceId}/social_connections/{connId}   → F9 OAuth tokens (encrypted)
workspaces/{workspaceId}/seo_reports/{reportId}       → F10 keyword/SEO data
workspaces/{workspaceId}/email_campaigns/{campaignId} → F11 campaigns
workspaces/{workspaceId}/leads/{leadId}               → F12 CRM leads
workspaces/{workspaceId}/generated_images/{imageId}   → F13 image gen
workspaces/{workspaceId}/clients/{clientId}           → F14 agency clients
workspaces/{workspaceId}/client_reports/{reportId}    → F14 client reports
workspaces/{workspaceId}/assets/{assetId}             → F16 DAM
notifications/{userId}/items/{notificationId}          → Per-user notifications
```

### 15.3 Key Document Schemas

```typescript
// workspaces/{workspaceId}
interface Workspace {
  id: string;
  clerkOrgId: string;
  name: string;
  ownerId: string;
  accountType: 'freelancer' | 'organization' | 'agency';
  tier: 'starter' | 'growth' | 'agency' | 'agency_pro' | 'white_label';
  status: 'active' | 'trial' | 'soft_locked' | 'suspended' | 'archived' | 'deleted';
  trialEndsAt?: Timestamp;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  parentWorkspaceId?: string;        // for claimed client workspaces
  agencyWorkspaceId?: string;        // if this is a client sub-workspace
  deletedAt?: Timestamp;             // soft delete
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// workspaces/{workspaceId}/members/{userId}
interface WorkspaceMember {
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
  status: 'active' | 'invited' | 'deactivated';
  email: string;
  displayName: string;
  avatarUrl?: string;
  invitedBy: string;
  joinedAt?: Timestamp;
  assignedClientIds?: string[];      // agency only
  deletedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// platform_users/{userId}
interface PlatformUser {
  userId: string;                    // Clerk user ID
  email: string;
  displayName: string;
  role: PlatformRole;
  status: 'active' | 'invited' | 'deactivated';
  invitedBy: string;                 // 'seed' for initial super_admin
  lastLoginAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}

// upgrade_requests/{requestId}
interface UpgradeRequest {
  id: string;
  workspaceId: string;
  requestedBy: string;               // workspace owner userId
  currentAccountType: AccountType;
  requestedAccountType: AccountType;
  currentTier: Tier;
  requestedTier?: Tier;
  reason: string;                    // user-provided reason
  status: 'pending' | 'approved' | 'denied';
  reviewedBy?: string;               // platform userId
  reviewNote?: string;
  reviewedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

---

## 16. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ═══════════════════════════════════════
    // HELPER FUNCTIONS
    // ═══════════════════════════════════════

    function isAuthenticated() {
      return request.auth != null;
    }

    // --- Workspace role helpers ---

    function getMember(workspaceId) {
      return get(/databases/$(database)/documents/workspaces/$(workspaceId)/members/$(request.auth.uid));
    }

    function isWorkspaceMember(workspaceId) {
      return isAuthenticated() &&
        exists(/databases/$(database)/documents/workspaces/$(workspaceId)/members/$(request.auth.uid)) &&
        getMember(workspaceId).data.status == 'active';
    }

    function getRole(workspaceId) {
      return getMember(workspaceId).data.role;
    }

    function hasRole(workspaceId, role) {
      return isWorkspaceMember(workspaceId) && getRole(workspaceId) == role;
    }

    function hasMinRole(workspaceId, minRole) {
      return isWorkspaceMember(workspaceId) &&
        roleLevel(getRole(workspaceId)) >= roleLevel(minRole);
    }

    function roleLevel(role) {
      return role == 'owner' ? 5
        : role == 'admin' ? 4
        : role == 'manager' ? 3
        : role == 'editor' ? 2
        : role == 'viewer' ? 1
        : 0;
    }

    // --- Platform role helpers ---

    function isPlatformUser() {
      return isAuthenticated() &&
        exists(/databases/$(database)/documents/platform_users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/platform_users/$(request.auth.uid)).data.status == 'active';
    }

    function getPlatformRole() {
      return get(/databases/$(database)/documents/platform_users/$(request.auth.uid)).data.role;
    }

    function hasMinPlatformRole(minRole) {
      return isPlatformUser() &&
        platformRoleLevel(getPlatformRole()) >= platformRoleLevel(minRole);
    }

    function platformRoleLevel(role) {
      return role == 'super_admin' ? 7
        : role == 'platform_admin' ? 6
        : role == 'partner_manager' ? 5
        : role == 'operations' ? 4
        : role == 'finance' ? 3
        : role == 'support' ? 2
        : role == 'content_moderator' ? 1
        : 0;
    }

    // ═══════════════════════════════════════
    // PLATFORM COLLECTIONS
    // ═══════════════════════════════════════

    match /platform_users/{userId} {
      allow read: if isPlatformUser();
      allow create, update: if hasMinPlatformRole('platform_admin');
      allow delete: if hasMinPlatformRole('super_admin');
    }

    match /platform_audit_log/{entryId} {
      allow read: if isPlatformUser();
      allow create: if isPlatformUser();
      // No update or delete — immutable
    }

    match /platform_notifications/{notifId} {
      allow read: if isPlatformUser();
      allow create: if isPlatformUser();
      allow update: if isPlatformUser(); // mark read
    }

    match /platform_settings/global {
      allow read: if isPlatformUser();
      allow write: if hasMinPlatformRole('platform_admin');
    }

    match /feature_flags/{flagId} {
      allow read: if isAuthenticated(); // workspace code reads flags
      allow write: if hasMinPlatformRole('operations');
    }

    match /upgrade_requests/{requestId} {
      allow read: if isPlatformUser() ||
        (isAuthenticated() && resource.data.requestedBy == request.auth.uid);
      allow create: if isAuthenticated(); // workspace owners create
      allow update: if hasMinPlatformRole('partner_manager'); // platform approves
    }

    match /agency_claim_requests/{requestId} {
      allow read: if isAuthenticated() &&
        (resource.data.initiatedBy == request.auth.uid ||
         resource.data.approvedBy == request.auth.uid ||
         isPlatformUser());
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
    }

    // ═══════════════════════════════════════
    // WORKSPACE COLLECTIONS
    // ═══════════════════════════════════════

    match /workspaces/{workspaceId} {
      allow read: if isWorkspaceMember(workspaceId) || isPlatformUser();
      allow create: if isAuthenticated();
      allow update: if hasMinRole(workspaceId, 'admin') || hasMinPlatformRole('operations');
      allow delete: if hasRole(workspaceId, 'owner');
    }

    match /workspaces/{workspaceId}/members/{memberId} {
      allow read: if isWorkspaceMember(workspaceId) || isPlatformUser();
      allow create, delete: if hasMinRole(workspaceId, 'admin');
      allow update: if hasMinRole(workspaceId, 'admin') &&
        roleLevel(request.resource.data.role) < roleLevel(getRole(workspaceId));
    }

    match /workspaces/{workspaceId}/activity_log/{entryId} {
      allow read: if hasMinRole(workspaceId, 'admin') || isPlatformUser();
      allow create: if isWorkspaceMember(workspaceId);
      // No update or delete
    }

    match /workspaces/{workspaceId}/profile_score/{docId} {
      allow read: if isWorkspaceMember(workspaceId);
      allow write: if isWorkspaceMember(workspaceId);
    }

    match /workspaces/{workspaceId}/content_drafts/{draftId} {
      allow read: if hasMinRole(workspaceId, 'viewer') || isPlatformUser();
      allow create: if hasMinRole(workspaceId, 'editor');
      allow update: if hasMinRole(workspaceId, 'editor') &&
        (resource.data.createdBy == request.auth.uid || hasMinRole(workspaceId, 'admin'));
      allow delete: if hasMinRole(workspaceId, 'admin');
    }

    match /workspaces/{workspaceId}/approvals/{approvalId} {
      allow read: if hasMinRole(workspaceId, 'viewer');
      allow create: if hasMinRole(workspaceId, 'editor');
      allow update: if hasMinRole(workspaceId, 'manager') &&
        resource.data.approverUserId == request.auth.uid;
    }

    match /workspaces/{workspaceId}/publish_jobs/{jobId} {
      allow read: if hasMinRole(workspaceId, 'viewer');
      allow create: if hasMinRole(workspaceId, 'manager');
    }

    match /workspaces/{workspaceId}/clients/{clientId} {
      // owner/admin: all clients
      allow read, write: if hasMinRole(workspaceId, 'admin');
      // manager/editor/viewer: only assigned clients
      allow read: if isWorkspaceMember(workspaceId) &&
        request.auth.uid in resource.data.assignedTeamMembers;
      // client_portal: read own client only
      allow read: if isAuthenticated() &&
        request.auth.uid in resource.data.portalUserIds;
    }

    // Notification per-user subcollection
    match /notifications/{userId}/items/{notifId} {
      allow read, update: if isAuthenticated() && request.auth.uid == userId;
      allow create: if isAuthenticated(); // system or other users create
    }

    // Catch-all for remaining workspace subcollections
    // (calendar_events, analytics, brand_profiles, social_connections,
    //  seo_reports, email_campaigns, leads, generated_images, assets, client_reports)
    match /workspaces/{workspaceId}/{subcollection}/{docId} {
      allow read: if hasMinRole(workspaceId, 'viewer') || isPlatformUser();
      allow create: if hasMinRole(workspaceId, 'editor');
      allow update: if hasMinRole(workspaceId, 'editor');
      allow delete: if hasMinRole(workspaceId, 'admin');
    }
  }
}
```

---

## 17. API Middleware

### 17.1 Workspace Role Enforcement

```typescript
// src/lib/auth/require-role.ts
import { auth } from '@clerk/nextjs/server';
import { getWorkspaceMember } from '@/lib/firebase/members';
import { ROLE_HIERARCHY, type WorkspaceRole } from '@/types/roles';

export async function requireMinRole(workspaceId: string, minRole: WorkspaceRole) {
  const { userId } = await auth();
  if (!userId) throw new AuthError('Unauthenticated');

  const member = await getWorkspaceMember(workspaceId, userId);
  if (!member || member.status !== 'active') throw new AuthError('Not a workspace member');
  if (ROLE_HIERARCHY[member.role] < ROLE_HIERARCHY[minRole]) {
    throw new AuthError(`Requires ${minRole} role or higher`);
  }

  return member;
}
```

### 17.2 Platform Role Enforcement

```typescript
// src/lib/auth/require-platform-role.ts
import { auth } from '@clerk/nextjs/server';
import { getPlatformUser } from '@/lib/firebase/platform';
import { PLATFORM_ROLE_HIERARCHY, type PlatformRole } from '@/types/roles';

export async function requireMinPlatformRole(minRole: PlatformRole) {
  const { userId } = await auth();
  if (!userId) throw new AuthError('Unauthenticated');

  const platformUser = await getPlatformUser(userId);
  if (!platformUser || platformUser.status !== 'active') throw new AuthError('Not a platform user');
  if (PLATFORM_ROLE_HIERARCHY[platformUser.role] < PLATFORM_ROLE_HIERARCHY[minRole]) {
    throw new AuthError(`Requires ${minRole} platform role or higher`);
  }

  return platformUser;
}
```

### 17.3 Soft Lock Enforcement

```typescript
// src/lib/auth/check-workspace-status.ts
import { getWorkspace } from '@/lib/firebase/workspaces';

export async function requireActiveWorkspace(workspaceId: string) {
  const workspace = await getWorkspace(workspaceId);

  if (workspace.status === 'soft_locked') {
    throw new SoftLockError('Workspace is in read-only mode. Please upgrade to continue.');
  }
  if (workspace.status === 'suspended') {
    throw new SuspendedError('Workspace has been suspended. Contact support.');
  }
  if (workspace.status === 'deleted') {
    throw new NotFoundError('Workspace not found.');
  }

  return workspace;
}
```

---

## 18. Clerk Integration

### 18.1 Clerk ↔ Firestore Role Sync

Roles are **authoritative in Firestore**. Clerk Organizations are used for auth sessions and org switching, but Firestore is the source of truth for permissions.

| Concern | Clerk | Firestore |
|---------|-------|-----------|
| Authentication | Y | - |
| Session management | Y | - |
| Org membership | Y (sync) | Y (authoritative) |
| Role assignment | - | Y |
| Permission checks | - | Y |
| Invitation flow | Y | Y (create pending member) |

### 18.2 Clerk Organizations Structure

```
Clerk Org: "aura-platform"            → Platform team (separate org)
Clerk Org: "workspace-{id}"           → Customer workspace
Clerk Org: "workspace-{id}-client-{id}" → Agency client sub-workspace
```

### 18.3 Webhook Sync Flow

**On member invite:**
1. Admin invites via UI → API creates Firestore member doc (`status: 'invited'`, assigned role)
2. API triggers Clerk org invitation email
3. Invitee accepts → Clerk webhook fires → API updates Firestore member `status: 'active'`, sets `joinedAt`

**On user deletion:**
1. Clerk webhook `user.deleted` fires
2. API soft-deletes all workspace member records for that user
3. Removes user from any `assignedTeamMembers` arrays

---

## 19. Soft Delete & Data Retention

### 19.1 Soft Delete Policy

All deletions are soft deletes. Data is marked as deleted but retained for 90 days.

| Entity | Soft Delete Field | Retention | Hard Purge |
|--------|------------------|:---------:|------------|
| User account | `deletedAt` on all member docs | 90 days | Automated Cloud Function |
| Workspace | `deletedAt` + `status: 'deleted'` | 90 days | Cascades to all subcollections |
| Content draft | `deletedAt` | 90 days | Purged with workspace |
| Client sub-workspace | `deletedAt` + `status: 'archived'` | 90 days | After agency confirmation |
| Platform audit log | N/A | **Indefinite** | Never purged |
| Workspace activity log | Follows workspace | 90 days | Purged with workspace |

### 19.2 Hard Purge Process

- Automated Cloud Function runs daily
- Scans for documents where `deletedAt` < now - 90 days
- Permanently deletes document and all subcollection data
- Firebase Storage files associated with purged documents also deleted
- Purge action logged to platform audit log
- Platform team notified of purge batch via Slack webhook

### 19.3 User Data Export

Before hard purge, or on user request (GDPR):
- Export generates a ZIP file with all workspace data as JSON + media files
- Available via `/settings/export` (workspace owner) or `/admin/users/:id/export` (platform)
- Export link valid for 7 days (stored in Firebase Storage with signed URL)

---

## 20. Migration & Upgrade Paths

### 20.1 Account Type Upgrades

| Scenario | Process | What Changes |
|----------|---------|-------------|
| Freelancer → Organization | Owner submits upgrade request → platform approves | Workspace type updated. Team invitations enabled. Approval settings enabled. Tier options expand. |
| Freelancer → Agency | Owner submits upgrade request → platform approves | Same as Org + client management (F14) unlocked. Can create client sub-workspaces. |
| Organization → Agency | Owner submits upgrade request → platform approves | Client management (F14) unlocked. Existing workspace becomes agency parent. |

### 20.2 Tier Upgrades/Downgrades

| Scenario | What Changes |
|----------|-------------|
| Starter → Growth | Team seats expand. F6, F7, F10, F11 unlock. |
| Growth → Agency | F12, F13, F14, F16 unlock. Client management available. |
| Agency → Agency Pro | White-label, REST API, priority support unlocked. Seat limit increases. |
| Agency Pro → White-Label | Custom domain, branded portal, dedicated onboarding. Unlimited seats. |
| Downgrade (Agency → Growth) | Client sub-workspaces archived (read-only). Client portal users deactivated. Data preserved for 90 days. Team must reduce to seat limit. |
| Downgrade (Growth → Starter) | Extra members deactivated (owner chooses who). Approval workflow disabled. |

### 20.3 Upgrade Request Flow

```
1. Workspace owner clicks "Upgrade Account Type" in settings
2. Fills out: requested type, reason, business details
3. Request created (status: 'pending')
4. Platform team notified (in-app + email + Slack)
5. Partner manager reviews in /admin/upgrades
6. Approves → workspace.accountType updated, new features unlocked
   Denies → owner notified with reason, can re-apply with changes
```

---

## 21. TypeScript Definitions

```typescript
// src/types/roles.ts

// ═══════════════════════════════════════
// WORKSPACE ROLES
// ═══════════════════════════════════════

export const WorkspaceRole = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  EDITOR: 'editor',
  VIEWER: 'viewer',
  CLIENT_PORTAL: 'client_portal',
} as const;

export type WorkspaceRole = (typeof WorkspaceRole)[keyof typeof WorkspaceRole];

export const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  client_portal: 0,
  viewer: 1,
  editor: 2,
  manager: 3,
  admin: 4,
  owner: 5,
};

// ═══════════════════════════════════════
// PLATFORM ROLES
// ═══════════════════════════════════════

export const PlatformRole = {
  SUPER_ADMIN: 'super_admin',
  PLATFORM_ADMIN: 'platform_admin',
  PARTNER_MANAGER: 'partner_manager',
  OPERATIONS: 'operations',
  FINANCE: 'finance',
  SUPPORT: 'support',
  CONTENT_MODERATOR: 'content_moderator',
  ANALYST: 'analyst',
} as const;

export type PlatformRole = (typeof PlatformRole)[keyof typeof PlatformRole];

export const PLATFORM_ROLE_HIERARCHY: Record<PlatformRole, number> = {
  analyst: 0,
  content_moderator: 1,
  support: 2,
  finance: 3,
  operations: 4,
  partner_manager: 5,
  platform_admin: 6,
  super_admin: 7,
};

// ═══════════════════════════════════════
// ACCOUNT & WORKSPACE TYPES
// ═══════════════════════════════════════

export const AccountType = {
  FREELANCER: 'freelancer',
  ORGANIZATION: 'organization',
  AGENCY: 'agency',
} as const;

export type AccountType = (typeof AccountType)[keyof typeof AccountType];

export const Tier = {
  STARTER: 'starter',
  GROWTH: 'growth',
  AGENCY: 'agency',
  AGENCY_PRO: 'agency_pro',
  WHITE_LABEL: 'white_label',
} as const;

export type Tier = (typeof Tier)[keyof typeof Tier];

export const WorkspaceStatus = {
  ACTIVE: 'active',
  TRIAL: 'trial',
  SOFT_LOCKED: 'soft_locked',
  SUSPENDED: 'suspended',
  ARCHIVED: 'archived',
  DELETED: 'deleted',
} as const;

export type WorkspaceStatus = (typeof WorkspaceStatus)[keyof typeof WorkspaceStatus];
```

---

## Appendix A: Role Assignment UI Requirements

### A.1 Onboarding Role Picker (Step 4)

For Organization and Agency onboarding, the invite step presents:

```
┌─────────────────────────────────────────────────┐
│  Invite Your Team                               │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ Email: sarah@agency.com                   │  │
│  │ Role:  [Admin ▾]                          │  │
│  │        ┌──────────────────────────────┐   │  │
│  │        │ Admin    — Full access       │   │  │
│  │        │ Manager  — Approve & publish │   │  │
│  │        │ Editor   — Create content    │   │  │
│  │        │ Viewer   — Read-only         │   │  │
│  │        └──────────────────────────────┘   │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  [+ Add another]  [Paste emails]  [Send Invites]│
│                                [Skip for now →] │
└─────────────────────────────────────────────────┘
```

### A.2 Member Management Page (F7)

Post-onboarding member management in workspace settings:

- List all members with name, email, role, status, last active
- Inline role dropdown (constrained: cannot assign role >= own)
- Deactivate / remove member actions (admin+ only)
- Pending invitations with resend / revoke options
- Transfer ownership action (owner only, requires confirmation modal)

### A.3 Client Team Assignment (F14 — Agency only)

```
┌─────────────────────────────────────────────────┐
│  Assign Team to Client: Acme Corp               │
│                                                 │
│  ☑ Sarah Chen — Manager                        │
│  ☑ Tom Park — Editor                           │
│  ☐ Lisa Wong — Editor                          │
│  ☐ Dev Patel — Viewer                          │
│                                                 │
│  ℹ Owner & Admin have access to all clients     │
│                                                 │
│  [Save Assignments]                             │
└─────────────────────────────────────────────────┘
```

### A.4 Platform Team Management (/admin/team)

- Table: name, email, platform role, status, last login
- Create new platform user: email + role picker (all 8 roles shown)
- Constraint: only `platform_admin`+ can create platform users
- Constraint: cannot assign role >= own
- Deactivate / reactivate platform users
- `super_admin` cannot be created via UI — only via seed script
