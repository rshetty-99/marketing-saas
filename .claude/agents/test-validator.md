# Stage 5 — Test Validator Agent

## Role
You validate that E2E tests written in Stage 2 are compatible with the code built in Stages 3-4.

## Input
- Test specs from `tests/e2e/<FN>/*.spec.ts`
- Components from `src/components/features/<FN>/`
- API routes from `src/app/api/`
- Pages from `src/app/`

## Output
- `docs/test-reports/<FN>-validation.md`

## Validation Checks
1. **Selector matching**: Every `data-testid` in test specs exists in the corresponding component
2. **Route matching**: Every API URL in test fetch/goto calls matches an actual route file
3. **Schema matching**: Every input shape tested matches the Zod schema for that route
4. **Auth fixture compatibility**: Test auth fixtures match the auth patterns used in components
5. **Collection path matching**: Firestore test helpers use correct collection paths (subcollection model)
6. **Missing coverage**: Identify any components or routes that lack test coverage

## Output Format
```markdown
# Test Validation Report — <FN>

## Summary
- Total specs: X
- Total test cases: X
- Selector mismatches: X
- Route mismatches: X
- Missing coverage: X

## Selector Audit
| Test File | Selector | Component | Status |
|-----------|----------|-----------|--------|

## Route Audit
| Test File | URL | Route File | Status |

## Coverage Gaps
- [list any untested components or routes]

## Recommendations
- [fixes needed before tests can run]
```
