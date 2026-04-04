"""Evening review: send planning prompt via NTFY and sync completed GCal events to Notion."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from utils import gcal, notion, ntfy
from ai_reflection import generate_daily_note


def run():
    print("[evening_review] Sending evening review notification...")
    ntfy.send(
        title="🌙 Evening Review",
        message=(
            "Time for your 20:00 planning review!\n\n"
            "1. What did you accomplish today?\n"
            "2. What are tomorrow's 3 slots?\n"
            "3. Any slot swaps needed?"
        ),
        priority="high",
        tags=["clipboard", "moon"],
    )

    print("[evening_review] Fetching today's GCal events...")
    try:
        events = gcal.get_todays_events()
    except Exception as exc:
        print(f"[evening_review] Error fetching GCal events: {exc}")
        events = []

    print("[evening_review] Fetching active Notion slots...")
    try:
        slots = notion.get_active_slots()
    except Exception as exc:
        print(f"[evening_review] Error fetching Notion slots: {exc}")
        slots = []

    # Build a map of GCal event ID → slot item for reverse lookup
    gcal_id_to_slot = {
        s["gcal_event_id"]: s
        for s in slots
        if s.get("gcal_event_id")
    }

    synced = 0
    for event in events:
        event_id = event.get("id")
        if event_id and event_id in gcal_id_to_slot:
            slot = gcal_id_to_slot[event_id]
            # If the event happened today and the slot isn't yet marked completed
            if slot.get("status") not in ("Completed", "Done"):
                print(f"[evening_review] Marking slot '{slot['name']}' as Completed (event ended).")
                notion.set_status(slot["id"], "Completed")
                synced += 1

    summary_parts = []
    if synced:
        summary_parts.append(f"✅ {synced} task(s) auto-marked completed from calendar.")
    if events:
        summary_parts.append(f"📅 {len(events)} calendar event(s) found today.")
    if not summary_parts:
        summary_parts.append("No completed events matched your Notion slots today.")

    summary_msg = "\n".join(summary_parts)

    # Generate AI daily note
    ai_note = ""
    if slots:
        try:
            ai_note = generate_daily_note(slots, events)
            print(f"[evening_review] AI note: {ai_note}")
            for slot in slots:
                notion.append_note(slot["id"], slot.get("notes", ""), f"[Evening Note] {ai_note}")
        except Exception as exc:
            print(f"[evening_review] AI note skipped: {exc}")

    if ai_note:
        summary_msg += f"\n\n💡 {ai_note}"

    print("[evening_review] Sending summary notification...")
    ntfy.send(
        title="📊 Evening Sync Summary",
        message=summary_msg,
        priority="default",
        tags=["bar_chart"],
    )
    print("[evening_review] Done.")


if __name__ == "__main__":
    run()
