import os
from supabase import create_client, Client
from dotenv import load_dotenv

from pathlib import Path

# Load .env relative to this file's directory
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

SUPABASE_URL: str = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(
        "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file. "
        "Check backend/.env and fill in your credentials."
    )

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
