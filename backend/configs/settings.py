import os
from pathlib import Path
from typing import List

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


BASE_DIR = Path(__file__).resolve().parents[2]
DEFAULT_UPLOAD_DIRECTORY = "/app/uploads" if Path("/app").exists() else str(BASE_DIR / "uploads")


class Settings:
    """
    Centralized configuration class for the application.
    Reads from environment variables with sensible local development defaults.
    """

    PROJECT_NAME: str = "Real Estate CRM API"
    VERSION: str = "1.0.0"
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://crm_user:crm_password@db:5432/real_estate_crm",
    )
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:4173")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    UPLOAD_DIRECTORY: str = os.getenv("UPLOAD_DIRECTORY", DEFAULT_UPLOAD_DIRECTORY)
    MAX_ASSET_UPLOAD_MB: int = int(os.getenv("MAX_ASSET_UPLOAD_MB", "25"))
    DEFAULT_ADMIN_EMAIL: str = os.getenv("DEFAULT_ADMIN_EMAIL", "")
    DEFAULT_ADMIN_PASSWORD: str = os.getenv("DEFAULT_ADMIN_PASSWORD", "")
    DEFAULT_ADMIN_NAME: str = os.getenv("DEFAULT_ADMIN_NAME", "System Administrator")

    @property
    def CORS_ORIGINS(self) -> List[str]:
        return [
            origin
            for origin in dict.fromkeys(
                [
                    "http://localhost",
                    "http://localhost:80",
                    "http://localhost:3000",
                    "http://localhost:5173",
                    "http://localhost:4173",
                    self.FRONTEND_URL,
                ]
            )
            if origin
        ]

    @property
    def MAX_ASSET_UPLOAD_BYTES(self) -> int:
        return self.MAX_ASSET_UPLOAD_MB * 1024 * 1024


settings = Settings()

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """
    Dependency injection for FastAPI routes.
    Creates and closes a database session per request.
    """

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
