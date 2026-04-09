import re

from fastapi import HTTPException
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from models.customer import Customer


def normalize_phone_number(phone_number: str | None) -> str | None:
    if phone_number is None:
        return None

    digits_only = re.sub(r"\D+", "", str(phone_number).strip())
    return digits_only or None


def normalize_email(email: str | None) -> str | None:
    if email is None:
        return None

    normalized = str(email).strip().lower()
    if not normalized or normalized == "nan":
        return None
    return normalized


def clean_customer_value(value: str | None) -> str | None:
    if value is None:
        return None

    normalized = str(value).strip()
    if not normalized or normalized.lower() == "nan":
        return None
    return normalized


def clean_customer_payload(payload: dict) -> dict:
    cleaned = dict(payload)
    cleaned["first_name"] = clean_customer_value(cleaned.get("first_name")) or "Unknown"
    cleaned["last_name"] = clean_customer_value(cleaned.get("last_name"))
    cleaned["email"] = normalize_email(cleaned.get("email"))
    cleaned["phone_number"] = clean_customer_value(cleaned.get("phone_number"))
    return cleaned


def find_customer_by_identity(
    db: Session,
    *,
    email: str | None = None,
    phone_number: str | None = None,
    exclude_customer_id: int | None = None,
):
    normalized_email = normalize_email(email)
    normalized_phone = normalize_phone_number(phone_number)

    filters = []
    if normalized_email:
        filters.append(func.lower(func.trim(Customer.email)) == normalized_email)
    if normalized_phone:
        filters.append(
            func.regexp_replace(func.coalesce(Customer.phone_number, ""), r"[^0-9]+", "", "g") == normalized_phone
        )

    if not filters:
        return None

    query = db.query(Customer).filter(or_(*filters))
    if exclude_customer_id is not None:
        query = query.filter(Customer.customer_id != exclude_customer_id)

    return query.order_by(Customer.created_at.asc(), Customer.customer_id.asc()).first()


def enforce_customer_identity_uniqueness(
    db: Session,
    *,
    email: str | None = None,
    phone_number: str | None = None,
    exclude_customer_id: int | None = None,
):
    duplicate = find_customer_by_identity(
        db,
        email=email,
        phone_number=phone_number,
        exclude_customer_id=exclude_customer_id,
    )
    if not duplicate:
        return

    match_reasons = []
    normalized_email = normalize_email(email)
    normalized_phone = normalize_phone_number(phone_number)

    if normalized_email and normalize_email(duplicate.email) == normalized_email:
        match_reasons.append("email")
    if normalized_phone and normalize_phone_number(duplicate.phone_number) == normalized_phone:
        match_reasons.append("phone number")

    reason_label = " and ".join(match_reasons) if match_reasons else "identity details"
    duplicate_name = " ".join(filter(None, [duplicate.first_name, duplicate.last_name])).strip() or "Unnamed customer"
    raise HTTPException(
        status_code=409,
        detail=f"A customer with the same {reason_label} already exists: {duplicate_name} (ID {duplicate.customer_id}).",
    )
