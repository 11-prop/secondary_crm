# backend/main.py
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from configs.settings import settings, engine, Base, SessionLocal
from core.security import get_password_hash
from models.user import User

from api import auth, customers, properties, agents, projects, floor_plans, interaction_notes, transactions, uploads, import_data, users

# Create database tables if they don't exist yet
# (Though init.sql handles this via Docker, it's safe to keep for SQLAlchemy)
Base.metadata.create_all(bind=engine)


def ensure_bootstrap_admin():
    """
    Create the first admin account from environment variables when the database
    is empty. This keeps credentials out of source control and avoids reseeding
    demo users on subsequent restarts.
    """
    if not settings.DEFAULT_ADMIN_EMAIL or not settings.DEFAULT_ADMIN_PASSWORD:
        return

    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return

        admin = User(
            email=settings.DEFAULT_ADMIN_EMAIL,
            hashed_password=get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
            full_name=settings.DEFAULT_ADMIN_NAME,
            is_admin=True,
            is_active=True,
        )
        db.add(admin)
        db.commit()
    finally:
        db.close()


ensure_bootstrap_admin()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for the Real Estate Secondary CRM"
)

# Set up CORS for the frontend using your dynamic list
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- REGISTER ROUTERS HERE ---
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(customers.router, prefix="/api/customers", tags=["Customers"])
app.include_router(properties.router, prefix="/api/properties", tags=["Properties"])
app.include_router(agents.router, prefix="/api/agents", tags=["Agents"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(floor_plans.router, prefix="/api/floor_plans", tags=["Floor Plans"])
app.include_router(interaction_notes.router, prefix="/api/interaction_notes", tags=["Interaction Notes"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["Uploads"])
app.include_router(import_data.router, prefix="/api/import_data", tags=["Import Data"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])

os.makedirs(settings.UPLOAD_DIRECTORY, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIRECTORY), name="uploads")

@app.get("/")
def root():
    return {"message": "Welcome to the Real Estate CRM API. System is operational."}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "database": "connected"}
