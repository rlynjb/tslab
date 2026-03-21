# Chat Question Tracker — Phased Plan

A tool that captures questions from Twitch chat so streamers don't miss them.

---

## Phase 1: MVP (Current)

**Status**: Built

**Architecture**: Fully client-side. EventSub WebSocket runs in the browser, no backend, no database.

**Distribution**: Standalone web app (browser tab or OBS browser source)

**Stack**: Next.js (static export), Twitch EventSub WebSocket, Zustand, Tailwind, Netlify

### Chat Connection: EventSub WebSocket (not tmi.js)

The plan uses Twitch's **EventSub WebSocket** instead of tmi.js/IRC:
- tmi.js relies on IRC, which Twitch is migrating away from
- EventSub (`channel.chat.message`) is the modern, supported approach
- **Trade-off**: requires Twitch OAuth (no anonymous read-only access) — users must log in via Twitch
- Client-side WebSocket to `wss://eventsub.wss.twitch.tv/ws`
- Limit: 3 WebSocket connections per user token

### Features

- Connect to any Twitch channel via OAuth (Twitch login required)
- Detect questions (messages containing "?")
- Filter pipeline: bot commands, spam/duplicates, low-quality messages
- Dashboard with pending/answered/dismissed queue
- Filter toggles (commands, spam, quality)
- localStorage persistence (survives tab refresh)
- Mock mode for testing without a live stream

### Project Structure

```
src/
├── app/
│   ├── page.tsx                # Landing: channel input + Twitch OAuth
│   └── dashboard/page.tsx      # Question queue dashboard
├── lib/
│   ├── twitch/
│   │   ├── client.ts           # EventSub WebSocket browser wrapper
│   │   ├── auth.ts             # Twitch OAuth (PKCE flow)
│   │   └── mock.ts             # Fake message generator
│   ├── questions/
│   │   ├── types.ts            # Interfaces
│   │   ├── detector.ts         # "?" detection
│   │   └── store.ts            # Zustand store
│   └── filters/
│       ├── commands.ts         # Bot/command filter
│       ├── spam.ts             # Duplicate/rate-limit filter
│       └── quality.ts          # Min length/word filter
├── hooks/
│   └── useTwitchChat.ts        # Glue: EventSub → filters → store
└── components/
    ├── QuestionCard.tsx
    ├── QuestionQueue.tsx
    └── ConnectionPanel.tsx
```

---

## Phase 2: AI + Backend

**Goal**: Add AI-powered question clustering and build the backend server that enables Twitch Extension distribution.

### Architecture

```
Twitch EventSub → Backend Server (EBS) → Frontend
                   │                       │
                   ├── EventSub WebSocket   ├── Standalone dashboard (existing)
                   ├── Question detection    └── Twitch Extension panel (new)
                   ├── AI clustering
                   ├── Extension PubSub (pushes to extension)
                   └── Config Service (per-channel settings)
```

### Features

- Backend server / EBS (Node.js on Railway/Fly.io)
- EventSub WebSocket subscription to `channel.chat.message` (server-side)
- AI question classification (replace simple "?" detection)
- Question clustering — group similar questions together
- Chat summary — top questions with counts
- Twitch OAuth (already in place from Phase 1)
- Extension PubSub integration (push updates to extension frontend)
- Twitch Configuration Service for per-channel streamer preferences (5 KB, Twitch-hosted)

### Twitch Platform Services Used

| Service | Hosted by | Purpose |
|--|--|--|
| **EventSub WebSocket** | Twitch | Real-time chat messages (`channel.chat.message`) |
| **Extension PubSub** | Twitch | Push question updates from EBS → extension frontend |
| **Configuration Service** | Twitch | Per-channel settings (filter prefs, thresholds) — 5 KB limit |
| **EBS** | Self-hosted | Chat processing, AI pipeline, PubSub relay |

### Why a Backend Now

The backend serves two purposes:
1. **AI features** — clustering/summarization requires server-side API calls
2. **Twitch Extension support** — extensions run in a sandboxed iframe and cannot open their own EventSub connections; the backend becomes the EBS that reads chat and relays data via Extension PubSub

### What Carries Over from Phase 1

- Filter logic (commands, spam, quality) → moves to backend
- Question types and store interface → shared types
- Dashboard UI → stays as standalone option
- EventSub connection logic → reused server-side (same API, different transport context)
- Mock system → useful for backend testing

---

## Phase 3: Twitch Extension + Chat Copilot

**Goal**: Distribute through Twitch platform and expand to a full Chat Copilot product.

### Twitch Extension

Extensions are embedded directly in the Twitch channel page (no separate tab needed).

**Type**: Panel Extension (renders below the video player)

**How it works**:
1. Backend (EBS) subscribes to `channel.chat.message` via EventSub WebSocket
2. EBS runs filter pipeline + AI clustering
3. EBS pushes question data to extension frontend via Extension PubSub
4. Panel displays the question queue — streamer manages from there
5. Viewers can interact (upvote questions, see answered ones)
6. Per-channel settings stored in Twitch Configuration Service (broadcaster segment)

**Requirements**:
- Twitch developer account + registered app
- Frontend assets hosted on Twitch CDN (upload as zip)
- Twitch review process (~3 business days per version)
- EBS must handle JWT auth from Twitch Extension Helper (`window.Twitch.ext.onAuthorized`)

**Constraints**:
- Extension runs in sandboxed iframe (strict CSP)
- Cannot open EventSub connections from the extension — must go through EBS
- Panel extensions don't show on mobile
- Extension PubSub has rate limits — batch question updates

### Channel Points Integration

Create an **"Ask a Question"** Channel Points Custom Reward:
- Viewers spend channel points to submit a question — acts as a built-in priority/filter mechanism
- These appear in the channel points redemption queue AND get picked up by the EBS
- Requires `channel:manage:redemptions` scope
- Only available to Affiliates/Partners
- Complementary to passive chat scanning — premium question path alongside free detection

### Polls Integration

Use the **Twitch Polls API** to let viewers vote on which question gets answered next:
- EBS creates a poll with top clustered questions as options
- Requires `channel:manage:polls` scope
- Only available to Affiliates/Partners

### Chat Copilot Features

- Question queue with AI prioritization
- Channel Points "Ask a Question" reward (priority queue)
- Polls for viewer-voted question selection
- Chat summary (real-time topic tracking)
- Sentiment detection (chat mood shifts)
- Highlight moments (detect hype/engagement spikes)
- Streamer-facing vs viewer-facing views

### Monetization

- **Twitch Bits**: Built-in, 80% to broadcaster / 20% to developer
- **Subscription gating**: Premium features for subscribers
- **Standalone SaaS**: $8–$15/month for advanced features
- Both Twitch Extension and standalone can coexist

---

## Distribution Comparison

| | Standalone (Phase 1) | Twitch Extension (Phase 3) |
|--|--|--|
| **Setup** | Visit a URL | Install from Twitch extension directory |
| **UX** | Separate browser tab | Built into the Twitch page |
| **Cost to run** | Free (static site) | Backend server hosting |
| **Monetization** | DIY | Bits integration |
| **Mobile** | Works in browser | Panel doesn't show on mobile |
| **Viewer interaction** | None | Upvoting, visibility |
| **Approval** | None | Twitch review required |

---

## Twitch Platform Integration Summary

**No native Q&A feature exists on Twitch** — this is a clear gap in the ecosystem. The plan leverages these Twitch-hosted services to minimize self-hosted infrastructure:

| What Twitch Provides | What You Self-Host |
|--|--|
| EventSub WebSocket (chat delivery) | EBS server (Node.js on Railway/Fly.io) |
| Extension PubSub (EBS → frontend push) | AI pipeline (classification, clustering) |
| Configuration Service (per-channel settings) | Question queue state (in-memory or lightweight DB) |
| Extension CDN (frontend hosting) | |
| OAuth / JWT auth infrastructure | |
| Channel Points, Polls APIs | |

---

## Key Takeaway

The phases build on each other — nothing is throwaway:

```
Phase 1 (standalone MVP)
   └── core logic (filters, detector, UI)
   └── EventSub WebSocket + OAuth (carries forward)

Phase 2 (backend + AI)
   └── reuses Phase 1 logic on server
   └── enables both AI features AND Twitch Extension
   └── leverages Twitch Config Service + Extension PubSub

Phase 3 (Twitch Extension + Copilot)
   └── second frontend for the same backend
   └── standalone and extension coexist
   └── Channel Points + Polls for deeper Twitch integration
```
