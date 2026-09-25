import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR.parent / ".env")
DATA_DIR = BASE_DIR / "data"
POLICIES_DIR = DATA_DIR / "policies"
TEMPLATES_DIR = DATA_DIR / "templates"
STORAGE_DIR = BASE_DIR / "storage_files"

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

STORAGE_DIR.mkdir(parents=True, exist_ok=True)
