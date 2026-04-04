# 🎯 Zion 3-Slots Bot

Automated time management system combining **Google Calendar**, **Notion**, and **Claude AI** with NTFY push notifications. Built on the 3-Slot Methodology + GTD + על זה principles.

## What It Does

| Feature | How |
|---|---|
| 📅 **Morning briefing** | Daily 06:00 — combines today's Google Calendar events with your active Notion slots + AI tip |
| 🔄 **Notion → GCal sync** | Every 15 min — tasks you schedule in Notion automatically appear in Google Calendar |
| ✅ **Auto-complete sync** | Check ✅ Done in Notion → GCal event is updated automatically |
| 🌙 **Evening review** | Daily 20:00 — NTFY prompt + auto-marks completed calendar events in Notion |
| 🗓️ **Weekly planning** | Every Sunday 07:00 — auto-creates weekly plan in Notion with AI reflection |
| 💡 **AI reflection** | Claude Haiku analyzes your week and writes a personalized reflection to Notion |

## Architecture

```
Notion (source of truth)
  ↕ every 15 min via GitHub Actions
Google Calendar (time-blocked schedule)
  ↓ notifications
NTFY (push to iPhone/desktop)
  ↑ AI insights
Claude API (reflection & daily notes)
```

## Notion Database Setup

### 1. Primary DB: `🎯 3 סלוטים — זה הכל`

Add these properties to your existing board (or create a new database):

| Property | Type | Purpose |
|---|---|---|
| `Name` | Title | Task/project name |
| `Done` | Checkbox | Check to mark complete |
| `Slot` | Select | `Slot 1 - פרנסה` / `Slot 2 - בנייה` / `Slot 3 - חקירה` / `Parking Lot` |
| `Status` | Select | `Active` / `Paused` / `Blocked` / `Completed` / `Idea` |
| `Scheduled Time` | Date | **Set this** to automatically create a Google Calendar event |
| `Duration (min)` | Number | Event length (default: 60 min) |
| `GCal Event ID` | Rich Text | Filled automatically by the bot |
| `Next Action` | Rich Text | GTD-style next action |
| `Notes` | Rich Text | AI notes are appended here |
| `Week` | Date | ISO week start for grouping |

### 2. Secondary DB: `Weekly Plans` (create new)

| Property | Type |
|---|---|
| `Name` | Title |
| `Week Start` | Date |
| `Slot 1 Project` | Relation → 3-Slots board |
| `Slot 2 Project` | Relation → 3-Slots board |
| `Slot 3 Project` | Relation → 3-Slots board |
| `Weekly Goal` | Rich Text |
| `Reflection` | Rich Text (written by Claude AI) |
| `Calendar Hours Available` | Number |

## One-Time Setup

### Step 1 — Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project → Enable **Google Calendar API**
3. Credentials → **Create Credentials** → **OAuth 2.0 Client ID** → Desktop App
4. Download the JSON file and save it as `credentials.json` in the repo root
5. Add `credentials.json` to `.gitignore` immediately
6. Run the setup script:
   ```bash
   pip install google-auth-oauthlib
   python setup/get_google_token.py
   ```
7. A browser window opens → sign in → grant access
8. Copy the printed values (see Step 3)
9. **Delete** `credentials.json` from your machine: `rm credentials.json`

### Step 2 — Notion Integration

1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Click **New integration** → give it a name (e.g. "Zion 3-Slots Bot")
3. Copy the **Internal Integration Token**
4. Open your **3-Slots planning board** in Notion → ••• menu → **Connections** → add your integration
5. Open (or create) the **Weekly Plans** database → same step
6. Copy the database IDs from the page URLs:
   - URL format: `https://notion.so/workspace/DATABASE_ID?v=...`
   - The ID is the 32-character hex string before the `?`

### Step 3 — Anthropic API Key

1. Go to [console.anthropic.com/api-keys](https://console.anthropic.com/api-keys)
2. Create a new API key

### Step 4 — Add GitHub Secrets

Go to your repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret Name | Value |
|---|---|
| `GOOGLE_CLIENT_ID` | From Step 1 output |
| `GOOGLE_CLIENT_SECRET` | From Step 1 output |
| `GOOGLE_REFRESH_TOKEN` | From Step 1 output |
| `GOOGLE_CALENDAR_ID` | `primary` (or your Gmail address) |
| `NOTION_TOKEN` | From Step 2 |
| `NOTION_DATABASE_ID` | 3-Slots board database ID |
| `NOTION_WEEKLY_DB_ID` | Weekly Plans database ID |
| `ANTHROPIC_API_KEY` | From Step 3 |

### Step 5 — Subscribe to NTFY

- **iPhone/Android:** Download NTFY app → subscribe to `zion-3slots`
- **Desktop/Web:** Visit [ntfy.sh/zion-3slots](https://ntfy.sh/zion-3slots) → enable notifications

## Workflow Schedules

| Workflow | Schedule | What It Does |
|---|---|---|
| `morning-briefing.yml` | 06:00 Israel (04:00 UTC) daily | Fetch calendar + slots → NTFY + AI note |
| `notion-to-gcal-sync.yml` | Every 15 minutes | Notion tasks → GCal events (and Done updates) |
| `daily-evening-review.yml` | 20:00 Israel (18:00 UTC) daily | NTFY prompt + sync completed events to Notion |
| `weekly-sunday-planning.yml` | 07:00 Israel (05:00 UTC) Sundays | Generate Notion weekly plan + AI reflection |

## How to Use It

**Daily workflow:**
1. Open Notion → add a task to your 3-Slots board
2. Set **Scheduled Time** (date + time) → the bot creates a Google Calendar event within 15 min
3. Work on the task → when done, check ✅ **Done** in Notion → GCal event is updated
4. At 06:00 → get a morning briefing with today's calendar + your 3 active slots
5. At 20:00 → get an evening review prompt + sync summary

**Weekly workflow:**
1. Every Sunday 07:00 → receive weekly planning notification
2. A new entry is auto-created in your **Weekly Plans** Notion DB
3. Claude AI writes a reflection based on last week's progress
4. Review and update your 3 active slots for the new week

## Methodology

**3-Slot Constraint**
- **Slot 1**: Money/Revenue (פרנסה)
- **Slot 2**: Build/Completion (בנייה)
- **Slot 3**: Explore/Learning (חקירה)
- **Parking Lot**: Ideas waiting to be activated
- Maximum 3 active projects at once

**GTD (Getting Things Done)** by David Allen
- Capture, Clarify, Organize, Reflect, Engage

**על זה** (Yair Yona's Self-Management)
- כבישת הזמן (Time blocking), אחריות רדיקלית (Radical accountability), חמלה רדיקלית (Radical compassion)

## Testing

Run any workflow manually from the **Actions** tab → select workflow → **Run workflow**.

To test locally:
```bash
pip install -r requirements.txt
export GOOGLE_CLIENT_ID=...  # set all 8 secrets as env vars
python scripts/morning_briefing.py
```

## Notes

- **Reliability:** GitHub Actions can have 5-10 minute delays; the 15-min sync may occasionally be 20-25 min
- **Privacy:** NTFY messages are not encrypted — avoid sending sensitive data in task names
- **Timezone:** All crons use UTC. Israel is UTC+2 (winter) / UTC+3 (DST). Set `ISRAEL_UTC_OFFSET` env var to `3` during daylight saving time if needed
- **GCal Event ID field:** Do not edit this field manually — it's managed by the bot
