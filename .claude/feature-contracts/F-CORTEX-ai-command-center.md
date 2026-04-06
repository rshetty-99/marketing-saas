# Feature Contract: F-CORTEX — Aura Cortex AI Command Center
## Phase 11A: Foundation

**PRD:** docs/prd-aura-cortex.md (v2.0, 22 decisions locked)
**Tagline:** "Think it. Cortex ships it."

---

## Scope — Phase 11A Only (Foundation)

This contract covers Phase 11A (Week 1-2) of the Cortex rollout. Subsequent phases (11B, 11C, 11D) will have separate contracts.

### What's In Scope
1. Cortex chat UI (slide-out panel + Cmd+K quick command palette)
2. Mobile full-screen takeover (< 768px)
3. Claude API integration with SSE streaming (POST → SSE response)
4. Two-pass intent routing (Sonnet classify → targeted context load)
5. 14 read-only tools via direct service calls
6. Voice input via Web Speech API
7. Session storage in Firestore (cortex_sessions + messages)
8. Context assembly (workspace, client, brand voice, recent activity)
9. Tooltip walkthrough + interactive self-guided tutorial
10. Feedback buttons (👍/👎 + reason dropdown)
11. Tiered degradation (full AI → Sonnet → slash commands → offline)
12. Per-user concurrency limit (1 active + 3 queued)
13. `/dashboard/cortex` page (session history list)
14. Sidebar nav item: "Cortex" in Overview section

### What's NOT In Scope (Phase 11B+)
- Write tools (content.create, publish.schedule, etc.)
- Action confirmation cards
- Campaign orchestration / DAG execution
- Background handoff via Cloud Tasks
- Long-term memory (3-level hierarchy)
- Session sharing / export
- White-label customization
- Client portal Cortex
- Usage dashboard with billing
- Proactive suggestions

---

## Acceptance Criteria

### AC1: Chat Panel UI
- [ ] Floating ✨ button visible on every `/dashboard/*` page (bottom-right)
- [ ] Click opens slide-out panel (right side, 400px wide) on desktop
- [ ] Click opens full-screen view on mobile (< 768px)
- [ ] Panel has: message thread, input field, mic button, context bar, suggestion chips
- [ ] Framer Motion: panel slides in, messages animate on appear
- [ ] Close via X button, Escape key, or clicking outside

### AC2: Cmd+K Quick Command Palette
- [ ] `Cmd+K` / `Ctrl+K` opens centered modal overlay (desktop only)
- [ ] Search-style input with "Ask Cortex anything..." placeholder
- [ ] Single-shot: submit query → show result → dismiss modal
- [ ] Does NOT maintain session history
- [ ] Disabled on mobile (< 768px)

### AC3: Claude API Streaming
- [ ] POST `/api/cortex/chat` receives user message + sessionId + context
- [ ] Two-pass: first Sonnet call classifies intent (~100ms), then loads targeted context
- [ ] Full response streams back via SSE (ReadableStream)
- [ ] Text chunks appear in real-time (typewriter effect)
- [ ] Tool calls are executed server-side, results fed back to Claude
- [ ] Final response saved to Firestore asynchronously

### AC4: Read-Only Tools (14 tools)
- [ ] Each tool maps to a direct service function call (no HTTP overhead)
- [ ] Tools: analytics.overview, analytics.compare, analytics.compareClients, content.list, content.get, calendar.upcoming, leads.list, leads.get, clients.list, clients.health, seo.keywords, hashtags.trending, listening.mentions, workspace.info
- [ ] All tools respect workspace scoping from auth context
- [ ] Tool results are formatted by Claude into user-friendly responses

### AC5: Voice Input
- [ ] Mic button next to text input (both chat panel and Cmd+K)
- [ ] Uses Web Speech API (browser-native, zero cost)
- [ ] Tap to start → waveform animation → tap to stop
- [ ] Speech converted to text in input field FIRST (user can edit before sending)
- [ ] Falls back to hidden/disabled mic on unsupported browsers
- [ ] Optional: text-to-speech readback toggle in settings

### AC6: Session Storage
- [ ] Sessions stored in `workspaces/{id}/cortex_sessions/{sessionId}`
- [ ] Messages stored in `cortex_sessions/{id}/messages/{msgId}`
- [ ] Session auto-titled from first user message (Claude generates title)
- [ ] Sessions expire after 24 hours of inactivity (soft — still accessible, just archived)
- [ ] New session created when user clicks "New Chat" or after 24h gap

### AC7: Context Assembly
- [ ] Base context always loaded: workspace name, tier, role, client name, 5 recent activity items (~700 tokens)
- [ ] Intent-specific context loaded only when needed (brand voice, content list, analytics, calendar, etc.)
- [ ] Maximum 50K token budget per request
- [ ] Context block loading tracked for debugging

### AC8: Onboarding
- [ ] First-time open: 3-4 tooltip walkthrough (skippable) pointing at button, input, chips, slash hint
- [ ] First Cortex message: interactive tutorial with 2-3 guided prompts using real workspace data
- [ ] Tutorial state stored in Firestore (don't repeat after completion)

### AC9: Feedback
- [ ] 👍/👎 buttons below every Cortex message
- [ ] 👎 expands reason dropdown: "Wrong tool", "Bad quality", "Missed context", "Too slow", "Other"
- [ ] Feedback stored on the message document in Firestore
- [ ] No auto-learning in Phase 11A (deferred to 11C)

### AC10: Graceful Degradation
- [ ] Health check: ping Claude API before each request
- [ ] If Claude down: show banner "AI temporarily offline. Quick commands still work."
- [ ] Slash commands always work (they map directly to APIs, no AI needed)
- [ ] If Firestore down: static error page

### AC11: Concurrency Control
- [ ] Max 1 active Cortex request per user at a time
- [ ] Second request while streaming → queued with "Processing your previous request..."
- [ ] Max 3 queued → reject with "Please wait for current requests to complete"

### AC12: Dashboard Page + Sidebar
- [ ] `/dashboard/cortex` page showing session history list (table with search/filter)
- [ ] Columns: title, client, date, message count, credits
- [ ] Click session → opens in chat panel
- [ ] Sidebar: "Cortex ✨" nav item in Overview section, between Dashboard and Inbox
- [ ] Permission: visible to all authenticated users (no specific permission required)

---

## Firestore Collections

```
workspaces/{id}/cortex_sessions/{sessionId}
workspaces/{id}/cortex_sessions/{sessionId}/messages/{msgId}
```

## API Routes

```
POST /api/cortex/chat          — Main Cortex endpoint (SSE streaming)
GET  /api/cortex/sessions       — List sessions for current user
GET  /api/cortex/sessions/[id]  — Get session with messages
```

## Dependencies

- `@anthropic-ai/sdk` — npm install required
- `ANTHROPIC_API_KEY` — must be set in .env.local
- All existing service modules (direct imports for read tools)

## Files to Create

```
src/app/api/cortex/chat/route.ts              — SSE streaming endpoint
src/app/api/cortex/sessions/route.ts          — List sessions
src/app/api/cortex/sessions/[id]/route.ts     — Get session detail
src/app/dashboard/cortex/page.tsx             — Session history page
src/components/cortex/CortexProvider.tsx       — Global state + floating button
src/components/cortex/CortexPanel.tsx          — Slide-out chat panel
src/components/cortex/CortexCommandPalette.tsx — Cmd+K modal
src/components/cortex/CortexMessage.tsx        — Message bubble component
src/components/cortex/CortexInput.tsx          — Input with mic + submit
src/components/cortex/CortexSuggestions.tsx    — Suggestion chips
src/components/cortex/CortexFeedback.tsx       — Thumbs up/down
src/components/cortex/VoiceInput.tsx           — Web Speech API hook
src/lib/cortex/cortex-service.ts              — Session CRUD
src/lib/cortex/intent-classifier.ts           — Two-pass intent routing
src/lib/cortex/context-assembler.ts           — Context block loader
src/lib/cortex/tool-definitions.ts            — 14 read tool definitions
src/lib/cortex/tool-executor.ts               — Direct service call executor
src/types/features/cortex.ts                  — TypeScript types
```
