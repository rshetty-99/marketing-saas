# Product Requirements Document: Aura Cortex
## The AI Marketing Command Center

**Version:** 2.0
**Author:** Claude Opus 4.6 + Rajesh Shetty
**Date:** 2026-04-05
**Status:** Approved — All design decisions locked (22/22)
**Tagline:** *"Think it. Cortex ships it."*

---

## 1. Executive Summary

Aura Cortex is the conversational AI command center that transforms Aura from a marketing tool suite into an autonomous AI marketing team. Users type (or speak) natural language instructions — "Launch a Mother's Day campaign for Client X across Instagram and email with 20% off messaging" — and Cortex orchestrates content generation, scheduling, email building, ad creation, and publishing across the entire platform without manual navigation.

**The problem:** Aura has 45+ features across 160 routes. Power users love the depth. But the cognitive overhead of navigating screens, clicking buttons, and configuring options manually creates friction — especially for agencies managing 20+ clients.

**The solution:** One input field. One AI brain. Every feature accessible via natural language or voice. Cortex is the nerve center that routes intent to action, coordinates multi-step workflows, and reports results — turning 45 minutes of multi-screen work into a single conversational exchange.

**Why now:** The platform is feature-complete (Phases 0–10). All the "muscles" exist — content gen, publishing, email, ads, analytics, CRM. Cortex is the "brain" that coordinates them. Without it, Aura is a Swiss Army knife. With it, Aura is a marketing employee.

---

## 2. Vision & Principles

### Vision
Every agency owner should be able to run their entire marketing operation by talking to Aura Cortex — the way a CEO delegates to a CMO, not the way a user clicks through software.

### Design Principles

1. **Prompt-first, screen-second** — Any action possible via the UI should also be possible via Cortex. The conversational interface is the primary experience; screens become detail views.

2. **Transparent orchestration** — Cortex shows what it's doing in real-time: "Creating LinkedIn post... Scheduling for Tuesday 9am... Building email sequence... Done." Users see the plan before execution.

3. **Human-in-the-loop by default** — Cortex proposes, humans approve. Destructive or high-stakes actions (publish, send email, spend ad budget) require explicit confirmation. Low-risk actions (draft content, analyze data) execute automatically.

4. **Context-aware** — Cortex knows which workspace you're in, which client is selected, what brand voice to use, what content was recently published, and what's performing well. It never asks for context it already has.

5. **Progressive autonomy** — New users get guardrails (confirm everything). Power users can unlock "autopilot" mode where Cortex executes without confirmation for trusted action types.

6. **Composable, not monolithic** — Cortex is built on the same APIs as the UI. Every Cortex action maps to an existing API endpoint. No special backdoors.

7. **RBAC-bound** — Cortex follows the same permission rules as the UI. It is a faster interface, not a privilege escalation. An editor cannot publish via Cortex if they can't publish via the button. *(Decision 8)*

---

## 3. User Personas

### 3.1 Sarah — Agency Owner (Primary)
- Manages 25 clients across 3 account managers
- Spends 2 hours/day in the platform coordinating work
- **Cortex use:** "Show me which clients had engagement drops this week" → "Create recovery content plans for the bottom 3" → "Schedule everything and send me a summary"

### 3.2 Marcus — Solo Freelancer (Secondary)
- Manages 8 clients himself, no team
- Can't afford to context-switch between screens
- **Cortex use:** "Create this week's content for all my clients using their brand voices" → "Score them all for SEO" → "Schedule the top performers"

### 3.3 Emily — Account Manager (Tertiary)
- Manages 5 client accounts within an agency
- Needs to produce weekly reports and respond to client requests fast
- **Cortex use:** "Generate this month's report for Client X with the analytics from last 30 days" → "Draft a response to their email about Q3 strategy"

### 3.4 Client Portal User (Quaternary)
- Agency's client with limited portal access
- Can view reports, approve content, ask questions
- **Cortex use:** "How did my content perform last week?" → "Approve the Tuesday LinkedIn post" → "Request a revision on the email draft"
- **Access:** RBAC-restricted to `client_portal` permissions. Agency toggles Cortex on/off per client. White-label branded as agency's AI assistant. *(Decision 17)*

---

## 4. Feature Specification

### 4.1 Cortex UI — Two Modes, One Brain *(Decision 3)*

**Mode 1: Chat Panel (Multi-turn conversations)**
- Persistent floating button (bottom-right, ✨ icon) on every page
- Opens a slide-out panel (desktop) or full-screen takeover (mobile < 768px) *(Decision 12)*
- Full conversation thread with session history
- Used for: campaign planning, multi-step workflows, ongoing conversations

**Mode 2: Quick Command Palette (Single-shot actions)**
- Activated via `Cmd+K` / `Ctrl+K` (desktop only, disabled on mobile) *(Decision 12)*
- Centered modal overlay — type a command, get a result, modal closes
- Used for: search, navigate, quick create, switch client, SEO score
- Does NOT maintain session — fire-and-forget
- Both modes use the same Cortex backend

**Voice Input** *(Decision 15)*
- Microphone button next to text input in both modes
- Uses Web Speech API (browser-native, zero API cost)
- Speech converts to text in input field first — user sees and can edit before sending
- Optional text-to-speech readback of responses (toggle in Cortex settings)
- Falls back to disabled mic button on unsupported browsers
- No wake word — tap mic button to start

**UI Components:**
- Chat message thread (user messages + Cortex responses)
- Real-time execution log (shows steps being taken)
- Action cards (confirm/reject proposed actions)
- Context bar (shows current workspace, client, brand voice)
- Suggestion chips (quick actions based on current page)
- Feedback buttons (👍/👎 on every Cortex message) *(Decision 22)*
- History tab (recent 10 sessions) *(Decision 19)*
- "Show chart" expand buttons on analytics responses *(Decision 16)*

### 4.2 Intent Recognition & Routing

Cortex maps natural language to platform capabilities via Claude's tool-use:

| Intent Category | Example Prompts | Routed To |
|---|---|---|
| **Content Creation** | "Write a blog post about...", "Create 5 Instagram captions for..." | F1 Content Gen API |
| **Publishing** | "Schedule this for Tuesday", "Publish now to LinkedIn" | F3 Publishing API |
| **Campaign Launch** | "Launch a campaign for Client X" | Campaign orchestrator (multi-step) |
| **Analytics** | "How did we perform last week?", "Which client grew fastest?" | F5 Analytics API |
| **Reporting** | "Generate a report for Client X" | Report Builder API |
| **Email** | "Send a newsletter to our subscriber list" | F11 Email API |
| **Social** | "What are people saying about us?", "Show trending hashtags" | Listening + Hashtag APIs |
| **Lead Management** | "Show me new leads this week", "Move lead X to qualified" | F15 Leads API |
| **SEO** | "Score this draft for SEO", "Research keywords for..." | F10 SEO API |
| **Image Generation** | "Create a header image for this post" | F13 Image Gen API |
| **Client Management** | "Switch to Client X", "Show client health scores" | F14 Client API |
| **Settings** | "Connect my LinkedIn account", "Update brand voice" | Settings APIs |
| **Meta** | "What can you do?", "Help me get started" | Built-in responses |

**Analytics responses** default to text summaries. A "Show chart" expand button renders inline Recharts/shadcn visualizations on demand — no second API call, uses data already fetched. *(Decision 16)*

### 4.3 Multi-Step Campaign Orchestration

The most powerful Cortex capability: executing complex, multi-feature workflows from a single prompt.

**Example flow:**

```
User: "Launch a summer sale campaign for Client X. 
       20% off all products. Run for 2 weeks starting June 1.
       Hit Instagram, LinkedIn, email, and a landing page."

Cortex Plan (shown to user for approval):
┌─────────────────────────────────────────────────────┐
│ 📋 Campaign Plan: Summer Sale — Client X            │
│                                                     │
│ Step 1: 🎨 Generate 3 Instagram posts with imagery  │
│ Step 2: 📝 Generate 2 LinkedIn posts (professional) │
│ Step 3: 📧 Build email campaign (subject + body)    │
│ Step 4: 🌐 Create landing page with promo code      │
│ Step 5: 📅 Schedule posts: Jun 1, 4, 7, 10, 13     │
│ Step 6: ✉️ Schedule email blast: Jun 1 9am           │
│ Step 7: 📊 Set up tracking (UTM + conversion pixel) │
│                                                     │
│ Brand Voice: Client X — "friendly, bold, Gen Z"     │
│ Budget: Using existing ad credits                   │
│                                                     │
│ [✅ Execute All]  [✏️ Edit Plan]  [❌ Cancel]        │
└─────────────────────────────────────────────────────┘
```

**Execution model** *(Decision 5)*:
- Steps execute synchronously with real-time streaming for campaigns under 30 seconds or fewer than 5 steps
- Campaigns exceeding 30 seconds or 5+ steps: first 3 steps execute synchronously (user watches), remaining steps hand off to background via Cloud Tasks
- Background completion triggers in-app toast notification + optional email: "Your campaign is ready! [View Results]"
- Notification links back to the Cortex session with full results

**Error handling** *(Decision 6)*:
- Each step in the DAG declares its dependencies
- If a step fails, execution stops. Completed steps are kept (not rolled back)
- User sees: "4/7 steps completed. Step 5 (image generation) failed: Vertex AI quota exceeded. [Retry Step 5] [Skip & Continue] [View What's Done]"
- "Skip & Continue" only offered if downstream steps don't depend on the failed step
- All completed assets are linked and accessible regardless of overall campaign status

### 4.4 Context Engine *(Decision 4)*

**Two-pass intent routing:**

1. **Pass 1 — Intent classification (fast):** User message sent to Claude Sonnet with minimal context (~200 tokens). Returns intent category + required context blocks. Cost: ~$0.0003. Latency: ~100ms.

2. **Pass 2 — Full response (with targeted context):** Based on classified intent, only relevant context blocks are loaded from Firestore. A content question loads brand voice + recent drafts. An analytics question loads metrics. Campaign planning loads everything.

**Context blocks available:**

| Context | Source | Token Cost | Loaded When |
|---|---|---|---|
| Workspace basics | Clerk session + Firestore | ~200 | Always (base context) |
| Active client | Client switcher state | ~100 | Always (base context) |
| User role & permissions | RBAC system | ~100 | Always (base context) |
| Recent activity (5 items) | Firestore | ~300 | Always (base context) |
| Brand voice profile | Entity profile | ~500 | Content, campaign, email intents |
| Recent content (50 drafts) | Firestore (summarized) | ~2K | Content, publishing, repurpose intents |
| Analytics trends (30 days) | Firestore (summarized) | ~2K | Analytics, reporting, insights intents |
| Calendar (upcoming) | Firestore | ~1K | Scheduling, calendar, campaign intents |
| Team members | Firestore | ~500 | Assignment, team, workspace intents |
| Active campaigns | Firestore | ~1K | Campaign, email, ads intents |
| Cortex memory | Firestore | ~500 | Always (loaded after intent classification) |

**Maximum context budget:** 50K tokens per request. 90% of requests use under 5K tokens.

### 4.5 Action Confirmation & Safety

Three tiers of autonomy:

| Tier | Actions | Default Behavior | User Can Override |
|---|---|---|---|
| **Auto-execute** | Read data, analyze, score content, generate drafts, research | Executes immediately, shows results | N/A |
| **Confirm once** | Schedule posts, create campaigns, assign tasks, update leads | Shows plan, requires one "Yes" | Can set to auto-execute |
| **Always confirm** | Publish live, send email blast, spend ad budget, delete content, change settings | Shows plan + warning, requires explicit approval | Cannot override |

**Concurrency limit** *(Decision 19)*:
- Maximum 1 active Cortex request per user at a time
- Second request while first is streaming → queued with "Processing your previous request..."
- Maximum 3 queued requests → reject with "Please wait for current requests to complete"

### 4.6 Cortex Memory — Three-Level Hierarchy *(Decision 10)*

**Session memory:** Full conversation history within a chat session. Stored in Firestore. Sessions expire after 24 hours of inactivity.

**Long-term memory — three scopes:**

| Scope | Example | Loaded When |
|---|---|---|
| **Workspace-wide** (`clientId: null, userId: null`) | "Our agency always uses UTM tracking", "We prefer 3-stage approvals" | Every Cortex request |
| **Client-scoped** (`clientId: "X", userId: null`) | "Client X prefers casual tone", "Client X posts Mon/Wed/Fri" | When that client is active |
| **User+Client-scoped** (`clientId: "X", userId: "emily"`) | "Emily always schedules Client X at 9am", "Emily skips SEO scoring for blogs" | When that user works on that client |

**Memory limits per tier:**

| Tier | Workspace | Per Client | Per User+Client |
|---|---|---|---|
| Starter | 20 | 10 | 5 |
| Growth | 50 | 25 | 15 |
| Agency+ | 100 | 50 | 30 |

**Stored in:** `workspaces/{id}/cortex_memory/{memoryId}`

```typescript
interface CortexMemory {
  id: string;
  workspaceId: string;
  clientId?: string;      // null = workspace-wide
  userId?: string;         // null = shared across team
  category: 'preference' | 'pattern' | 'insight';
  content: string;
  confidence: number;      // 0-1
  source: 'explicit' | 'inferred' | 'feedback';  // How it was learned
  lastReferencedAt: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
}
```

### 4.7 Proactive Suggestions

Cortex doesn't just respond — it initiates:

| Trigger | Suggestion |
|---|---|
| User lands on dashboard | "Good morning! 3 posts are ready for review, Client X's engagement is trending up 15%, and you have 2 leads to follow up on." |
| Content draft saved | "Want me to score this for SEO and generate social variants?" |
| Analytics anomaly detected | "Client Y's Instagram reach dropped 30% — want me to analyze why?" |
| Scheduled post approaching | "Your LinkedIn post goes live in 1 hour. The optimal time for Client X's audience is actually 2pm — want me to reschedule?" |
| New lead captured | "New lead from Client X's landing page: John Doe, VP Marketing at Acme. Want me to enrich and assign?" |

### 4.8 Slash Commands (Power User)

For users who prefer structured input over natural language:

```
/create blog "Topic" --client X --tone professional --length 1200
/schedule "content-id" --date 2026-06-01 --time 09:00 --platform linkedin,twitter
/report --client X --period last-30-days --format pdf --send client@email.com
/score --draft "content-id" --type seo,readability,brand
/campaign --goal "50 leads" --budget 500 --duration 30d --platforms ig,li,email
/analyze --client X --metric engagement --compare last-month
/translate --draft "content-id" --to es,fr,de
```

### 4.9 Session Management *(Decisions 18, 19, 21)*

**Onboarding:**
1. First open: 3-4 tooltip walkthrough pointing at Cortex button, input field, suggestion chips, slash command hint (skippable, 15 seconds)
2. First message: Cortex self-guided interactive tutorial — "Let me show you what I can do. Try typing 'show my analytics'." 3-4 guided prompts using real workspace data. Learning by doing.

**Session history:**
- **In-panel tab:** "History" tab in chat panel showing recent 10 sessions. Click to switch.
- **Full page:** `/dashboard/cortex` with searchable, filterable table of all sessions. Filter by client, date, action type. Preview conversation snippets.

**Session sharing** *(Decision 18)*:
- "Share session" button generates a link. Recipients can view and continue the conversation.
- Access model:
  - Creator: always has access
  - Shared recipients: can view AND continue (send messages)
  - Owner/Admin: can view ANY session (audit oversight) but NOT continue unless they "Transfer session to me"
  - Manager/Editor/Viewer: only their own + shared with them

**Session export** *(Decision 21)*:
- Export as PDF (branded with agency logo in white-label mode) — the session becomes a deliverable for clients
- Export as Markdown (for Notion, Google Docs, etc.)
- Shareable read-only link (expires in 7 days, accessible without login)
- PDF includes conversation + links to all assets created during the session

### 4.10 Feedback Loop *(Decision 22)*

**UI:** Small 👍/👎 icons below every Cortex message. Non-intrusive, zero friction on happy path.

**Thumbs down** expands a reason dropdown:
- "Wrong tool used"
- "Bad content quality"
- "Missed context"
- "Too slow"
- "Other" (free text)

**Auto-learning:** Three thumbs-down on the same pattern automatically creates a low-confidence (0.5) memory. Example: user gives 👎 three times when Cortex uses casual tone for Client X → memory created: "Client X: user prefers formal tone (learned from feedback)." Subsequent confirmation or contradiction adjusts confidence.

**Dashboard:** Feedback metrics visible on `/dashboard/cortex` Usage tab — "87% positive this month", trend chart, most-flagged categories.

### 4.11 Audit Trail *(Decision 13)*

Every action taken by Cortex is logged in the existing audit system with additional fields:

```json
{
  "actorId": "user_emily",
  "action": "content.created",
  "resourceId": "draft_abc",
  "via": "cortex",
  "cortexSessionId": "session_xyz",
  "timestamp": "2026-06-01T14:14:00Z"
}
```

- The human is always the actor — Cortex is the tool (`via: "cortex"`)
- `cortexSessionId` links to the full conversation for context
- Enables filtering: "Show me everything done via Cortex today"

---

## 5. Technical Architecture

### 5.1 Tool Execution Model *(Decision 1)*

**Hybrid approach:**
- **Read operations** (70% of calls): Direct service function calls (`listDrafts()`, `getAnalytics()`). Skips HTTP overhead. Zero latency penalty.
- **Write operations** (30% of calls): Route through existing API endpoints (`POST /api/content/drafts`). Preserves Zod validation, RBAC middleware, and audit logging.
- A 7-step campaign with 3 reads + 4 writes = ~200ms overhead instead of ~700ms with all-API approach.

### 5.2 Streaming Architecture *(Decision 2)*

**SSE + REST hybrid** (same pattern as Claude API and ChatGPT):

```
Client ──POST──> /api/cortex/chat
                     │
                     ├─> Intent classification (Sonnet, ~100ms)
                     ├─> Context assembly (Firestore, ~200ms)
                     ├─> Claude API call (streaming SSE)
                     │      │
                     │      ├─> Text chunk → SSE event to client
                     │      ├─> Tool call → execute internally
                     │      │      │
                     │      │      ├─> Read tool → direct service call
                     │      │      ├─> Write tool → internal API call
                     │      │      └─> Progress update → SSE event to client
                     │      └─> Final response → SSE event to client
                     │
                     └─> Save to Firestore (async, non-blocking)
```

- Each user message is a POST request
- Response streams back as SSE events
- No WebSocket — works cleanly on Firebase Hosting, behind CDN, auto-reconnects
- Mid-stream cancellation: client aborts the SSE connection

### 5.3 Multi-Client Data *(Decision 7)*

**Cross-client aggregation tools** (Phase 11A):
- `analytics.compareClients` — single Firestore collection-group query across all client workspaces
- `clients.rankByMetric` — returns sorted client list by any metric
- `clients.alertsOverview` — surfaces all clients needing attention

**Nightly rollup Cloud Function** (Phase 11D):
- Runs at 2am UTC
- Computes per-client daily summaries
- Stores in `workspaces/{agencyId}/client_rollups/{date}`
- Feeds proactive insights: "Good morning, 3 clients need attention"

### 5.4 Graceful Degradation *(Decision 14)*

When Claude API or dependencies fail:

| Level | Condition | Behavior |
|---|---|---|
| **Full** | Claude available, <3s response | Complete Cortex experience |
| **Degraded** | Claude slow (>10s) | Auto-switch to Sonnet. Banner: "Using fast mode" |
| **Slash-only** | Claude API down | Natural language disabled. Slash commands + smart autocomplete (pre-built templates) work. Banner: "AI is temporarily offline. Quick commands still work." |
| **Offline** | Claude + Firestore down | Static error page. "We're experiencing issues. Your data is safe." |

Health check: ping Claude API on each request. If fail, downgrade immediately — no timeout wait.

### 5.5 Firestore Schema

```typescript
// Collection: workspaces/{id}/cortex_sessions
interface CortexSession {
  id: string;
  workspaceId: string;
  userId: string;
  clientId?: string;
  title: string;                        // Auto-generated from first message
  messageCount: number;
  status: 'active' | 'archived';
  sharedWith: string[];                 // userIds with access
  creditsConsumed: number;
  tokensConsumed: number;
  lastMessageAt: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
}

// Subcollection: cortex_sessions/{id}/messages
interface CortexMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  inputMethod: 'text' | 'voice' | 'slash_command';
  toolCalls?: {
    toolName: string;
    arguments: Record<string, unknown>;
    result?: Record<string, unknown>;
    status: 'pending' | 'executing' | 'completed' | 'failed';
    executionMode: 'direct_service' | 'api_route';
    durationMs?: number;
  }[];
  actionCards?: {
    type: 'confirm' | 'info' | 'warning';
    title: string;
    actions: { label: string; action: string }[];
    resolved?: boolean;
    resolvedAction?: string;
  }[];
  feedback?: {
    rating: 'positive' | 'negative';
    reason?: string;
    timestamp: FirestoreTimestamp;
  };
  tokenUsage?: { input: number; output: number };
  timestamp: FirestoreTimestamp;
}

// Collection: workspaces/{id}/cortex_memory
interface CortexMemory {
  id: string;
  workspaceId: string;
  clientId?: string;         // null = workspace-wide
  userId?: string;            // null = shared across team
  category: 'preference' | 'pattern' | 'insight';
  content: string;
  confidence: number;         // 0-1
  source: 'explicit' | 'inferred' | 'feedback';
  lastReferencedAt: FirestoreTimestamp;
  createdAt: FirestoreTimestamp;
}

// Collection: workspaces/{id}/cortex_usage
interface CortexUsageRecord {
  id: string;
  workspaceId: string;
  userId: string;
  clientId?: string;
  sessionId: string;
  creditsConsumed: number;
  tokensConsumed: number;
  model: 'sonnet' | 'opus';
  toolsUsed: string[];
  date: string;               // YYYY-MM-DD for daily aggregation
  timestamp: FirestoreTimestamp;
}
```

---

## 6. User Experience Flows

### 6.1 First-Time Activation

```
User clicks Cortex button (✨ icon, bottom-right)
  → Tooltip walkthrough: 3-4 steps pointing at key UI elements (skippable)
  → Slide-out panel opens
  → Interactive tutorial begins:
  
    Cortex: "Hey Rajesh! I'm Cortex, your AI marketing co-pilot. 👋
             I can see you're managing Rajesh Agency with 3 clients.
             
             Let me show you what I can do.
             Try typing: 'show my analytics'"
    
    User: "show my analytics"
    
    Cortex: [Executes analytics.overview tool with real data]
             "Here's your agency overview:
              • Total reach: 45.2K (+12% vs last week)
              • Top client: Client X (engagement rate 4.2%)
              • Needs attention: Client Z (reach down 18%)
              
             Nice! Now try: 'create a LinkedIn post for Client X 
             about their new product launch'"
    
    User: "create a LinkedIn post for Client X about their new product launch"
    
    Cortex: [Generates real content using Client X's brand voice]
             "Here's your draft: ...
              
             Great — you're a natural! Here's what else I can do:
             • 📋 Plan entire campaigns with one prompt
             • 📊 Generate branded client reports  
             • 🎨 Create images and schedule posts
             • ⌨️ Use /slash commands for quick actions
             
             Ask me anything!"
```

### 6.2 Simple Query Flow

```
User: "What hashtags are trending in the fitness industry?"

Cortex: [Calls hashtag.research tool — direct service call, ~200ms]
  → "Here are the top trending fitness hashtags:
     
     🔥 #FitnessMotivation (2.1M posts, trending ↑23%)
     💪 #GymLife (1.8M posts, steady)
     🏃 #RunningCommunity (890K posts, trending ↑45%)
     🥗 #HealthyEating (1.2M posts, trending ↑12%)
     
     Want me to create a hashtag group for Client X's fitness content?"
     
     [👍] [👎]
```

### 6.3 Multi-Step Campaign Flow

```
User: "Create a product launch campaign for Client X. 
       New protein powder. Target gym-goers 25-40. 
       2 weeks, Instagram + email + landing page."

Cortex: "I'll build a complete launch campaign. Here's my plan:
        
         📋 CAMPAIGN: Protein Powder Launch — Client X
         
         1. 🌐 Landing Page
            • Hero section with product imagery
            • Benefits list + social proof
            • Lead capture form with 10% discount code
         
         2. 📸 Instagram (6 posts over 14 days)
            • Day 1: Teaser — 'Something big is coming'
            • Day 3: Product reveal with benefits
            • Day 5: Testimonial/social proof
            • Day 8: Behind-the-scenes/ingredients
            • Day 11: User-generated content prompt
            • Day 14: Last chance / urgency
         
         3. ✉️ Email Sequence (3 emails)
            • Email 1 (Day 1): Launch announcement + discount
            • Email 2 (Day 7): Benefits deep-dive + testimonials  
            • Email 3 (Day 13): Last chance reminder
         
         4. 🎨 AI-Generated Images
            • Product hero shot (1200x628)
            • 6 Instagram squares (1080x1080)
            • Email header (600x200)
         
         5. 📊 Tracking
            • UTM parameters on all links
            • Conversion pixel on landing page
            • A/B test on email subject lines
         
         Brand voice: Client X — 'energetic, motivational, clean'
         Estimated reach: 15K-25K (based on Client X's audience)
         
         [✅ Build Everything]  [✏️ Modify Plan]  [❌ Cancel]"

User: "Build everything"

Cortex: "🚀 Executing campaign...
         
         ✅ Landing page created — /launch/protein-powder
         ✅ 6 Instagram posts generated and scored (avg SEO: 82)
         ✅ 3 emails drafted with A/B subject lines
         ⏳ Remaining 4 steps continuing in background...
         
         I'll notify you when everything is ready (~30 seconds)."

[30 seconds later — toast notification]

Cortex: "✅ Campaign complete!
         
         ✅ 9 images generated (product + social + email)
         ✅ Posts scheduled: Jun 1, 3, 5, 8, 11, 14
         ✅ Emails scheduled: Jun 1, 7, 13
         ✅ UTM tracking configured
         ✅ A/B test set up on Email 1 subject line
         
         📎 Quick links:
         • [View Landing Page] [View Posts] [View Emails]
         • [View Calendar] [Campaign Dashboard]
         • [Export Session as PDF]
         
         Total execution time: 47 seconds
         Credits used: 5
         Anything else you'd like to adjust?"
         
         [👍] [👎]
```

---

## 7. Metrics & Success Criteria

### Primary Metrics
| Metric | Target | Measurement |
|---|---|---|
| **Cortex adoption rate** | 60% of active users within 30 days | % users who open Cortex panel |
| **Actions per session** | 5+ tool calls per session avg | Tool call count per session |
| **Time savings** | 70% reduction in multi-step workflows | Compare task completion time before/after |
| **Repeat usage** | 3+ sessions per user per week | Session frequency per user |
| **Voice input adoption** | 15% of messages via voice within 60 days | % messages with inputMethod: 'voice' |

### Quality Metrics
| Metric | Target | Measurement |
|---|---|---|
| **Intent accuracy** | 95%+ correct tool routing | Manual audit of 100 random sessions/week |
| **First-try success** | 85%+ tasks completed without clarification | % sessions with 0 "I don't understand" |
| **Approval rate** | 90%+ of proposed plans approved as-is | % "Execute All" vs "Modify Plan" |
| **Error rate** | < 2% tool call failures | Failed tool calls / total tool calls |
| **Feedback score** | 85%+ positive ratings | 👍 / (👍 + 👎) per week |

---

## 8. Phased Rollout

### Phase 11A — Foundation (Week 1-2)
- Cortex chat UI (slide-out panel + full-screen mobile + Cmd+K palette)
- Claude API integration with SSE streaming
- Two-pass intent routing (Sonnet classification → targeted context)
- 14 read-only tools via direct service calls
- Voice input via Web Speech API
- Session storage in Firestore
- Context assembly (workspace, client, brand voice)
- Tooltip walkthrough + interactive tutorial
- Feedback buttons (👍/👎 + reason dropdown)
- Tiered degradation (full → Sonnet → slash → offline)
- Per-user concurrency limit (1 active + 3 queued)

### Phase 11B — Write Actions (Week 3-4)
- 14 write tools via API routes (with RBAC + validation)
- Action confirmation cards (3-tier autonomy)
- Multi-step execution with progress streaming
- Background handoff for 30s+ / 5+ step campaigns
- Slash command support
- Dependency-aware error handling (fail fast + keep completed)
- Audit trail with `via: "cortex"` flag
- Session sharing (explicit share + admin view-only)

### Phase 11C — Orchestration (Week 5-6)
- Campaign planner (multi-step DAG execution)
- Goal-to-campaign builder
- Cross-feature coordination (content → SEO score → schedule → track)
- Three-level memory (workspace / client / user+client)
- Auto-learning from feedback patterns
- Cross-client aggregation tools
- Session export (PDF branded, Markdown, shareable link)

### Phase 11D — Intelligence (Week 7-8)
- Proactive suggestions (dashboard greeting, anomaly alerts)
- Smart send-time recommendations
- Predictive insights ("engagement will drop if you don't post this week")
- Copilot mode on content editor (inline suggestions)
- Nightly client rollup Cloud Function
- Client portal Cortex (RBAC-restricted, toggle per client)
- `/dashboard/cortex` page with History + Usage tabs
- Usage dashboard (breakdown, projections, per-user limits, CSV export)

---

## 9. Dependencies

| Dependency | Status | Blocker? |
|---|---|---|
| Claude API (Sonnet/Opus) | `ANTHROPIC_API_KEY` env var | Yes — must be set |
| `@anthropic-ai/sdk` npm package | Not installed yet | Yes — install in Phase 11A |
| All Phase 0-10 API routes | Built (90+ routes) | No |
| SSE support | Next.js Route Handlers support ReadableStream natively | No |
| Web Speech API | Browser-native (Chrome, Edge, Safari) | No |
| Firestore composite indexes | Need cortex_sessions indexes | No — auto-created |
| Cloud Tasks (background execution) | Queues created but not wired | Phase 11B dependency |

---

## 10. Pricing & Tier Gating *(Decision 9)*

### Dual-Layer Cost Control

**Layer 1 — User-facing (Action Credits):**

| Tier | Credits/Month | Model Access | Autopilot |
|---|---|---|---|
| **Starter** | 100 | Sonnet only | No |
| **Growth** | 500 | Sonnet + Opus for campaigns | No |
| **Agency** | 2,000 | Full Opus | No |
| **Agency Pro** | 10,000 | Full Opus | Yes |
| **White-Label** | 20,000 | Full Opus + custom branding | Yes |

**Credit costs by action:**
- Analytics query, search, navigate = 0 credits (reads are free)
- Content generation, scoring, repurpose = 1 credit
- Image generation = 2 credits
- Campaign plan (multi-step) = 5 credits
- Full campaign execution = 10 credits

**Layer 2 — System-level (Token Budget, hidden from users):**

| Tier | Hidden Token Budget | Behavior at ceiling |
|---|---|---|
| Starter | 500K tokens | Silent downgrade to Sonnet |
| Growth | 3M tokens | Silent downgrade to Sonnet |
| Agency | 10M tokens | Warning to admin |
| Agency Pro | 50M tokens | Warning to admin |
| White-Label | 100M tokens | Warning to admin |

When credits run out → "Upgrade for more AI actions."
When token budget approached but credits remain → silently downgrade to Sonnet.

### Per-User Limits (Admin-Configurable)
- Agency admins can set per-team-member daily credit caps
- "Emily: max 50 credits/day" prevents one person burning the entire budget
- Configurable on `/dashboard/cortex` Usage tab

---

## 11. White-Label Cortex *(Decision 11)*

Three-tier customization, progressively more powerful:

### Basic (Any white-label user)
- **Name:** Custom AI assistant name (e.g., "Nova")
- **Avatar:** Upload custom icon/image
- **Welcome message:** Custom first-time greeting

### Advanced (Most agencies)
Guided form — no prompt engineering required:
- **Tone:** Professional / Casual / Friendly / Bold / Custom
- **Personality traits:** ☑ Helpful ☑ Concise ☐ Emoji-friendly ☐ Formal
- **Specialty knowledge:** Textarea ("We specialize in healthcare marketing...")
- **Tool access:** Toggle features on/off (☑ Content ☑ Email ☐ Ads ☐ Influencers)
- **Restricted topics:** Textarea ("Never mention HubSpot or Hootsuite")

### Expert (Technical agencies)
- **Raw system prompt editor** with syntax highlighting
- Warning banner: "Advanced mode — changes can break Cortex behavior"
- "Test with sample query" button to validate before saving
- "Reset to Default" always available
- Audit log records every system prompt change

**Safety rails:**
- Core instructions (RBAC, safety tiers, tool definitions) are prepended as `[SYSTEM — NOT OVERRIDABLE]`
- Expert prompt injected as `[AGENCY CUSTOMIZATION]` block after core
- Blocklist validation rejects prompts containing: "ignore previous instructions", "bypass approval", "skip confirmation"

---

## 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Claude API cost at scale | High | High | Dual-layer billing (credits + tokens). Sonnet by default. Cache context assembly. Per-user limits. |
| Hallucinated tool calls | Medium | High | Strict tool definitions with Zod validation. All write tools go through existing API auth + validation. |
| User trust gap | Medium | Medium | "Show plan before execute" default. Execution logs visible. Audit trail. Undo for content creation. |
| Latency for complex campaigns | Medium | Low | Stream progress. Background handoff for 30s+ campaigns. Toast notifications on completion. |
| Prompt injection via user content | Low | High | Hardened system prompt. User messages are never system instructions. Firestore content treated as data. |
| Claude API outage | Medium | High | Tiered degradation. Slash commands work without Claude. Health check per-request. |
| Cross-client data leakage | Low | Critical | Three-level memory scoping. All queries workspace-scoped. RBAC enforced on every tool call. |
| White-label prompt abuse | Low | Medium | Blocklist validation. Core instructions non-overridable. Test button before save. |
| Voice input accuracy | Medium | Low | Speech-to-text shown in input field first. User can edit before sending. No blind execution. |

---

## 13. Competitive Analysis

| Platform | AI Assistant | What Cortex Does Better |
|---|---|---|
| **HubSpot Breeze** | Single-feature AI (write email, summarize) | Multi-feature orchestration — one prompt, entire campaign |
| **Jasper** | Content generation only | Content + scheduling + email + ads + analytics in one flow |
| **GoHighLevel** | Basic AI chat for lead nurture | Full marketing stack awareness — not just CRM |
| **Hootsuite OwlyWriter** | Social copy suggestions | Cross-platform campaign planning + execution |
| **Salesforce Einstein** | CRM-focused insights | Marketing-specific with agency multi-client support |

**Cortex's moat:** No competitor has a conversational interface that orchestrates content creation, multi-platform publishing, email campaigns, ad management, analytics, and client reporting in a single natural language flow. They all do one or two of these; Cortex does all of them because it sits on top of a complete platform. Add voice input + white-label + client portal access, and no competing product comes close.

---

## 14. Resolved Design Decisions

All 22 decisions from the design review session:

| # | Topic | Decision |
|---|---|---|
| 1 | Tool execution | Hybrid — direct service for reads, API routes for writes |
| 2 | Streaming protocol | SSE + REST (POST → SSE response stream) |
| 3 | UI surface | Two modes — Cmd+K quick commands + floating chat panel |
| 4 | Context assembly | Two-pass intent routing — fast Sonnet classify, then targeted context |
| 5 | Campaign execution | Sync <30s / <5 steps, background handoff for longer |
| 6 | Error handling | Fail fast + keep completed, dependency-aware skip option |
| 7 | Multi-client queries | Aggregation tools (real-time) + nightly rollup (trends) |
| 8 | Approval workflows | Cortex follows RBAC — same rules as UI, never bypasses |
| 9 | Cost control | Dual-layer — action credits (UX) + token budgets (system) |
| 10 | Memory scoping | Three-level — workspace / client / user+client |
| 11 | White-label | Three tiers — Basic (cosmetic), Advanced (guided), Expert (raw prompt) |
| 12 | Mobile UX | Full-screen takeover, Cmd+K disabled |
| 13 | Audit trail | `via: "cortex"` + `cortexSessionId` flag on human actor |
| 14 | Outage handling | Tiered degradation — full AI → Sonnet → slash commands → error |
| 15 | Voice input | Included — Web Speech API, speech-to-text-first, zero cost |
| 16 | Analytics visuals | Text summary default + "Show chart" expand button |
| 17 | Client portal | Full Cortex with RBAC restrictions, toggle per client |
| 18 | Onboarding | Tooltips (skippable) + interactive self-guided tutorial |
| 19 | Session history | Tab in chat panel (recent 10) + `/dashboard/cortex` full page |
| 20 | Usage dashboard | Full breakdown by day/member/client/tool + projections + per-user limits + CSV |
| 21 | Session export | PDF (branded/white-label) + Markdown + shareable link (7-day expiry) |
| 22 | Feedback loop | 👍/👎 + reason dropdown + auto-learning memory from patterns |

---

## 15. Appendix: Tool Catalog (v1)

### Read Tools — Phase 11A (Direct Service Calls)
```
analytics.overview       — Get workspace/client analytics summary
analytics.compare        — Compare two time periods
analytics.compareClients — Cross-client performance comparison
content.list             — List recent content drafts
content.get              — Get specific draft details
calendar.upcoming        — List upcoming scheduled posts
leads.list               — List leads with filters
leads.get                — Get lead details
clients.list             — List agency clients
clients.health           — Get client health scores
clients.rankByMetric     — Rank all clients by a metric
seo.keywords             — Research keywords
hashtags.trending        — Get trending hashtags
listening.mentions       — Get recent brand mentions
team.list                — List team members
workspace.info           — Get workspace details
```

### Write Tools — Phase 11B (API Route Calls)
```
content.create           — Generate content draft (Claude AI)
content.score            — Score content for SEO/readability
content.repurpose        — Repurpose content for another platform
publish.schedule         — Schedule content for publishing
publish.now              — Publish content immediately
email.create             — Create email campaign
email.schedule           — Schedule email send
images.generate          — Generate AI image
leads.update             — Update lead stage/assignee
leads.enrich             — Trigger lead enrichment
briefs.create            — Create content brief
reports.generate         — Generate client report
reports.send             — Send report to client
links.create             — Create short link with UTM
```

### Orchestration Tools — Phase 11C
```
campaign.plan            — Generate multi-step campaign plan
campaign.execute         — Execute approved campaign plan
campaign.track           — Set up tracking for campaign
audience.segment         — Create audience segment
abtest.create            — Set up A/B test
workflow.trigger         — Trigger automation workflow
```

---

*This PRD is a living document. Version 2.0 — all 22 design decisions locked.*
*Last updated: 2026-04-05.*
*Next step: Implementation of Phase 11A.*
