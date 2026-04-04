"""NTFY push notification helper."""

import os
import urllib.request

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
        "Title": title,
        "Priority": priority,
        "Content-Type": "text/plain; charset=utf-8",
    }
    if tags:
        headers["Tags"] = ",".join(tags)

    data = message.encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            status = resp.getcode()
            if status != 200:
                print(f"[ntfy] Warning: received status {status}")
    except Exception as exc:
        print(f"[ntfy] Failed to send notification: {exc}")
