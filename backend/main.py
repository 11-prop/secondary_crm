# backend/main.py
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from configs.settings import settings, engine, Base, SessionLocal
from core.property_attributes import LEGACY_PROPERTY_ATTRIBUTE_DEFINITIONS, SEEDED_LOCATION_ATTRIBUTE_DEFINITIONS
from core.security import get_password_hash
from models.user import User

from api import auth, customers, properties, agents, projects, floor_plans, interaction_notes, transactions, uploads, import_data, property_attributes, users

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
                CREATE TABLE IF NOT EXISTS property_attribute_definitions (
                    attribute_definition_id SERIAL PRIMARY KEY,
                    key VARCHAR(80) NOT NULL UNIQUE,
                    label VARCHAR(120) NOT NULL,
                    value_type VARCHAR(20) NOT NULL DEFAULT 'boolean',
                    options JSONB NOT NULL DEFAULT '[]'::jsonb,
                    sort_order INTEGER NOT NULL DEFAULT 0,
                    is_active BOOLEAN NOT NULL DEFAULT TRUE,
                    is_system BOOLEAN NOT NULL DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
        )
        connection.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS property_attribute_values (
                    property_id INTEGER NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
                    attribute_definition_id INTEGER NOT NULL REFERENCES property_attribute_definitions(attribute_definition_id) ON DELETE CASCADE,
                    value_boolean BOOLEAN,
                    value_text TEXT,
                    value_number NUMERIC,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (property_id, attribute_definition_id)
                )
                """
            )
        )

        for definition in LEGACY_PROPERTY_ATTRIBUTE_DEFINITIONS:
            connection.execute(
                text(
                    """
                    INSERT INTO property_attribute_definitions (key, label, value_type, options, sort_order, is_active, is_system)
                    VALUES (:key, :label, :value_type, '[]'::jsonb, :sort_order, TRUE, :is_system)
                    ON CONFLICT (key) DO NOTHING
                    """
                ),
                definition,
            )

        for definition in SEEDED_LOCATION_ATTRIBUTE_DEFINITIONS:
            connection.execute(
                text(
                    """
                    INSERT INTO property_attribute_definitions (key, label, value_type, options, sort_order, is_active, is_system)
                    VALUES (:key, :label, :value_type, '[]'::jsonb, :sort_order, TRUE, :is_system)
                    ON CONFLICT (key) DO UPDATE
                    SET label = EXCLUDED.label,
                        value_type = EXCLUDED.value_type,
                        sort_order = EXCLUDED.sort_order,
                        is_active = TRUE
                    """
                ),
                definition,
            )

        connection.execute(
            text(
                """
                UPDATE property_attribute_definitions
                SET created_at = CURRENT_TIMESTAMP
                WHERE created_at IS NULL
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
        for definition in LEGACY_PROPERTY_ATTRIBUTE_DEFINITIONS:
            connection.execute(
                text(
                    f"""
                    INSERT INTO property_attribute_values (property_id, attribute_definition_id, value_boolean)
                    SELECT p.property_id, d.attribute_definition_id, TRUE
                    FROM properties p
                    JOIN property_attribute_definitions d ON d.key = :key
                    WHERE p.{definition["key"]} IS TRUE
                      AND NOT EXISTS (
                          SELECT 1
                          FROM property_attribute_values pav
                          WHERE pav.property_id = p.property_id
                            AND pav.attribute_definition_id = d.attribute_definition_id
                      )
                    """
                ),
                {"key": definition["key"]},
            )

        connection.execute(
            text(
                """
                UPDATE property_attribute_definitions
                SET is_active = FALSE
                WHERE key = 'property_location'
                """
            )
        )

        location_backfills = {
            "perimeter": "LOWER(pav.value_text) LIKE '%perimeter%'",
            "near_road": "LOWER(pav.value_text) LIKE '%road%'",
            "near_water": "LOWER(pav.value_text) LIKE '%near water%' OR LOWER(pav.value_text) LIKE '%/ water%' OR LOWER(pav.value_text) LIKE '%water /%'",
            "internal_waterway": "LOWER(pav.value_text) LIKE '%internal waterway%'",
            "near_amenities": "LOWER(pav.value_text) LIKE '%amenit%'",
            "internal_cluster": "LOWER(pav.value_text) LIKE '%internal cluster%'",
        }

        for key, condition in location_backfills.items():
            connection.execute(
                text(
                    f"""
                    INSERT INTO property_attribute_values (property_id, attribute_definition_id, value_boolean)
                    SELECT pav.property_id, d.attribute_definition_id, TRUE
                    FROM property_attribute_values pav
                    JOIN property_attribute_definitions source_definition
                      ON source_definition.attribute_definition_id = pav.attribute_definition_id
                    JOIN property_attribute_definitions d
                      ON d.key = :key
                    WHERE source_definition.key = 'property_location'
                      AND pav.value_text IS NOT NULL
                      AND ({condition})
                      AND NOT EXISTS (
                          SELECT 1
                          FROM property_attribute_values existing
                          WHERE existing.property_id = pav.property_id
                            AND existing.attribute_definition_id = d.attribute_definition_id
                      )
                    """
                ),
                {"key": key},
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
app.include_router(property_attributes.router, prefix="/api/property_attributes", tags=["Property Attributes"])
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
