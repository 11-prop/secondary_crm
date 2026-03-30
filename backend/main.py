# backend/main.py
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from configs.settings import settings, engine, Base, SessionLocal
from core.security import get_password_hash
from models.user import User

from api import auth, customers, properties, agents, projects, floor_plans, interaction_notes, transactions, uploads, import_data, users

# Create database tables if they don't exist yet
# (Though init.sql handles this via Docker, it's safe to keep for SQLAlchemy)
Base.metadata.create_all(bind=engine)


def ensure_schema_updates():
    """
    Apply lightweight, idempotent schema adjustments for deployments that already
    have an initialized database but do not yet have the latest community model.
    """
    with engine.begin() as connection:
        connection.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS communities (
                    community_id SERIAL PRIMARY KEY,
                    project_id INTEGER NOT NULL REFERENCES projects(project_id) ON DELETE CASCADE,
                    community_name VARCHAR(150) NOT NULL,
                    layout_plan_path TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT uq_communities_project_name UNIQUE (project_id, community_name)
                )
                """
            )
        )
        connection.execute(
            text(
                """
                ALTER TABLE communities
                ADD COLUMN IF NOT EXISTS layout_plan_path TEXT
                """
            )
        )
        connection.execute(
            text(
                """
                ALTER TABLE floor_plans
                ADD COLUMN IF NOT EXISTS community_id INTEGER REFERENCES communities(community_id) ON DELETE SET NULL
                """
            )
        )
        connection.execute(
            text(
                """
                ALTER TABLE properties
                ADD COLUMN IF NOT EXISTS community_id INTEGER REFERENCES communities(community_id) ON DELETE SET NULL
                """
            )
        )
        connection.execute(
            text(
                """
                INSERT INTO communities (project_id, community_name, layout_plan_path)
                SELECT p.project_id, TRIM(p.neighborhood_name), p.layout_plan_path
                FROM projects p
                WHERE COALESCE(TRIM(p.neighborhood_name), '') <> ''
                  AND NOT EXISTS (
                      SELECT 1
                      FROM communities c
                      WHERE c.project_id = p.project_id
                        AND LOWER(c.community_name) = LOWER(TRIM(p.neighborhood_name))
                  )
                """
            )
        )
        connection.execute(
            text(
                """
                UPDATE communities c
                SET layout_plan_path = p.layout_plan_path
                FROM projects p
                WHERE c.project_id = p.project_id
                  AND LOWER(c.community_name) = LOWER(TRIM(p.neighborhood_name))
                  AND c.layout_plan_path IS NULL
                  AND p.layout_plan_path IS NOT NULL
                  AND COALESCE(TRIM(p.neighborhood_name), '') <> ''
                """
            )
        )
        connection.execute(
            text(
                """
                UPDATE floor_plans fp
                SET community_id = c.community_id
                FROM projects p
                JOIN communities c
                  ON c.project_id = p.project_id
                 AND LOWER(c.community_name) = LOWER(TRIM(p.neighborhood_name))
                WHERE fp.project_id = p.project_id
                  AND fp.community_id IS NULL
                  AND COALESCE(TRIM(p.neighborhood_name), '') <> ''
                """
            )
        )
        connection.execute(
            text(
                """
                UPDATE properties pr
                SET community_id = c.community_id
                FROM projects p
                JOIN communities c
                  ON c.project_id = p.project_id
                 AND LOWER(c.community_name) = LOWER(TRIM(p.neighborhood_name))
                WHERE pr.project_id = p.project_id
                  AND pr.community_id IS NULL
                  AND COALESCE(TRIM(p.neighborhood_name), '') <> ''
                """
            )
        )


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
ensure_schema_updates()

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
