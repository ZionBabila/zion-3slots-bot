"""One-time Google OAuth2 setup script.

Step 1 — generate the URL:
  python setup/get_google_token.py

Step 2 — after getting the auth code from Google, exchange it:
  python setup/get_google_token.py YOUR_AUTH_CODE_HERE
"""

import json
import sys
import secrets
import hashlib
import base64
import urllib.request
import urllib.parse
from pathlib import Path

CREDENTIALS_FILE = Path(__file__).parent.parent / "credentials.json"
STATE_FILE = Path(__file__).parent / ".oauth_state.json"
SCOPE = "https://www.googleapis.com/auth/calendar.events"
REDIRECT_URI = "urn:ietf:wg:oauth:2.0:oob"
TOKEN_URI = "https://oauth2.googleapis.com/token"
AUTH_URI = "https://accounts.google.com/o/oauth2/auth"


def step1_generate_url():
    if not CREDENTIALS_FILE.exists():
        print(f"ERROR: credentials.json not found at {CREDENTIALS_FILE}")
        sys.exit(1)

    with open(CREDENTIALS_FILE) as f:
        creds = json.load(f)
    cfg = creds.get("installed") or creds.get("web")
    client_id = cfg["client_id"]
    client_secret = cfg["client_secret"]

    # Generate PKCE code verifier + challenge
    code_verifier = secrets.token_urlsafe(64)
    code_challenge = base64.urlsafe_b64encode(
        hashlib.sha256(code_verifier.encode()).digest()
    ).rstrip(b"=").decode()

    params = urllib.parse.urlencode({
        "response_type": "code",
        "client_id": client_id,
        "redirect_uri": REDIRECT_URI,
        "scope": SCOPE,
        "access_type": "offline",
        "prompt": "consent",
        "code_challenge": code_challenge,
        "code_challenge_method": "S256",
    })
    auth_url = f"{AUTH_URI}?{params}"

    # Save state for step 2
    with open(STATE_FILE, "w") as f:
        json.dump({
            "client_id": client_id,
            "client_secret": client_secret,
            "code_verifier": code_verifier,
        }, f)

    print()
    print("=" * 70)
    print("STEP 1: Open this URL in your browser:")
    print()
    print(auth_url)
    print()
    print("STEP 2: Sign in with Google → click Allow")
    print("STEP 3: Copy the authorization code shown on the page")
    print("STEP 4: Paste the code here and run:")
    print()
    print("  python setup/get_google_token.py PASTE_YOUR_CODE_HERE")
    print("=" * 70)


def step2_exchange_code(code: str):
    if not STATE_FILE.exists():
        print("ERROR: Run step 1 first: python setup/get_google_token.py")
        sys.exit(1)

    with open(STATE_FILE) as f:
        state = json.load(f)

    data = urllib.parse.urlencode({
        "code": code,
        "client_id": state["client_id"],
        "client_secret": state["client_secret"],
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code",
        "code_verifier": state["code_verifier"],
    }).encode()

    req = urllib.request.Request(
        TOKEN_URI,
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    try:
        with urllib.request.urlopen(req) as resp:
            tokens = json.loads(resp.read())
    except urllib.request.HTTPError as exc:
        body = exc.read().decode()
        print(f"ERROR {exc.code}: {body}")
        sys.exit(1)

    refresh_token = tokens.get("refresh_token")
    if not refresh_token:
        print("ERROR: No refresh_token returned.")
        print("Full response:", tokens)
        sys.exit(1)

    STATE_FILE.unlink(missing_ok=True)

    print()
    print("=" * 60)
    print("SUCCESS! Add these 4 secrets to GitHub:")
    print("  Repo → Settings → Secrets and variables → Actions")
    print("=" * 60)
    print()
    print(f"GOOGLE_CLIENT_ID\n  {state['client_id']}\n")
    print(f"GOOGLE_CLIENT_SECRET\n  {state['client_secret']}\n")
    print(f"GOOGLE_REFRESH_TOKEN\n  {refresh_token}\n")
    print("GOOGLE_CALENDAR_ID\n  primary\n")
    print("=" * 60)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        step2_exchange_code(sys.argv[1].strip())
    else:
        step1_generate_url()
