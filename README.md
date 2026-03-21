# Chat Question Tracker for Twitch

A tool that captures questions from Twitch chat so streamers don't miss them. Detects questions, filters noise (bots, spam, low-quality), and presents a manageable queue.

**Current phase**: MVP (Phase 1) — fully client-side, no backend.

See [PLAN.md](PLAN.md) for the full roadmap and [LEARNING.md](LEARNING.md) for the technical learning guide.

---

## Getting Started

### Prerequisites

- **Node.js 20+** — [Download](https://nodejs.org/) or install via `nvm install 20`
- **npm** (comes with Node.js)
- **Git** — [Download](https://git-scm.com/)

### Install and Run

```bash
git clone <your-repo-url>
cd ts-cqt
npm install
npm run dev
```

Open http://localhost:3000. That's it — the app runs locally.

### Test Without Twitch (Mock Mode)

You don't need a Twitch account to test the app. On the landing page, click **Mock Mode**. This generates fake chat messages with a mix of questions, commands, spam, and normal messages so you can see the full filter pipeline and dashboard in action.

---

## Twitch Setup (When You're Ready)

### Step 1: Create a Twitch Account

1. Go to https://www.twitch.tv and sign up (free)
2. Verify your email

### Step 2: Register a Developer Application

You need this to get API credentials (Client ID) for connecting to Twitch chat.

1. Go to https://dev.twitch.tv and log in with your Twitch account
2. Click your avatar (top right) → **Developer Console**
3. Go to **Applications** → **Register Your Application**
4. Fill in:
   - **Name**: Anything (e.g. "Chat Question Tracker Dev")
   - **OAuth Redirect URLs**: `http://localhost:3000` (for local dev)
   - **Category**: Chat Bot
5. Click **Create**
6. Click **Manage** on your new app to see your **Client ID**
7. Copy the Client ID — you'll need it in your app's environment config

### Step 3: Understand Twitch Auth (OAuth)

Twitch uses OAuth 2.0. For a browser-based app, you'll use the **Implicit Grant Flow** (Phase 1) or **Authorization Code + PKCE** (Phase 2+).

```
User clicks "Connect with Twitch"
    │
    ▼
Browser redirects to Twitch login page
    │
    ▼
User authorizes your app
    │
    ▼
Twitch redirects back to your app with an access token
    │
    ▼
Your app uses the token to connect to chat
```

**Scopes you'll need**:

| Scope | What it does | When |
|--|--|--|
| `user:read:chat` | Read chat messages via EventSub | Phase 1+ |
| `channel:manage:redemptions` | Create Channel Points rewards | Phase 3 |
| `channel:manage:polls` | Create polls | Phase 3 |

Twitch OAuth docs: https://dev.twitch.tv/docs/authentication/

### Step 4: Connect to a Live Channel

1. Start the app (`npm run dev`)
2. Enter a channel name (any public Twitch channel)
3. The app connects via tmi.js (Phase 1) and starts capturing messages
4. Questions appear in the dashboard as they come in

**Tip**: To test with a live chat, pick a large channel (thousands of viewers) — they'll have constant message flow. Smaller channels may have long gaps between messages.

---

## Testing Before Twitch Marketplace

The Twitch Extension marketplace has a review process. Here's what to do at each stage.

### Local Development Testing

What you're doing now. No Twitch approval needed.

```
npm run dev                    # Start the dev server
```

- Use **Mock Mode** to test filters, UI, and question lifecycle
- Connect to real channels to test live chat parsing
- Test with different channel sizes (quiet vs active)

### Twitch Extension Testing (Phase 3)

Before submitting to the marketplace, Twitch lets you test your extension on your own channel.

#### 1. Create the Extension on Twitch

1. Go to https://dev.twitch.tv/console → **Extensions** → **Create Extension**
2. Fill in:
   - **Name**: Chat Question Tracker
   - **Type**: Panel (renders below the video player)
   - **Panel viewer path**: `panel.html`
   - **Summary / Description**: Short explanation of what it does
3. Click **Create Extension Version**

#### 2. Hosted Test (on your channel)

Twitch provides a **Hosted Test** mode — your extension runs only on your channel, visible only to you and allowlisted users.

1. In the Extension Developer Console, go to **Asset Hosting**
2. Upload your built frontend as a zip file:
   ```bash
   npm run build
   # zip the output directory
   ```
3. Go to **Status** → **Hosted Test**
4. Go to your Twitch channel → **Creator Dashboard** → **Extensions**
5. Find your extension → **Activate** → choose a panel slot
6. Visit your channel page — your extension appears below the video

#### 3. Invite Testers

In the Extension Console under **Access**, add Twitch usernames of people who can see and test your extension in Hosted Test mode. They visit your channel and interact with the panel.

#### 4. Test Checklist Before Marketplace Submission

| Test | What to verify |
|--|--|
| **Panel renders** | Extension loads in the iframe without errors |
| **Auth works** | `window.Twitch.ext.onAuthorized` fires, JWT is valid |
| **EBS connection** | Extension communicates with your backend |
| **PubSub receives** | Question updates appear in real-time |
| **Config Service** | Per-channel settings save and load |
| **CSP compliance** | No blocked resources in browser console (strict iframe sandbox) |
| **Error states** | Graceful handling when EBS is down, token expires, etc. |
| **Performance** | Panel renders quickly, no memory leaks over time |
| **Mobile** | Panel extensions don't show on mobile — verify fallback messaging |

#### 5. Twitch Review Submission

1. In the Extension Console → **Submit for Review**
2. Provide:
   - Description and screenshots
   - Privacy policy URL
   - Link to your EBS (must be live and reachable)
   - Testing instructions for the Twitch review team
3. Review takes **~3 business days** per version
4. Common rejection reasons:
   - Broken functionality
   - Missing error handling
   - Policy violations (data collection without disclosure)
   - Assets not loading from Twitch CDN

Twitch Extension docs: https://dev.twitch.tv/docs/extensions/

---

## Project Scripts

```bash
npm run dev       # Start development server (http://localhost:3000)
npm run build     # Build for production (static export)
npm run start     # Serve production build locally
npm run lint      # Run ESLint
```

## Tech Stack

- **Next.js 16** — React framework (static export)
- **React 19** — UI
- **TypeScript 5** — Type safety
- **tmi.js** — Twitch chat connection (Phase 1, migrating to EventSub in Phase 2)
- **Zustand 5** — State management with localStorage persistence
- **Tailwind CSS 4** — Styling
