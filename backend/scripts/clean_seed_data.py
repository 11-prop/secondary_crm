from sqlalchemy import create_engine, text

from configs.settings import settings
from core.security import get_password_hash


LEGACY_ADMIN_EMAIL = "admin@crm.local"
SEED_AGENT_NAMES = ("Alice Buyer", "Bob Buyer", "Charlie Seller", "Diana Seller")
SEED_CUSTOMER_EMAILS = ("john@example.com", "sarah@example.com")
SEED_PROJECT_NAMES = ("Palm Jumeirah", "The Springs")
SEED_PLAN_NAMES = ("Signature Villa", "Type 3M")
SEED_PROPERTY_NUMBERS = ("Villa 12", "Townhouse 84")


def main():
    if not settings.DEFAULT_ADMIN_EMAIL or not settings.DEFAULT_ADMIN_PASSWORD:
        raise RuntimeError("DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD must be set before cleanup.")

    engine = create_engine(settings.DATABASE_URL)
    summary = {}

    with engine.begin() as connection:
        user_count = connection.execute(text("SELECT COUNT(*) FROM users")).scalar_one()
        legacy_admin = connection.execute(
            text("SELECT user_id FROM users WHERE email = :email"),
            {"email": LEGACY_ADMIN_EMAIL},
        ).first()

        if legacy_admin and user_count == 1:
            connection.execute(
                text(
                    """
                    UPDATE users
                    SET email = :email,
                        hashed_password = :hashed_password,
                        full_name = :full_name,
                        is_admin = TRUE,
                        is_active = TRUE
                    WHERE user_id = :user_id
                    """
                ),
                {
                    "email": settings.DEFAULT_ADMIN_EMAIL,
                    "hashed_password": get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
                    "full_name": settings.DEFAULT_ADMIN_NAME,
                    "user_id": legacy_admin.user_id,
                },
            )
            summary["admin_rotated"] = 1
        else:
            summary["admin_rotated"] = 0

        summary["transactions_deleted"] = connection.execute(
            text("DELETE FROM transactions WHERE property_id IN (SELECT property_id FROM properties WHERE villa_number = ANY(:numbers))"),
            {"numbers": list(SEED_PROPERTY_NUMBERS)},
        ).rowcount

        summary["notes_deleted"] = connection.execute(
            text("DELETE FROM interaction_notes WHERE customer_id IN (SELECT customer_id FROM customers WHERE email = ANY(:emails))"),
            {"emails": list(SEED_CUSTOMER_EMAILS)},
        ).rowcount

        summary["properties_deleted"] = connection.execute(
            text("DELETE FROM properties WHERE villa_number = ANY(:numbers)"),
            {"numbers": list(SEED_PROPERTY_NUMBERS)},
        ).rowcount

        summary["plans_deleted"] = connection.execute(
            text("DELETE FROM floor_plans WHERE plan_name = ANY(:names)"),
            {"names": list(SEED_PLAN_NAMES)},
        ).rowcount

        summary["projects_deleted"] = connection.execute(
            text("DELETE FROM projects WHERE project_name = ANY(:names)"),
            {"names": list(SEED_PROJECT_NAMES)},
        ).rowcount

        summary["customers_deleted"] = connection.execute(
            text("DELETE FROM customers WHERE email = ANY(:emails)"),
            {"emails": list(SEED_CUSTOMER_EMAILS)},
        ).rowcount

        summary["agents_deleted"] = connection.execute(
            text("DELETE FROM agents WHERE name = ANY(:names)"),
            {"names": list(SEED_AGENT_NAMES)},
        ).rowcount

    for key, value in summary.items():
        print(f"{key}={value}")


if __name__ == "__main__":
    main()
