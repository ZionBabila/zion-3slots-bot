"""Notion API client utilities for the 3-Slots planning board."""

import os
from datetime import datetime, timedelta

from notion_client import Client

# Slot color IDs for Google Calendar (optional mapping)
SLOT_COLOR_IDS = {
    "Slot 1 - פרנסה": "11",   # Tomato
    "Slot 2 - בנייה": "9",    # Blueberry
    "Slot 3 - חקירה": "2",    # Sage
    "Parking Lot": "8",        # Graphite
}


def get_client() -> Client:
    return Client(auth=os.environ["NOTION_TOKEN"])


def _db_id() -> str:
    return os.environ["NOTION_DATABASE_ID"]


def _weekly_db_id() -> str:
    return os.environ["NOTION_WEEKLY_DB_ID"]


def _extract_text(prop: dict) -> str:
    """Extract plain text from a rich_text or title property value."""
    rich = prop.get("rich_text") or prop.get("title") or []
    return "".join(r.get("plain_text", "") for r in rich)


def _extract_select(prop: dict) -> str:
    sel = prop.get("select")
    return sel["name"] if sel else ""


def _extract_date(prop: dict) -> str:
    d = prop.get("date")
    return d["start"] if d else ""


def _extract_number(prop: dict) -> float | None:
    return prop.get("number")


def _extract_checkbox(prop: dict) -> bool:
    return bool(prop.get("checkbox"))


def _page_to_item(page: dict) -> dict:
    props = page.get("properties", {})
    return {
        "id": page["id"],
        "name": _extract_text(props.get("Name", {})),
        "slot": _extract_select(props.get("Slot", {})),
        "status": _extract_select(props.get("Status", {})),
        "done": _extract_checkbox(props.get("Done", {})),
        "scheduled_time": _extract_date(props.get("Scheduled Time", {})),
        "duration_min": _extract_number(props.get("Duration (min)", {})) or 60,
        "gcal_event_id": _extract_text(props.get("GCal Event ID", {})),
        "next_action": _extract_text(props.get("Next Action", {})),
        "notes": _extract_text(props.get("Notes", {})),
        "last_edited": page.get("last_edited_time", ""),
    }


def get_active_slots() -> list[dict]:
    """Return pages where Status = Active and Slot is one of the 3 slots (not Parking Lot)."""
    client = get_client()
    result = client.databases.query(
        database_id=_db_id(),
        filter={
            "and": [
                {"property": "Status", "select": {"equals": "Active"}},
                {
                    "or": [
                        {"property": "Slot", "select": {"equals": "Slot 1 - פרנסה"}},
                        {"property": "Slot", "select": {"equals": "Slot 2 - בנייה"}},
                        {"property": "Slot", "select": {"equals": "Slot 3 - חקירה"}},
                    ]
                },
            ]
        },
    )
    return [_page_to_item(p) for p in result.get("results", [])]


def get_tasks_pending_gcal_sync() -> list[dict]:
    """Return tasks that have a Scheduled Time but no GCal Event ID yet."""
    client = get_client()
    result = client.databases.query(
        database_id=_db_id(),
        filter={
            "and": [
                {"property": "Scheduled Time", "date": {"is_not_empty": True}},
                {"property": "GCal Event ID", "rich_text": {"is_empty": True}},
                {"property": "Done", "checkbox": {"equals": False}},
            ]
        },
    )
    return [_page_to_item(p) for p in result.get("results", [])]


def get_completed_tasks_with_gcal() -> list[dict]:
    """Return tasks marked Done=true that still have a GCal Event ID."""
    client = get_client()
    result = client.databases.query(
        database_id=_db_id(),
        filter={
            "and": [
                {"property": "Done", "checkbox": {"equals": True}},
                {"property": "GCal Event ID", "rich_text": {"is_not_empty": True}},
            ]
        },
    )
    return [_page_to_item(p) for p in result.get("results", [])]


def get_recently_edited_with_gcal(minutes: int = 20) -> list[dict]:
    """Return tasks edited in the last `minutes` minutes that already have a GCal Event ID."""
    from dateutil import parser as dateutil_parser

    client = get_client()
    result = client.databases.query(
        database_id=_db_id(),
        filter={
            "and": [
                {"property": "GCal Event ID", "rich_text": {"is_not_empty": True}},
                {"property": "Done", "checkbox": {"equals": False}},
            ]
        },
    )
    cutoff = datetime.utcnow() - timedelta(minutes=minutes)
    items = []
    for p in result.get("results", []):
        last_edited = p.get("last_edited_time", "")
        try:
            edited_dt = dateutil_parser.isoparse(last_edited).replace(tzinfo=None)
            if edited_dt >= cutoff:
                items.append(_page_to_item(p))
        except (ValueError, TypeError):
            pass
    return items


def get_all_slots_this_week() -> list[dict]:
    """Return all active slot items for the current ISO week."""
    from dateutil import parser as dateutil_parser

    client = get_client()
    today = datetime.utcnow()
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=7)

    result = client.databases.query(
        database_id=_db_id(),
        filter={
            "and": [
                {"property": "Status", "select": {"equals": "Active"}},
                {
                    "property": "Scheduled Time",
                    "date": {
                        "on_or_after": week_start.strftime("%Y-%m-%d"),
                    },
                },
                {
                    "property": "Scheduled Time",
                    "date": {
                        "before": week_end.strftime("%Y-%m-%d"),
                    },
                },
            ]
        },
    )
    return [_page_to_item(p) for p in result.get("results", [])]


def update_page(page_id: str, properties: dict) -> None:
    """Update specific properties on a Notion page.

    properties format examples:
      {"GCal Event ID": {"rich_text": [{"text": {"content": "abc123"}}]}}
      {"Status": {"select": {"name": "Completed"}}}
      {"Done": {"checkbox": True}}
    """
    client = get_client()
    client.pages.update(page_id=page_id, properties=properties)


def set_gcal_event_id(page_id: str, event_id: str) -> None:
    update_page(page_id, {"GCal Event ID": {"rich_text": [{"text": {"content": event_id}}]}})


def set_status(page_id: str, status: str) -> None:
    update_page(page_id, {"Status": {"select": {"name": status}}})


def append_note(page_id: str, existing_notes: str, new_note: str) -> None:
    combined = f"{existing_notes}\n\n{new_note}".strip()
    update_page(
        page_id,
        {"Notes": {"rich_text": [{"text": {"content": combined[:2000]}}]}},
    )


def get_weekly_plan(week_start: datetime) -> dict | None:
    """Find an existing weekly plan entry for the given week start date."""
    client = get_client()
    week_str = week_start.strftime("%Y-%m-%d")
    result = client.databases.query(
        database_id=_weekly_db_id(),
        filter={"property": "Week Start", "date": {"equals": week_str}},
    )
    results = result.get("results", [])
    if not results:
        return None
    page = results[0]
    props = page.get("properties", {})
    return {
        "id": page["id"],
        "name": _extract_text(props.get("Name", {})),
        "week_start": _extract_date(props.get("Week Start", {})),
        "weekly_goal": _extract_text(props.get("Weekly Goal", {})),
        "reflection": _extract_text(props.get("Reflection", {})),
        "hours_available": _extract_number(props.get("Calendar Hours Available", {})),
    }


def create_weekly_plan(
    week_start: datetime,
    weekly_goal: str = "",
    hours_available: float | None = None,
    slot_page_ids: list[str] | None = None,
) -> str:
    """Create a new Weekly Plans entry. Returns the new page ID."""
    client = get_client()
    week_label = week_start.strftime("Week of %B %-d, %Y")

    properties: dict = {
        "Name": {"title": [{"text": {"content": week_label}}]},
        "Week Start": {"date": {"start": week_start.strftime("%Y-%m-%d")}},
    }
    if weekly_goal:
        properties["Weekly Goal"] = {"rich_text": [{"text": {"content": weekly_goal}}]}
    if hours_available is not None:
        properties["Calendar Hours Available"] = {"number": hours_available}

    # Link up to 3 active slot projects via relation (if your DB has relation properties)
    if slot_page_ids:
        for i, slot_pid in enumerate(slot_page_ids[:3], start=1):
            prop_name = f"Slot {i} Project"
            properties[prop_name] = {"relation": [{"id": slot_pid}]}

    page = client.pages.create(
        parent={"database_id": _weekly_db_id()},
        properties=properties,
    )
    return page["id"]


def update_weekly_reflection(plan_page_id: str, reflection: str) -> None:
    client = get_client()
    client.pages.update(
        page_id=plan_page_id,
        properties={
            "Reflection": {"rich_text": [{"text": {"content": reflection[:2000]}}]}
        },
    )
