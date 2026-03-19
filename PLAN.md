# Chat Question Tracker — Phased Plan

A tool that captures questions from Twitch chat so streamers don't miss them.

---

## Phase 1: MVP (Current)

**Status**: Built

**Architecture**: Fully client-side. tmi.js runs in the browser, no backend, no database.

**Distribution**: Standalone web app (browser tab or OBS browser source)

**Stack**: Next.js (static export), tmi.js, Zustand, Tailwind, Netlify

### Features

- Connect to any Twitch channel anonymously (read-only)
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
│   ├── page.tsx                # Landing: channel input
│   └── dashboard/page.tsx      # Question queue dashboard
├── lib/
│   ├── twitch/
│   │   ├── client.ts           # tmi.js browser wrapper
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
│   └── useTwitchChat.ts        # Glue: tmi.js → filters → store
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
Twitch Chat → Backend Server (EBS) → Frontend
               │                       │
               ├── tmi.js (IRC)        ├── Standalone dashboard (existing)
               ├── Question detection   └── Twitch Extension panel (new)
               ├── AI clustering
               └── Twitch PubSub (pushes to extension)
```

### Features

- Backend server (Node.js on Railway/Fly.io/Render)
- AI question classification (replace simple "?" detection)
- Question clustering — group similar questions together
- Chat summary — top questions with counts
- Twitch OAuth (needed for authenticated API access)
- Twitch PubSub integration (push updates to extension frontend)

### Why a Backend Now

The backend serves two purposes:
1. **AI features** — clustering/summarization requires server-side API calls
2. **Twitch Extension support** — extensions cannot connect to IRC from the iframe; the backend becomes the Extension Backend Service (EBS) that reads chat and relays data via PubSub

### What Carries Over from Phase 1

- Filter logic (commands, spam, quality) → moves to backend
- Question types and store interface → shared types
- Dashboard UI → stays as standalone option
- Mock system → useful for backend testing

---

## Phase 3: Twitch Extension + Chat Copilot

**Goal**: Distribute through Twitch platform and expand to a full Chat Copilot product.

### Twitch Extension

Extensions are embedded directly in the Twitch channel page (no separate tab needed).

**Type**: Panel Extension (renders below the video player)

**How it works**:
1. Backend (EBS) connects to streamer's chat via EventSub/IRC
2. EBS filters and clusters questions
3. EBS pushes question data to extension frontend via Twitch PubSub
4. Panel displays the question queue — streamer manages from there
5. Viewers could interact (upvote questions, see answered ones)

**Requirements**:
- Twitch developer account + registered app
- Frontend assets hosted on Twitch CDN (upload as zip)
- Twitch review process (~3 business days per version)
- EBS must handle JWT auth from Twitch Extension Helper

**Constraints**:
- Extension runs in sandboxed iframe (strict CSP)
- Cannot use tmi.js in the extension — must go through EBS
- Panel extensions don't show on mobile
- PubSub has rate limits — batch question updates

### Chat Copilot Features

- Question queue with AI prioritization
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

## Key Takeaway

The phases build on each other — nothing is throwaway:

```
Phase 1 (standalone MVP)
   └── core logic (filters, detector, UI)

Phase 2 (backend + AI)
   └── reuses Phase 1 logic on server
   └── enables both AI features AND Twitch Extension

Phase 3 (Twitch Extension + Copilot)
   └── second frontend for the same backend
   └── standalone and extension coexist
```
