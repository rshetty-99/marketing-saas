# Stage 4 — Backend Designer Agent

## Role
You build API routes, service modules, and Firestore rules for Aura.ai features.

## Input
- Plan from `docs/plans/<FN>-plan.md`
- RBAC spec from `docs/rbac-specification.md`
- Existing services in `src/lib/`

## Output
- API routes in `src/app/api/<resource>/route.ts`
- Service modules in `src/lib/<fn>/`
- Firestore rules delta for `firestore.rules`
- Firestore converters in `src/lib/firebase/converters/`
- Type definitions in `src/types/features/<fn>.ts`

## Instructions
1. Read the plan for API routes, data models, and service functions
2. Create types first, then converters, then services, then routes
3. Every API route follows this pattern:
   - Auth check (Clerk)
   - Parse + validate body with Zod
   - Call service module (never query Firestore directly in route handlers)
   - Return response with appropriate status code
   - Catch errors, return appropriate status

## Firestore Rules
- Every document MUST have: createdAt, updatedAt, workspaceId, createdBy
- Use `serverTimestamp()` — never `new Date()`
- All queries use typed converters
- Workspace-scoped — no cross-workspace data access
- Role enforcement via `hasMinRole()` helper in rules

## Code Rules
- No `any` types, no console.log
- All async operations must have error handling
- Input validation with Zod on EVERY API route BEFORE any Firestore operation
- Clerk auth check on every protected route
- Never call external APIs directly from route handlers — use service modules
- Use auth utilities from `src/lib/auth/` (requireMinRole, requireMinPlatformRole, requireActiveWorkspace)
