"""NTFY push notification helper."""

import os
import requests

NTFY_TOPIC = os.environ.get("NTFY_TOPIC", "zion-3slots")
NTFY_BASE_URL = "https://ntfy.sh"


def send(
    title: str,
    message: str,
    priority: str = "default",
    tags: list[str] | None = None,
) -> None:
    """Send a push notification via ntfy.sh.

    priority: min | low | default | high | urgent
    tags: list of emoji shortcodes or tag names shown in notification
    """
    url = f"{NTFY_BASE_URL}/{NTFY_TOPIC}"
    headers = {
        "Title": title.encode("utf-8"),
        "Priority": priority,
        "Content-Type": "text/plain; charset=utf-8",
    }
    if tags:
        headers["Tags"] = ",".join(tags)

    try:
        resp = requests.post(url, data=message.encode("utf-8"), headers=headers, timeout=10)
        if resp.status_code != 200:
            print(f"[ntfy] Warning: received status {resp.status_code}: {resp.text}")
        else:
            print(f"[ntfy] Notification sent: {title}")
    except Exception as exc:
        print(f"[ntfy] Failed to send notification: {exc}")
