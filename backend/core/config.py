import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from google import genai

# Setup project paths
BACKEND_DIR = Path(__file__).resolve().parent.parent
BASE_DIR = BACKEND_DIR.parent
ENV_FILE = BASE_DIR / ".env"

# Ensure backend directory is in sys.path for clean imports
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

# Load environment variables
load_dotenv(ENV_FILE)

class Settings:
    PROJECT_NAME: str = "AI Smart Study Assistant"
    VERSION: str = "1.0.0"
    API_PREFIX: str = ""

    # Path configurations
    BASE_DIR: Path = BASE_DIR
    BACKEND_DIR: Path = BACKEND_DIR
    UPLOAD_DIR: Path = BACKEND_DIR / "uploads"

    # Security & CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # Gemini API configurations
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DEFAULT_GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-flash-latest")

    @property
    def is_gemini_configured(self) -> bool:
        return bool(self.GEMINI_API_KEY and self.GEMINI_API_KEY.strip())

settings = Settings()

# Ensure uploads directory exists
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def get_gemini_client() -> genai.Client:
    """Safely returns an authenticated Gemini client."""
    if not settings.is_gemini_configured:
        raise ValueError(
            "GEMINI_API_KEY is not configured. "
            "Please add your GEMINI_API_KEY in the .env file."
        )
    return genai.Client(api_key=settings.GEMINI_API_KEY)
