"""Notion → Google Calendar sync.

Runs every 15 minutes via GitHub Actions. Three operations:
1. New tasks (Scheduled Time set, no GCal Event ID) → create GCal event → write ID back to Notion
2. Completed tasks (Done=true, has GCal Event ID) → update GCal event description to mark done
3. Recently edited tasks (has GCal Event ID, edited < 20 min ago) → update GCal event title/time
"""

import sys
from datetime import datetime
from pathlib import Path

from dateutil import parser as dateutil_parser

sys.path.insert(0, str(Path(__file__).parent))

from utils import gcal, notion, ntfy

# Slot → Google Calendar color mapping
SLOT_COLOR_IDS = {
    "Slot 1 - פרנסה": "11",   # Tomato (red)
    "Slot 2 - בנייה": "9",    # Blueberry (dark blue)
    "Slot 3 - חקירה": "2",    # Sage (green)
    "Parking Lot": "8",        # Graphite
}


def _parse_dt(dt_str: str) -> datetime:
    """Parse an ISO datetime string (with or without timezone) to a naive datetime."""
    dt = dateutil_parser.isoparse(dt_str)
    if dt.tzinfo is not None:
        dt = dt.replace(tzinfo=None)
    return dt


def sync_new_tasks() -> int:
    """Create GCal events for Notion tasks that have a Scheduled Time but no GCal Event ID."""
    tasks = notion.get_tasks_pending_gcal_sync()
    created = 0
    for task in tasks:
        scheduled = task.get("scheduled_time")
        if not scheduled:
            continue
        try:
            start_dt = _parse_dt(scheduled)
        except (ValueError, TypeError) as exc:
            print(f"[slot_sync] Skipping '{task['name']}': bad date '{scheduled}': {exc}")
            continue

        duration_min = int(task.get("duration_min") or 60)
        end_dt = start_dt + __import__("datetime").timedelta(minutes=duration_min)

        slot = task.get("slot", "")
        color_id = SLOT_COLOR_IDS.get(slot)
        slot_label = slot.replace("Slot 1 - ", "💰 ").replace("Slot 2 - ", "🔨 ").replace("Slot 3 - ", "🔍 ")
        title = f"[{slot_label}] {task['name']}"
        description = task.get("next_action", "") or task.get("notes", "")

        print(f"[slot_sync] Creating GCal event: '{title}' at {start_dt}")
        try:
            event_id = gcal.create_time_block(
                title=title,
                start_dt=start_dt,
                end_dt=end_dt,
                description=description,
                color_id=color_id,
            )
            notion.set_gcal_event_id(task["id"], event_id)
            print(f"[slot_sync] Created event {event_id}, updated Notion.")
            created += 1
        except Exception as exc:
            print(f"[slot_sync] Failed to create event for '{task['name']}': {exc}")

    return created


def sync_completed_tasks() -> int:
    """Mark GCal events as done (via description update) for tasks checked off in Notion."""
    tasks = notion.get_completed_tasks_with_gcal()
    updated = 0
    for task in tasks:
        event_id = task.get("gcal_event_id")
        if not event_id:
            continue
        print(f"[slot_sync] Marking GCal event '{task['name']}' as done...")
        try:
            gcal.update_event(
                event_id,
                title=f"✅ {task['name']}",
                description=f"Completed via Notion\n{task.get('notes', '')}".strip(),
            )
            updated += 1
        except Exception as exc:
            print(f"[slot_sync] Failed to update event for '{task['name']}': {exc}")

    return updated


def sync_edited_tasks() -> int:
    """Update GCal events for tasks recently edited in Notion."""
    tasks = notion.get_recently_edited_with_gcal(minutes=20)
    updated = 0
    for task in tasks:
        event_id = task.get("gcal_event_id")
        scheduled = task.get("scheduled_time")
        if not event_id or not scheduled:
            continue
        try:
            start_dt = _parse_dt(scheduled)
        except (ValueError, TypeError):
            continue

        duration_min = int(task.get("duration_min") or 60)
        end_dt = start_dt + __import__("datetime").timedelta(minutes=duration_min)

        slot = task.get("slot", "")
        slot_label = slot.replace("Slot 1 - ", "💰 ").replace("Slot 2 - ", "🔨 ").replace("Slot 3 - ", "🔍 ")
        title = f"[{slot_label}] {task['name']}"

        print(f"[slot_sync] Updating GCal event '{task['name']}' (edited recently)...")
        try:
            gcal.update_event(
                event_id,
                title=title,
                start_dt=start_dt,
                end_dt=end_dt,
                description=task.get("next_action", "") or task.get("notes", ""),
            )
            updated += 1
        except Exception as exc:
            print(f"[slot_sync] Failed to update event for '{task['name']}': {exc}")

    return updated


def run():
    print("[slot_sync] Starting Notion → GCal sync...")

    created = sync_new_tasks()
    completed = sync_completed_tasks()
    edited = sync_edited_tasks()

    total = created + completed + edited
    print(f"[slot_sync] Sync complete: {created} created, {completed} completed, {edited} updated.")

    if total > 0:
        parts = []
        if created:
            parts.append(f"{created} new event(s) added to calendar")
        if completed:
            parts.append(f"{completed} event(s) marked done")
        if edited:
            parts.append(f"{edited} event(s) updated")

        ntfy.send(
            title="🔄 Notion → GCal Synced",
            message="\n".join(f"• {p}" for p in parts),
            priority="low",
            tags=["arrows_counterclockwise"],
        )


if __name__ == "__main__":
    run()
