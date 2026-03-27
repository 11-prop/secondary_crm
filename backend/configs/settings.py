import os
from typing import List
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

class Settings:
    """
    Centralized configuration class for the application.
    Reads from environment variables with sensible local development defaults.
    """
    # App Metadata
    PROJECT_NAME: str = "Real Estate CRM API"
    VERSION: str = "1.0.0"

    # Database Configuration
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://crm_user:crm_password@db:5432/real_estate_crm"
    )

    # Frontend Configuration
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost")

    # CORS Configuration
    @property
    def CORS_ORIGINS(self) -> List[str]:
        """
        Dynamically generates the list of allowed origins for CORS.
        """
        return [
            "http://localhost",
            "http://localhost:80",
            "http://localhost:3000", # Standard React dev port
            self.FRONTEND_URL,
            "*" # Note: In strict production, you'd remove the wildcard
        ]

# Instantiate the settings class so it acts as a singleton.
# You will import this specific instance into your other files.
settings = Settings()


# ==========================================
# DATABASE CONNECTION SETUP
# ==========================================
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

# Security Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days