"""AI-powered reflection and briefing using the Claude API."""

import os

import anthropic

MODEL = "claude-haiku-4-5-20251001"


def _client() -> anthropic.Anthropic:
    return anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])


def generate_weekly_reflection(
    slots_data: list[dict],
    events_data: list[dict],
    prev_reflection: str = "",
) -> str:
    """Generate a 3–5 sentence weekly reflection with suggestions.

    Args:
        slots_data: List of active slot items from Notion (name, slot, status, notes).
        events_data: List of completed GCal events from last week.
        prev_reflection: Previous week's reflection text for continuity.

    Returns:
        Reflection string to write back to Notion's Weekly Plans 'Reflection' field.
    """
    slots_text = "\n".join(
        f"- {s['slot']}: {s['name']} (status: {s['status']}, next: {s.get('next_action', 'N/A')})"
        for s in slots_data
    ) or "No active slots found."

    events_text = "\n".join(
        f"- {e['summary']} ({e.get('start', 'unknown time')})"
        for e in events_data
    ) or "No events found for last week."

    prev_text = f"\n\nPrevious week's reflection:\n{prev_reflection}" if prev_reflection else ""

    prompt = f"""You are a personal productivity coach helping someone who uses the 3-Slot Methodology (GTD + על זה principles).

Current active 3 slots (projects):
{slots_text}

Google Calendar events completed last week:
{events_text}{prev_text}

Write a brief, honest, and encouraging weekly reflection in 3–5 sentences covering:
1. What went well or was accomplished
2. What was skipped or needs attention
3. One concrete recommendation for next week (slot swap, time block adjustment, or focus tip)

Be direct and practical. Write in second person ("You..."). Keep it under 200 words."""

    message = _client().messages.create(
        model=MODEL,
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text.strip()


def generate_daily_note(
    slots_data: list[dict],
    todays_events: list[dict],
) -> str:
    """Generate a short 2-sentence daily briefing note.

    Args:
        slots_data: Active Notion slots.
        todays_events: Today's Google Calendar events.

    Returns:
        Short briefing string to append as a Note to each active slot.
    """
    slots_text = "\n".join(
        f"- {s['slot']}: {s['name']}"
        for s in slots_data
    ) or "No active slots."

    events_text = "\n".join(
        f"- {e['summary']} ({e.get('start', '')})"
        for e in todays_events
    ) or "No events today."

    prompt = f"""You are a personal productivity coach. Based on today's schedule and active projects, write exactly 2 sentences:
1. A quick observation about how today's calendar aligns with the 3 slots.
2. One actionable tip or reminder for today.

Active slots:
{slots_text}

Today's calendar events:
{events_text}

Be concise and practical. Write in second person. Max 60 words total."""

    message = _client().messages.create(
        model=MODEL,
        max_tokens=100,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text.strip()
