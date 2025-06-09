from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    SECRET_KEY: str = "a_very_secret_key_123"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DATABASE_URL: str = "postgresql+asyncpg://appuser:apppassword@db:5432/appdb"
    POSTGRES_USER: str = "appuser"
    POSTGRES_PASSWORD: str = "apppassword"
    POSTGRES_DB: str = "appdb"
    GMAIL_USER: str = "your_gmail_address@gmail.com"
    GMAIL_PASSWORD: str = "your_gmail_app_password"

    class Config:
        env_file = ".env"

@lru_cache
def get_settings():
    return Settings()
