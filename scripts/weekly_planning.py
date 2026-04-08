"""Weekly planning: auto-generate a Notion weekly plan from Google Calendar + AI reflection."""

import sys
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from utils import gcal, notion, ntfy
from ai_reflection import generate_weekly_reflection


def next_monday() -> datetime:
    today = datetime.utcnow()
    days_until_monday = (7 - today.weekday()) % 7 or 7
    return (today + timedelta(days=days_until_monday)).replace(
        hour=0, minute=0, second=0, microsecond=0
    )


def run():
    print("[weekly_planning] Sending weekly planning notification...")
    ntfy.send(
        title="📋 Weekly Planning",
        message=(
            "Time for your Sunday 07:00 weekly planning!\n\n"
            "Review last week's 3 slots, assess what worked, plan next week's slots "
            "based on priorities, move items as needed, and check your GTD and על זה principles."
        ),
        priority="high",
        tags=["calendar", "white_check_mark"],
    )

    week_start = next_monday()
    print(f"[weekly_planning] Planning week starting {week_start.strftime('%Y-%m-%d')}...")

    print("[weekly_planning] Fetching next week's GCal events...")
    try:
        events = gcal.get_weeks_events(week_start)
        hours_available = gcal.calculate_available_hours(week_start)
    except Exception as exc:
        print(f"[weekly_planning] Error fetching GCal events: {exc}")
        events = []
        hours_available = None

    print("[weekly_planning] Fetching active Notion slots...")
    try:
        slots = notion.get_active_slots()
    except Exception as exc:
        print(f"[weekly_planning] Error fetching Notion slots: {exc}")
        slots = []

    # Get or create the weekly plan entry
    existing_plan = None
    try:
        existing_plan = notion.get_weekly_plan(week_start)
    except Exception as exc:
        print(f"[weekly_planning] Error fetching existing plan: {exc}")

    slot_page_ids = [s["id"] for s in slots[:3]]

    if existing_plan:
        plan_id = existing_plan["id"]
        prev_reflection = existing_plan.get("reflection", "")
        print(f"[weekly_planning] Found existing plan (id={plan_id}), updating...")
    else:
        prev_reflection = ""
        print("[weekly_planning] Creating new weekly plan entry in Notion...")
        try:
            plan_id = notion.create_weekly_plan(
                week_start=week_start,
                hours_available=hours_available,
                slot_page_ids=slot_page_ids,
            )
            print(f"[weekly_planning] Created weekly plan (id={plan_id}).")
        except Exception as exc:
            print(f"[weekly_planning] Error creating weekly plan: {exc}")
            plan_id = None

    # Generate AI weekly reflection
    if plan_id:
        try:
            print("[weekly_planning] Generating AI weekly reflection...")
            reflection = generate_weekly_reflection(slots, events, prev_reflection)
            print(f"[weekly_planning] AI reflection: {reflection}")
            notion.update_weekly_reflection(plan_id, reflection)
            print("[weekly_planning] Reflection written to Notion.")
        except Exception as exc:
            print(f"[weekly_planning] AI reflection skipped: {exc}")
            reflection = ""
    else:
        reflection = ""

    # Build summary notification
    slot_summary = " | ".join(
        f"{s['slot']}: {s['name']}"
        for s in slots
    ) or "No active slots"

    hours_text = f"{hours_available:.0f}h available" if hours_available else ""
    week_label = week_start.strftime("%B %-d")

    summary = f"Week of {week_label}: {slot_summary}"
    if hours_text:
        summary += f"\n📅 {len(events)} events, {hours_text} free"
    if reflection:
        # Truncate for NTFY (max ~500 chars works well)
        short_reflection = reflection[:250] + ("..." if len(reflection) > 250 else "")
        summary += f"\n\n💡 {short_reflection}"

    ntfy.send(
        title="🗓️ Weekly Plan Ready",
        message=summary,
        priority="default",
        tags=["spiral_notepad"],
    )
    print("[weekly_planning] Done.")


if __name__ == "__main__":
    run()
