"""Google Calendar API client utilities."""

import os
from datetime import datetime, timedelta, timezone

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

SCOPES = ["https://www.googleapis.com/auth/calendar.events"]
# Israel is UTC+2 (winter) / UTC+3 (summer DST). Use +2 as conservative default;
# exact offset is determined at runtime via ISRAEL_UTC_OFFSET env var.
ISRAEL_UTC_OFFSET = int(os.environ.get("ISRAEL_UTC_OFFSET", "2"))


def get_service():
    """Build authenticated Google Calendar service using stored refresh token."""
    creds = Credentials(
        token=None,
        refresh_token=os.environ["GOOGLE_REFRESH_TOKEN"],
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.environ["GOOGLE_CLIENT_ID"],
        client_secret=os.environ["GOOGLE_CLIENT_SECRET"],
        scopes=SCOPES,
    )
    creds.refresh(Request())
    return build("calendar", "v3", credentials=creds, cache_discovery=False)


def _calendar_id() -> str:
    return os.environ.get("GOOGLE_CALENDAR_ID", "primary")


def _israel_now() -> datetime:
    """Current datetime in Israel time (naive, treated as local)."""
    return datetime.now(timezone.utc) + timedelta(hours=ISRAEL_UTC_OFFSET)


def _day_bounds_utc(day: datetime | None = None) -> tuple[str, str]:
    """Return RFC3339 start/end of a day in Israel time, expressed in UTC."""
    if day is None:
        day = _israel_now()
    day_start_israel = day.replace(hour=0, minute=0, second=0, microsecond=0)
    day_end_israel = day.replace(hour=23, minute=59, second=59, microsecond=0)
    # Convert back to UTC for the API
    offset = timedelta(hours=ISRAEL_UTC_OFFSET)
    start_utc = day_start_israel - offset
    end_utc = day_end_israel - offset
    return (
        start_utc.strftime("%Y-%m-%dT%H:%M:%SZ"),
        end_utc.strftime("%Y-%m-%dT%H:%M:%SZ"),
    )


def get_todays_events() -> list[dict]:
    """Fetch all events for today in Israel time.

    Returns list of dicts: {id, summary, start, end, description}
    """
    service = get_service()
    time_min, time_max = _day_bounds_utc()
    result = (
        service.events()
        .list(
            calendarId=_calendar_id(),
            timeMin=time_min,
            timeMax=time_max,
            singleEvents=True,
            orderBy="startTime",
        )
        .execute()
    )
    events = []
    for e in result.get("items", []):
        events.append(
            {
                "id": e.get("id"),
                "summary": e.get("summary", "(no title)"),
                "start": e.get("start", {}).get("dateTime") or e.get("start", {}).get("date"),
                "end": e.get("end", {}).get("dateTime") or e.get("end", {}).get("date"),
                "description": e.get("description", ""),
            }
        )
    return events


def get_weeks_events(week_start: datetime | None = None) -> list[dict]:
    """Fetch all events for the 7-day week starting from week_start (Israel time).

    Defaults to next Monday if week_start is None.
    """
    if week_start is None:
        today = _israel_now()
        days_until_monday = (7 - today.weekday()) % 7 or 7
        week_start = today + timedelta(days=days_until_monday)

    week_end = week_start + timedelta(days=7)
    service = get_service()
    offset = timedelta(hours=ISRAEL_UTC_OFFSET)
    time_min = (week_start.replace(hour=0, minute=0, second=0, microsecond=0) - offset).strftime(
        "%Y-%m-%dT%H:%M:%SZ"
    )
    time_max = (week_end.replace(hour=23, minute=59, second=59, microsecond=0) - offset).strftime(
        "%Y-%m-%dT%H:%M:%SZ"
    )

    result = (
        service.events()
        .list(
            calendarId=_calendar_id(),
            timeMin=time_min,
            timeMax=time_max,
            singleEvents=True,
            orderBy="startTime",
        )
        .execute()
    )
    events = []
    for e in result.get("items", []):
        events.append(
            {
                "id": e.get("id"),
                "summary": e.get("summary", "(no title)"),
                "start": e.get("start", {}).get("dateTime") or e.get("start", {}).get("date"),
                "end": e.get("end", {}).get("dateTime") or e.get("end", {}).get("date"),
                "description": e.get("description", ""),
            }
        )
    return events


def create_time_block(
    title: str,
    start_dt: datetime,
    end_dt: datetime,
    description: str = "",
    color_id: str | None = None,
) -> str:
    """Create a Google Calendar event and return its event ID."""
    service = get_service()
    offset = timedelta(hours=ISRAEL_UTC_OFFSET)

    def _fmt(dt: datetime) -> str:
        utc_dt = dt - offset if dt.tzinfo is None else dt.astimezone(timezone.utc)
        return utc_dt.strftime("%Y-%m-%dT%H:%M:%S") + "Z"

    body: dict = {
        "summary": title,
        "description": description,
        "start": {"dateTime": _fmt(start_dt), "timeZone": "Asia/Jerusalem"},
        "end": {"dateTime": _fmt(end_dt), "timeZone": "Asia/Jerusalem"},
    }
    if color_id:
        body["colorId"] = color_id

    event = service.events().insert(calendarId=_calendar_id(), body=body).execute()
    return event["id"]


def update_event(event_id: str, **kwargs) -> None:
    """Patch an existing Google Calendar event.

    Accepted kwargs: title, description, start_dt, end_dt, color_id
    """
    service = get_service()
    patch_body: dict = {}
    offset = timedelta(hours=ISRAEL_UTC_OFFSET)

    def _fmt(dt: datetime) -> str:
        utc_dt = dt - offset if dt.tzinfo is None else dt.astimezone(timezone.utc)
        return utc_dt.strftime("%Y-%m-%dT%H:%M:%S") + "Z"

    if "title" in kwargs:
        patch_body["summary"] = kwargs["title"]
    if "description" in kwargs:
        patch_body["description"] = kwargs["description"]
    if "start_dt" in kwargs:
        patch_body["start"] = {
            "dateTime": _fmt(kwargs["start_dt"]),
            "timeZone": "Asia/Jerusalem",
        }
    if "end_dt" in kwargs:
        patch_body["end"] = {
            "dateTime": _fmt(kwargs["end_dt"]),
            "timeZone": "Asia/Jerusalem",
        }
    if "color_id" in kwargs:
        patch_body["colorId"] = kwargs["color_id"]

    if patch_body:
        service.events().patch(
            calendarId=_calendar_id(), eventId=event_id, body=patch_body
        ).execute()


def delete_event(event_id: str) -> None:
    """Delete a Google Calendar event."""
    service = get_service()
    service.events().delete(calendarId=_calendar_id(), eventId=event_id).execute()


def calculate_available_hours(week_start: datetime | None = None) -> float:
    """Calculate free hours in the week (168h total minus event durations)."""
    events = get_weeks_events(week_start)
    busy_minutes = 0
    for e in events:
        start_str = e.get("start")
        end_str = e.get("end")
        if start_str and end_str and "T" in start_str:
            try:
                fmt = "%Y-%m-%dT%H:%M:%S%z" if "+" in start_str or start_str.endswith("Z") else "%Y-%m-%dT%H:%M:%S"
                start = datetime.strptime(start_str.replace("Z", "+00:00"), "%Y-%m-%dT%H:%M:%S%z")
                end = datetime.strptime(end_str.replace("Z", "+00:00"), "%Y-%m-%dT%H:%M:%S%z")
                busy_minutes += max(0, (end - start).total_seconds() / 60)
            except ValueError:
                pass
    total_week_minutes = 168 * 60
    return round((total_week_minutes - busy_minutes) / 60, 1)
