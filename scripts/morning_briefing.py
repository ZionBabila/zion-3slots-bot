"""Morning briefing: combine today's Google Calendar events with active Notion slots.

Sends an NTFY notification and appends a short AI-generated note to each active slot.
"""

import sys
from pathlib import Path

# Allow imports from scripts/ without installing the package
sys.path.insert(0, str(Path(__file__).parent))

from utils import gcal, notion, ntfy
from ai_reflection import generate_daily_note


def format_time(dt_str: str) -> str:
    """Convert ISO datetime string to HH:MM format."""
    if not dt_str or "T" not in dt_str:
        return dt_str or "all day"
    time_part = dt_str.split("T")[1][:5]
    return time_part


def run():
    print("[morning_briefing] Fetching today's Google Calendar events...")
    try:
        events = gcal.get_todays_events()
    except Exception as exc:
        print(f"[morning_briefing] Error fetching GCal events: {exc}")
        events = []

    print("[morning_briefing] Fetching active Notion slots...")
    try:
        slots = notion.get_active_slots()
    except Exception as exc:
        print(f"[morning_briefing] Error fetching Notion slots: {exc}")
        slots = []

    # Format events for notification
    if events:
        event_lines = [f"• {e['summary']} @ {format_time(e['start'])}" for e in events]
        events_section = "\n".join(event_lines)
    else:
        events_section = "• No events scheduled"

    # Format slots for notification
    if slots:
        slot_lines = [
            f"{s['slot']}: {s['name']}"
            for s in slots
        ]
        slots_section = "\n".join(slot_lines)
    else:
        slots_section = "No active slots — time to plan!"

    message = f"📅 Today's Calendar:\n{events_section}\n\n🎯 Your 3 Slots:\n{slots_section}"

    print("[morning_briefing] Sending morning NTFY notification...")
    ntfy.send(
        title="☀️ Morning Briefing",
        message=message,
        priority="high",
        tags=["calendar", "brain"],
    )
    print("[morning_briefing] Morning notification sent.")

    # Generate and append AI daily note to each active slot
    if slots:
        print("[morning_briefing] Generating AI daily note...")
        try:
            daily_note = generate_daily_note(slots, events)
            print(f"[morning_briefing] AI note: {daily_note}")
            for slot in slots:
                notion.append_note(slot["id"], slot.get("notes", ""), f"[Morning Note] {daily_note}")
            print("[morning_briefing] AI note appended to active slots.")
        except Exception as exc:
            print(f"[morning_briefing] AI note skipped: {exc}")


if __name__ == "__main__":
    run()
