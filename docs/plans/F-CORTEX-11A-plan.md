# F-CORTEX Phase 11A Implementation Plan

## 1. Context

Aura Cortex is the conversational AI command center that transforms Aura from a 45-feature marketing tool suite into an autonomous AI marketing team. Phase 11A (Foundation) delivers the read-only conversational layer: slide-out chat panel, Cmd+K quick command palette, Claude API integration with SSE streaming, two-pass intent routing, 14 read-only tools via direct service calls, voice input, session storage, context assembly, onboarding, feedback, graceful degradation, and concurrency control.

**Key constraints:**
- All 14 tools are read-only direct service calls (no HTTP overhead)
- POST to `/api/cortex/chat` returns an SSE ReadableStream
- Two-pass intent routing: Sonnet classifies (~100ms), then targeted context loads
- Max 50K token budget per request
- Per-user concurrency: 1 active + 3 queued
- Dependencies: `@anthropic-ai/sdk`, `ANTHROPIC_API_KEY`

---

## 2. File Manifest

### Layer 1: Types
| File | Action |
|------|--------|
| `src/types/features/cortex.ts` | CREATE |

### Layer 2: Validation
| File | Action |
|------|--------|
| `src/lib/validations/cortex.ts` | CREATE |

### Layer 3: Services
| File | Action |
|------|--------|
| `src/lib/cortex/cortex-service.ts` | CREATE |
| `src/lib/cortex/intent-classifier.ts` | CREATE |
| `src/lib/cortex/context-assembler.ts` | CREATE |
| `src/lib/cortex/tool-definitions.ts` | CREATE |
| `src/lib/cortex/tool-executor.ts` | CREATE |
| `src/lib/cortex/stream-handler.ts` | CREATE |
| `src/lib/cortex/health-check.ts` | CREATE |

### Layer 4: API Routes
| File | Action |
|------|--------|
| `src/app/api/cortex/chat/route.ts` | CREATE |
| `src/app/api/cortex/sessions/route.ts` | CREATE |
| `src/app/api/cortex/sessions/[id]/route.ts` | CREATE |

### Layer 5: Components (12 files)
| File | Action |
|------|--------|
| `src/components/cortex/CortexProvider.tsx` | CREATE |
| `src/components/cortex/CortexPanel.tsx` | CREATE |
| `src/components/cortex/CortexCommandPalette.tsx` | CREATE |
| `src/components/cortex/CortexMessage.tsx` | CREATE |
| `src/components/cortex/CortexInput.tsx` | CREATE |
| `src/components/cortex/CortexSuggestions.tsx` | CREATE |
| `src/components/cortex/CortexFeedback.tsx` | CREATE |
| `src/components/cortex/CortexContextBar.tsx` | CREATE |
| `src/components/cortex/VoiceInput.tsx` | CREATE |
| `src/components/cortex/CortexOnboarding.tsx` | CREATE |
| `src/components/cortex/CortexFloatingButton.tsx` | CREATE |
| `src/components/cortex/CortexDegradationBanner.tsx` | CREATE |

### Layer 6: Pages
| File | Action |
|------|--------|
| `src/app/dashboard/cortex/page.tsx` | CREATE |

### Layer 7: Modifications
| File | Action |
|------|--------|
| `src/components/app-sidebar.tsx` | MODIFY — add Cortex nav item |
| `src/app/dashboard/layout.tsx` | MODIFY — wrap with CortexProvider |

**Total: 26 files to create, 2 to modify**

---

## 3. Build Order

```
Step 1: npm install @anthropic-ai/sdk
Step 2: Types → src/types/features/cortex.ts
Step 3: Validation → src/lib/validations/cortex.ts
Step 4: Services (parallel):
  ├─ cortex-service.ts (Firestore CRUD)
  ├─ health-check.ts (Claude ping)
  ├─ tool-definitions.ts (static)
  └─ tool-executor.ts (imports existing services)
Step 5: AI services (depends on Step 4):
  ├─ intent-classifier.ts
  ├─ context-assembler.ts
  └─ stream-handler.ts
Step 6: API routes (depends on Steps 3-5)
Step 7: UI components (parallel with Steps 4-6)
Step 8: Dashboard page
Step 9: Integration (sidebar + layout modifications)
Step 10: Build + test
```

---

## 4. Data Models

### CortexSession
```typescript
interface CortexSession {
  id: string;
  workspaceId: string;
  userId: string;
  clientId?: string;
  title: string;
  messageCount: number;
  status: 'active' | 'archived';
  creditsConsumed: number;
  tokensConsumed: number;
  lastMessageAt: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
}
```

### CortexMessage
```typescript
interface CortexMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  inputMethod: 'text' | 'voice' | 'slash_command' | 'suggestion_chip';
  toolCalls?: CortexToolCall[];
  feedback?: CortexFeedback;
  tokenUsage?: { input: number; output: number };
  timestamp: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  createdBy: string;
  workspaceId: string;
}
```

---

## 5. API Routes

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/cortex/chat` | requireWorkspaceAuth() | SSE streaming endpoint |
| GET | `/api/cortex/sessions` | requireWorkspaceAuth() | List user sessions |
| GET | `/api/cortex/sessions/[id]` | requireWorkspaceAuth() | Get session + messages |

---

## 6. 14 Read Tools

| Tool | Service Call | Source |
|------|-------------|--------|
| analytics.overview | getDashboardMetrics() | @/lib/f5/analytics-service |
| analytics.compare | getDashboardMetrics() x2 | @/lib/f5/analytics-service |
| analytics.compareClients | listClients() + getDashboardMetrics() | @/lib/f14 + @/lib/f5 |
| content.list | listDrafts() | @/lib/f1/content-service |
| content.get | getDraft() | @/lib/f1/content-service |
| calendar.upcoming | listCalendarEvents() | @/lib/f4/calendar-service |
| leads.list | listLeads() | @/lib/f12/lead-service |
| leads.get | Firestore doc read | Direct |
| clients.list | listClients() | @/lib/f14/client-service |
| clients.health | getMockHealthScore() | @/lib/f14/client-service |
| seo.keywords | mockKeywordResearch() | @/lib/f10/seo-service |
| hashtags.trending | mockHashtagAnalytics() | @/lib/marketing/hashtag-service |
| listening.mentions | listMentions() | @/lib/listening/listening-service |
| workspace.info | Firestore doc read | Direct |

---

## 7. Verification

12 acceptance criteria with detailed test steps — see feature contract.
