"""One-time Google OAuth2 setup script.

Run this ONCE locally to obtain a refresh token, then store the output values
as GitHub Secrets. The refresh token does not expire unless you revoke access.

Usage:
    1. Go to https://console.cloud.google.com
    2. Create a project → Enable "Google Calendar API"
    3. Credentials → Create → OAuth 2.0 Client ID → Desktop App
    4. Download the JSON file and save it as 'credentials.json' in this repo root
    5. Add credentials.json to .gitignore immediately!
    6. Run: pip install google-auth-oauthlib
    7. Run: python setup/get_google_token.py
    8. A browser window will open — sign in and grant access
    9. Copy the printed values to your GitHub repository secrets
"""

import json
import sys
from pathlib import Path

try:
    from google_auth_oauthlib.flow import InstalledAppFlow
except ImportError:
    print("ERROR: google-auth-oauthlib is not installed.")
    print("Run: pip install google-auth-oauthlib")
    sys.exit(1)

SCOPES = [
    "https://www.googleapis.com/auth/calendar.events",
]

CREDENTIALS_FILE = Path(__file__).parent.parent / "credentials.json"


def main():
    if not CREDENTIALS_FILE.exists():
        print(f"ERROR: credentials.json not found at {CREDENTIALS_FILE}")
        print("Download it from Google Cloud Console → Credentials → OAuth 2.0 Client IDs")
        sys.exit(1)

    print("Starting OAuth2 flow — a browser window will open...")
    print("Sign in with your Google account and grant calendar access.\n")

    flow = InstalledAppFlow.from_client_secrets_file(
        str(CREDENTIALS_FILE),
        scopes=SCOPES,
    )
    creds = flow.run_local_server(port=0)

    print("\n" + "=" * 60)
    print("SUCCESS! Copy these values to GitHub Secrets:")
    print("  Settings → Secrets and variables → Actions → New repository secret")
    print("=" * 60)
    print(f"\nGOOGLE_CLIENT_ID\n  {creds.client_id}\n")
    print(f"GOOGLE_CLIENT_SECRET\n  {creds.client_secret}\n")
    print(f"GOOGLE_REFRESH_TOKEN\n  {creds.refresh_token}\n")
    print("GOOGLE_CALENDAR_ID\n  primary\n  (or your Gmail address if you want a specific calendar)")
    print("=" * 60)
    print("\nAlso add these Notion secrets:")
    print("  NOTION_TOKEN        — from notion.so/my-integrations")
    print("  NOTION_DATABASE_ID  — from your 3-Slots board URL")
    print("  NOTION_WEEKLY_DB_ID — from your Weekly Plans database URL")
    print("\nAnd the AI secret:")
    print("  ANTHROPIC_API_KEY   — from console.anthropic.com/api-keys")
    print("=" * 60)
    print("\nIMPORTANT: Delete credentials.json from your machine now!")
    print("  rm credentials.json")


if __name__ == "__main__":
    main()
