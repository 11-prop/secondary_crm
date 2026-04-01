import re


PROPERTY_ATTRIBUTE_TYPES = {"boolean", "text", "number", "select"}

LEGACY_PROPERTY_ATTRIBUTE_DEFINITIONS = [
    {"key": "is_corner", "label": "Corner", "value_type": "boolean", "sort_order": 10, "is_system": True},
    {"key": "is_lake_front", "label": "Lake-front", "value_type": "boolean", "sort_order": 20, "is_system": True},
    {"key": "is_park_front", "label": "Park-front", "value_type": "boolean", "sort_order": 30, "is_system": True},
    {"key": "is_beach", "label": "Beachfront", "value_type": "boolean", "sort_order": 40, "is_system": True},
    {"key": "is_market", "label": "Market-facing", "value_type": "boolean", "sort_order": 50, "is_system": True},
]

LEGACY_PROPERTY_ATTRIBUTE_KEYS = {definition["key"] for definition in LEGACY_PROPERTY_ATTRIBUTE_DEFINITIONS}
LEGACY_PROPERTY_ATTRIBUTE_LABELS = {definition["key"]: definition["label"] for definition in LEGACY_PROPERTY_ATTRIBUTE_DEFINITIONS}


def slugify_property_attribute_key(value: str) -> str:
    normalized = re.sub(r"[^a-zA-Z0-9]+", "_", (value or "").strip().lower()).strip("_")
    normalized = re.sub(r"_+", "_", normalized)
    if normalized and normalized[0].isdigit():
        normalized = f"attr_{normalized}"
    return normalized
