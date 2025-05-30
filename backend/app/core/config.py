from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # BACKEND_CORS_ORIGINS is a comma-separated list of origins
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    PROJECT_NAME: str = "GateWise"
    
    POSTGRES_SERVER: str
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None

    @field_validator("SQLALCHEMY_DATABASE_URI", mode="before")
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql",
            username=values.data.get("POSTGRES_USER"),
            password=values.data.get("POSTGRES_PASSWORD"),
            host=values.data.get("POSTGRES_SERVER"),
            path=f"/{values.data.get('POSTGRES_DB') or ''}",
        )

    # Database Backup Settings
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_BUCKET_NAME: Optional[str] = None
    BACKUP_RETENTION_DAYS: int = 7
    BACKUP_SCHEDULE: str = "0 0 * * *"  # Daily at midnight

    # Email settings for password reset
    SMTP_TLS: bool = True
    SMTP_PORT: int = 587
    SMTP_HOST: str = ""
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    EMAILS_FROM_EMAIL: str = ""
    EMAILS_FROM_NAME: str = "GateWise"

settings = Settings()