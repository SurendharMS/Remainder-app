import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()

def parse_cors_origins() -> List[str]:
    default_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "https://YOUR_VERCEL_APP.vercel.app",
    ]
    raw_env = os.getenv("CORS_ORIGINS")
    if raw_env:
        extra_origins = [origin.strip() for origin in raw_env.split(",") if origin.strip()]
        for origin in extra_origins:
            if origin not in default_origins:
                default_origins.append(origin)
    return default_origins

class Settings(BaseSettings):
    PROJECT_NAME: str = "Reminder & Note-Taking App"
    ALLOWED_GITHUB_USER: str = os.getenv("ALLOWED_GITHUB_USER", "Surendhar2252")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")

    @property
    def CORS_ORIGINS(self) -> List[str]:
        return parse_cors_origins()

    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()
